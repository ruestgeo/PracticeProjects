
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useSelector } from "react-redux";

import { RootState } from "../../redux/_store";

import GameControl from "./GameControl";

import { PlayerMovement, PlayerReady, PlayerUnready, 
  RequestUpdate } from "../../types/game/ClientSend";
import { Direction, MiscActor, MobActor, PlayerActor, 
  StageInit, StageUpdate, isStageInit, isStageUpdate, FullUpdate, isFullUpdate, 
  PlayersReady, isPlayersReady } from "../../types/game/ClientReceive";
import { GamePackage, isGamePackage } from "../../types/game/GamePackage";
import { GameMovement, KeyAction, RoomState, StageCell } from "../../types/game/Room";



const MISSED_UPDATE_TOLERANCE_AMOUNT = 4;



interface GameStageProps {
  updateLock: React.MutableRefObject<boolean>,
  gameOver: React.MutableRefObject<boolean>,
  roomReady: boolean, 
  setRoomReady: React.Dispatch<React.SetStateAction<boolean>>,
  roomState: RoomState,
  setRoomState: React.Dispatch<React.SetStateAction<RoomState>>,
}




function GameStage({updateLock, gameOver, roomReady, setRoomReady, 
  roomState, setRoomState, }: GameStageProps
) {


  const focused =  useSelector((state: RootState) => state.focus.focused);
  const { user } = useSelector((state: RootState) => state.auth);
  const { room } = useSelector((state: RootState) => state.game);
  const { netAddr: configs }  = useSelector((state: RootState) => state.configs);
  const { shouldConnect }     = useSelector((state: RootState) => state.game.socket);


  const [_width, setWidth]  = useState(0);
  const [_height, setHeight]  = useState(0);
  const [_maxHealth, setMaxHealth]  = useState(0);
  const [hp, setHealth] =     useState(0);
  const [reveal, setReveal] = useState(false);
  
  const [healthStatus, setHealthStatus] = useState<boolean[]>([]);
  const [players, setPlayers] =           useState<Player[]>([]); // !out is also used as a ready/not-ready boolean
  const [stage, setStage] =               useState<StageCell[][]>([]);

  const [specialAction, setSpecialAction] = useState(false);
  const specialActionToggle = () => {
    setSpecialAction(!specialAction);
  }


  const playerNums = useRef<{[id: string]: number}>({});
  const emptyStage = useRef<StageCell[][]>([]); //blank stage

  const clientUpdateNum =     useRef(0);
  const missedUpdates =       useRef(0);
  const previousUpdateType =  useRef(UpdateType.uninitialized);
  const controlsDisabled =    useRef(true);

  
  const stageRef   = useRef<StageCell[][]>([]);
  


  useEffect(() => {
    stageRef.current = stage;
  },[stage]);



//#region websocket

  const getAddr = useCallback(async () => {
    return `ws://${configs.address}:${configs.port}/ww`;
  }, [configs]);
  
  const {
    sendMessage,
    readyState,
  } = 
  useWebSocket(getAddr, {
    share: true,
    filter: (message: MessageEvent<any>) => {
      if (typeof message.data === 'string'){
        let json;
        try{
          json = JSON.parse(message.data);
        }
        catch (err){ return false; }
        if (isGamePackage(json))
          return true;
      }
      else if (typeof message.data === 'object'){
        if (isGamePackage(message.data))
          return true;
      }
      return false;
    },
    onMessage: (event: MessageEvent<any>) => {
      if (typeof event.data === 'string'){
        let json;
        try{
          json = JSON.parse(event.data);
        }
        catch (err){ return false; }
        handlePack(json);
      }
      else if (typeof event.data === 'object'){
        handlePack(event.data);
      }
    },
  }, shouldConnect);

  function handlePack(pack: GamePackage){
    if (gameOver.current)   return;
    if (isStageUpdate(pack) && roomState === RoomState.gameOngoing)
      partialUpdate(pack);
    else if (isFullUpdate(pack) && roomState === RoomState.gameOngoing)
      fullUpdate(pack);
    else if (isStageInit(pack) && roomState === RoomState.waitingToStart)
      initStage(pack);
    else if (isPlayersReady(pack) && roomState === RoomState.waitingToStart)
      playerReady(pack);
  }

//#endregion websocket


  

//#region control

  const sendControl = (move: Direction) => { 
    //console.log(`controlsDisabled: ${controlsDisabled.current}\nupdateLock: ${updateLock.current}\nreadyState: ${readyState}`);
    if (controlsDisabled.current || updateLock.current || readyState !== ReadyState.OPEN)
      return;
    console.log("send_control: "+move+"\t\tisPulling: "+specialAction);
    let pack: PlayerMovement = { 
      type: 'player_movement', 
      player_id: user!.id, 
      room_id: room.id, 
      dir: move, 
      isPulling: specialAction, 
      updateNum: clientUpdateNum.current
    };
    sendMessage(JSON.stringify(pack));
  }



  const getKeyAction =  useCallback((key: string) => {
    switch (key.toLowerCase()){
      case 'arrowup':
      case 'w': { return KeyAction.up }
      case 'arrowdown':
      case 's': { return KeyAction.down }
      case 'arrowleft':
      case 'a': { return KeyAction.left }
      case 'arrowright':
      case 'd': { return KeyAction.right }
      default: { return KeyAction.special } //placeholder
    }
  }, []);



  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    //console.log(`keydown ${event.key}\nfocused: ${focused}`);
    if (focused) 
      return;
    if (event.shiftKey  &&  !specialAction)
      setSpecialAction(true);
    else if (!event.shiftKey  &&  specialAction)
      setSpecialAction(false);
    const key: KeyAction = getKeyAction(event.key);
    if (key === KeyAction.special) 
      return;
    switch (key){
      case KeyAction.up:    { sendControl(GameMovement.up   ); break; }
      case KeyAction.down:  { sendControl(GameMovement.down ); break; }
      case KeyAction.left:  { sendControl(GameMovement.left ); break; }
      case KeyAction.right: { sendControl(GameMovement.right); break; }
    }
  }, [focused, setSpecialAction, specialAction, readyState]);

  useEffect(() => {
    if (!focused)
      document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focused, handleKeyDown]);



  const handleKeyUp = useCallback((_event: KeyboardEvent) => {
    if (focused) 
      return;
    setSpecialAction(false);
  }, [focused, setSpecialAction]);

  useEffect(() => {
    if (!focused)
      document.addEventListener('keyup', handleKeyUp);
    return () => document.removeEventListener('keyup', handleKeyUp);
  }, [focused, handleKeyUp]);



  
  const handleKeyDownMimicReveal = useCallback((event: KeyboardEvent) => {
    if (focused) 
      return;
    if (event.key.toLowerCase() === 'm'){
      console.log('mimic reveal keydown');
      mimicReveal();
      //setReveal(true); //wont update actors
      //setTimeout(() => {
      //  setReveal(false);
      //}, 2000);
    }
  }, [focused]);
  useEffect(() => {
    if (!focused)
      document.addEventListener('keydown', handleKeyDownMimicReveal);
    return () => document.removeEventListener('keydown', handleKeyDownMimicReveal);
  }, [focused, handleKeyDownMimicReveal]);
  useEffect(() => {console.log(`reveal: ${reveal}`)},[reveal]);


