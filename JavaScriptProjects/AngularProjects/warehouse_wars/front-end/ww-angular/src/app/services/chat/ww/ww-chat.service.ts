import { Inject, Injectable, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { firstValueFrom } from 'rxjs';

import { DEFAULT_RENDERER } from 'src/app/injectionTokens/Renderer2';

import { ChatService } from 'src/app/services/chat/common/chat.service';
import { ChatPackagerInterface } from "src/app/services/chat/common/ChatPackagerInterface";
import { ChatElement, ChatElementOptions } from 'src/app/services/chat/common/ChatElement';
import { isWWChatFetchMessagesDone, isWWChatFetchTokenDone, isWWChatInfoReceived, isWWChatPackage, isWWChatReceived, isWWChatToken, WWChatError, WWChatPackage, WWChatReceived } from 'src/app/services/chat/ww/WWChatPackage';
//import { UniqueIdService } from 'src/app/services/util/uid/unique-id.service';
import { awaitOrTimeout } from 'src/app/utils/AwaitTimeout';

import { UserProfile } from 'src/app/types/User';
import { ChatPackage } from "src/app/services/chat/common/ChatPackage";
//import { ChatState } from 'src/app/services/chat/common/ChatState';
import { DeliveryState } from 'src/app/services/chat/common/delivery-state';

import { WebConfigsService } from 'src/app/services/web-configs.service';
//import configs from 'src/assets/configs/configs.json'



//const addr = configs.address === "0.0.0.0" ? "localhost" : configs.address;
//const port = configs.port;

const TOKEN_WAIT_TIME = 60; //seconds

const dateOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
  timeZone: "UTC"
}
const dateFormat = new Intl.DateTimeFormat("en-US", dateOptions);



@Injectable({
  providedIn: 'root'
})
export class WwChatService extends ChatService {
  private socket!: WebSocketSubject<ChatPackage>; //assigned via connect

  private updateNum: number = 0; // the latest update number used to track message order
  private queueLimit: number = 0; //the max number of messages that are stored on the server
  private maxUpdateNum: number = 0; //max # the updateNum is allowed before wrapping back to 0

  private socketIsOpen: boolean = false;
  private socketIsReady: boolean = false;

  private awaitToken: string | null = null;
  private tokenSubject: Subject<string> = new Subject<string>();


  constructor(private packager: ChatPackagerInterface, 
    protected override user: UserProfile /*injected as WWUserProfile*/,
    @Inject(DEFAULT_RENDERER) protected override renderer: Renderer2,
    private configs: WebConfigsService) 
  {
    super(renderer, user);

    //this.connect();
    this.configs.observable.subscribe({
      complete: () => this.connect()
    });
  }



  init (){
    //this.user.updated.subscribe(() => {});
  }



  override connect (){
    let url = `ws://${this.configs.address}:${this.configs.port}/chat`; //`ws://${addr}:${parseInt(port)+1}/chat`;
    console.log(`connecting to:  `+url);
    this.socket = webSocket({
      url: url,
      serializer: this.packager.createPackage,  //default:   JSON.stringify
      deserializer: (e) => this.packager.unpackPackage(e.data),  //default:   JSON.parse(e.data)
      openObserver: {
        next: () => {
          this.open();
          console.log('Chat Websocket connected');
          this.socket.next({type: 'info'});
        }
      },
      closingObserver: {
        next: () => {
          this.clean();
          console.log(`Chat Websocket shutting down`);
        }
      },
      closeObserver: {
        next: (e) => {
          this.clean();
          console.log(`Chat Websocket closed: ${e.code}\nwas clean? :  ${e.wasClean}\n${e.reason}`);
          /*DEV*/ //alert (`Chat Websocket closed: ${e.code}\nwas clean? :  ${e.wasClean}\n${e.reason}`);
        }
      }
    });
    this.socket.subscribe((pack) => { 
      if (isWWChatPackage(pack))
        this.handleMessage(pack);
    });
  }


  private clean (){
    this.socketIsOpen = false;
    this.socketIsReady = false;
    this.enabled = false;
  }
  private open (){
    this.socketIsOpen = true;
    this.enabled = true;
  }



  override disconnect () {
    this.socket.complete();
  }
  

  
  override update () {
    this.stateSubject.next({
      state: DeliveryState.default, 
      enabled: this.socketIsOpen && this.socketIsReady, 
      message: ''
    });
  }




