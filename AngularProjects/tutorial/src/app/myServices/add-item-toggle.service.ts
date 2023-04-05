import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject, Subscription, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';



/*
EventBus: loosely coupled / anonymous, global shared mediator
ObservableService: simple sending messages
 */

@Injectable({
  providedIn: 'root'
})
export class AddItemToggleService {

  constructor() { }

  //Event Bus
  //#region EventBus
  private subject = new Subject<MyEvent>();
  emit (event: MyEvent) {
    this.subject.next(event); 
  } 
  on ( event: MyEvents, doStuff: ((value: any) => void) ): Subscription {
    return this.subject.pipe(//combine the following
      filter((e: MyEvent) => e.name == event), //filter list for given name
      map((e: MyEvent) => e.data) //return data of matching name
    ).subscribe(doStuff); //exec doStuff function on the data
  }
  //toggleService.emit( new MyEvent(MyEvents.someEvent, ?someData ) );
  //toggleService.on( MyEvents.someEvent, (data => doSomething) ); dosomething = arg => { console.log(arg); }

  //send
  //this.toggleService.emit( new MyEvent(MyEvents.toggleAddItem, this.addItemVisible ) );

  //receive
  //this.toggleService.on( MyEvents.toggleAddItem, (data => this.addItemVisible = data) );

  //#endregion EventBus



  //Observable Service
  //#region ObservableService

  private toggleState: boolean = false;
  private toggleSubject: Subject<boolean> = new Subject<boolean>();
  toggleChanged: Observable<boolean> = this.toggleSubject.asObservable();

  toggleAddItem (/*newState: boolean*/) {
    this.toggleState = !this.toggleState;
    this.toggleSubject.next(this.toggleState);
  }

  //send
  //this.toggleService.toggleAddItem();

  //receive
  //this.toggleService.toggleChanged.subscribe(toggleState => this.addItemVisible = toggleState)


  /* 
  alternatively can use EventEmitter

  @Output toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  toggleAddItem (newState: boolean) {
    this.toggle.emit(newState);
  }

  //send
  //this.toggleService.toggleAddItem(this.addItemVisible);

  //receive
  //this.toggleService.toggle.subscribe(toggleState => this.addItemVisible = toggleState)
  */

  //#endregion ObservableService

}


//#region eventBus

//these can go in their own file
export enum MyEvents{
  toggleAddItem
}
export class MyEvent {
  name: MyEvents;
  data: any;

  constructor (name: MyEvents, data: any){
    this.name = name;
    this.data = data;
  }
}

//#endregion eventBus



//#region observableService
//#endregion observableService