import { Component, Input } from '@angular/core';
import { ChatService } from 'src/app/services/chat/common/chat.service';

@Component({
  selector: 'chat-status-info',
  templateUrl: './chat-status-info.component.html',
  styleUrls: ['./chat-status-info.component.css']
})
export class ChatStatusInfoComponent {
  @Input() id: string = '';
  @Input() text: string = '';
  @Input() style: string = '';
  @Input() classes: string[] = [];


  constructor (private chatService: ChatService){}


  closeStatusInfo (){
    this.chatService.onCloseStatusInfo(this.id);
  }


}
