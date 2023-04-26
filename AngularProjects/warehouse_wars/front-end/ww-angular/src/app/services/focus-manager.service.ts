import { Injectable } from '@angular/core';


/**
 * Used to track focusable components that have functionality 
 * which requires exclusive focus such as key input.
 */
@Injectable({
  providedIn: 'root'
})
export class FocusManager {
  private focusElements: FocusElement[] = [];


  constructor() { }


  /* call this OnInit */
  addThis (component: FocusElement){
    if (component
    //&& component.hasOwnProperty('focus') && typeof component.focus === 'boolean'
    && this.focusElements.indexOf(component) < 0)
      this.focusElements.push(component);
  }


  /* call this OnDestroy */
  removeThis (component: FocusElement){
    let index;
    if (component && (index = this.focusElements.indexOf(component)) >= 0)
      this.focusElements.splice(index, 1);
  }


  thisInFocus = this.thisInExclusiveFocus;

  /**
   * Return whether component is exclusively in focus.
   * (might not work on nested FocusElements)
   * 
   * Returns false if component is not initialized with FocusManager.addThis;
   * 
   * If noneElseInFocus is true, then return only whether no other FocusElement
   * is in focus.
   */
  thisInExclusiveFocus (component: FocusElement, noneElseInFocus?: boolean): boolean {
    let index = this.focusElements.indexOf(component);
    if (index < 0)   return false;
    return (noneElseInFocus ? true : component.focus)
    && this.focusElements.slice().splice(index,1).map(c => !c.focus)
      .reduce((acc:boolean, next:boolean) => acc && next, true);
  }


  /**
   * Return whether no FocusElement is in focus
   */
  noneInFocus (){
    return this.focusElements.map(c => !c.focus)
    .reduce((acc:boolean, next:boolean) => acc && next, true);
  }
}

/**
 * Implement on a component to be used with the FocusManager
 */
export abstract class FocusElement {
  /**
   * Set true on focus.
   * Set false on blur.
   */
  abstract focus: boolean;
}