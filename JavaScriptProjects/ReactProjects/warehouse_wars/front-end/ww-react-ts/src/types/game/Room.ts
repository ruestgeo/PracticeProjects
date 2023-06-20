import { Direction } from "./ClientReceive";

export type { Direction } from "./ClientReceive";


export type SpecialActionTypes = 'special';
export type LiteralMoveTypes = 'up' | 'down' | 'left' | 'right' /* | 'upleft' | 'upright' | 'downleft' | 'downright'*/;
type KeyActionTypes = LiteralMoveTypes | SpecialActionTypes;

type KeyActionLiterals = {[key in KeyActionTypes]:  number}; //{[key in LiteralMoveTypes | SpecialActionTypes]:  number};
export const KeyAction: Readonly<KeyActionLiterals> = ({
  'special' : 0, //better enum
  'up'      : 1,
  'right'   : 2,
  'down'    : 3,
  'left'    : 4,
  /*
  'upleft'    : 5,
  'upright'   : 6,
  'downleft'  : 7,
  'downright' : 8,*/
} as const);
export type KeyAction = typeof KeyAction[keyof typeof KeyAction];
/*  if type isn't defined, type of KeyAction param is defined as such
fn (keyaction: typeof KeyAction[keyof typeof KeyAction]) */

type LiteralMove = {[key in LiteralMoveTypes]:  Direction};
export const GameMovement: Readonly<LiteralMove> = Object.freeze({
  'up':     [ 0,-1],
  'right':  [ 1, 0],
  'down':   [ 0, 1],
  'left':   [-1, 0],
  /*
  'upleft':     [-1,-1],
  'upright':    [ 1,-1],
  'downleft':   [-1, 1],
  'downright':  [ 1, 1],*/
});
export type GameMovement = typeof GameMovement[keyof typeof GameMovement];






export interface StageCell { src: string, alt: string, classes: string[] }

export enum RoomState {
  'uninitialized',
  'waitingToStart',
  'gameOngoing'
}

export function whatRoomState (state: RoomState): string {
  switch (state){
    case (RoomState.uninitialized): {
      return 'uninitialized';
    }
    case (RoomState.waitingToStart): {
      return 'waitingToStart';
    }
    case (RoomState.gameOngoing): {
      return 'gameOngoing';
    }
    default: return '';
  }
}


