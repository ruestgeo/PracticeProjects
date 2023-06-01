import { Injectable } from '@angular/core';

import { ClientService } from 'src/app/services/game/client/client.service';

import { WWUserProfile } from 'src/app/types/WWUser';
import { UserProfile } from 'src/app/types/User';
import { PlayerMovement, PlayerReady, PlayerUnready, RequestUpdate } from 'src/app/types/ClientSend';
import { Direction, EnteredRoom, FullUpdate, GamePackage, MiscActor, MobActor, PlayerActor, PlayersReady, RoomInit, RoomUpdate, isEnteredRoom, isFullUpdate, isPlayersReady, isRoomInit, isRoomUpdate } 
  from "src/app/types/ClientReceive";
export { Direction } from "src/app/types/ClientReceive";



const MISSED_UPDATE_TOLERANCE_AMOUNT = 4;



@Injectable({
  providedIn: 'root'
})
export class RoomService {
  ready: boolean = false;
  updateLock: boolean = true;
  private state: RoomState = RoomState.uninitialized;

  private _id: string = '';
  get id (): string { return this._id; } //Readonly<string> 
  private _name: string = '';
  get name (): string { return this._name; } //Readonly<string> 
  private width: number = 0;
  private height: number = 0 ;

  private max_hp: number = 0;
  private hp: number = 0;

  stage:  StageCell[][]  = [];
  private emptyStage: StageCell[][] = []; //blank stage
  //private baseStage: StageCell[][] = []; //clean stage (only walls);  UNUSED

  hpStatus: boolean[] = [];
  players: {num: number, id: string, name: string, out: boolean}[]  = []; // !out is also used as a ready/not-ready boolean
  private playerNums: {[id: string]: number} = {};
  private capacity: number = 0;

  private clientUpdateNum: number = 0;
  private previousUpdateType: 'full' | 'partial' | '' = '';	//"full" or "partial"
  private missedUpdates: number = 0;

  private controlsDisabled: boolean = true;
  private reveal: boolean = false;

  readonly imgs: {[key: string]: string} = {
      "player1n": "assets/game/player1-n.gif",
      "player1e": "assets/game/player1-e.gif",
      "player1w": "assets/game/player1-w.gif",
      "player1s": "assets/game/player1-s.gif",

      "player2n": "assets/game/player2-n.gif",
      "player2e": "assets/game/player2-e.gif",
      "player2w": "assets/game/player2-w.gif",
      "player2s": "assets/game/player2-s.gif",

      "player3n": "assets/game/player3-n.gif",
      "player3e": "assets/game/player3-e.gif",
      "player3w": "assets/game/player3-w.gif",
      "player3s": "assets/game/player3-s.gif",

      "player4n": "assets/game/player4-n.gif",
      "player4e": "assets/game/player4-e.gif",
      "player4w": "assets/game/player4-w.gif",
      "player4s": "assets/game/player4-s.gif",

      "player5n": "assets/game/player1-n.gif",
      "player5e": "assets/game/player1-e.gif",
      "player5w": "assets/game/player1-w.gif",
      "player5s": "assets/game/player1-s.gif",

      "player6n": "assets/game/player2-n.gif",
      "player6e": "assets/game/player2-e.gif",
      "player6w": "assets/game/player2-w.gif",
      "player6s": "assets/game/player2-s.gif",

      "player7n": "assets/game/player3-n.gif",
      "player7e": "assets/game/player3-e.gif",
      "player7w": "assets/game/player3-w.gif",
      "player7s": "assets/game/player3-s.gif",

      "player8n": "assets/game/player4-n.gif",
      "player8e": "assets/game/player4-e.gif",
      "player8w": "assets/game/player4-w.gif",
      "player8s": "assets/game/player4-s.gif",

      "blank": "assets/game/blank.gif",
      "Wall": "assets/game/wall.gif",
      "Box": "assets/game/box2.gif",
      "Box0": "assets/game/box2.gif",
      "Box1": "assets/game/box1.gif",
      "Box2": "assets/game/box2.gif",
      "Box3": "assets/game/box3.gif",
      "hp+": "assets/game/hp.gif",
      "hp-": "assets/game/out.gif",
      "out": "assets/game/grave.gif",

      "Bouncer": "assets/game/mob.gif",
      "Wanderer": "assets/game/wanderer.gif",
      "Crawler": "assets/game/crawler.gif",
      "Warper": "assets/game/warper.gif",
      "Pusher": "assets/game/pusher.gif", 
      "Charger": "assets/game/charger.gif",
      "Charger-n": "assets/game/charger-n.gif",
      "Charger-e": "assets/game/charger-e.gif",
      "Charger-s": "assets/game/charger-s.gif",
      "Charger-w": "assets/game/charger-w.gif",
      "Mimic": "assets/game/mimic1.gif",
      "Mimic_revealed": "assets/game/mimic_reveal.gif"

  };