//#endregion control
  




//#region waiting

  useEffect(() => {
    console.log("GameStage mounted");

    prepRoom();

    return () => {
      console.log("GameStage unmounted");
    }
  }, []);



  function prepRoom (){
    //player.out = !player.ready
    setRoomReady(false);
    setRoomState(RoomState.waitingToStart);

    const tempPlayers = Array(room.capacity).fill({num: -1, id: '--', name: '--', out: true});
    console.log(JSON.stringify(tempPlayers));
    for (let i = 0;  i < room.playersReady.length;  i++){
      if (i >= room.capacity) break;
      tempPlayers[i] = {num: i, id: room.playersReady[i].id, name: room.playersReady[i].name, out: !room.playersReady[i].ready};
      playerNums.current[room.playersReady[i].id] = i;
    }
    console.log(JSON.stringify(tempPlayers));
    setPlayers(tempPlayers);
  }



  function playerReady (pack: PlayersReady){
    setPlayers(players.map((_player, index) => {
      if (index >= pack.players.length) 
        return {num: -1, id: '--', name: '--', out: true};
      else {
        playerNums.current[pack.players[index].id] = index;
        return {num: index, id: pack.players[index].id, name: pack.players[index].name, out: !pack.players[index].ready};
      }
    }));
  }



  function onReady (){
    const tempPlayers = clonePlayers();
    let player = tempPlayers[playerNums.current[user!.id]];
    player.out = !player.out;
    if (player.out){
      let pack: PlayerUnready = {
        type: 'player_unready',
        player_id: user!.id,
        room_id: room.id
      }
      sendMessage(JSON.stringify(pack));
    }
    else {
      let pack: PlayerReady = {
        type: 'player_ready',
        player_id: user!.id,
        room_id: room.id
      };
      sendMessage(JSON.stringify(pack));
    }
    setPlayers(tempPlayers);
  }

