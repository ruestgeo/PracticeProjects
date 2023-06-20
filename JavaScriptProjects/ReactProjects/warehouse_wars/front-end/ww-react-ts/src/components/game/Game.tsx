import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import GameStage from "./GameStage";
import GameInfo from "./GameInfo";

import { RootState } from "../../redux/_store";
import { deactivateSpinner } from "../../redux/SpinnerSlice";

import { RoomState } from "../../types/game/Room";
import { LeaveRoom } from "../../types/game/ClientSend";
import { GamePackage, isGamePackage } from "../../types/game/GamePackage";
import { isDefeat, isRemovedFromRoom, isVictory } from "../../types/game/ClientReceive";

import './Game.css'




function Game({route}: {route: string}) {

  const { user } = useSelector((state: RootState) => state.auth);
  const { room } = useSelector((state: RootState) => state.game);
  const { netAddr: configs }  = useSelector((state: RootState) => state.configs);
  const { shouldConnect }     = useSelector((state: RootState) => state.game.socket);
  
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  

  const [infoVisible, setInfoVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  
  const [roomReady, setRoomReady] = useState(false); //ready
  const [roomState, setRoomState] = useState(RoomState.uninitialized); //state

  //const [gyroMove, setGyroMove] = useState(false);

  
  const updateLock = useRef(true);
  const gameOver = useRef(false);
  

  

  useEffect(() => {
    console.log(`Game component at "/${route}"`);
    return () => {
      console.log('Game component unmounting');
    }
  }, []);


  



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
    if (isVictory(pack)){
      gameOver.current = true;
      updateLock.current = true;
      setOverlayText("Victory!");
      setOverlayVisible(true);
    }
    else if (isDefeat(pack)){
      gameOver.current = true;
      updateLock.current = true;
      setOverlayText("Defeat...");
      setOverlayVisible(true);
    }
    else if (isRemovedFromRoom(pack)){
      gameOver.current = true;
      updateLock.current = true;
      alert(`Removed from game room\nreason:  ${pack.reason}`);
      navigate('/lobby', {state: {from: location.pathname}});
      }
  }

  useEffect(() => {
    if (readyState === ReadyState.OPEN){
      dispatch(deactivateSpinner());
    }
  }, [readyState])

  //#endregion websocket



  

  const leaveRoom = () => {
    if (readyState === ReadyState.OPEN){
      const pack: LeaveRoom = {
        type: 'leave_room',
        player_id: user!.id,
        room_id: room.id
      };
      sendMessage(JSON.stringify(pack));
    }
    updateLock.current = true;
    navigate('/lobby', {state: {from: location.pathname}});
  };





  return (
    <div id="game_div">
      <div className={!overlayVisible ? 'game_div' : 'game_div underlay'}>
      <div id="game_debug"></div>
        <div>
          <GameStage updateLock={updateLock} gameOver={gameOver} 
            roomReady={roomReady} setRoomReady={setRoomReady} 
            roomState={roomState} setRoomState={setRoomState} />
          {/* GyroMovement component */}
        </div>
        <br />


        <div id="general_controls">
          <table>
            <tbody>
              <tr>
                {/* <td>
                  <input type='button' id="gyroToggle" value={`Turn ${gyroMove ? 'Off' : 'On'} GyroMovement`} onClick={() => setGyroMove(!gyroMove)} />
                </td> */}
                <td>
                  <input type="button" id="toggle_info" value="Toggle Info" onClick={() => setInfoVisible(!infoVisible)} />
                </td>
                <td>
                  <input type='button' value="Leave Room" onClick={leaveRoom} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>


        {infoVisible && (
          <GameInfo />
        )}
      </div>

      


      {overlayVisible && (
        <div id="game_overlay" onClick={leaveRoom} 
            className="overlayBanner overlayInteractable overlayFullscreen">
          <h1 id="banner_text" className="screen-centered-text">{overlayText}</h1>
        </div>
      )} 
    </div>
  )
}

export default Game