  readonly alts: {[key: string]: string} = {
      "player1n": '1⮝',
      "player1e": '1⮞',
      "player1w": '1⮜',
      "player1s": '1⮟',

      "player2n": '2⮝',
      "player2e": '2⮞',
      "player2w": '2⮜',
      "player2s": '2⮟',

      "player3n": '3⮝',
      "player3e": '3⮞',
      "player3w": '3⮜',
      "player3s": '3⮟',

      "player4n": '4⮝',
      "player4e": '4⮞',
      "player4w": '4⮜',
      "player4s": '4⮟',
      
      "player5n": '5⮝',
      "player5e": '5⮞',
      "player5w": '5⮜',
      "player5s": '5⮟',

      "player6n": '6⮝',
      "player6e": '6⮞',
      "player6w": '6⮜',
      "player6s": '6⮟',

      "player7n": '7⮝',
      "player7e": '7⮞',
      "player7w": '7⮜',
      "player7s": '7⮟',

      "player8n": '8⮝',
      "player8e": '8⮞',
      "player8w": '8⮜',
      "player8s": '8⮟',

      "blank": "---",
      "Wall": "||||",
      "Box": "['']",
      "Box1": "['']",
      "Box2": "[--]",
      "Box3": "[__]",
      "hp+": "O",
      "hp-": "X",
      "out": "--",

      "Bouncer": "\\-/",
      "Wanderer": "* *",
      "Crawler": "<^>",
      "Warper": "=-=",
      "Pusher": "<->",
      "Charger": "'-'",
      "Charger-n": "⮉", 
      "Charger-e": "⮊",
      "Charger-s": "⮋",
      "Charger-w": "⮈",
      "Mimic": "[``]",
      "Mimic_revealed": "[**]"
  };




  constructor (private client: ClientService, private user: UserProfile /*injected as WWUserProfile*/){}



  initService (){
    this.updateLock = false;
  }



  handlePack (pack: GamePackage){
    if (this.updateLock)   return;
    //*DEV*/ console.log(`ready: ${this.ready}\nstate: ${whatRoomState(this.state)}\nisRoomUpdate: ${isRoomUpdate(pack)}\nisFullUpdate: ${isFullUpdate(pack)}\nisRoomInit: ${isRoomInit(pack)}\nisPlayerReady: ${isPlayersReady(pack)}\nisEnteredRoom: ${isEnteredRoom(pack)}`);
    if (isRoomUpdate(pack) && this.state === RoomState.gameOngoing)
      this.partialUpdate(pack);
    else if (isFullUpdate(pack) && this.state === RoomState.gameOngoing)
      this.fullUpdate(pack);
    else if (isRoomInit(pack) && this.state === RoomState.waitingToStart)
      this.initRoom(pack);
    else if (isPlayersReady(pack) && this.state === RoomState.waitingToStart)
      this.playerReady(pack);
    else if (isEnteredRoom(pack) && this.state === RoomState.uninitialized)
      this.prepRoom(pack);
  }



