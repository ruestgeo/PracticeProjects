import { Inject, Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { DEFAULT_RENDERER } from 'src/app/injectionTokens/Renderer2';

import { User, isUser, UserProfile } from 'src/app/types/User';
//import { ChatPackagerInterface } from "src/app/services/chat/common/ChatPackagerInterface";
import { ChatElement } from 'src/app/services/chat/common/ChatElement';
import { ChatState } from 'src/app/services/chat/common/ChatState';
import { DeliveryState } from 'src/app/services/chat/common/delivery-state';
import { FocusElement } from 'src/app/services/focus-manager.service';




@Injectable({
  providedIn: 'root'
})
export class ChatService {

  protected chatSubject: Subject<ChatElement> = new Subject<ChatElement>();
  chatObservable: Observable<ChatElement> = this.chatSubject.asObservable();

  protected stateSubject: BehaviorSubject<ChatState> = new BehaviorSubject<ChatState>({state:DeliveryState.default, message: '', enabled: false}); 
  stateObservable: Observable<ChatState> = this.stateSubject.asObservable();

  protected statusInfoSubject: Subject<string> = new Subject<string>();
  statusInfoObservable: Observable<string> = this.statusInfoSubject.asObservable();

  protected enabledSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  enabledObservable: Observable<boolean> = this.enabledSubject.asObservable();
  set enabled (val: boolean){  this.enabledSubject.next(val);  }
  get enabled (): boolean{  return this.enabledSubject.getValue();  }


  
  
  //protected focusSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  //focusObservable: Observable<boolean> = this.focusSubject.asObservable();
  //set focus (val: boolean){  this.focusSubject.next(val);  }
  //get focus (): boolean{  return this.focusSubject.getValue();  }




  constructor (@Inject(DEFAULT_RENDERER) protected renderer: Renderer2, protected user: UserProfile){}



  update () { //update with whether the service is ready
      this.stateSubject.next({state: DeliveryState.default, enabled: true, message: ''});
  }
  //send
  //this.chatService.update();

  //receive
  //this.chatService.stateObservable.subscribe((status: ChatState) => doStuff)



  async sendMessage (content: any): Promise<boolean> {
    //basic service is completely local, no server
    this.receiveMessage(content);
    this.stateSubject.next({state: DeliveryState.complete, enabled: true, message: 'Message sent'});
    return true; //return if successfully sent
  };
  
  receiveMessage (content: any): void {
    this.chatSubject.next({html: this.renderer.createText(`${this.user.name} :   ${content}`), token: '@me'} as ChatElement);
  }

  async fetchMessage (options: {token: string, [opt: string]: any}): Promise<void> {
    return;
  }




  connect (){
    this.enabled = true;
  }
  disconnect (){
    this.enabled = false;
  }




  onCloseStatusInfo (id:string){
    this.statusInfoSubject.next(id);
  }
  //send
  //this.chatService.onCloseStatusInfo(id);

  //receive
  //this.chatService.statusInfoObservable.subscribe((id: string) => doStuff)

}