//#endregion waiting





//#region active

  function initStage (pack: StageInit){
    
    setWidth(pack.width);
    setHeight(pack.height);

    //init emptyStage
    for (let y = 0; y < pack.height; y++){
      let row: StageCell[] = [];
      for (let x = 0; x < pack.width; x++){
        let cell: StageCell = {src: room.imgs['blank'], alt: room.alts['blank'], classes: ['blank']};
        row.push(cell);
      }
      emptyStage.current.push(row);
    }

    //clone emptyStage to stage
    const tempStage = cloneStage(emptyStage.current)
    

    setMaxHealth(pack.max_hp);
    setHealth(pack.max_hp);
    setHealthStatus(Array(pack.max_hp).fill(true));

    const newPlayers: Player[] = [];
    for (let i = 0;  i < pack.actors.players.length; i++){
      let player = pack.actors.players[i];
      newPlayers.push({num: i, name: player.name, id: player.id, out: false});
      playerNums.current[player.id] = i;
    }
    setPlayers(newPlayers);

    updateActors(tempStage, pack.actors.players, pack.actors.mobs, pack.actors.misc);
    previousUpdateType.current = UpdateType.full;
    controlsDisabled.current = false;
    clientUpdateNum.current = pack.updateNum;

    const _roomReady = true;
    const _roomState = RoomState.gameOngoing;
    setRoomReady(_roomReady);
    setRoomState(_roomState);
    console.log(`init done, ready? ${_roomReady}  state: ${whatRoomState(_roomState)}`)

    setStage(tempStage);
  }




  function fullUpdate (pack: FullUpdate){
    let newUpdateNum = pack.updateNum;
    if ( (clientUpdateNum.current > newUpdateNum) && (newUpdateNum > 0) && (previousUpdateType.current !== UpdateType.full) ){ //dont update if new update seems older
      requestUpdate();
      return;
    }
    clientUpdateNum.current = newUpdateNum;
    previousUpdateType.current = UpdateType.full;
    missedUpdates.current = 0;
    if ( pack.hp < hp ){
      setHealthStatus(healthStatus.map((_, index) => index < pack.hp));
      setHealth(pack.hp);
    }
    const tempStage = cloneStage(emptyStage.current);
    updateActors(tempStage, pack.update.players, pack.update.mobs, pack.update.misc);
    setStage(tempStage);
  }



  function partialUpdate (pack: StageUpdate){
    checkUpdateNum(pack);
    
    const tempStage = cloneStage(stage);

    for (let blank of pack.blanks){
      setImage(tempStage,blank[0], blank[1], room.imgs['blank'], room.alts['blank'], 'blank');
    }
    removeActors(tempStage, pack.removed.players, pack.removed.mobs, pack.removed.misc);
    updateActors(tempStage, pack.updated.players, pack.updated.mobs, pack.updated.misc);

    //interpret player spawned=true as a decrease in hp
    //players share hp
    let hpLoss = 0;
    for (let actor of pack.updated.players){
      if ( actor.spawned )  hpLoss++;
    }
    if (hpLoss > 0){
      setHealth(Math.max(0, hp - hpLoss));
      setHealthStatus(healthStatus.map((_, index) => index < hp));
    }

    setStage(tempStage);
  }



  function checkUpdateNum (pack: StageUpdate){
    let newUpdateNum = pack.updateNum;
    clientUpdateNum.current = newUpdateNum;
    previousUpdateType.current = UpdateType.partial;
    if ( (clientUpdateNum.current > newUpdateNum) ){ //force full update if received an older update or if num wrapped
      requestUpdate();
      return;
    }
    let updateGap = newUpdateNum - clientUpdateNum.current;
    if ( updateGap > 0) 
      missedUpdates.current += updateGap;
    if ( missedUpdates.current > MISSED_UPDATE_TOLERANCE_AMOUNT ){ //if continue missing partial updates, then request a full update
      requestUpdate();
    }
  }



  function updateActors (tempStage: StageCell[][], players: PlayerActor[], mobs: MobActor[], misc: MiscActor[]){
    for (let actor of misc){
      if (!room.imgs.hasOwnProperty(actor.class))
        setImage(tempStage, actor.pos[0], actor.pos[1], "/game/unknown.gif", "?", actor.class);
      else if (actor.class === "Box")
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs[actor.class + (actor?.variant ?? '')], room.alts[actor.class + (actor?.variant ?? '')], actor.class);
      else  
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs[actor.class], room.alts[actor.class], actor.class);
    }

    for (let actor of mobs){
      let dir = 'mob_e';
      const [x,y] = actor.dir;
      switch (x){
        case 1: {
          switch (y){
            case 1:  { dir = "mob_se"; break; }
            case 0:  { dir = "mob_e";  break; }
            case -1: { dir = "mob_ne"; break; }
          }
          break;
        }
        case 0: {
          switch (y){
            case 1:  { dir = "mob_s";  break; }
            case -1: { dir = "mob_n";  break; }
          }
          break;
        }
        case -1: {
          switch (y){
            case 1: { dir = "mob_sw"; break; }
            case 0: { dir = "mob_w";  break; }
            case -1:{ dir = "mob_nw"; break; }
          }
          break;
        }
      }

      if (reveal && actor.class === "Mimic")
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs["Mimic_reveal"], room.alts["Mimic_reveal"], actor.class);
      //else if ( type === "Charger" )  setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs[(actor.class + dir)], room.alts[actor.class], actor.class);
      else 
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs[actor.class], room.alts[actor.class], [actor.class, dir]); 
    }

    for (let actor of players){
      let klass = ["Player"];
      if (actor.spawned && !tempStage[actor.pos[0]][actor.pos[1]].classes.includes("spawned"))
        klass.push('spawned');
      let img_src = "player" + (playerNums.current[actor.id]+1) + actor.dir;
      setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs[img_src], room.alts[img_src], klass);
    }

    updateLock.current = false;
  }



  function removeActors (tempStage: StageCell[][], players: PlayerActor[], mobs: MobActor[], misc: MiscActor[]){
    if (players.length > 0){
      const tempPlayers = clonePlayers();
      for (let actor of players){
        tempPlayers[playerNums.current[actor.id]].out = true;
        if (actor.id === user!.id)
          controlsDisabled.current = true;
      }
      setPlayers(tempPlayers);
    }
    if (mobs.length > 0 || misc.length > 0){
      for (let actor of mobs){
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs['blank'], room.alts['blank'], 'blank');
      }
      for (let actor of misc){
        setImage(tempStage, actor.pos[0], actor.pos[1], room.imgs['blank'], room.alts['blank'], 'blank');
      }
    }
  }



  function setImage (tempStage: StageCell[][], x: number, y: number, src: string, alt: string, type: string | string[]){
    let cell: StageCell = tempStage[y][x];
    cell.src = src;
    cell.alt = alt;
    if (Array.isArray(type))
      cell.classes = type;
    else
      cell.classes = [type];
  }



  function cloneStage (originalStage: StageCell[][]): StageCell[][] {
    return JSON.parse(JSON.stringify(originalStage));
  }
  function clonePlayers (): Player[] {
    return JSON.parse(JSON.stringify(players));
  }


  
  const mimicReveal = useCallback(() => {
    if (reveal || updateLock.current)   return;
  
    setReveal(true); 
    let mimics: StageCell[] = [];
    const temp = cloneStage(stageRef.current);
    for (let row of temp){
      for (let actor of row){
        if (actor.classes.includes("Mimic")){
          mimics.push(actor);
          actor.src = room.imgs["Mimic_reveal"];
          actor.alt = room.alts["Mimic_reveal"];
        }
      }
    }
    setStage(temp);
  
    setTimeout(() => {
      setReveal(false);
      const temp = cloneStage(stageRef.current);
      for (let row of temp){
        for (let actor of row){
          if (actor.classes.includes("Mimic")){
            mimics.push(actor);
            actor.src = room.imgs["Mimic"];
            actor.alt = room.alts["Mimic"];
          }
        }
      }
      setStage(temp);
      requestUpdate();
    }, 2000);
  }, [reveal]);



  function requestUpdate (){
    if (updateLock.current)  return;
    if (previousUpdateType.current !== UpdateType.full)  return;
    let pack: RequestUpdate = {"type": "request_update", 'room_id': room.id, 'player_id': user!.id};
    sendMessage(JSON.stringify(pack));
  }