  override async sendMessage (content: string): Promise<boolean> {
    console.log(this.user.getUser());
    try{
      this.stateSubject.next({
        state: DeliveryState.sending, 
        enabled: false, 
        message: `${dateFormat.format(Date.now())}\nPreparing to send}`
      });
      let packToken: string;
      this.socket.next({type: 'request_token'});
      try{
        packToken = await awaitOrTimeout(firstValueFrom(this.tokenSubject), TOKEN_WAIT_TIME*1000, 'Token Request').catch(e => {throw e;});
      }
      catch (err){ throw (err); }
      let pack : WWChatPackage = {
        type: 'chat',
        content: content,
        token: packToken,
        user: this.user.getUser()
      };
      console.log(JSON.stringify(pack));
      this.socket.next(pack);
      
      let success = this.socketIsOpen && this.socketIsReady;
      this.stateSubject.next({
        state: success ? DeliveryState.success : DeliveryState.failed, 
        enabled: success ? false : true, 
        message: `${dateFormat.format(Date.now())}\n`+(success ? 'Message sent!' : 'Failed to send message')
      });
      if (success) this.awaitToken = packToken;
      return success;
    }
    catch (e){ throw e; }
  };


  
  override receiveMessage (raw: string) {
    //TODO check updateNum, if missing updates, fetch
    // if fetching, dont check missing updates until 'fetch_done' received
    // then check again

    let pack = this.packager.unpackPackage(raw) as WWChatReceived; //this should be guarenteed prior to call
    this.updateNum = pack.updateNum;

    if (this.awaitToken && pack.token === this.awaitToken){
      this.stateSubject.next({
        state: DeliveryState.complete, 
        enabled: true,
      });
      this.awaitToken = null;
    }

    let username = (pack.user && pack.user.name) ? pack.user.name : "[[Anonymous]]";
    let html = this.renderer.createElement('div');
    this.renderer.appendChild(html, this.renderer.createText(username+" :  "));
    this.renderer.appendChild(html, this.renderer.createText("\t"+pack.content));

    let chatElem : ChatElement = {html: html};
    let options: ChatElementOptions = {token: pack.token};
    if (pack.timestamp)
      options['timestamp'] = pack.timestamp;
    if (pack.user && pack.user.color)
      options.style = `border-color: ${pack.user.color}`;
    options.class = ["chat-entry"];
    if (Object.keys(options).length > 0)
      chatElem.options = options;

    this.chatSubject.next( chatElem );
  }


  /** options.missingUpdate is only supported locally */
  override async fetchMessage (options: {token?: string, missingUpdates?: number[]}): Promise<void> {
    //TODO send request to reply with message with token
    //either token or missingUpdates
    //WWChatFetchPackage
    return;
  }


  private getFetchSeries (opt: {startingFrom: number, backTo?: number, amount?: number}): number[]{
    //backTo is prioritized over amount, if none provided then defaults to 1
    this.maxUpdateNum;
    this.queueLimit;
    let amount: number = Math.min(this.queueLimit, opt.backTo ? 
      ( opt.backTo > opt.startingFrom ? 
        ((opt.startingFrom + 1)  +  (this.maxUpdateNum - opt.backTo + 1))
        : (opt.startingFrom - opt.backTo + 1)
      ) : (opt.amount ? (opt.amount) : (1))  );
    console.log(`fetching a total of ${amount} old chat messages`);
    let updateNums: number[] = [];
    let pointer = opt.startingFrom;
    for (let remaining = amount; remaining > 0; remaining--){
      updateNums.push(pointer - (amount-remaining));
      if (pointer - (amount-remaining) == 0){
        pointer = this.maxUpdateNum;
        amount = remaining-1;
      }
    }
    return updateNums;
  }

  private pruneFetch (updateNums: number[]){
    let removed = updateNums.filter(n => n < 0 && n > this.maxUpdateNum);
    if (removed.length > 0) 
      console.log(`pruning out fetch updateNums: [${removed.join(", ")}]`);
    return updateNums.filter(n => n >= 0 && n <= this.maxUpdateNum);
  }



  handleMessage (pack: WWChatPackage){
    console.log(`Received socket package type :  ${pack.type}`);
    switch (pack.type){
      case 'error': {  /*{type:'error', message: string}*/    
        this.stateSubject.next({state: DeliveryState.complete, enabled: true, message: (pack as WWChatError).message});
        break;
      }
      case 'info': {  /*{type: 'info', max_updateNum: number, queue_limit: number, current_updateNum: number}*/
        if (isWWChatInfoReceived(pack)){
          this.updateNum = pack.current_updateNum;
          this.maxUpdateNum = pack.max_updateNum;
          this.queueLimit = pack.queue_limit;
          this.socketIsReady = true;
          this.stateSubject.next({state: DeliveryState.default, enabled: true, message: 'Chat initialized'});
          this.update();
        }
        break;
      }
      case 'token': {  /*{type:'token', token: string}*/
        if (isWWChatToken(pack)){
          this.tokenSubject.next(pack.token);
        }
        break;
      }
      case 'chat': {  /*(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp:number, updateNum:number)*/
        if (isWWChatReceived(pack)){
          this.receiveMessage(this.packager.createPackage(pack) as string);
        }  
      
        break;
      }
      case 'fetch_done': {  /*{type: 'fetch_done', token?:string}  |  {type: 'fetch_done', failed?:number[], nonexistent?:number[]}*/
        if (isWWChatFetchTokenDone(pack)){
          //TODO
        }
        else if (isWWChatFetchMessagesDone(pack)){
          //for simplicity any fails are ignored 
        }
        break;
      }
      case 'non-existent': {  /*{type: 'non-existent', token: string } */
        //only returned when fetch token does not exist
        //TODO
        break;
      }
      default: {
        console.error(`Received invalid socket package of type: ${pack.type}`);
        return;
      }
    }
  }
  
}
