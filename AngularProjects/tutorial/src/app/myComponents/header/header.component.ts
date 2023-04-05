import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AddItemToggleService, MyEvent, MyEvents } from 'src/app/myServices/add-item-toggle.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  title: string = 'My Header Component';
  
  addItemVisible: boolean = false; //only accessible to header

  /* it is not advisable to daisy chain Events from parent to child sequentially
  when needing to pass data to a child of child of greater depth, 
  or across child components of x-depth in different branches.
  instead we can create an event bus or observable service
  @Output() onAddItemVisibilityToggle: EventEmitter<boolean> = new EventEmitter();
  */

  constructor (private toggleService: AddItemToggleService){}
  ngOnInit(): void {}

  toggleAddItem(){
    this.addItemVisible = !this.addItemVisible;
    //this.onAddItemVisibilityToggle.emit(this.addItemVisible);

    //Event Bus
    //this.toggleService.emit( new MyEvent(MyEvents.toggleAddItem, this.addItemVisible ) );

    //Observable Service
    this.toggleService.toggleAddItem();

    console.log(`header toggle state: ${this.addItemVisible}`);
  }
}
