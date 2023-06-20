import { GamePackage } from "./GamePackage";

/*
Note that various assumptions are made to simplify,
one of which is that there is no ping to assert a connection or state
which may cause issues on both the client and server
 */





export interface ErrorPackage extends GamePackage {
    type: 'error';
    message: string
}
export function isErrorPackage (object: any): object is ErrorPackage {
    return typeof object === 'object' && object.type === 'error' && typeof object.message === 'string';
}



export interface ReceiveName extends GamePackage {
    type: "receive_name";
    id: string|null;
    name: string;
    expiry: string;
}
export function isReceiveName (object: any): object is ReceiveName {
    return typeof object === 'object' && object.type === "receive_name" && ((object.id === null) 
    || (typeof object.id === "string" 
        && typeof object.name === "string" 
        && typeof object.expiry === "string"));
}



export interface PlayerReadyStatus {
    id: string;
    name: string;
    ready: boolean;
}

export interface EnterRoomFull extends GamePackage {
    type: "enter_room";
    room_name: null; //null on failure to join room
}
export interface EnterRoom extends GamePackage {
    type: "enter_room";
    room_name: string;
    room_id: string;
    capacity: number;
    players: PlayerReadyStatus[];
}
export function isEnterRoomFull (object: any): object is EnterRoomFull {
    return typeof object === 'object' && object.type === "enter_room" && (object.room_name === null);
}
export function isEnterRoom (object: any): object is EnterRoom {
    return typeof object === 'object' && object.type === "enter_room"
    && typeof object.room_name === "string" 
    && typeof object.room_id === "string" 
    && typeof object.capacity === "number" 
    && Array.isArray(object.players) 
    && object.players?.reduce( (acc: boolean,  next: PlayerReadyStatus ) => {
        return acc && (typeof next?.id === "string" && typeof next?.name === "string" && typeof next?.ready === "boolean")
    }, true);
}



export interface PlayersReady extends GamePackage {
    type: "players_ready";
    room_id: string;
    players: PlayerReadyStatus[];
}
export function isPlayersReady (object: any): object is PlayersReady {
    return typeof object === 'object' && object.type === "players_ready" && ((object.room_name === null) 
    || (typeof object.room_id === "string" 
        && Array.isArray(object.players) 
        && object.players?.reduce((acc: boolean, next: PlayerReadyStatus) => {
            return acc && (typeof next?.id === "string" && typeof next?.name === "string" && typeof next?.ready === "boolean")
        }, true)));
}


export type DirectionValue = -1|0|1;
export type Direction = [DirectionValue, DirectionValue];
export type Coordinate = [number, number];

export interface PlayerActor {
    name: string;
    id: string;
    out: boolean;
    spawned: boolean;
    pos: Coordinate;
    dir: 'n' | 'e' | 's' | 'w';
    /*dir: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';*/
    /*dir: Coordinate;*/
}
export interface MobActor {
    class: string;
    pos: Coordinate;
    dir: Coordinate;
}
export interface MiscActor{
    class: string;
    pos: Coordinate;
    variant?: number | string;
}




export interface StageInit extends GamePackage {
    type: "room_init";
    room_id: string;
    room_name: string;
    width: number;
    height: number;
    max_hp: number;
    updateNum: number;
    actors: {
        players: PlayerActor[];
        mobs: MobActor[];
        misc: MiscActor[];
    }
}
export function isStageInit (object: any): object is StageInit {
    return typeof object === 'object' && object.type === "room_init"
    && typeof object.room_id === 'string' && typeof object.room_name === 'string'
    && typeof object.max_hp === 'number' && typeof object.updateNum === 'number'
    && typeof object.width === 'number' && typeof object.height === 'number'
    && typeof object.actors === 'object' && isActors(object.actors);
}




export interface StageUpdate extends GamePackage {
    type: "update";
    updateNum: number;
    blanks: [Coordinate];
    updated: {
        players: PlayerActor[];
        mobs: MobActor[];
        misc: MiscActor[];
    }
    removed: {
        players: PlayerActor[];
        mobs: MobActor[];
        misc: MiscActor[];
    }
}
export function isStageUpdate (object: any): object is StageUpdate {
    return typeof object === 'object' && object.type === "update"
    && typeof object.updateNum === 'number' && Array.isArray(object.blanks)
    && object.blanks.reduce((acc:boolean, next:number[]) => {
        return acc && Array.isArray(next) && next.length === 2 && typeof next[0] === 'number' && typeof next[1] === 'number'
    }, true)
    && typeof object.updated === 'object' && isActors(object.updated)
    && typeof object.removed === 'object' && isActors(object.removed);
}




