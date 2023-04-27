import { Component,OnInit } from '@angular/core';
//import { ITEMS } from 'src/app/my-example-items';
import {Item} from 'src/app/Item';

import { ElementService } from 'src/app/myServices/element.service';
import { AddItemToggleService, MyEvents  } from 'src/app/myServices/add-item-toggle.service';

import {trigger,  state,  style,  animate,  transition} from '@angular/animations';



@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  animations: [
    trigger ('simpleAnimation', [
      //*
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*' }),
        animate('500ms ease-out', style({ opacity: 0, height: '0px' }))
      ])
      //*/
      /*
      state('true', style({ opacity: 1, height: '*' })),
      state('false', style({ opacity: 0, height: '0' })),
      transition('true => false', animate('500ms ease-out', style({ opacity: 0, height: '0' }))),
      transition('false => true', animate('500ms ease-in', style({ opacity: 1, height: '*' })))
      */
    ])
  ]
})
export class ItemsComponent implements OnInit{
  //items: Item[] = ITEMS;
  items: Item[] = [];

  addItemVisible: boolean = false; //only accessible to items component

  constructor(private elementService: ElementService, private toggleService: AddItemToggleService){}

  ngOnInit(): void {
      //this.items = this.elementService.getItems();
      this.elementService.getItems().subscribe((fetchedItems) => {this.items = fetchedItems;}); //observable is similar to promise

      //EventBus
      /*
      this.toggleService.on( MyEvents.toggleAddItem, (data => {
        this.addItemVisible = data;
        console.log(`items toggle state: ${this.addItemVisible}`);
      }) ); //can set this to var and unsubscribe onDestroy
      */

      //ObservableService
      //*
      this.toggleService.toggleChanged.subscribe(toggleState => {
        this.addItemVisible = toggleState;
        console.log(`items toggle state: ${this.addItemVisible}`);
      });
      //*/
  }

  deleteItemEnd (item: Item): void {
    this.elementService.deleteItem(item).subscribe((returnedItem) => {
      //remove the item from the UI list of items after commit
      //let removedItem: Item = this.items.splice(this.items.indexOf(fetchedItem),1);
      this.items = this.items.filter((itemX) => itemX.id !== returnedItem.id);
    });
  }

  updateItemEnd (itemPartial: Item): void {
    this.elementService.updateItem(itemPartial).subscribe((returnedItem) => {
      //replace existing item with updated version after commit
      this.items = this.items.map((itemX) => {
        if (itemX.id === returnedItem.id) 
          return returnedItem; 
        return itemX;
      });
    });
  }

  createItemEnd (itemPrototype: Item): void {
    this.elementService.createItem(itemPrototype).subscribe((returnedItem) => {
      //add the item to the UI list of items after commit
      this.items.push(returnedItem);
    });
  }
  //this.elementService.addItem(item).subscribe((fetchedItem) => {this.items.push(fetchedItem);});
}
