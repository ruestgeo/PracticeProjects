import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[chatEntryDirective]'
})
export class ChatEntryDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