export interface FullUpdate extends GamePackage {
    type: "full_update";
    hp: number;
    updateNum: number;
    update: {
        players: PlayerActor[];
        mobs: MobActor[];
        misc: MiscActor[];
    }
}
export function isFullUpdate (object: any): object is FullUpdate {
    return typeof object === 'object' && object.type === "full_update"
    && typeof object.hp === 'number' && typeof object.updateNum === 'number'
    && typeof object.update === 'object' && isActors(object.update);
}





export interface Victory extends GamePackage {
    type: "victory";
}
export function isVictory (object: any): object is Victory {
    return typeof object === 'object' && object.type === "victory";
}



export interface Defeat extends GamePackage {
    type: "defeat";
}
export function isDefeat (object: any): object is Defeat {
    return typeof object === 'object' && object.type === "defeat";
}



export interface RemovedFromRoom extends GamePackage {
    type: "removed_from_room";
    reason: string;
}
export function isRemovedFromRoom (object: any): object is RemovedFromRoom {
    return typeof object === 'object' && object.type === "removed_from_room" && typeof object.reason === "string";
}



function isActors (object: any): boolean {
    return (!object.hasOwnProperty('players') ? true :
        Array.isArray(object.players)
        && object.players.reduce((acc:boolean, next:PlayerActor) => {
            return acc && typeof next.name === 'string' && typeof next.id === 'string'
            && typeof next.out === 'boolean' && typeof next.spawned === 'boolean'
            && Array.isArray(next.pos) && next.pos.length === 2 && typeof next.pos[0] === 'number' && typeof next.pos[1] === 'number'
            && next.dir.match(/^(n|e|s|w)$/g) !== null
            //&& next.dir.match(/^(n|e|s|w|ne|nw|se|sw)$/g) !== null
            //&& Array.isArray(next.dir) && next.dir.length === 2 && typeof next.dir[0] === 'number' && typeof next.dir[1] === 'number'
        },true)
    ) && (!object.hasOwnProperty('mobs') ? true :
        Array.isArray(object.mobs)
        && object.mobs.reduce((acc:boolean, next:MobActor) => {
            return acc && typeof next.class === 'string'
            && Array.isArray(next.pos) && next.pos.length === 2 && typeof next.pos[0] === 'number' && typeof next.pos[1] === 'number'
            && Array.isArray(next.dir) && next.dir.length === 2 && typeof next.dir[0] === 'number' && typeof next.dir[1] === 'number'
        },true)
    ) && (!object.hasOwnProperty('misc') ? true :
        Array.isArray(object.misc)
        && object.misc.reduce((acc:boolean, next:MiscActor) => {
            return acc && typeof next.class === 'string'
            && Array.isArray(next.pos) && next.pos.length === 2 && typeof next.pos[0] === 'number' && typeof next.pos[1] === 'number'
            && (!next.hasOwnProperty('variant') ? true : (typeof next.variant === 'string' || typeof next.variant === 'number'))
        },true)
    );
}




/**
 * client receive       (assumed always correct if json is parsable)
 *      {type: error, message: <string>}
 * 
 *      {type: receive_name, id: <string>, name: <string>, expiry: <string>} || {type: receive_name, id: <null>}
 * 
 *      {type: enter_room, room_name: <string>, room_id: <string>, capacity: <num>, players: [{id,name,ready}...]}  ||  {type: enter_room, room_name: null}
 *      {type: players_ready, room_id: <string>, players: [{id,name,ready}]}
 * 
 *      {type: room_init, room_id: <string>, room_name: <string>, height: <number>, width: <number>, actors: {players/mobs/misc: [...]}, max_hp: <num>, updateNum: <num>}
 *      {type: update, updateNum: <num>, blanks: [[x,y] ...], updated: {players: [], mobs: [], misc: []}, removed: {players: [], mobs: [], misc: []} }
 *      {type: full_update, updateNum: <num>, hp: <num>, update: {players: [{name, id, out, spawned, pos, dir} ...], mobs: [{class, pos, dir} ...], misc: [{class, pos} ...]}}
 *      {type: victory}
 *      {type: defeat}
 *      {type: removed_from_room, reason: <string>}
*/