  prepRoom (pack: EnteredRoom){
    //player.out = !player.ready
    this.ready = false;
    this.state = RoomState.waitingToStart;

    this._id = pack.room_id;
    this._name = pack.room_name;
    this.capacity = pack.capacity;
    this.players = Array(this.capacity).fill({num: -1, id: '--', name: '--', out: true});
    console.log(JSON.stringify(this.players));
    for (let i = 0;  i < pack.players.length;  i++){
      if (i >= this.capacity) break;
      this.players[i] = {num: i, id: pack.players[i].id, name: pack.players[i].name, out: true};
      this.playerNums[pack.players[i].id] = i;
    }
    console.log(JSON.stringify(this.players));
  }


  
  playerReady (pack: PlayersReady){
    this.players = this.players.map((player, index) => {
      if (index >= pack.players.length) 
        return {num: -1, id: '--', name: '--', out: true};
      else {
        this.playerNums[pack.players[index].id] = index;
        return {num: index, id: pack.players[index].id, name: pack.players[index].name, out: !pack.players[index].ready};
      }
        
    });
  }



  onReady (){
    let player = this.players[this.playerNums[this.user.id]];
    player.out = !player.out;
    if (player.out){
      let pack: PlayerUnready = {
        type: 'player_unready',
        player_id: this.user.id,
        room_id: this.id
      }
      this.client.sendPackage(pack);
    }
    else {
      let pack: PlayerReady = {
        type: 'player_ready',
        player_id: this.user.id,
        room_id: this.id
      };
      this.client.sendPackage(pack);
    }
  }



  initRoom (pack: RoomInit){
    this._id = pack.room_id;
    this._name = pack.room_name;
    this.width = pack.width;
    this.height = pack.height;
    //this.hp = 0;
    //this.max_hp = 0;
    //this.hpStatus = [];
    this.players = [];
    this.playerNums = {};
    this.capacity = 0;
    this.clientUpdateNum = 0;
    this.previousUpdateType = '';
    this.missedUpdates = 0;
    this.controlsDisabled = true;
    this.reveal = false;
    //this.stage = [];
    //this.baseStage = [];
    this.emptyStage = [];

    //init emptyStage
    for (let y = 0; y < this.height; y++){
      let row: StageCell[] = [];
      for (let x = 0; x < this.width; x++){
        let cell: StageCell = {src: this.imgs['blank'], alt: this.alts['blank'], classes: ['blank']};
        row.push(cell);
      }
      this.emptyStage.push(row);
    }

    //clone emptyStage to stage
    this.stage = this.cloneStage(this.emptyStage);

    this.max_hp = pack.max_hp;
    this.hp = this.max_hp;
    this.hpStatus = Array(this.max_hp).fill(true);

    for (let i = 0;  i < pack.actors.players.length; i++){
      let player = pack.actors.players[i];
      this.players.push({num: i, name: player.name, id: player.id, out: false});
      this.playerNums[player.id] = i;
    }

    this.updateActors(pack.actors.players, pack.actors.mobs, pack.actors.misc);
    this.previousUpdateType = 'full';
    this.controlsDisabled = false;
    this.clientUpdateNum = pack.updateNum;

    this.ready = true;
    this.state = RoomState.gameOngoing;
    console.log(`init done, ready? ${this.ready}  state: ${whatRoomState(this.state)}`)
  }



  fullUpdate (pack: FullUpdate){
    let newUpdateNum = pack.updateNum;
    if ( (this.clientUpdateNum > newUpdateNum) && (newUpdateNum > 0) && (this.previousUpdateType != "full") ){ //dont update if new update seems older
      this.requestUpdate();
      return;
    }
    this.clientUpdateNum = newUpdateNum;
    this.previousUpdateType = 'full';
    this.missedUpdates = 0;
    if ( pack.hp < this.hp ){
      this.hpStatus = this.hpStatus.map((_, index) => index < pack.hp);
      this.hp = pack.hp;
    }
    this.stage = this.cloneStage(this.emptyStage);
    this.updateActors(pack.update.players, pack.update.mobs, pack.update.misc);
  }



