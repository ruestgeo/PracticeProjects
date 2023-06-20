import { CSSProperties } from "react";

export interface ChatElement {
    html: JSX.Element;
    options?: ChatElementOptions;
}
export interface ChatElementOptions {
    class?: string[];
    style?: CSSProperties;
    timestamp?: number;
    token: string;
}

export function isChatElement (object: any): object is ChatElement {
    return object && object.html instanceof HTMLElement 
        && typeof object.token === 'string'
        && (!object.hasOwnProperty('options') ? true : (object.options 
            && (!object.options.hasOwnProperty('timestamp') ? true :
                (object.options.timestamp && typeof object.options.timestamp === 'number'))
            && (!object.options.hasOwnProperty('style') ? true :
                (object.options.style && typeof object.options.style === 'string'))
            && (!object.options.hasOwnProperty('class') ? true : 
                (object.options.class && Array.isArray(object.options.class) 
                    && object.options.class.reduce((acc: boolean, next: any) => acc && typeof next === 'string',true)))
            ));
}
