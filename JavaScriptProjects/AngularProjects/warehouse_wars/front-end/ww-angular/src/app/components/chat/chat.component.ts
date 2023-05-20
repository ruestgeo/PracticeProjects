import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, ComponentRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';


import { ChatService } from 'src/app/services/chat/common/chat.service';
import { ChatElement, ChatElementOptions } from 'src/app/services/chat/common/ChatElement';
import { ChatEntryDirective } from 'src/app/directives/chat/chat-entry.directive';
import { ChatState } from 'src/app/services/chat/common/ChatState';
import { DeliveryState } from 'src/app/services/chat/common/delivery-state';
import { ChatStatusDirective } from 'src/app/directives/chat/chat-status.directive';
import { ChatStatusInfoComponent } from './chat-status-info/chat-status-info.component';
import { UniqueIdService } from 'src/app/services/util/uid/unique-id.service';

import configs from 'src/app/components/chat/chat-configs.json';
import { ChatEntryComponent } from './chat-entry/chat-entry.component';
import { WwChatService } from 'src/app/services/chat/ww/ww-chat.service';
import { FocusElement, FocusManager } from 'src/app/services/focus-manager.service';
import { UserProfile } from 'src/app/types/User';


const dateOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
  timeZone: "UTC"
}
const dateFormat = new Intl.DateTimeFormat("en-US", dateOptions);




