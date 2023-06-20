

import { User, UserProfile } from "./User";



export interface WWUser extends User {
    id: string;
    name: string;
    color?: string;
}

export function isWWUser (object: any): object is WWUser {
    return object && typeof object.id === 'string' && typeof object.name === 'string'
        && (!object.hasOwnProperty('color') ? true : typeof object.color === 'string');
}




export class WWUserProfile extends UserProfile {
    constructor (user: WWUser) {
        super(user);
        this._color = user.color ?? WWUserProfile.DEFAULT_COLOR;
    }

    static DEFAULT_COLOR: string = "#ffffff";

    protected _color: string = WWUserProfile.DEFAULT_COLOR;
    set color (color:string) { this._color = color; }
    get color () { return this._color; }

    override getUser (): WWUser {
        return {
            id: this._id,
            name: this._name,
            color: this._color
        }
    }

    

    toString (): WWUser {
        return this.getUser();
    }
}