  partialUpdate (pack: RoomUpdate){
    this.checkUpdateNum(pack);

    for (let blank of pack.blanks){
      this.setImage(blank[0], blank[1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
    this.removeActors(pack.removed.players, pack.removed.mobs, pack.removed.misc);
	  this.updateActors(pack.updated.players, pack.updated.mobs, pack.updated.misc);

    //interpret player spawned=true as a decrease in hp
    //players share hp
    let hpLoss = 0;
    for (let actor of pack.updated.players){
      if ( actor.spawned )  hpLoss++;
    }
    if (hpLoss > 0){
      this.hp = Math.max(0, this.hp - hpLoss);
      this.hpStatus = this.hpStatus.map((_, index) => index < this.hp);
    }
  }



  private checkUpdateNum (pack: RoomUpdate){
    let newUpdateNum = pack.updateNum;
    this.clientUpdateNum = newUpdateNum;
	  this.previousUpdateType = "partial";
    if ( (this.clientUpdateNum > newUpdateNum) ){ //force full update if received an older update or if num wrapped
      this.requestUpdate();
      return;
    }
    let updateGap = newUpdateNum - this.clientUpdateNum;
    if ( updateGap > 0) 
      this.missedUpdates += updateGap;
    if ( this.missedUpdates > MISSED_UPDATE_TOLERANCE_AMOUNT ){ //if continue missing partial updates, then request a full update
      this.requestUpdate();
    }
  }



  private updateActors (players: PlayerActor[], mobs: MobActor[], misc: MiscActor[]){
    for (let actor of misc){
      if (!this.imgs.hasOwnProperty(actor.class))
        this.setImage(actor.pos[0], actor.pos[1], "assets/game/unknown.gif", "?", actor.class);
      else if (actor.class === "Box")
        this.setImage(actor.pos[0], actor.pos[1], this.imgs[actor.class + (actor?.variant ?? '')], this.alts[actor.class + (actor?.variant ?? '')], actor.class);
      else  
        this.setImage(actor.pos[0], actor.pos[1], this.imgs[actor.class], this.alts[actor.class], actor.class);
    }

    for (let actor of mobs){
      let dir = '';
      switch (actor.dir){
        case [1,1]:  { dir = "mob_se"; break; }
        case [1,0]:  { dir = "mob_e";  break; }
        case [1,-1]: { dir = "mob_ne"; break; }
        case [0,1]:  { dir = "mob_s";  break; }
        case [0,-1]: { dir = "mob_n";  break; }
        case [-1,1]: { dir = "mob_sw"; break; }
        case [-1,0]: { dir = "mob_w";  break; }
        case [-1,-1]:{ dir = "mob_nw"; break; }
        default: { dir = "mob_e" }
      }

      if (this.reveal && actor.class === "Mimic")
        this.setImage(actor.pos[0], actor.pos[1], this.imgs["Mimic_reveal"], this.alts["Mimic_reveal"], actor.class);
      //else if ( type === "Charger" )  this.setImage(actor.pos[0], actor.pos[1], this.imgs[(actor.class + dir)], this.alts[actor.class], actor.class);
      else 
        this.setImage(actor.pos[0], actor.pos[1], this.imgs[actor.class], this.alts[actor.class], (actor.class + dir)); 
    }

    for (let actor of players){
      let klass = ["Player"];
      if (actor.spawned && !this.stage[actor.pos[0]][actor.pos[1]].classes.includes("spawned"))
        klass.push('spawned');
      let img_src = "player" + (this.playerNums[actor.id]+1) + actor.dir;
      this.setImage(actor.pos[0], actor.pos[1], this.imgs[img_src], this.alts[img_src], klass);
    }

    this.updateLock = false;
  }



  private removeActors (players: PlayerActor[], mobs: MobActor[], misc: MiscActor[]){
    for (let actor of players){
      this.players[this.playerNums[actor.id]].out = true;
      if (actor.id === this.user.id)
        this.controlsDisabled = true;
    }
    for (let actor of mobs){
      this.setImage(actor.pos[0], actor.pos[1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
    for (let actor of misc){
      this.setImage(actor.pos[0], actor.pos[1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
  }



  private setImage (x: number, y: number, src: string, alt: string, type: string | string[]){
    let cell: StageCell = this.stage[y][x];
    cell.src = src;
    cell.alt = alt;
    if (Array.isArray(type))
      cell.classes = type;
    else
      cell.classes = [type];
  }



  private cloneStage (stage: StageCell[][]): StageCell[][] {
    return JSON.parse(JSON.stringify(stage));
  }



  mimicReveal (){
    if (this.reveal || this.updateLock)   return;

    this.reveal = true; 
    let mimics: StageCell[] = [];
    for (let row of this.stage){
      for (let actor of row){
        if (actor.classes.includes("Mimic")){
          mimics.push(actor);
          actor.src = this.imgs["Mimic_reveal"];
          actor.alt = this.alts["Mimic_reveal"];
        }
      }
    }
    setTimeout(() => {
      this.reveal = false;
      for (let actor of mimics){
        actor.src = this.imgs["Mimic"];
        actor.alt = this.alts["Mimic"];
      }
    }, 2000);
  }



  requestUpdate (){
    if (this.updateLock)  return;
    if (this.previousUpdateType != "full")  return;
    let pack: RequestUpdate = {"type": "request_update", 'room_id': this.id, 'player_id': this.user.id};
    this.client.sendPackage(pack);
  }



  destroy (){
    this._id =     '';
    this._name =   '';
    this.width =  0;
    this.height = 0;
    this.hp =     0;
    this.max_hp = 0;
    this.emptyStage = [];
    this.stage =      [];
    this.hpStatus =   [];
    this.players =    [];
    this.playerNums = {};
    this.capacity =         0;
    this.clientUpdateNum =  0;
    this.missedUpdates =    0;
    this.previousUpdateType = '';
    this.controlsDisabled = true;
    this.reveal = false;
    
    this.updateLock =     true;
    this.specialAction =  false;

    this.ready = false;
    this.state = RoomState.uninitialized;
  }



  toString (): string {
    return JSON.stringify({
      "stage_id": this.id,
      "stage_name": this.name,
      "stage_width": this.width,
      "stage_height": this.height,
      "max_healthPoints": this.max_hp,
      "current_healthPoints": this.hp,
      "players": this.players
    },null,4);
  }






  //#region controller
  //gyro movement not implemented

  specialAction: boolean = false;

  initController (){
    this.updateLock = false;
    this.specialAction = false;
  }


  sendControl (move: Direction){
    if (this.controlsDisabled || this.updateLock)  return;
    console.log("send_control: "+move+"\t\tisPulling: "+this.specialAction);
    let pack: PlayerMovement = { 
      type: 'player_movement', 
      player_id: this.user.id, 
      room_id: this.id, 
      dir: move, 
      isPulling: this.specialAction, 
      updateNum: this.clientUpdateNum
    };
    this.client.sendPackage(pack);
  }

  specialActionToggle (): boolean{
    this.specialAction = !this.specialAction;
    return this.specialAction;
  }
  //#endregion controller
}








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






interface StageCell { src: string, alt: string, classes: string[] }

enum RoomState {
  'uninitialized',
  'waitingToStart',
  'gameOngoing'
}

function whatRoomState (state: RoomState): string {
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