@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked, FocusElement {
  @ViewChild('chatlog') logDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('chatStatus') statusDiv!: ElementRef<HTMLDivElement>;
  @ViewChild(ChatStatusDirective, {static: true}) statusHost!: ChatStatusDirective;
  @ViewChild(ChatEntryDirective, {static: true}) logHost!: ChatEntryDirective;
  chatForm: FormGroup;

  serviceEnabled: boolean;
  autoScroll: boolean = true;
  checkScroll: boolean = false;
  chatQueue: HTMLElement[] = [];

  focus: boolean = false;

  get username (){ return this.user.name; }

  //status: DeliveryState = DeliveryState.default;
  stateEnum: typeof DeliveryState = DeliveryState;

  statusInfo: {[id:string]: ComponentRef<ChatStatusInfoComponent>} = {};
  statusTimeout: {[id:string]: NodeJS.Timeout} = {};





  constructor (private chatService: ChatService, private formBuilder: FormBuilder,
    private renderer: Renderer2, private generator: UniqueIdService, 
    private focusManager: FocusManager, private user: UserProfile) 
  {
    this.chatForm = this.formBuilder.group({
      chatText: new FormControl({ value: '', disabled: true }),
      chatSubmit: new FormControl({ value: 'Send', disabled: true }),
      toggleScroll: new FormControl('Disable Jump-To-Newest')
    });

    this.serviceEnabled = this.chatService.enabled;
  }


  
  ngAfterViewChecked(): void {
    if (this.autoScroll && this.checkScroll){
      this.renderer.setProperty(this.logDiv.nativeElement, 'scrollTop', this.logDiv.nativeElement.scrollHeight);
      this.checkScroll = false;
    }
      
  }



  ngOnDestroy () {
      this.focusManager.removeThis(this);
  }



  ngOnInit () {
    this.focusManager.addThis(this);

    this.chatService.enabledObservable.subscribe(enabled => this.serviceEnabled = enabled);

    this.chatForm.controls['chatText'].valueChanges.subscribe(_ => {
      if (this.chatForm.controls['chatText'].valid && this.chatForm.controls['chatSubmit'].disabled)
        this.chatForm.controls['chatSubmit'].enable();
      else if (this.chatForm.controls['chatText'].invalid && this.chatForm.controls['chatSubmit'].enabled)
        this.chatForm.controls['chatSubmit'].disable();
    });

    this.chatForm.controls['chatText'].setValidators([Validators.minLength(1), Validators.required]);
    this.chatForm.controls['chatText'].updateValueAndValidity();
    if (this.chatForm.controls['chatText'].invalid)
        this.chatForm.controls['chatSubmit'].disable();


    this.chatService.chatObservable.subscribe((pack: ChatElement) => {
      this.receiveMessage(pack);
    });

    this.chatService.statusInfoObservable.subscribe((id: string) => {
      this.onCloseStatusInfo(id, this.statusTimeout, this.statusInfo);
    });

    this.chatService.stateObservable.subscribe((status: ChatState) => {
      console.log(`status: ${JSON.stringify(status)}`);
      switch (status.state){
        /*case DeliveryState.default: {
          break;
        }*/
        case DeliveryState.sending: {
          if (status.message)
            this.createStatusInfo({
              status: status.state, 
              text: status.message,
              duration: 1000, 
              class: ['chat-status-entry', 'chat-status-sending']
            });
          break;
        }
        case DeliveryState.success: {
          if (status.message)
            this.createStatusInfo({
              status: status.state, 
              text: status.message,
              duration: 2000, 
              class: ['chat-status-entry', 'chat-status-success']
            });
          break;
        }
        case DeliveryState.failed: {
          if (status.message)
            this.createStatusInfo({
              status: status.state, 
              text: status.message,
              duration: 4000, 
              class: ['chat-status-entry', 'chat-status-failed']
            });
          break;
        }
        case DeliveryState.complete: {
          if (status.message)
            this.createStatusInfo({
              status: status.state, 
              text: status.message,
              duration: 1000, 
              class: ['chat-status-entry', 'chat-status-sending']
            });
          break;
        }
        case DeliveryState.error: {
          if (status.message)
            this.createStatusInfo({
              status: status.state, 
              text: status.message, //`[${dateFormat.format(Date.now())}] An error occurred:  ${err.name} ::   ${err.message}`
              duration: 10000, 
              class: ['chat-status-entry', 'chat-status-error']
            });
          break;
        }
      }

      if (status.state === DeliveryState.complete ){
        this.chatForm.controls['chatText'].patchValue('');
      }

      if (!status.enabled && this.chatForm.controls['chatSubmit'].enabled){
        this.chatForm.controls['chatSubmit'].disable();
      }
      else if (status.enabled && this.chatForm.controls['chatSubmit'].disabled && this.chatForm.controls['chatText'].valid){
        this.chatForm.controls['chatSubmit'].enable();
      }
      if (status.enabled && this.chatForm.controls['chatText'].disabled){
        this.chatForm.controls['chatText'].enable();
      }
    });
  }



  createStatusInfo (opt: {status: DeliveryState, text: string, duration: number, class?: string[], style?: string}) {
    this.generator.generateUniqueId('z0.z', {collection: '_chat-status', numAttempts: 10})
    .then(id => {
      let infoComponent: ComponentRef<ChatStatusInfoComponent> = this.statusHost.viewContainerRef.createComponent(ChatStatusInfoComponent);
      infoComponent.setInput('id', id);
      infoComponent.setInput('text', opt.text);
      if (opt.style)   infoComponent.setInput('style', opt.style ?? '');
      if (opt.class)   infoComponent.setInput('classes', opt.class ?? []);

      this.statusInfo[id] = infoComponent;
      this.statusTimeout[id] = setTimeout(this.onCloseStatusInfo, opt.duration, id, this.statusTimeout, this.statusInfo);
    })
    .catch(err => {
      console.error(`${err}\n-- Could not create chat status info component: \n${JSON.stringify(opt)}`);
    });
  }


  createChatEntry (chatElem: ChatElement){
    //creating an angular component dynamically
    let entryComponent: ComponentRef<ChatEntryComponent> = this.logHost.viewContainerRef.createComponent(ChatEntryComponent);
    entryComponent.setInput('html', chatElem.html.outerHTML);
    if (chatElem.options?.token)   entryComponent.setInput('token', chatElem.options?.token ?? null);
    if (chatElem.options?.style)   entryComponent.setInput('style', chatElem.options?.style ?? '');
    if (chatElem.options?.class)   entryComponent.setInput('classes', chatElem.options?.class ?? ['chat-entry']);

    //let idx = this.logHost.viewContainerRef.indexOf(entryComponent.hostView);
    //if (idx > 0)   this.logHost.viewContainerRef.remove(idx);
    if (this.logHost.viewContainerRef.length > configs.queueLimit) 
      this.logHost.viewContainerRef.remove(0); //new entries are added as the last entry
    //alternatively keep an array queue of ComponentRef and use .destroy()


    //creating a regular DOM object dynamically
    /*
    let options = chatElem.options;
    let newMessage = this.renderer.createElement('div') as HTMLDivElement;
    this.renderer.addClass(newMessage,'chat-entry');
    if (options?.class) 
      for (let clas of options.class ){
        this.renderer.addClass(newMessage,clas);
      }
    if (options?.style)
      this.renderer.setProperty(this.logDiv.nativeElement,'style', options.style);
    this.renderer.appendChild(newMessage, chatElem.html);
    this.renderer.appendChild(this.logDiv.nativeElement, newMessage);
    this.chatQueue.push(newMessage);

    if (this.chatQueue.length > configs.queueLimit){
      let oldestMessage = this.chatQueue.shift();
      this.renderer.removeChild(this.logDiv.nativeElement, oldestMessage);
    }
    */
  }




  enableChat (): void {
    if (this.chatForm.controls['chatText'].valid)
      this.chatForm.controls['chatText'].enable();
  }
  disableChat (): void {
    this.chatForm.controls['chatText'].disable();
  }


  
  sendMessage (): void {
    if (this.chatForm.controls['chatText'].valid){
      let content: string = this.chatForm.controls['chatText'].value;
      this.chatService.sendMessage(content)
      .catch(err => {
        let message = err instanceof Error ? err.name : `Send_Message_Error ::   ${JSON.stringify(err)}`;
        this.createStatusInfo({
          status: DeliveryState.error, 
          text: `[${dateFormat.format(Date.now())}] An error occurred:  ${message}`,
          duration: 10000, 
          class: ['chat-status-entry', 'chat-status-error']
        });
        if (this.chatForm.controls['chatSubmit'].disabled && this.chatForm.controls['chatText'].valid){
          this.chatForm.controls['chatSubmit'].enable();
        }
        if (this.chatForm.controls['chatText'].disabled){
          this.chatForm.controls['chatText'].enable();
        }
      });
    }
  }



  receiveMessage (chatElem: ChatElement): void {
    this.createChatEntry(chatElem);
    
    //this seems to be updating before the chat element is added, so it was moved to afterViewCheck
    //if (this.autoScroll)
    //  this.renderer.setProperty(this.logDiv.nativeElement, 'scrollTop', this.logDiv.nativeElement.scrollHeight);
    this.checkScroll = true;
  }



  toggleChatScroll (): void {
    this.autoScroll = ! this.autoScroll;
    this.chatForm.controls['toggleScroll'].patchValue(this.autoScroll ? 'Disable Jump-To-Newest' : 'Enable Jump-To-Newest');
    
    if (this.autoScroll)
      this.renderer.setProperty(this.logDiv.nativeElement, 'scrollTop', this.logDiv.nativeElement.scrollHeight);
  }



  onFocus (): void {
    //this.chatService.focus = true;
    this.focus = true;
  }



  onBlur (): void {
    //this.chatService.focus = false;
    this.focus = false;
  }



  onCloseStatusInfo (id: string, statusTimeout: {[id:string]:NodeJS.Timeout}, statusInfo: {[id:string]: ComponentRef<ChatStatusInfoComponent>}): void {
    clearTimeout(statusTimeout[id]);
    if (statusTimeout.hasOwnProperty(id))
      delete statusTimeout[id]; 
    if (statusInfo.hasOwnProperty(id)){
      statusInfo[id].destroy();
      delete statusInfo[id];
    }
  }

  reconnect (){
    this.chatService.connect();
  }
}
