import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { PlayerReadyStatus } from '../types/game/ClientReceive';
//import { Direction } from './../../types/game/Room'



interface GameSliceState  {
  socket: GameWebSocket,
  room: GameRoom,
}

interface GameWebSocket {
  shouldConnect: boolean,
}

interface GameRoom extends RoomInit /*, StageInit*/ {
  alts: Readonly<{[key: string]: string}>,
  imgs: Readonly<{[key: string]: string}>
}

export interface RoomInit { //EnterRoom pack;  only used as initial value for GameStage
  id: string,
  name: string,
  capacity: number,
  playersReady: PlayerReadyStatus[];
}
// export interface StageInit { //RoomInit pack
//   id: string,
//   name: string,
//   width: number,
//   height: number,
//   max_hp: number,
// }

const initState: GameSliceState = {
  socket: {
    shouldConnect: false,
  },
  room: {
    id: '',
    name: '',
    capacity: 0,
    playersReady: [],

    //width: 0,
    //height: 0,
    //max_hp: 0,

    imgs: {
      "player1n": "/game/player1-n.gif",
      "player1e": "/game/player1-e.gif",
      "player1w": "/game/player1-w.gif",
      "player1s": "/game/player1-s.gif",

      "player2n": "/game/player2-n.gif",
      "player2e": "/game/player2-e.gif",
      "player2w": "/game/player2-w.gif",
      "player2s": "/game/player2-s.gif",

      "player3n": "/game/player3-n.gif",
      "player3e": "/game/player3-e.gif",
      "player3w": "/game/player3-w.gif",
      "player3s": "/game/player3-s.gif",

      "player4n": "/game/player4-n.gif",
      "player4e": "/game/player4-e.gif",
      "player4w": "/game/player4-w.gif",
      "player4s": "/game/player4-s.gif",

      "player5n": "/game/player1-n.gif",
      "player5e": "/game/player1-e.gif",
      "player5w": "/game/player1-w.gif",
      "player5s": "/game/player1-s.gif",

      "player6n": "/game/player2-n.gif",
      "player6e": "/game/player2-e.gif",
      "player6w": "/game/player2-w.gif",
      "player6s": "/game/player2-s.gif",

      "player7n": "/game/player3-n.gif",
      "player7e": "/game/player3-e.gif",
      "player7w": "/game/player3-w.gif",
      "player7s": "/game/player3-s.gif",

      "player8n": "/game/player4-n.gif",
      "player8e": "/game/player4-e.gif",
      "player8w": "/game/player4-w.gif",
      "player8s": "/game/player4-s.gif",

      "blank": "/game/blank.gif",
      "Wall": "/game/wall.gif",
      "Box": "/game/box2.gif",
      "Box0": "/game/box2.gif",
      "Box1": "/game/box1.gif",
      "Box2": "/game/box2.gif",
      "Box3": "/game/box3.gif",
      "hp+": "/game/hp.gif",
      "hp-": "/game/out.gif",
      "out": "/game/grave.gif",

      "Bouncer": "/game/mob.gif",
      "Wanderer": "/game/wanderer.gif",
      "Crawler": "/game/crawler.gif",
      "Warper": "/game/warper.gif",
      "Pusher": "/game/pusher.gif",
      "Charger": "/game/charger.gif",
      "Charger-n": "/game/charger-n.gif",
      "Charger-e": "/game/charger-e.gif",
      "Charger-s": "/game/charger-s.gif",
      "Charger-w": "/game/charger-w.gif",
      "Mimic": "/game/mimic1.gif",
      "Mimic_reveal": "/game/mimic_reveal.gif"
    },

    alts: {
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
    },
  }
}

export const GameSlice = createSlice({

  name: 'game',
  
  
  initialState: initState,


  reducers: {

    dontConnectGame: (state) => {
      state.socket.shouldConnect = false;
    },
    doConnectGame: (state) => {
      state.socket.shouldConnect = true;
    },

    initRoom: (state, action: PayloadAction<RoomInit>) => {
      state.room = {...state.room, ...action.payload};
    },

    //initStage: (state, action: PayloadAction<StageInit>) => {
    //  state.room = {...state.room, ...action.payload};
    //},
    

  },


})

// Action creators are generated for each case reducer function
export const { 
  doConnectGame, 
  dontConnectGame,
  initRoom,
  //initStage,

} = GameSlice.actions

export default GameSlice.reducer