
import { Injectable } from '@angular/core';
import { User, UserProfile } from "src/app/types/User";



export interface WWUser extends User {
    id: string;
    name: string;
    color?: string;
}

export function isWWUser (object: any): object is WWUser {
    return object && typeof object.id === 'string' && typeof object.name === 'string'
        && (!object.hasOwnProperty('color') ? true : typeof object.color === 'string');
}



@Injectable({
    providedIn: 'root'
})
export class WWUserProfile extends UserProfile {
    constructor () {super();}

    static DEFAULT_COLOR: string = "#ffffff";

    protected _color: string = WWUserProfile.DEFAULT_COLOR;
    set color (color:string) { this._color = color; }
    get color () { return this._color; }

    override getUser (): User {
        return {
            id: this._id,
            name: this._name,
            color: this._color
        }
    }
}