//#endregion active






  // function toString (): string {
  //   return JSON.stringify({
  //     "stage_id": room.id,
  //     "stage_name": room.name,
  //     "stage_width": room.width,
  //     "stage_height": room.height,
  //     "max_healthPoints": maxHealth,
  //     "current_healthPoints": hp,
  //     "players": players
  //   },null,4);
  // }




  return (
    <div id='game_stage'>
      {roomReady ? (

        <div>
          <table className="stage">
            <tbody>
              {stage.map((row, index) => (
                <tr className={'stage'} key={`row_${index}`}>
                  {row.map((cell, index2) => (
                    <td key={`cell_${index}-${index2}`}>
                      <img src={cell.src} alt={cell.alt} className={cell.classes.join(' ')} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <table>
            <tbody>
              <tr>
                {healthStatus.map((hp, index) => (
                  <td key={`hp_${index}`}>
                    <img src={room.imgs[hp ? 'hp+' : 'hp-']} alt={room.alts[hp ? 'hp+' : 'hp-']} className={hp ? 'hp+' : 'hp-'} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      ) : (

        <h3 className="room-id">{'Room token: '+room.id}</h3>

      )}

      

      
          


      <div>
          <table className="players">
            <tbody>
              {/* for player of players */}
              {players.map((player, index) => (
                <tr className="players" key={index}>
                    <td className="players">
                        <p>{player.num+1}</p>
                    </td>
                    
                    { roomReady ? (
                      <td className="players">
                        <img src={!player.out ? '/game/player'+(player.num+1)+'-s.gif' : '/game/grave.gif'} alt={'Player '+(player.num+1)} />
                      </td>
                    ) : (
                      <td className="players">
                        <img src={player.num < 0 ? '' : '/game/player'+(player.num+1)+'-s.gif'} alt={player.num < 0 ? '--' : 'Player '+(player.num+1)} />
                      </td>
                    )}
                    
                    
                    <td className="players name">
                        <p>{player.name}</p>
                    </td>
                    <td className="players">
                        <p className="playerId">{player.id}</p>
                    </td>
                    
                    {!roomReady && (
                      <td className="players ready-button">
                        <input type="button" 
                            value={player.num < 0 ? 'Empty slot' : (player.out ? 'Not Ready': 'Ready')}
                            className={player.id === user!.id ? 
                                (player.out ? 'iNotReady readyButton' : 'iReady readyButton') : 
                                (player.out ? 'playerNotReady readyButton' : 'playerReady readyButton')
                            }
                            disabled={player.id !== user!.id}
                            onClick={
                              player.id === user!.id ? onReady : undefined
                            }  />
                      </td>
                    )}
                    
                </tr>
              ))}
            </tbody>
          </table>
      </div>




      {roomReady && (
        <GameControl specialAction={specialAction} 
          specialActionToggle={specialActionToggle}
          sendControl={sendControl} />
      )}
    </div>
  )

}

export default GameStage



enum UpdateType {
  'uninitialized', 'full', 'partial'
}

interface Player {
  num: number, 
  id: string, 
  name: string, 
  out: boolean
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

