import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item } from 'src/app/Item';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {
  @Input() item: Item = {"id":-1, "text": "--"};
  @Output() onDeleteItem: EventEmitter<Item> = new EventEmitter();
  @Output() onUpdateItem: EventEmitter<Item> = new EventEmitter();

  

  constructor (){
    if (!this.item.hasOwnProperty('toggle')) this.item['toggle'] = false;
  }

  deleteItem (item: Item): void{
    console.log(`attempting delete item ${JSON.stringify(item)}`);
    this.onDeleteItem.emit(item);
  }

  toggleHighlight (item: Item): void {
    console.log(`attempting toggle ${item.id} to ${!item.toggle}`);
    //item.toggle = !item.toggle; //moved to service to change after response
    this.onUpdateItem.emit({"id": item.id, "toggle": !item.toggle});
  }

  updateItem (item: Item, updatePartial: Item): void {
    console.log(`attempting update item ${item.id}`);
    this.onUpdateItem.emit(Object.assign({}, updatePartial, {"id": item.id}));
  }
}
