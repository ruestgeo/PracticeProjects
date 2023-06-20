import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FocusManager } from 'src/app/services/focus-manager.service';
import { ClientService } from 'src/app/services/game/client/client.service';
import { GameMovement, KeyAction, RoomService } from 'src/app/services/game/room.service';
import { isDefeat, isRemovedFromRoom, isVictory } from 'src/app/types/ClientReceive';
import { LeaveRoom } from 'src/app/types/ClientSend';
import { UserProfile } from 'src/app/types/User';
import { WWUserProfile } from 'src/app/types/WWUser';

@Component({
  selector: 'ww-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  infoVisible: boolean = false;
  //gyroMove: boolean = false; //not implemented

  overlayVisible: boolean = false;
  overlayText: string = '';

  gameOver: boolean = false;
  get ready (){ return this.room.ready; }

  key: typeof KeyAction = KeyAction;

  private subscriptions: Subscription[] = [];



  constructor (private client: ClientService, private room: RoomService, 
    private focusManager: FocusManager, 
    private user: UserProfile /*injected as WWUserProfile*/,
    private router: Router){}


  ngOnDestroy() {
    for (let sub of this.subscriptions){
      sub.unsubscribe();
    }
    this.subscriptions = [];
    this.client.onFinishedWaiting();
    this.room.destroy();
  }
  ngOnInit() {
    this.setDefaults();
    this.room.initService();
    let subscription: Subscription;

    subscription = this.client.auth.subscribe(authorized => {
      if (authorized)   return;
      let expiryMessage = `UserId cookie expired\nid: [${this.user.id}]\npath: ${this.router.url}`;
      console.log(expiryMessage);
    });
    this.subscriptions.push(subscription);

    //subscription = this.client.socketIsOpenObservable.subscribe((isOpen)=>{
    //  if (!isOpen){
    //    //this.setDefaults();
    //    //this.client.onFinishedWaiting();
    //  }
    //});
    //this.subscriptions.push(subscription);

    subscription = this.client.packObservable.subscribe(pack => {
      if (this.gameOver)   return;
      if (isVictory(pack)){
        this.gameOver = true;
        this.room.updateLock = true;
        this.overlayText = "Victory!";
        this.overlayVisible = true;
      }
      else if (isDefeat(pack)){
        this.gameOver = true;
        this.room.updateLock = true;
        this.overlayText = "Defeat...";
        this.overlayVisible = true;
      }
      else if (isRemovedFromRoom(pack)){
        this.gameOver = true;
        this.room.updateLock = true;
        alert(`Removed from game room\nreason:  ${pack.reason}`);
        this.room.destroy();
        this.router.navigate(['lobby']);
      }
      else
        this.room.handlePack(pack);
    });
  }



  setDefaults (){
    this.gameOver = false;
    this.overlayText = "Hello World!";
    this.overlayVisible = false;
  }



  leaveRoom (){
    let pack: LeaveRoom = {
      type: 'leave_room',
      player_id: this.user.id,
      room_id: this.room.id
    };
    this.room.updateLock = true;
    this.room.destroy();
    this.client.sendPackage(pack);
    this.router.navigate(['lobby']);
  }



  //#region keyControl

  //@HostListener('document:keydown.shift', ['$event'])
  //specialAction (event: KeyboardEvent){ this.keydown(KeyAction.special, event); }

  @HostListener('document:keydown.w', ['$event'])
  @HostListener('document:keydown.arrowup', ['$event'])
  @HostListener('document:keydown.shift.w', ['$event'])
  @HostListener('document:keydown.shift.arrowup', ['$event'])
  moveUp (event: KeyboardEvent){ this.keydown(KeyAction.up, event); }

  @HostListener('document:keydown.s', ['$event'])
  @HostListener('document:keydown.arrowdown', ['$event'])
  @HostListener('document:keydown.shift.s', ['$event'])
  @HostListener('document:keydown.shift.arrowdown', ['$event'])
  moveDown (event: KeyboardEvent){ this.keydown(KeyAction.down, event); }

  @HostListener('document:keydown.a', ['$event'])
  @HostListener('document:keydown.arrowleft', ['$event'])
  @HostListener('document:keydown.shift.a', ['$event'])
  @HostListener('document:keydown.shift.arrowleft', ['$event'])
  moveLeft (event: KeyboardEvent){ this.keydown(KeyAction.left, event); }

  @HostListener('document:keydown.d', ['$event'])
  @HostListener('document:keydown.arrowright', ['$event'])
  @HostListener('document:keydown.shift.d', ['$event'])
  @HostListener('document:keydown.shift.arrowright', ['$event'])
  moveRight (event: KeyboardEvent){ this.keydown(KeyAction.right, event); }

  keydown (key: KeyAction, event: KeyboardEvent){
    if (!this.focusManager.noneInFocus()) 
      return;
    if (event.shiftKey  &&  !this.room.specialAction)
      this.room.specialAction = true;
    else if (!event.shiftKey  &&  this.room.specialAction)
      this.room.specialAction = false;
    if (key === KeyAction.special) 
      return;
    switch (key){
      case KeyAction.up:    { this.room.sendControl(GameMovement.up   ); break; }
      case KeyAction.down:  { this.room.sendControl(GameMovement.down ); break; }
      case KeyAction.left:  { this.room.sendControl(GameMovement.left ); break; }
      case KeyAction.right: { this.room.sendControl(GameMovement.right); break; }
    }
  }

  @HostListener('document:keyup.shift', ['$event'])
  keyup (event: KeyboardEvent){
    if (!this.focusManager.noneInFocus()) return;
    //if (!event.shiftKey  &&  this.room.specialAction)
    this.room.specialAction = false;
  }



  @HostListener('document:keydown.m', ['$event'])
  @HostListener('document:keydown.shift.m', ['$event'])
  mimicReveal (event: KeyboardEvent){ 
    console.log('mimic reveal key press');
    this.room.mimicReveal(); 
  }

  //#endregion keyControl
}

