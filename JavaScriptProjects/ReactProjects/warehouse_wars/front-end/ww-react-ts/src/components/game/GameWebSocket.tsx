import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { RootState } from "../../redux/_store";
import { activateSpinner, deactivateSpinner } from "../../redux/SpinnerSlice";

import { isGamePackage } from "../../types/game/GamePackage";
import { dontConnectGame } from "../../redux/GameSlice";









function GameWebSocket() {

  const { netAddr: configs } = useSelector((state: RootState) => state.configs);
  const { shouldConnect } = useSelector((state: RootState) => state.game.socket);
  
  const dispatch = useDispatch();

  const init = useRef(false);





  const getAddr = useCallback(async () => {
    return `ws://${configs.address}:${configs.port}/ww`;
  }, [configs]);


  

  /** Create shared connection on login,lobby,game components
   * options: share, filter, onMessage
   */
  const {
    //sendMessage,
    readyState,
  } = useWebSocket(getAddr, {
    share: true,
    retryOnError: true,

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
    
    onOpen: () => {
      console.log('Game Websocket connected');
    },
    onClose: (_event: CloseEvent) => {
      console.log(`Game Websocket shutting down`);
    },
    onError: (event: Event) => {
      console.error(`Game websocket error: ${event.type} [${event.timeStamp}]`);
      console.error(event);
    },
    onReconnectStop: (numAttempts: number) => {
      console.error(`Game Websocket disconnected\n- failed to connect to websocket after ${numAttempts} attempts`);
      dispatch(dontConnectGame());
    },
    onMessage: (event: MessageEvent<any>) => {
      console.log(`received message: ${event.data}`);
    },


    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (_closeEvent) => true,
    reconnectInterval: (attemptNumber) =>
      Math.min(Math.pow(2, attemptNumber) * 10*1000, 10*60*1000),
    reconnectAttempts: 3,
  }, shouldConnect);







  useEffect(() => {
    if (!init.current){
      init.current = true;
      dispatch(activateSpinner('Connecting...'));
    }
    else if (readyState === ReadyState.OPEN){
      dispatch(deactivateSpinner());
    }
  }, [readyState]);

  





  return (
    <></>
  )
}

export default GameWebSocket