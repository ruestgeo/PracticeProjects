import { Inject, Injectable, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { CookieService } from 'ngx-cookie-service';

import { DEFAULT_RENDERER } from 'src/app/injectionTokens/Renderer2';

import { WWUser, WWUserProfile } from 'src/app/types/WWUser';
import { User, UserProfile } from 'src/app/types/User';
import { GamePackage, isGamePackage } from 'src/app/types/ClientReceive';
import { GamePackager } from 'src/app/services/game/client/GamePackager';
import { PathEnum } from 'src/app/routing/PathEnum';
import { PathTravelGuard } from 'src/app/routing/guards/path-travel.guard';

import { SpinnerOverlayService } from 'src/app/_sourcedMaterial/spinner/spinner-overlay.service';

import { WebConfigsService } from 'src/app/services/web-configs.service';
//import configs from 'src/assets/configs/configs.json'



//const addr = configs.address === "0.0.0.0" ? "localhost" : configs.address;
//const port = configs.port;




@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private socket!: WebSocketSubject<GamePackage>; //assigned via connect

  private socketIsOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  socketIsOpenObservable: Observable<boolean> = this.socketIsOpenSubject.asObservable();
  private set socketIsOpen (val: boolean){ this.socketIsOpenSubject.next(val); }
  get socketIsOpen (): boolean { return this.socketIsOpenSubject.getValue(); }

  private socketIsReady: boolean = false;

  private socketErrorSubject: Subject<Error> = new Subject<Error>();
  socketError: Observable<Error> = this.socketErrorSubject.asObservable();

  //use to monitor is authentication is valid, or invalid
  private authSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(!this.cookieIsExpired()); 
  auth: Observable<boolean> = this.authSubject.asObservable();
  get isAuthorized (): boolean { return this.authSubject.getValue(); };
  private expiryTimeout: NodeJS.Timeout | null = null;

  private pathSubject: BehaviorSubject<PathEnum> = new BehaviorSubject<PathEnum>(PathEnum.root);
  pathObservable: Observable<PathEnum> = this.pathSubject.asObservable();
  get path (): PathEnum { return this.pathSubject.getValue(); }

  private packSubject: Subject<GamePackage> = new Subject<GamePackage>();
  packObservable: Observable<GamePackage> = this.packSubject.asObservable();



  
  constructor(private packager: GamePackager, private user: UserProfile /*injected as WWUserProfile*/, 
    @Inject(DEFAULT_RENDERER) protected renderer: Renderer2,  private cookieService:CookieService,
    private guard:PathTravelGuard, private router: Router, private spinner: SpinnerOverlayService,
    private configs: WebConfigsService)
  {
    guard.route.subscribe((pEnum) => {
      this.pathSubject.next(pEnum);
    });
  }



  connect (){
    let url = `ws://${this.configs.address}:${this.configs.port}/ww`; //`ws://${addr}:${parseInt(port)+1}/chat`;
    console.log(`connecting to:  `+url);
    this.socket = webSocket({
      url: url,
      serializer: this.packager.createPackage,  //default:   JSON.stringify
      deserializer: (e) => this.packager.unpackPackage(e.data),  //default:   JSON.parse(e.data)
      openObserver: {
        next: () => {
          this.socketIsOpen = true;
          console.log('Game Websocket connected');
        }
      },
      closingObserver: {
        next: () => {
          this.socketIsOpen = false;
          console.log(`Game Websocket shutting down`);
        }
      },
      closeObserver: {
        next: (e) => {
          this.socketIsOpen = false;
          let message = `Game Websocket closed: ${e.code}\nwas clean? :  ${e.wasClean}\n${e.reason}`
          console.log(message);
          this.socketErrorSubject.next(new Error(message));
          this.router.navigate(['']); //by the route guard, this should fail if already ''
          alert (message);
        }
      }
    });
    this.socket.subscribe((pack) => { 
      if (isGamePackage(pack))
        this.handlePackage(pack);
    });
  }



  disconnect () {
    this.socket.complete();
  }



  handlePackage (pack: GamePackage){
    this.packSubject.next(pack);
  }



  sendPackage (pack: GamePackage){
    this.socket.next(pack);
  }



  setAuth (user: User, expiry: Date){
    this.setUserCookie(user, expiry);
    if (this.expiryTimeout)
      clearTimeout(this.expiryTimeout);
    this.expiryTimeout = setTimeout(()=>{
      this.expiryTimeout = null;
      this.authSubject.next(false);
    }, Math.max(0, (expiry.getTime() - Date.now()) - (30*1000)) ); //to alert 30sec before expiry
    this.authSubject.next(true);
  }

  cookieIsExpired (): boolean {
    return this.getExpiryCookie() < Date.now();
  }


  getIdCookie (): string {
    return this.cookieService.get('warehouse-wars_user-id'); //return '' if not found
  }

  getNameCookie (): string {
    return this.cookieService.get('warehouse-wars_user-name');
  }
  /** return -1 if no cookie exists */
  getExpiryCookie (): number {
    let expiry = this.cookieService.get('warehouse-wars_user-expiry');
    return expiry === '' ? -1 : new Date(expiry).getTime();
  }



  setUserCookie (user: User, expiry: number|Date){
    this.setIdCookie(user.id, expiry);
    if (user.name) 
      this.setNameCookie(user.name, expiry);
    this.cookieService.set('warehouse-wars_user-expiry', typeof expiry === 'number' ? expiry.toString() : expiry.getTime().toString());
  }

  setIdCookie (id: string, expiry?: number|Date){
    if (expiry){
      this.cookieService.set('warehouse-wars_user-id', id, {expires: expiry});
    }
    else {
      this.cookieService.set('warehouse-wars_user-id', id);
    }
  }

  setNameCookie (name: string, expiry?: number|Date){
    if (expiry) {
      this.cookieService.set('warehouse-wars_user-name', name, {expires: expiry});
    }
    else {
      this.cookieService.set('warehouse-wars_user-name', name);
    } 
  }


  

  onWaiting(message =  ''){
    this.spinner.show(message);
  }
  onFinishedWaiting (){
    this.spinner.hide();
  }
}
