import { useCallback } from "react";
import useWebSocket from "react-use-websocket";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../redux/_store";
import { dontConnectChat, setChatInitInfo, setChatState } from "../../redux/ChatSlice";

import { DeliveryState } from "../../types/chat/DeliveryState";
import { WWChatInfoReceived, isWWChatInfoReceived, isWWChatPackage } from "../../types/chat/WWChatPackage";









function ChatWebSocket() {

  const { netAddr: configs } = useSelector((state: RootState) => state.configs);
  const { shouldConnect } = useSelector((state: RootState) => state.chat);
  
  const dispatch = useDispatch();




  const getAddr = useCallback(async () => {
    return `ws://${configs.address}:${configs.port}/chat`;
  }, [configs]);


  

  /** Create shared connection on login,lobby,game components
   * options: share, filter, onMessage
   */
  const {
    sendMessage,
  //  readyState,
  } = 
  useWebSocket(getAddr, {
    share: true,
    retryOnError: true,

    filter: (message: MessageEvent<any>) => {
      if (typeof message.data === 'string'){
        let json;
        try{
          json = JSON.parse(message.data);
        }
        catch (err){ return false; }
        if (isWWChatPackage(json))
          return true;
      }
      else if (typeof message.data === 'object'){
        if (isWWChatPackage(message.data))
          return true;
      }
      return false;
    },
    
    onOpen: () => {
      console.log('Chat Websocket connected');
      sendMessage(JSON.stringify({type: 'info'}));
    },
    onClose: (_event: CloseEvent) => {
      console.log(`Chat Websocket shutting down`);
    },
    onError: (event: Event) => {
      console.error(`Chat websocket error: ${event.type} [${event.timeStamp}]`);
      console.error(event);
    },
    onReconnectStop: (numAttempts: number) => {
      console.error(`Chat Websocket disconnected\n- failed to connect to websocket after ${numAttempts} attempts`);
      dispatch(dontConnectChat());
    },
    onMessage: (event: MessageEvent<any>) => {
      console.log(`received message: ${event.data}`);
      if (typeof event.data === 'string'){
        let json;
        try{
          json = JSON.parse(event.data);
        }
        catch (err){ return false; }
        if (isWWChatInfoReceived(json))
          handlePack(json);
      }
      else if (typeof event.data === 'object'){
        if (isWWChatInfoReceived(event.data))
          handlePack(event.data);
      }
    },


    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (_closeEvent) => true,
    reconnectInterval: (attemptNumber) =>
      Math.min(Math.pow(2, attemptNumber) * 10*1000, 10*60*1000),
    reconnectAttempts: 3,
  }, shouldConnect);


  function handlePack (pack: WWChatInfoReceived){
    dispatch(setChatInitInfo({
      queueLimit: pack.current_updateNum,
      updateNum: pack.max_updateNum,
      maxUpdateNum:pack.queue_limit,
    }));
    dispatch(setChatState({state: DeliveryState.default, enabled: true, message: 'Chat initialized'}));
  }

  





  return (
    <></>
  )
}

export default ChatWebSocket