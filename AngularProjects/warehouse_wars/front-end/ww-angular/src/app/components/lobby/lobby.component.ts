import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { ClientService } from 'src/app/services/game/client/client.service';
import { isEnterRoom, isErrorPackage } from 'src/app/types/ClientReceive';
import { CreateRoom, JoinRoom, LeaveRoom, RoomConfigs } from 'src/app/types/ClientSend';
import { WWUserProfile } from 'src/app/types/WWUser';
import { UserProfile } from 'src/app/types/User';
import { RoomService } from 'src/app/services/game/room.service';



const TIMEOUT_SECONDS = 60;
const ON_CHANGE_DELAY = 500;
const DEFAULT_INTERVAL = 200;
const DEFAULT_NUM_PLAYERS = 4;
const DEFAULT_HEALTH = 3;
const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;
const ROOM_ID_MIN = 6;
const ROOM_ID_MAX = 8;
const ROOM_NAME_MIN = 3;
const ROOM_NAME_MAX = 20;




@Component({
  selector: 'ww-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {

  //#region inputs
  joinForm: FormGroup;
  configsForm: FormGroup;

  configsVisible: boolean = false;
  randomMobsVisible: boolean = false;
  fixedMobsVisible: boolean = false;

  boxesAvailable: string = '';
  wallsAvailable: string = '';
  mobsAvailable: string = '';
  boxesAvailableClass: string[] = [];
  wallsAvailableClass: string[] = [];
  mobsAvailableClass: string[] = [];

  bouncerChance: string = '';
  chargerChance: string = '';
  crawlerChance: string = '';
  mimicChance: string = '';
  pusherChance: string = '';
  wandererChance: string = '';
  warperChance: string = '';

  enum: typeof ConfigsEnum = ConfigsEnum;
  toggle: typeof TogglableEnum = TogglableEnum;

  roomNameMin = ROOM_NAME_MIN;
  roomNameMax = ROOM_NAME_MAX;

  intervalValue = DEFAULT_INTERVAL;
  intervalStep = 100;
  intervalMin = 100;
  intervalMax = 1000;
  
  playersValue = DEFAULT_NUM_PLAYERS;
  playersStep = 1;
  playersMin = 1;
  playersMax = 8;
  
  healthValue = DEFAULT_HEALTH;
  healthStep = 1;
  healthMin = 0;
  healthMax = 16;
  
  widthValue = DEFAULT_WIDTH;
  widthStep = 1;
  widthMin = 8;
  widthMax = 256;
  
  heightValue = DEFAULT_HEIGHT;
  heightStep = 1;
  heightMin = 8;
  heightMax = 256;
  
  boxesValue = 0; //updated dynamically
  boxesStep = 1;
  boxesMin = 0;
  boxesMax = 0; //updated dynamically
  
  wallsValue = 0;
  wallsStep = 1;
  wallsMin = 0;
  wallsMax = 0; //updated dynamically

  randomValue = 1;
  randomStep = 1;
  randomMin = 0;
  randomMax = 0; //updated dynamically

  weightMax = 1000;

  bouncerMax = 0; //updated dynamically
  chargerMax = 0; //updated dynamically
  crawlerMax = 0; //updated dynamically
  mimicMax = 0; //updated dynamically
  pusherMax = 0; //updated dynamically
  wandererMax = 0; //updated dynamically
  warperMax = 0; //updated dynamically

  bouncerValue = 1;
  chargerValue = 1;
  crawlerValue = 1;
  mimicValue = 1;
  pusherValue = 1;
  wandererValue = 1;
  warperValue = 1;
  //#endregion outputs
  
  private availableNumMobs = 0; //updated dynamically
  private minNumMobs = 1;
  private maxNumMobs = 0; //updated dynamically
  private minNumBoxes= 0; //updated dynamically
  private maxNumBoxes= 0; //updated dynamically
  //private maxNumWalls= 0; //dependant on maxNumMisc and numBoxes
  private maxNumMisc= 0; //updated dynamically

  private InvalidatorFn: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return {invalid: true};
  };
  private MinValidatorFn (getMin: () => number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      //if (control === null || control.value === null)   return null;
      if (control.value >= getMin())
        return null;
      else 
        return {greaterThanOrEqualToMin: false};
    };
  }
  private MaxValidatorFn (getMax: () => number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      //if (control === null || control.value === null)   return null;
      if (control.value <= getMax())
        return null;
      else 
        return {lessThanOrEqualToMax: false};
    };
  }
  configInvalids: string [] = [];
  private awaitingJoin: boolean = false;
  private awaitToken: string | undefined; //undefined since it isn't a JsonElement
  private joinTimeout: NodeJS.Timeout | null = null;
  private buttonLock: boolean = false;
  private configsLock: boolean = false;

  private subscriptions: Subscription[] = [];
  



  constructor (private router: Router, private client: ClientService, 
    private formBuilder: FormBuilder, private user: UserProfile /*injected as WWUserProfile*/, 
    private room: RoomService) 
  {
    this.joinForm = this.formBuilder.group({
      joinId: new FormControl({ value: '', disabled: false }),
      joinSubmit: new FormControl({ value: 'Join Room', disabled: true }),
    });

    this.configsForm = this.formBuilder.group({
      configsSubmit: new FormControl({ value: 'Send configs and create Room', disabled: false }),
      configsGroup: new FormGroup({
        roomName: new FormControl(''),
        intervalGroup: new FormGroup({
          intervalRange: new FormControl(this.intervalValue),
          intervalNum: new FormControl(this.intervalValue)
        }),
        playersGroup: new FormGroup({
          playersRange: new FormControl(this.playersValue),
          playersNum: new FormControl(this.playersValue)
        }),
        healthGroup: new FormGroup({
          healthRange: new FormControl(this.healthValue),
          healthNum: new FormControl(this.healthValue)
        }),
        widthGroup: new FormGroup({
          widthRange: new FormControl(this.widthValue),
          widthNum: new FormControl(this.widthValue)
        }),
        heightGroup: new FormGroup({
          heightRange: new FormControl(this.heightValue),
          heightNum: new FormControl(this.heightValue)
        }),
        boxesGroup: new FormGroup({
          boxesRange: new FormControl(this.boxesValue),
          boxesNum: new FormControl(this.boxesValue)
        }),
        wallsGroup: new FormGroup({
          wallsRange: new FormControl(this.wallsValue),
          wallsNum: new FormControl(this.wallsValue)
        }),
        randomGroup: new FormGroup({
          randomRange: new FormControl(this.randomValue),
          randomNum: new FormControl(this.randomValue),
  
          bouncerWeight: new FormControl(this.randomValue),
          chargerWeight: new FormControl(this.randomValue),
          crawlerWeight: new FormControl(this.randomValue),
          mimicWeight: new FormControl(this.randomValue),
          pusherWeight: new FormControl(this.randomValue),
          wandererWeight: new FormControl(this.randomValue),
          warperWeight: new FormControl(this.randomValue)
        }),
        fixedGroup: new FormGroup({
          bouncerNum: new FormControl(0),
          chargerNum: new FormControl(0),
          crawlerNum: new FormControl(0),
          mimicNum: new FormControl(0),
          pusherNum: new FormControl(0),
          wandererNum: new FormControl(0),
          warperNum: new FormControl(0)
        })
      })
    });
  }



  ngOnDestroy() {
    if (this.joinTimeout !== null)
      clearTimeout(this.joinTimeout);
    for (let sub of this.subscriptions){
      sub.unsubscribe();
    }
    this.subscriptions = [];
    this.client.onFinishedWaiting();
  }



  ngOnInit () {
    this.setDefaults();
    this.updateAvailableActors();
    this.updateMobWeights();
    this.setValidation();
    this.setOnChange();
    this.watchValidity();
    this.checkConfigValidity();

    let subscription: Subscription;

    subscription = this.client.socketIsOpenObservable.subscribe((isOpen)=>{
      if (!isOpen){
        this.setDefaults();
        this.client.onFinishedWaiting();
      }
    });
    this.subscriptions.push(subscription);


    subscription = this.client.auth.subscribe(authorized => {
      if (authorized)   return;
      let expiryMessage = `UserId cookie expired\nid: [${this.user.id}]\npath: ${this.router.url}`;
      console.log(expiryMessage);
      alert(expiryMessage);
      this.router.navigate(['login']);
    });
    this.subscriptions.push(subscription);


    subscription = this.client.packObservable.subscribe(pack => {
      if (!this.awaitingJoin
      || (pack.hasOwnProperty('token') && this.awaitToken !== pack.token))
        return;
        
      
      if (isEnterRoom(pack)){
        this.room.initService();
        this.room.handlePack(pack);
        this.router.navigate(['game']);
      }
      else if(isErrorPackage(pack)){
        console.log(`error: ${pack.message}`);
        if (pack.hasOwnProperty('token') && pack.token === this.awaitToken){
          this.awaitToken = undefined;
          if (this.joinTimeout) clearTimeout(this.joinTimeout);
          this.joinTimeout = null;
          this.client.onFinishedWaiting();
        }
        alert(`An error occurred: ${pack.message}`);
      }
    });
    this.subscriptions.push(subscription);
  }




  toggleView (toggle: TogglableEnum){
    switch (toggle){
      case TogglableEnum.randomMobs: {
        this.randomMobsVisible = !this.randomMobsVisible;
        break;
      }
      case TogglableEnum.fixedMobs: {
        this.fixedMobsVisible = !this.fixedMobsVisible;
        break;
      }
    }
  }


  viewConfigs (){  //display configs view
    if (!this.buttonLock)   this.configsVisible = true;
  } 


  returnToLobby (){  //display lobby view
    if (!this.buttonLock)   this.configsVisible = false;
    let pack: LeaveRoom = {
      type: 'leave_room',
      player_id: this.user.id,
      room_id: this.room.id
    };
    this.client.sendPackage(pack); //just in case
  } 


  backToLogin (){  //route to login
    let pack: LeaveRoom = {
      type: 'leave_room',
      player_id: this.user.id,
      room_id: this.room.id
    };
    this.client.sendPackage(pack); //just in case
    this.router.navigate(['login']);
  }



  blur (target: EventTarget|null){
    if (!target) return;
    (target as HTMLInputElement).blur();
  }



  getValue (event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getNumValue (event: Event){
    return parseInt(this.getValue(event));
  }



  setDefaults (){
    if (this.configsLock)
      this.unlockConfigs();
    if (this.buttonLock)
      this.unlockButtons();
    this.buttonLock = false;
    this.configsLock = false;
    if (this.joinForm.get(['joinId'])?.invalid)
      this.joinForm.get(['joinSubmit'])?.disable();
    this.checkConfigValidity();
    if (this.configInvalids.length > 0)
      this.configsForm.get(['configsSubmit'])?.disable();
    this.awaitingJoin = false;
    this.awaitToken = undefined;
    if (this.joinTimeout !== null)
      clearTimeout(this.joinTimeout);
    this.joinTimeout = null;
    this.joinForm.get(['joinId'])?.patchValue('');
    this.configsForm.get(['configsGroup', 'roomName'])?.patchValue('');
    this.configsVisible = false;
    this.randomMobsVisible = false;
    this.fixedMobsVisible = false;
  }

  lockButtons (){
    this.buttonLock = true;
    this.joinForm.get(['joinSubmit'])?.disable();
    this.configsForm.get(['configsSubmit'])?.disable();
  }

  unlockButtons (){
    this.buttonLock = false;
    if (this.joinForm.get(['joinId'])?.valid)
      this.joinForm.get(['joinSubmit'])?.enable();
    if (this.configsForm.get(['configsGroup'] as const)?.valid)
      this.configsForm.get(['configsSubmit'])?.enable();
  }

  lockConfigs (){
    this.configsLock = true;
    this.configsForm.get(['configsGroup'])?.disable({emitEvent: false});
  }
  unlockConfigs (){
    this.configsLock = false;
    this.configsForm.get(['configsGroup'])?.enable({emitEvent: false});
  }



  joinRoom(){  //submit and await first value from socket
    this.lockButtons();
    this.lockConfigs();
    this.client.onWaiting();
    let pack: JoinRoom = {
      type: 'join_room',
      player_id: this.user.id,
      room_id: this.joinForm.get(['joinId'])?.value
    }
    this.awaitingJoin = true;
    this.joinTimeout = setTimeout((_this)=>{
      _this.setDefaults();
      _this.client.onFinishedWaiting();
      console.log('!! lobby join room time out'); 
      alert('Could not join game room, request timed out!');
      //_this.router.navigate(['login']);
    },TIMEOUT_SECONDS*1000, this);
    this.awaitingJoin = true;
    this.awaitToken = this.user.id +'_'+ Date.now();
    pack['token'] = this.awaitToken;
    this.client.sendPackage(pack);
  }


  
  watchValidity (){
    let subscription: Subscription | undefined;

    subscription = this.joinForm.get(['joinId'])?.valueChanges
    .subscribe(_ => {
      if (this.buttonLock)
        return;
      else if (this.joinForm.get(['joinId'])?.valid && this.joinForm.get(['joinSubmit'])?.disabled)
        this.joinForm.get(['joinSubmit'])?.enable();
      else if (this.joinForm.get(['joinId'])?.invalid && this.joinForm.get(['joinSubmit'])?.enabled)
        this.joinForm.get(['joinSubmit'])?.disable();
    });
    if (subscription)
      this.subscriptions.push(subscription);

    subscription = this.configsForm.get(['configsGroup'] as const)?.valueChanges
    .pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() )
    .subscribe(_ => {
      this.checkConfigValidity();
      if (this.buttonLock) 
        return;
      else if (this.configInvalids.length > 0)
        this.configsForm.get(['configsSubmit'])?.disable();
      else
        this.configsForm.get(['configsSubmit'])?.enable();
    });
    if (subscription)
      this.subscriptions.push(subscription);
  }

  

  setValidation (){
    this.joinForm.get(['joinId'])?.setValidators([
      Validators.minLength(ROOM_ID_MIN), Validators.maxLength(ROOM_ID_MAX), 
      Validators.required, Validators.pattern("^[a-zA-Z0-9]+$")] );
    this.joinForm.get(['joinId'])?.updateValueAndValidity();

    this.configsForm.get(['configsGroup', 'roomName'])?.setValidators([
      Validators.minLength(ROOM_NAME_MIN), Validators.maxLength(ROOM_NAME_MAX), 
      Validators.required, Validators.pattern(`^[a-zA-Z0-9_ ]+$`)] );
    this.configsForm.get(['configsGroup', 'roomName'])?.updateValueAndValidity();


    this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.intervalMin }), this.MaxValidatorFn(()=>{ return this.intervalMax })]);
    this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.playersMin }), this.MaxValidatorFn(()=>{ return this.playersMax })]);
    this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.healthMin }), this.MaxValidatorFn(()=>{ return this.healthMax })]);
    this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.widthMin }), this.MaxValidatorFn(()=>{ return this.widthMax })]);
    this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.heightMin }), this.MaxValidatorFn(()=>{ return this.heightMax })]);
    this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.boxesMin }), this.MaxValidatorFn(()=>{ return this.boxesMax })]);
    this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.wallsMin }), this.MaxValidatorFn(()=>{ return this.wallsMax })]);
    this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.randomMin }), this.MaxValidatorFn(()=>{ return this.randomMax })]);

    this.configsForm.get(['configsGroup','intervalGroup','intervalRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.intervalMin }), this.MaxValidatorFn(()=>{ return this.intervalMax })]);
    this.configsForm.get(['configsGroup','playersGroup','playersRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.playersMin }), this.MaxValidatorFn(()=>{ return this.playersMax })]);
    this.configsForm.get(['configsGroup','healthGroup','healthRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.healthMin }), this.MaxValidatorFn(()=>{ return this.healthMax })]);
    this.configsForm.get(['configsGroup','widthGroup','widthRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.widthMin }), this.MaxValidatorFn(()=>{ return this.widthMax })]);
    this.configsForm.get(['configsGroup','heightGroup','heightRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.heightMin }), this.MaxValidatorFn(()=>{ return this.heightMax })]);
    this.configsForm.get(['configsGroup','boxesGroup','boxesRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.boxesMin }), this.MaxValidatorFn(()=>{ return this.boxesMax })]);
    this.configsForm.get(['configsGroup','wallsGroup','wallsRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.wallsMin }), this.MaxValidatorFn(()=>{ return this.wallsMax })]);
    this.configsForm.get(['configsGroup','randomGroup','randomRange'] as const)?.setValidators([this.MinValidatorFn(()=>{ return this.randomMin }), this.MaxValidatorFn(()=>{ return this.randomMax })]);

    this.configsForm.get(['configsGroup','randomGroup','bouncerWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','chargerWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','crawlerWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','mimicWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','pusherWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','wandererWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);
    this.configsForm.get(['configsGroup','randomGroup','warperWeight'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.weightMax })]);

    this.configsForm.get(['configsGroup','fixedGroup','bouncerNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','chargerNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','crawlerNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','mimicNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','pusherNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','wandererNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);
    this.configsForm.get(['configsGroup','fixedGroup','warperNum'] as const)?.setValidators([this.MinValidatorFn(()=>{ return 0 }), this.MaxValidatorFn(()=>{ return this.maxNumMobs })]);


    this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.updateValueAndValidity();

    this.configsForm.get(['configsGroup','intervalGroup','intervalRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','playersGroup','playersRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','healthGroup','healthRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','widthGroup','widthRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','heightGroup','heightRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','boxesGroup','boxesRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','wallsGroup','wallsRange'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','randomRange'] as const)?.updateValueAndValidity();

    this.configsForm.get(['configsGroup','randomGroup','bouncerWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','chargerWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','crawlerWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','mimicWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','pusherWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','wandererWeight'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup','warperWeight'] as const)?.updateValueAndValidity();

    this.configsForm.get(['configsGroup','fixedGroup','bouncerNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','chargerNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','crawlerNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','mimicNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','pusherNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','wandererNum'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','fixedGroup','warperNum'] as const)?.updateValueAndValidity();
  }



  setOnChange (){
    /*
    notes: 
      only forms triggering update functions are of concern.
      input number is updated on change with delay.
      input range is updated on mouseup event, thus doesn't need delay.
      patchValue should not trigger valueChanges.
      only number/text input should trigger after delay
     */
    let subscription: Subscription | undefined;

    //updateAvailableActors
    subscription = this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {
      this.updateAvailableActors();
      this.unlockConfigs();
    });
    if (subscription)
      this.subscriptions.push(subscription);
    subscription = this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableActors(); this.unlockConfigs(); });
    if (subscription)
      this.subscriptions.push(subscription);
    
    //updateAvailableMisc
    subscription = this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {
      this.updateAvailableMisc();
      this.unlockConfigs();
    });
    if (subscription)
      this.subscriptions.push(subscription);
    subscription = this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMisc(); this.unlockConfigs(); });
    if (subscription)
      this.subscriptions.push(subscription);

    //updateAvailableMobs
    subscription = this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {
      this.updateAvailableMobs();
      this.unlockConfigs();
    });
    if (subscription)
      this.subscriptions.push(subscription);

    
    //UNUSED
    //this.configsForm.get(['configsGroup','intervalGroup','intervalRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','playersGroup','playersRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','healthGroup','healthRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});

    //this.configsForm.get(['configsGroup','widthGroup','widthRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','heightGroup','heightRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});  

    //this.configsForm.get(['configsGroup','boxesGroup','boxesRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    //this.configsForm.get(['configsGroup','wallsGroup','wallsRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    
    //this.configsForm.get(['configsGroup','randomGroup','randomRange'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {});
    
    //updateMobWeights & update chance to spawn
    /* //using input range with mouseup event instead
    this.configsForm.get(['configsGroup','randomGroup','bouncerWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => {
      this.updateMobWeights();
      this.unlockConfigs();
    });
    this.configsForm.get(['configsGroup','randomGroup','chargerWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','randomGroup','crawlerWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','randomGroup','mimicWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','randomGroup','pusherWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','randomGroup','wandererWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','randomGroup','warperWeight'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateMobWeights(); this.unlockConfigs(); });
    */

    //updateAvailableMobs
    /* //using input range with mouseup event instead
    this.configsForm.get(['configsGroup','fixedGroup','bouncerNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','chargerNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','crawlerNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','mimicNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','pusherNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','wandererNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    this.configsForm.get(['configsGroup','fixedGroup','warperNum'] as const)?.valueChanges.pipe( debounceTime(ON_CHANGE_DELAY), distinctUntilChanged() ).subscribe(value => { this.updateAvailableMobs(); this.unlockConfigs(); });
    */
  }



  updateConfigs ( event: Event, cEnum: ConfigsEnum ){
    let element: HTMLInputElement = (event.target as HTMLInputElement);
    let value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    //update num-to-range and range-to-num
    switch (cEnum){
      //#region i
      case ConfigsEnum.intervalRange:{
        let val = Math.max(Math.min(value,this.intervalMax),this.intervalMin);
        this.intervalValue = val;
        //this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','intervalGroup','intervalRange'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      case ConfigsEnum.intervalNum:{
        let val = Math.max(Math.min(value,this.intervalMax),this.intervalMin);
        this.intervalValue = val;
        //this.configsForm.get(['configsGroup','intervalGroup','intervalRange'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      //#endregion i

      //#region p
      case ConfigsEnum.playersRange:{
        let val = Math.max(Math.min(value,this.playersMax),this.playersMin);
        this.playersValue = val;
        //this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','playersGroup','playersRange'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      case ConfigsEnum.playersNum:{
        let val = Math.max(Math.min(value,this.playersMax),this.playersMin);
        this.playersValue = val;
        //this.configsForm.get(['configsGroup','playersGroup','playersRange'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      //#endregion p

      //#region h
      case ConfigsEnum.healthRange:{
        let val = Math.max(Math.min(value,this.healthMax),this.healthMin);
        this.healthValue = val;
        //this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','healthGroup','healthRange'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      case ConfigsEnum.healthNum:{
        let val = Math.max(Math.min(value,this.healthMax),this.healthMin);
        this.healthValue = val;
        //this.configsForm.get(['configsGroup','healthGroup','healthRange'] as const)?.patchValue(val, {emitEvent: false});
        //if (value !== val)
        //  this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.patchValue(val, {emitEvent: false});
        break;
      }
      //#endregion h

      //#region gw
      case ConfigsEnum.widthRange:{
        let val = Math.min(Math.max(value, this.widthMin), this.widthMax);
        this.widthValue = val;
        //this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.patchValue(val, {emitEvent: false});
        //if (val !== value)
        //  this.configsForm.get(['configsGroup','widthGroup','widthRange'] as const)?.patchValue(val, {emitEvent: false});
        this.updateAvailableActors(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.widthNum:{
        let val = Math.min(Math.max(value, this.widthMin), this.widthMax);
        this.widthValue = val;
        //this.configsForm.get(['configsGroup','widthGroup','widthRange'] as const)?.patchValue(val, {emitEvent: false});
        //if (val !== value)
        //  this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.patchValue(val, {emitEvent: false});
        this.lockConfigs(); //unlocked after delay and availability update
        break;
      }
      //#endregion gw

      //#region gh
      case ConfigsEnum.heightRange:{
        let val = Math.min(Math.max(value, this.heightMin), this.heightMax);
        this.heightValue = val;
        //this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.patchValue(val, {emitEvent: false});
        //if (val !== value)
        //  this.configsForm.get(['configsGroup','heightGroup','heightRange'] as const)?.patchValue(val, {emitEvent: false});
        this.updateAvailableActors(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.heightNum:{
        let val = Math.min(Math.max(value, this.heightMin), this.heightMax);
        this.heightValue = val;
        //this.configsForm.get(['configsGroup','heightGroup','heightRange'] as const)?.patchValue(val, {emitEvent: false});
        //if (val !== value)
        //  this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.patchValue(val, {emitEvent: false});
        this.lockConfigs(); //unlocked after delay and availability update
        break;
      }
      //#endregion gh

      //#region b
      case ConfigsEnum.boxesRange:{
        //max/min/value updated in updateAvailableMisc
        this.boxesValue = value;
        //this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.patchValue(value, {emitEvent: false});
        this.updateAvailableMisc(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.boxesNum:{
        //max/min/value updated in updateAvailableMisc
        this.boxesValue = value;
        //this.configsForm.get(['configsGroup','boxesGroup','boxesRange'] as const)?.patchValue(value, {emitEvent: false});
        this.lockConfigs(); //unlocked after delay and availability update
        break;
      }
      //#endregion b

      //#region w
      case ConfigsEnum.wallsRange:{
        //max/min/value updated in updateAvailableMisc
        this.wallsValue = value;
        //this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.patchValue(value, {emitEvent: false});
        this.updateAvailableMisc(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.wallsNum:{
        //max/min/value updated in updateAvailableMisc
        this.wallsValue = value;
        //this.configsForm.get(['configsGroup','wallsGroup','wallsRange'] as const)?.patchValue(value, {emitEvent: false});
        this.lockConfigs(); //unlocked after delay and availability update
        break;
      }
      //#endregion w

      //#region r
      case ConfigsEnum.randomRange:{
        //max/min updated in updateAvailableMobs
        this.randomValue = value;
        //this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.patchValue(value, {emitEvent: false});
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.randomNum:{
        //max/min updated in updateAvailableMobs
        this.randomValue = value;
        //this.configsForm.get(['configsGroup','randomGroup','randomRange'] as const)?.patchValue(value, {emitEvent: false});
        this.lockConfigs(); //unlocked after delay and availability update
        break;
      }
      //#endregion r



      //#region weight
      case ConfigsEnum.bouncerWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.chargerWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.crawlerWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.mimicWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.pusherWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.wandererWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }      
      case ConfigsEnum.warperWeight:{
        this.updateMobWeights(); //mouseup trigger:  no delay
        break;
      }
      //#endregion weight


      //#region fixedspawn
      case ConfigsEnum.bouncerNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.chargerNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.crawlerNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.mimicNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.pusherNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.wandererNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      case ConfigsEnum.warperNum:{
        //max/min updated in updateAvailableMobs
        this.updateAvailableMobs(); //mouseup trigger:  no delay
        break;
      }
      //#endregion fixedspawn
    }
    this.checkConfigValidity();
  }


  
  updateAvailableActors (){
    this.maxNumMobs  = Math.round(this.widthValue*this.heightValue*0.15);
    this.minNumBoxes = Math.round(this.widthValue*this.heightValue*0.15);
    this.maxNumBoxes = Math.round(this.widthValue*this.heightValue*0.50);
    this.maxNumMisc  = Math.round(this.widthValue*this.heightValue*0.60);
    this.updateAvailableMisc();
    this.updateAvailableMobs();
  }



  updateAvailableMisc (){
    let numBoxes = this.boxesValue; //this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.value;
    let fixedBoxes = Math.min(this.maxNumBoxes, Math.max(this.minNumBoxes, numBoxes));
    let numWalls = this.wallsValue; //this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.value;
    let availableNumBoxes = this.maxNumBoxes - fixedBoxes;
    let availableNumWalls = this.maxNumMisc - (fixedBoxes + numWalls);
    this.boxesMin = this.minNumBoxes;
    this.boxesMax = this.maxNumBoxes;
    this.wallsMax = this.maxNumMisc - fixedBoxes;
    
    if (numBoxes !== fixedBoxes || numBoxes > this.boxesMax || numBoxes < this.boxesMin){
      this.boxesValue = fixedBoxes; //update issue
      this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.patchValue(fixedBoxes, {emitEvent:false});
      this.configsForm.get(['configsGroup','boxesGroup','boxesRange'] as const)?.patchValue(fixedBoxes, {emitEvent:false});
    }
    if (numWalls > this.wallsMax){
      this.wallsValue = numWalls;
      this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.patchValue(numWalls, {emitEvent: false});
      this.configsForm.get(['configsGroup','wallsGroup','wallsRange'] as const)?.patchValue(numWalls, {emitEvent: false});
    }
    this.boxesAvailable = `Available # of Boxes: ${availableNumBoxes}`;
    this.wallsAvailable = `Available # of Walls: ${availableNumWalls}`;
  }

  

  updateAvailableMobs (){
    let numBouncer = this.configsForm.get(['configsGroup','fixedGroup','bouncerNum'] as const)?.value;
    let numCharger = this.configsForm.get(['configsGroup','fixedGroup','chargerNum'] as const)?.value;
    let numCrawler = this.configsForm.get(['configsGroup','fixedGroup','crawlerNum'] as const)?.value;
    let numMimic = this.configsForm.get(['configsGroup','fixedGroup','mimicNum'] as const)?.value;
    let numPusher = this.configsForm.get(['configsGroup','fixedGroup','pusherNum'] as const)?.value;
    let numWanderer = this.configsForm.get(['configsGroup','fixedGroup','wandererNum'] as const)?.value;
    let numWarper = this.configsForm.get(['configsGroup','fixedGroup','warperNum'] as const)?.value
    let numFixedMobs = numBouncer + numCharger + numCrawler + numMimic + numPusher + numWanderer + numWarper;
    let numRandomMobs = this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.value;
    var totalNumMobs = (numRandomMobs + numFixedMobs);
    this.availableNumMobs = this.maxNumMobs - totalNumMobs;
    if (totalNumMobs >= this.minNumMobs && totalNumMobs <= this.maxNumMobs){
      this.mobsAvailable = `Available # of Mobs: ${this.availableNumMobs}`;
      if (this.mobsAvailableClass.includes('invalid_input')){
        this.configsForm.get(['configsGroup','fixedGroup'] as const)?.removeValidators(this.InvalidatorFn);
        this.configsForm.get(['configsGroup','randomGroup'] as const)?.removeValidators(this.InvalidatorFn);
        this.mobsAvailableClass = this.mobsAvailableClass.filter(klass => klass !== 'invalid_input');
        this.mobsAvailableClass.push('valid_input');
      }
    }
    else {
      if (totalNumMobs < this.minNumMobs)
        this.mobsAvailable = `Required # of Mobs: ${this.minNumMobs-totalNumMobs}`;
      else if (totalNumMobs > this.maxNumMobs)
        this.mobsAvailable = `# of Mobs to remove: ${this.availableNumMobs}`;
      if (!this.mobsAvailableClass.includes('invalid_input')){
        this.configsForm.get(['configsGroup','fixedGroup'] as const)?.addValidators(this.InvalidatorFn);
        this.configsForm.get(['configsGroup','randomGroup'] as const)?.addValidators(this.InvalidatorFn);
        this.mobsAvailableClass = this.mobsAvailableClass.filter(klass => klass !== 'valid_input');
        this.mobsAvailableClass.push('invalid_input');
      }
    }
    this.randomMax = this.maxNumMobs - numFixedMobs;
    
    //decided not to update exact and/or force value to at most max
    this.bouncerMax = this.maxNumMobs - numRandomMobs;  
    this.chargerMax = this.maxNumMobs - numRandomMobs;
    this.crawlerMax = this.maxNumMobs - numRandomMobs;
    this.mimicMax = this.maxNumMobs - numRandomMobs;
    this.pusherMax = this.maxNumMobs - numRandomMobs;
    this.wandererMax = this.maxNumMobs - numRandomMobs;
    this.warperMax = this.maxNumMobs - numRandomMobs;

    this.configsForm.get(['configsGroup','fixedGroup'] as const)?.updateValueAndValidity();
    this.configsForm.get(['configsGroup','randomGroup'] as const)?.updateValueAndValidity();
  }



  updateMobWeights (){
    let weightBouncers =  this.configsForm.get(['configsGroup','randomGroup','bouncerWeight'] as const)?.value;
    let weightChargers =  this.configsForm.get(['configsGroup','randomGroup','chargerWeight'] as const)?.value;
    let weightCrawlers =  this.configsForm.get(['configsGroup','randomGroup','crawlerWeight'] as const)?.value;
    let weightMimics =    this.configsForm.get(['configsGroup','randomGroup','mimicWeight'] as const)?.value;
    let weightPushers =   this.configsForm.get(['configsGroup','randomGroup','pusherWeight'] as const)?.value;
    let weightWanderers = this.configsForm.get(['configsGroup','randomGroup','wandererWeight'] as const)?.value;
    let weightWarpers =   this.configsForm.get(['configsGroup','randomGroup','warperWeight'] as const)?.value;
    let totalWeight = weightBouncers + weightChargers + weightCrawlers + weightMimics + weightPushers + weightWanderers + weightWarpers;
    this.bouncerChance = `${(weightBouncers / totalWeight).toFixed(2)}% ( ${weightBouncers} / ${totalWeight} ) chance to spawn`;
    this.chargerChance = `${(weightChargers / totalWeight).toFixed(2)}% ( ${weightChargers} / ${totalWeight} ) chance to spawn`;
    this.crawlerChance = `${(weightCrawlers / totalWeight).toFixed(2)}% ( ${weightCrawlers} / ${totalWeight} ) chance to spawn`;
    this.mimicChance = `${(weightMimics / totalWeight).toFixed(2)}% ( ${weightMimics} / ${totalWeight} ) chance to spawn`;
    this.pusherChance = `${(weightPushers / totalWeight).toFixed(2)}% ( ${weightPushers} / ${totalWeight} ) chance to spawn`;
    this.wandererChance = `${(weightWanderers / totalWeight).toFixed(2)}% ( ${weightWanderers} / ${totalWeight} ) chance to spawn`;
    this.warperChance = `${(weightWarpers / totalWeight).toFixed(2)}% ( ${weightWarpers} / ${totalWeight} ) chance to spawn`;
  }



  checkConfigValidity () {
    let invalids: string[] = [];
    if (this.configsForm.get(['configsGroup', 'roomName'])?.invalid) {invalids.push('- room name');}
    if (this.configsForm.get(['configsGroup','intervalGroup'] as const)?.invalid) {invalids.push('- interval');}
    if (this.configsForm.get(['configsGroup','playersGroup'] as const)?.invalid)  {invalids.push('- max number of players');}
    if (this.configsForm.get(['configsGroup','healthGroup'] as const)?.invalid)   {invalids.push('- health points');}
    if (this.configsForm.get(['configsGroup','widthGroup'] as const)?.invalid)    {invalids.push('- grid width');}
    if (this.configsForm.get(['configsGroup','heightGroup'] as const)?.invalid)   {invalids.push('- grid height');}
    if (this.configsForm.get(['configsGroup','boxesGroup'] as const)?.invalid)    {invalids.push('- number of boxes');}
    if (this.configsForm.get(['configsGroup','wallsGroup'] as const)?.invalid)    {invalids.push('- number of walls');}
    if (this.configsForm.get(['configsGroup','randomGroup'] as const)?.invalid)   {invalids.push('- number of weighted random mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    if (this.configsForm.get(['configsGroup','fixedGroup'] as const)?.invalid)    {invalids.push('- number of fixed mob spawns');}
    this.configInvalids = invalids;
  }





  createRoom (){  //submit room
    if (this.configsForm.get(['configsGroup'] as const)?.invalid){
      alert('Invalid configs');
      return;
    }
    this.lockButtons();
    this.lockConfigs();
    this.client.onWaiting();

    let configs: RoomConfigs = {
      intervalTime:     this.configsForm.get(['configsGroup','intervalGroup','intervalNum'] as const)?.value,
      maxNumPlayers:    this.configsForm.get(['configsGroup','playersGroup','playersNum'] as const)?.value,
      maxHealthPoints:  this.configsForm.get(['configsGroup','healthGroup','healthNum'] as const)?.value,
      gridHeight:       this.configsForm.get(['configsGroup','widthGroup','widthNum'] as const)?.value,
      gridWidth:        this.configsForm.get(['configsGroup','heightGroup','heightNum'] as const)?.value,
      numBoxes:         this.configsForm.get(['configsGroup','boxesGroup','boxesNum'] as const)?.value,
      numWalls:         this.configsForm.get(['configsGroup','wallsGroup','wallsNum'] as const)?.value,
      numRandomMobs:    this.configsForm.get(['configsGroup','randomGroup','randomNum'] as const)?.value,
      randomMobWeights: {
        Bouncer:  this.configsForm.get(['configsGroup','randomGroup','bouncerWeight'] as const)?.value,
        Charger:  this.configsForm.get(['configsGroup','randomGroup','chargerWeight'] as const)?.value,
        Crawler:  this.configsForm.get(['configsGroup','randomGroup','crawlerWeight'] as const)?.value,
        Mimic:    this.configsForm.get(['configsGroup','randomGroup','mimicWeight'] as const)?.value,
        Pusher:   this.configsForm.get(['configsGroup','randomGroup','pusherWeight'] as const)?.value,
        Wanderer: this.configsForm.get(['configsGroup','randomGroup','wandererWeight'] as const)?.value,
        Warper:   this.configsForm.get(['configsGroup','randomGroup','warperWeight'] as const)?.value
      },
      fixedMobAmounts: {
        numBouncer:   this.configsForm.get(['configsGroup','fixedGroup','bouncerNum'] as const)?.value,
        numCharger:   this.configsForm.get(['configsGroup','fixedGroup','chargerNum'] as const)?.value,
        numCrawler:   this.configsForm.get(['configsGroup','fixedGroup','crawlerNum'] as const)?.value,
        numMimic:     this.configsForm.get(['configsGroup','fixedGroup','mimicNum'] as const)?.value,
        numPusher:    this.configsForm.get(['configsGroup','fixedGroup','pusherNum'] as const)?.value,
        numWanderer:  this.configsForm.get(['configsGroup','fixedGroup','wandererNum'] as const)?.value,
        numWarper:    this.configsForm.get(['configsGroup','fixedGroup','warperNum'] as const)?.value
      }
    }
    let pack: CreateRoom = {
      type: 'create_room',
      player_id: this.user.id,
      name: this.configsForm.get(['configsGroup','roomName'] as const)?.value,
      configs: configs
    }
    this.awaitingJoin = true;
    this.joinTimeout = setTimeout((_this)=>{
      _this.setDefaults();
      _this.client.onFinishedWaiting();
      console.log('!! lobby create room time out'); 
      alert('Could not create game room, request timed out!');
      //_this.router.navigate(['login']);
    },TIMEOUT_SECONDS*1000, this);
    this.awaitToken = this.user.id +'_'+ Date.now();
    pack['token'] = this.awaitToken;
    this.client.sendPackage(pack);
  }
}




enum ConfigsEnum {
  'name',
  'intervalRange',
  'intervalNum',
  'playersRange',
  'playersNum',
  'healthRange',
  'healthNum',
  'widthRange',
  'widthNum',
  'heightRange',
  'heightNum',
  'boxesRange',
  'boxesNum',
  'wallsRange',
  'wallsNum',
  'randomRange',
  'randomNum',
  'bouncerWeight',
  'bouncerNum',
  'chargerWeight',
  'chargerNum',
  'crawlerWeight',
  'crawlerNum',
  'mimicWeight',
  'mimicNum',
  'pusherWeight',
  'pusherNum',
  'wandererWeight',
  'wandererNum',
  'warperWeight',
  'warperNum'
}


enum TogglableEnum {
  'randomMobs',
  'fixedMobs'
}
