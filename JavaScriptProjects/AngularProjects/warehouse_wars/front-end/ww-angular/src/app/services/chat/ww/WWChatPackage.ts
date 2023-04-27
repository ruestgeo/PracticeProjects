import { JsonObject } from "src/app/types/JsonElement";
import { WWUser, isWWUser } from "src/app/types/WWUser";
import { ChatPackage } from "src/app/services/chat/common/ChatPackage";




export interface WWChatPackage extends ChatPackage {
    type: string;
}
export function isWWChatPackage (object: any): object is WWChatPackage {
    return object && typeof object.type === 'string';
}

/* 
send
    {type:'request_token', id: string}
    (type:'chat', content:string, token:string, user:{id,name,color? *:string})
    (type:'fetch', token:string)
    (type:'fetch', missingUpdates:number[])
    {type: 'info'}

receive
    {type:'error', message: string}
    {type:'token', token: string}
    (type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp:number, updateNum:number)
    {type: 'fetch_done', token?:string}
    {type: 'fetch_done', failed?:number[], nonexistent?:number[]}
    {type: 'non-existent', token: string } 
    {type: 'info', max_updateNum: number, queue_limit: number, current_updateNum: number}
*/


//#region send & receive
/*
    (type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp?:number, updateNum?:number)
    {type: 'info', max_updateNum?: number, queue_limit?: number, current_updateNum?: number}
*/


export interface WWChatMessage extends WWChatPackage {
    type: 'chat';
    content: string;
    user: WWUser;
    token: string;
    //channel: string; //keeping it simple
    timestamp?: number;
    updateNum?: number;
}
export interface WWChatReceived extends WWChatMessage {
    type: 'chat';
    content: string;
    user: WWUser;
    token: string;
    timestamp: number;
    updateNum: number;
}
export function isWWChatSend (object: any): object is WWChatMessage {
    return object && typeof object.type === 'string' && object.type === 'chat'
    && typeof object.content === 'string' && typeof object.token === 'string'
    && (!object.hasOwnProperty('timestamp') ? true : typeof object.timestamp === 'number')
    && (!object.hasOwnProperty('updateNum') ? true : typeof object.updateNum === 'number')
    && isWWUser(object.user);
}
export function isWWChatReceived (object: any): object is WWChatReceived {
    return object && typeof object.type === 'string' && object.type === 'chat'
    && typeof object.content === 'string' && typeof object.token === 'string'
    && typeof object.timestamp === 'number' && typeof object.updateNum === 'number'
    && isWWUser(object.user);
}



export interface WWChatInfo extends WWChatPackage {
    type: 'info';
    max_updateNum?: number;
    queue_limit?: number;
    current_updateNum?: number;
}
export interface WWChatInfoReceived extends WWChatInfo {
    type: 'info';
    max_updateNum: number;
    queue_limit: number;
    current_updateNum: number;
}
export function isWWChatInfo (object: any): object is WWChatInfo {
    return object && typeof object.type === 'string' && object.type === 'info'
    && (!object.hasOwnProperty('max_updateNum') ? true : typeof object.max_updateNum === 'number')
    && (!object.hasOwnProperty('queue_limit') ? true : typeof object.queue_limit === 'number')
    && (!object.hasOwnProperty('current_updateNum') ? true : typeof object.current_updateNum === 'number');
}
export function isWWChatInfoReceived (object: any): object is WWChatInfoReceived {
    return object && typeof object.type === 'string' && object.type === 'info'
    && typeof object.max_updateNum === 'number'
    && typeof object.queue_limit === 'number'
    && typeof object.current_updateNum === 'number';
}

//#endregion send & receive




//#region send
/*
    {type:'request_token', id: string}
    (type:'fetch', token:string)
    (type:'fetch', missingUpdates:number[])

*/


export interface WWChatRequestToken extends WWChatPackage {
    type: 'request_token';
}
export function isWWChatRequestToken (object: any): object is WWChatRequestToken {
    return object && typeof object.type === 'string' && object.type === 'request_token'
}



export interface WWChatFetch extends WWChatPackage {
    type: 'fetch';
    token?: string;
    missingUpdates?: number[];
}
export function isWWChatFetch (object: any): object is WWChatFetch {
    return object && typeof object.type === 'string' && object.type === 'fetch'
    && (!object.hasOwnProperty('token') ? true : typeof object.token === 'string')
    && (!object.hasOwnProperty('missingUpdates') ? true : (Array.isArray(object.missingUpdates) 
        && object.missingUpdates.reduce((acc:boolean, next:number) => acc && typeof next === 'number',true) ));
}


//#endregion send



//#region receive
/*
    {type:'error', message: string}
    {type:'token', token: string}
    {type: 'fetch_done', token?:string}
    {type: 'fetch_done', failed?:number[], nonexistent?:number[]}
    {type: 'non-existent', token: string } 
*/


export interface WWChatError extends WWChatPackage {
    type: 'error';
    message: string
}
export function isWWChatError (object: any): object is WWChatError {
    return object && typeof object.type === 'string' && object.type === 'error'
    && (!object.hasOwnProperty('message') ? true : typeof object.message === 'string');
}



export interface WWChatToken extends WWChatPackage {
    type: 'token';
    token: string;
}
export function isWWChatToken (object: any): object is WWChatToken {
    return object && typeof object.type === 'string' && object.type === 'token'
    && typeof object.token === 'string';
}



export interface WWChatTokenNonExistent extends WWChatPackage {
    type: 'non-existent';
    token: string;
}
export function isWWChatTokenNonExistent (object: any): object is WWChatTokenNonExistent {
    return object && typeof object.type === 'string' && object.type === 'non-existent'
    && typeof object.token === 'string';
}


export interface WWChatFetchDone extends WWChatPackage {
    type: 'fetch_done';
    token?: string;
    failed?: number[];
    nonexistent?: number[];
}
export interface WWChatFetchTokenDone extends WWChatFetchDone {
    type: 'fetch_done';
    token: string;
}
export interface WWChatFetchMessagesDone extends WWChatFetchDone {
    type: 'fetch_done';
    failed: number[];
    nonexistent: number[];
}
export function isWWChatFetchDone (object: any): object is WWChatFetchDone {
    return object && typeof object.type === 'string' && object.type === 'fetch_done'
    && (!object.hasOwnProperty('token') ? true : typeof object.token === 'string')
    && (!object.hasOwnProperty('failed') ? true : (Array.isArray(object.failed) 
        && object.failed.reduce((acc:boolean, next:number)=> acc && typeof next === 'number',true)))
    && (!object.hasOwnProperty('nonexistent') ? true : (Array.isArray(object.nonexistent) 
        && object.nonexistent.reduce((acc:boolean, next:number)=> acc && typeof next === 'number',true)));
}
export function isWWChatFetchTokenDone (object: any): object is WWChatFetchTokenDone {
    return object && typeof object.type === 'string' && object.type === 'fetch_done'
    && typeof object.token === 'string';
}
export function isWWChatFetchMessagesDone (object: any): object is WWChatFetchMessagesDone {
    return object && typeof object.type === 'string' && object.type === 'fetch_done'
    && ((Array.isArray(object.failed) 
        && object.failed.reduce((acc:boolean, next:number)=> acc && typeof next === 'number',true)))
    && ((Array.isArray(object.nonexistent) 
        && object.nonexistent.reduce((acc:boolean, next:number)=> acc && typeof next === 'number',true)));
}

//#endregion receive


