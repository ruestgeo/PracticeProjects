import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[chatStatusDirective]'
})
export class ChatStatusDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
