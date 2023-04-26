import { GamePackage } from "src/app/types/ClientReceive";


export interface RequestName extends GamePackage {
    type: "request_name";
    id?: string;
    name: string;
}
//export function isRequestName (object: any): object is RequestName {
//    return object && object.type === "request_name" 
//        && typeof object.name === 'string' 
//        && (!object.hasOwnProperty("id") ? true : typeof object.id ==='string');
//}



export interface RoomConfigs {
    intervalTime: number;
    maxNumPlayers: number;
    maxHealthPoints: number;
    gridHeight: number;
    gridWidth: number;
    numBoxes: number;
    numWalls: number;
    numRandomMobs: number;
    randomMobWeights: {
        Bouncer: number;
        Charger: number;
        Crawler: number;
        Mimic: number;
        Pusher: number;
        Wanderer: number;
        Warper: number;
    }
    fixedMobAmounts: {
        numBouncer: number;
        numCharger: number;
        numCrawler: number;
        numMimic: number;
        numPusher: number;
        numWanderer: number;
        numWarper: number;
    }
}



export interface CreateRoom extends GamePackage {
    type: "create_room";
    player_id: string;
    name: string;
    configs: RoomConfigs;
}
//export function isCreateRoom (object: any): object is CreateRoom {
//    return object && object.type === "create_room" 
//        && typeof object.name === 'string';
//}



export interface JoinRoom extends GamePackage {
    type: "join_room";
    player_id: string;
    room_id: string;
}
//export function isJoinRoom (object: any): object is JoinRoom {
//    return object && object.type === "join_room" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



export interface PlayerReady extends GamePackage {
    type: "player_ready";
    player_id: string;
    room_id: string;
}
//export function isPlayerReady (object: any): object is PlayerReady {
//    return object && object.type === "player_ready" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



export interface PlayerUnready extends GamePackage {
    type: "player_unready";
    player_id: string;
    room_id: string;
}
//export function isPlayerUnready (object: any): object is PlayerReady {
//    return object && object.type === "player_unready" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



export interface PlayerMovement extends GamePackage {
    type: "player_movement";
    player_id: string;
    room_id: string;
    dir: [number,number];
    isPulling: boolean;
    updateNum: number;
}
//export function isPlayerMovement (object: any): object is PlayerMovement {
//    return object && object.type === "player_movement" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



export interface LeaveRoom extends GamePackage {
    type: "leave_room";
    player_id: string;
    room_id: string;
}
//export function isLeaveRoom (object: any): object is LeaveRoom {
//    return object && object.type === "leave_room" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



export interface RequestUpdate extends GamePackage {
    type: "request_update";
    player_id: string;
    room_id: string;
}
//export function isRequestUpdate (object: any): object is RequestUpdate {
//    return object && object.type === "request_update" 
//        && typeof object.player_id === 'string' 
//        && typeof object.room_id === 'string';
//}



/**
 * client send
 *      {type: request_name, id: <string>, name: <string>}  ||  {type: request_name, name: <string>}
 *      {type: create_room, player_id: <string>, name: <string>, configs: <configs json>}
 *      {type: join_room, room_id: <string>, player_id: <string>}
 *      {type: player_ready, room_id: <string>, player_id: <string>} || {type: player_unready, room_id: <string>, player_id: <string>}
 *      {type: player_movement, player_id: <num>, room_id: <num>, dir: <[num,num]>, isPulling: <bool>, updateNum: <num> }
 *      {type: leave_room, player_id , room_id }
 *      {type: request_update, player_id , room_id }
 * 
*/