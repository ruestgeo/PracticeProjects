import { Component, Input } from '@angular/core';
import { User } from 'src/app/types/User';

@Component({
  selector: 'chat-entry',
  templateUrl: './chat-entry.component.html',
  styleUrls: ['./chat-entry.component.css']
})
export class ChatEntryComponent {
  @Input() token: string | null = null;
  @Input() author: User | null = null;
  
  @Input() html: string = '';
  @Input() style: string = '';
  @Input() classes: string[] = [];
  
}
