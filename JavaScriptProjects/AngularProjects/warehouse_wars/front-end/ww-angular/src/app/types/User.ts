import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface User {
    id: string;
    name?: string;
    [prop: string]: any;
}

export function isUser (object: any): object is User {
    return object && typeof object.id === 'string';
}


@Injectable({
    providedIn: 'root'
})
export class UserProfile implements User {
    static DEFAULT_ID = "";
    static DEFAULT_NAME = "[[Anonymous]]"

    protected _id: string = UserProfile.DEFAULT_ID;
    protected _name: string = UserProfile.DEFAULT_NAME;
    //[prop: string]: any; //bad but possible
    
    protected updateEmitter: BehaviorSubject<User> = new BehaviorSubject<User>(this.getUser());
    updated: Observable<User> = this.updateEmitter.asObservable();
    //subscribe to updated to listen to when profile is modified

    set id (id:string) { this._id = id; }
    get id () { return this._id; }
    set name (name:string) { this._name = name; }
    get name () { return this._name; }
    //setProp (propName:string, value:any){ this[propName] = value; }

    //call this after modifying
    emitProfileUpdate () { this.updateEmitter.next(this.getUser()); }

    getUser (): User {
        return {
            id: this._id,
            name: this._name
        }
    }

}
