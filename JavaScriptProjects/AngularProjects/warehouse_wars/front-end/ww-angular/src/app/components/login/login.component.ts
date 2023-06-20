import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { ClientService } from 'src/app/services/game/client/client.service';
import { isErrorPackage, isReceiveName } from 'src/app/types/ClientReceive';
import { RequestName } from 'src/app/types/ClientSend';
import { WWUserProfile } from 'src/app/types/WWUser';
import { UserProfile } from 'src/app/types/User';
import { Color } from 'src/app/types/Color';



const TIMEOUT_SECONDS = 60;
const NAME_MIN = 3;
const NAME_MAX = 20;



@Component({
  selector: 'ww-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;

  defaultColor: string = '#999999';
  selectedColor: string = this.defaultColor;
  colors: Color[] = [{name:"default", value:this.defaultColor}, {name:'custom', value:this.selectedColor}];

  colorsObs?: Observable<Color[]>;
  private colorTextFilePath: string = "assets/colors.json";

  validChars = 'a-zA-Z0-9_ ';
  private invalidMessage: string = `A valid name should be between ${NAME_MIN} and ${NAME_MAX} characters long, \nand should be composed of only letters, numbers, underscore, and space.`;
  invalidNameMessage: string = this.invalidMessage;
  invalidName: boolean = true;

  
  invalidUsernames: string[] = [];
  currentPattern: string = `((?!^(${this.invalidUsernames.join('|')})$)[${this.validChars}]+)`;
  patternInvalidator = Validators.pattern(this.currentPattern);

  awaitingLogin: boolean = false;
  awaitToken: string | undefined; //undefined since it isn't a JsonElement
  private loginTimeout: NodeJS.Timeout | null = null;
  
  private subscriptions: Subscription[] = [];



  constructor (private router: Router, private client: ClientService, private http: HttpClient, 
    private formBuilder: FormBuilder, private user: UserProfile /*injected as WWUserProfile*/) 
  {
    this.loginForm = this.formBuilder.group({
      requestName: new FormControl({ value: this.client.getNameCookie(), disabled: true }),
      loginSubmit: new FormControl({ value: 'Send', disabled: true }),

      colorGroup: new FormGroup({
        colorSelectControl: new FormControl(this.colors[0].value),
        colorCustomControl: new FormControl(this.selectedColor)
      })
    });

    this.colorsObs = this.http.get<Color[]>(this.colorTextFilePath, {responseType: 'json'});
  }



  ngOnDestroy() {
    if (this.loginTimeout !== null)
      clearTimeout(this.loginTimeout);
    for (let sub of this.subscriptions){
      sub.unsubscribe();
    }
    this.subscriptions = [];
    this.client.onFinishedWaiting();
  }



  ngOnInit (){
    this.setDefaults();
    let subscription: Subscription;

    this.loginForm.controls['requestName'].setValidators([
      Validators.minLength(NAME_MIN), Validators.maxLength(NAME_MAX), 
      Validators.required, Validators.pattern(`^[${this.validChars}]+$`)] );
    this.loginForm.controls['requestName'].updateValueAndValidity();

    if (this.loginForm.controls['requestName'].invalid && this.loginForm.controls['loginSubmit'].enabled)
      this.loginForm.controls['loginSubmit'].disable();


    //component is destroyed on route change
    //this.client.pathObservable.subscribe(pEnum => { this.setDefaults(); });


    subscription = this.client.auth.subscribe(authorized => {
      if (authorized)   return;
      let expiryMessage = `UserId cookie expired\nid: [${this.user.id}]\npath: ${this.router.url}`;
      console.log(expiryMessage);
      //alert(expiryMessage);
      //this.router.navigate(['login']);
    });
    this.subscriptions.push(subscription);


    subscription = this.loginForm.controls['requestName'].valueChanges.subscribe(change => {
      this.invalidName = this.loginForm.controls['requestName'].invalid;
      if (this.loginForm.controls['requestName'].invalid){
        let name: string = this.loginForm.controls['requestName'].value;
        let chars = [...new Set(name.replace(RegExp(`[${this.validChars}]`, 'g'),'').split(''))];
        let invalidChars = chars.length > 0;
        let invalidLength = name.length < NAME_MIN || name.length > NAME_MAX;
        if (invalidChars || invalidLength)
          this.invalidNameMessage = `${this.invalidMessage}\n${invalidLength ? '\n- invalid length ('+name.length+')' : ''}${invalidChars ? '\n- invalid characters:  '+chars.join('') : ''}`;
      }
      if (this.loginForm.controls['requestName'].invalid && this.loginForm.controls['loginSubmit'].enabled)
        this.loginForm.controls['loginSubmit'].disable();
      else if (this.loginForm.controls['requestName'].valid && this.loginForm.controls['loginSubmit'].disabled)
        this.loginForm.controls['loginSubmit'].enable();
    });
    this.subscriptions.push(subscription);
    

    subscription = this.client.socketIsOpenObservable.subscribe((isOpen)=>{
      isOpen ? this.enable() : this.disable();
      if (!isOpen){
        this.setDefaults();
        this.client.onFinishedWaiting();
      }
    });
    this.subscriptions.push(subscription);


    subscription = this.client.packObservable.subscribe(pack => {
      if (!this.awaitingLogin
      || (pack.hasOwnProperty('token') && this.awaitToken !== pack.token))
        return;
      if (isReceiveName(pack)){
        if (!pack.id){ //update invalid name pattern
          if (this.invalidUsernames.length > 0)
            this.loginForm.controls['requestName'].removeValidators(this.patternInvalidator);
          this.invalidUsernames.push(pack.name);
          this.currentPattern = `((?!^(${this.invalidUsernames.join('|')})$)[${this.validChars}]+)`;
          console.log(`new invalidating pattern ::   ${this.currentPattern}`);
          this.patternInvalidator = Validators.pattern(this.currentPattern);
          this.loginForm.controls['requestName'].addValidators(this.patternInvalidator);
          this.loginForm.controls['requestName'].updateValueAndValidity();
          this.awaitingLogin = false;
          this.awaitToken = undefined;
          this.client.onFinishedWaiting();
          this.enable();
          alert(`username ${pack.name} already exists, please choose another name`);
          return;
        }
        this.user.id = pack.id;
        this.user.name = pack.name;
        //this.user.color = this.selectedColor;
        try{
          (this.user as WWUserProfile).color = this.selectedColor; //because WWUserProfile is injected as UserProfile
        }
        catch (err) {console.error(err);}
        this.user.emitProfileUpdate();
        this.client.setAuth(this.user.getUser(), new Date(pack.expiry));
        this.awaitingLogin = false;
        this.awaitToken = undefined;
        this.client.onFinishedWaiting();
        this.router.navigate(['lobby']);
      }
      else if(isErrorPackage(pack)){
        console.log(`error: ${pack.message}`);
        this.awaitingLogin = false;
        this.awaitToken = undefined;
        this.enable();
        this.client.onFinishedWaiting();
        alert(`An error occurred: ${pack.message}`);
      }
    });
    this.subscriptions.push(subscription);
  }



  setDefaults (){
    this.awaitingLogin = false;
    this.awaitToken = undefined;
    if (this.loginTimeout !== null)
      clearTimeout(this.loginTimeout);
    this.loginTimeout = null;
    this.loginForm.controls['requestName'].patchValue(this.client.getNameCookie());
    this.loginForm.controls['requestName'].updateValueAndValidity();
    this.invalidName = this.loginForm.controls['requestName'].invalid;
  }


  enable (){
    this.loginForm.controls['requestName'].enable();
    this.loginForm.controls['loginSubmit'].enable();
  }
  disable () {
    this.loginForm.controls['requestName'].disable();
    this.loginForm.controls['loginSubmit'].disable();
  }





  login (){
    let pack: RequestName = {type: 'request_name', name: this.loginForm.controls['requestName'].value};
    let id;
    if ((id = this.client.getIdCookie()) !== '' && !this.client.cookieIsExpired())
      pack['id'] = id;
    this.awaitingLogin = true;
    this.awaitToken = this.user.id +'_'+ Date.now();
    pack['token'] = this.awaitToken;
    this.disable();
    this.client.onWaiting('Logging in...');
    this.loginTimeout = setTimeout((_this) => {
      _this.setDefaults();
      _this.enable();
      _this.client.onFinishedWaiting();
      console.log('!! login time out'); 
      alert('Could not log in, request timed out!');
    }, TIMEOUT_SECONDS*1000, this);
    this.client.sendPackage(pack);
  }







  onColorSelect ( event: Event ){
    let element: HTMLSelectElement = (event.target as HTMLSelectElement);
    let oldColor = this.selectedColor;
    this.selectedColor = element.value;
    this.loginForm.controls['colorGroup'].patchValue({'colorCustomControl': element.value});
    console.log(`change color from ${oldColor} to ${this.selectedColor}`);
  }

  onColorCustom (event: Event){
    let element: HTMLInputElement = (event.target as HTMLInputElement);
    let oldColor = this.selectedColor;
    this.selectedColor = element.value;
    this.colors[1].value = element.value;
    this.loginForm.controls['colorGroup'].patchValue({'colorSelectControl': this.colors[1].value});
    console.log(`custom change color from ${oldColor} to ${this.selectedColor}`);
  }
}
