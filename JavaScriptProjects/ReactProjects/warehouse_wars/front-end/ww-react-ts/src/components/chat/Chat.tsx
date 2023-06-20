
import { useRef, useEffect, useCallback, useState, 
  FormEvent, KeyboardEvent, CSSProperties } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useDispatch, useSelector } from 'react-redux';
import { addListener, ListenerEffectAPI, PayloadAction, removeListener, ThunkDispatch } from '@reduxjs/toolkit';

import { RootState, store } from '../../redux/_store';
import { focus, blur } from '../../redux/FocusSlice';
import { UNKNOWN_USER, UNKNOWN_ID } from '../../redux/AuthSlice';
import { doConnectChat, setChatAwaitToken, setChatState, setChatSubmitEnabled, setChatTextEnabled, setUpdateNum } from '../../redux/ChatSlice';

import ChatNotification from './ChatNotification';
import ChatEntry from './ChatEntry';
import { DEFAULT_COLOR } from '../ColorSelect';

import { ChatState } from '../../types/chat/ChatState';
import { DeliveryState } from '../../types/chat/DeliveryState'
import { ChatElement, ChatElementOptions } from '../../types/chat/ChatElement'
import { WWChatPackage, isWWChatPackage, WWChatError, isWWChatReceived, isWWChatToken, 
  isWWChatFetchMessagesDone, isWWChatFetchTokenDone,  } from '../../types/chat/WWChatPackage';

import { generateUniqueId } from '../../utils/UniqueId';

import './Chat.css'
import './ChatNotification.css'













const TOKEN_WAIT_TIME = 60; //seconds
const TEXT_PATTERN = '\\S+';
const TEXT_REG_EXP = new RegExp(TEXT_PATTERN, 'g');

const dateOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
  timeZone: "UTC"
}
const dateFormat = new Intl.DateTimeFormat("en-US", dateOptions);

interface NotifOpt {
  status: DeliveryState, 
  text: string, 
  duration: number, 
  class?: string[], 
  style?: string
}



/** singleton */
function Chat() {
  
  //NOTE: multiton is not supported but can be by transferring state to ChatSlice or a single source 
  //  as done with some props below
  //  ;  rerender, chatQueue, notifications (which should go to its own component), and redux middleware logic

  // 

  const { shouldConnect, infoInit: socketIsReady, textEnabled: chatTextEnabled, submitEnabled: chatSubmitEnabled,
    queueLimit /*, updateNum, maxUpdateNum*/ } = useSelector((state: RootState) => state.chat);
  const { user }              = useSelector((state: RootState) => state.auth);
  const { netAddr: configs }  = useSelector((state: RootState) => state.configs);
  const focused               = useSelector((state: RootState) => state.focus.focused);
  
  const dispatch = useDispatch();


  const [text, setText] = useState('');

  const chatLogRef  = useRef<HTMLDivElement>(null);
  const autoScroll  = useRef(true);
  const checkScroll = useRef(false);
  
  const [chatQueue, updateQueue] = useState<JSX.Element[]>([]);

  const awaitToken          = useRef<string|null>(null);
  const awaitTokenTimeouts  = useRef<{[timestamp:string]: (NodeJS.Timeout|number)}>({});

  const notifications       = useRef<{[id:string]: JSX.Element}>({});
  const notificationTimeout = useRef<{[id:string]: NodeJS.Timeout}>({});


  const [_, forceUpdate] = useState({});
  const rerender = () => {forceUpdate({});}

  



  useEffect (() => {
    console.log('Chat mounted');

    if (!chatLogRef.current){
      rerender();
    }

    const unsubscribeChatState = 
      store.dispatch(addListener({actionCreator: setChatState, effect: chatStateEffect  }));

    return () => {
      console.log('Chat unmounted');
      unsubscribeChatState();
    }
  }, []);


  useEffect(() => { 
    if (autoScroll.current && checkScroll.current && chatLogRef.current){
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight - chatLogRef.current.offsetHeight;
      checkScroll.current = false;
      rerender();
    }
  }, [chatQueue]);


//#region functions



  async function forwardMessage () {
    console.log(user);
    try{
      dispatch(setChatState({
        state: DeliveryState.sending, 
        enabled: false, 
        message: `${dateFormat.format(Date.now())}\nPreparing to send`
      }));

      sendMessage(JSON.stringify({type: 'request_token'}));

      const timestamp = Date.now();

      function awaitingTokenEffect ( action: PayloadAction<string> ) {
        let packToken: string = action.payload;
        console.log(`awaitTokenEffect: ${packToken}`);
        console.log(`ts key: ${timestamp}`);

        clearTimeout(awaitTokenTimeouts.current[timestamp]);
        delete awaitTokenTimeouts.current[timestamp];

        if (store.dispatch(removeListener({actionCreator: setChatAwaitToken, effect: awaitingTokenEffect, cancelActive: true}))){
          console.log(`removeListener`);
        }
        
        let pack : WWChatPackage = {
          type: 'chat',
          content: text,
          token: packToken,
          user: user ?? {id: UNKNOWN_ID, name: UNKNOWN_USER, color: DEFAULT_COLOR}
        };
        const message = JSON.stringify(pack);
        console.log(message);
        sendMessage(message);
        
        let success = (readyState === ReadyState.OPEN) && socketIsReady;
        dispatch(setChatState({
          state: success ? DeliveryState.success : DeliveryState.failed, 
          enabled: success ? false : true, 
          message: `${dateFormat.format(Date.now())}\n`+(success ? 'Message sent!' : 'Failed to send message')
        }));
        if (success) awaitToken.current = packToken;
      }

      //const unsubscribeAwaitToken = 
        store.dispatch(addListener({actionCreator: setChatAwaitToken, effect: awaitingTokenEffect}));

      const timeout = setTimeout(() => {
        //unsubscribeAwaitToken()
        console.log(`awaitToken timeout for ts key: ${timestamp}`);
        if (store.dispatch(removeListener({actionCreator: setChatAwaitToken, effect: awaitingTokenEffect, cancelActive: true}))){
          console.log(`removeListener`);
        }
        //else {
        //  console.log('awaitToken timeout not found');
        //}
      }, TOKEN_WAIT_TIME * 1000);
      awaitTokenTimeouts.current[timestamp] = timeout;
      console.log(`chat awaitToken ts key: ${timestamp}`);

    }
    catch (e){ throw e; }

  }



  function receiveMessage (chatElement: ChatElement) {
    createChatEntry(chatElement);
    checkScroll.current = true;
  }


  


  function chatStateEffect (
    action: PayloadAction<ChatState>, 
    _listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, PayloadAction<ChatState>>, unknown>
  ) {
    const status = action.payload;
    console.log(`status: ${JSON.stringify(status)}`);
    switch (status.state){
      /*case DeliveryState.default: {
        break;
      }*/
      case DeliveryState.sending: {
        if (status.message)
          createNotification({
            status: status.state, 
            text: status.message,
            duration: 1000, 
            class: ['chat-notif-sending']
          });
        break;
      }
      case DeliveryState.success: {
        if (status.message)
          createNotification({
            status: status.state, 
            text: status.message,
            duration: 2000, 
            class: ['chat-notif-success']
          });
        break;
      }
      case DeliveryState.failed: {
        if (status.message)
          createNotification({
            status: status.state, 
            text: status.message,
            duration: 4000, 
            class: ['chat-notif-failed']
          });
        break;
      }
      case DeliveryState.complete: {
        if (status.message)
          createNotification({
            status: status.state, 
            text: status.message,
            duration: 1000, 
            class: ['chat-notif-sending']
          });
        break;
      }
      case DeliveryState.error: {
        if (status.message)
          createNotification({
            status: status.state, 
            text: status.message, //`[${dateFormat.format(Date.now())}] An error occurred:  ${err.name} ::   ${err.message}`
            duration: 10000, 
            class: ['chat-notif-error']
          });
        break;
      }
    }

    if (status.state === DeliveryState.complete ){
      setText('');
    }

    if (!status.enabled && chatSubmitEnabled){
      dispatch(setChatSubmitEnabled(false));
    }
    else if (status.enabled && !chatSubmitEnabled && text.match(TEXT_REG_EXP)){
      dispatch(setChatSubmitEnabled(true));
    }
    if (status.enabled && !chatTextEnabled){
      dispatch(setChatTextEnabled(true));
    }
  }
  


  function createChatEntry (chatElement: ChatElement) {
    let classes: string[] = [];
    let style: CSSProperties = {};
    let token: string = '--';
    if (chatElement.options?.token)   token = chatElement.options?.token;
    if (chatElement.options?.style)   style = chatElement.options?.style;
    if (chatElement.options?.class)   classes = chatElement.options?.class;

    const chatEntry = (<ChatEntry token={token} author={user ? user.id : '--'} 
      html={chatElement.html} 
      classes={classes} style={style}
      key={token} />)

    const newChatQueue = [...chatQueue, chatEntry];

    if (newChatQueue.length > queueLimit){
      const oldestMessage = newChatQueue.shift();
      console.log(oldestMessage?.props);
    }
    updateQueue(newChatQueue);
  }



  async function createNotification (opt: NotifOpt) {
    try {
      const id = await generateUniqueId('z0.z', {collection: '_chat-notif', numAttempts: 10});
      let classes: string[] = [];
      let style = {};
      if (opt.style)   style = opt.style;
      if (opt.class)   classes = opt.class;

      const chatNotif = (<ChatNotification id={id} closeChatNotification={() => 
        onCloseNotification(id)} 
        text={opt.text} classes={classes} style={style}
        key={id} />)

      notifications.current[id] = chatNotif;
      rerender();

      notificationTimeout.current[id] = setTimeout(onCloseNotification, opt.duration, id);
    }
    catch (err){
      console.error(`${err}\n-- Could not create chat status info component: \n${JSON.stringify(opt)}`);
    };
  }





  function onFocus () {
    dispatch(focus());
  }
  function onBlur () {
    dispatch(blur());
  }

  const onCloseNotification = useCallback((id: string) => {
    if ( notificationTimeout.current.hasOwnProperty(id) ){
      clearTimeout( notificationTimeout.current[id] );
      delete notificationTimeout.current[id]; 
    }
    if ( notifications.current.hasOwnProperty(id) ){
      delete notifications.current[id];
      rerender();
    }
  }, [notificationTimeout, notifications, rerender]);



  function toggleChatScroll () {
    console.log(`toggle scroll ${autoScroll.current}`);
    autoScroll.current = !autoScroll.current;

    if (autoScroll.current && chatLogRef.current){
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight - chatLogRef.current.offsetHeight;
    }
    rerender();
  }


  function reconnect () {
    dispatch(doConnectChat());
  }


  function isValid (str: string) {
    const match = str.match(new RegExp(TEXT_PATTERN ,'g'));
    return (match !== null && match[0] === str);
  }


  function submit (e?: FormEvent<HTMLFormElement>) {
    if (e)
      e.preventDefault();

    dispatch(setChatTextEnabled(false));
    dispatch(setChatSubmitEnabled(false));
    forwardMessage()
    .catch(err => {
      let message = err instanceof Error ? err.name : `Send_Message_Error ::   ${JSON.stringify(err)}`;
      console.error(err);
      createNotification({
        status: DeliveryState.error, 
        text: `[${dateFormat.format(Date.now())}] An error occurred:  ${message}`,
        duration: 10000, 
        class: ['chat-notif-error']
      });
      dispatch(setChatTextEnabled(true));
      if (isValid(text) && !chatSubmitEnabled)
        dispatch(setChatSubmitEnabled(true));
    });
  }

//#endregion function


//#region websocket

  const getAddr = useCallback(async () => {
    return `ws://${configs.address}:${configs.port}/chat`;
  }, [configs]);



  const {
    sendMessage,
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
        if (isWWChatPackage(json))
          return true;
      }
      else if (typeof message.data === 'object'){
        if (isWWChatPackage(message.data))
          return true;
      }
      return false;
    },
    
    onMessage: (event: MessageEvent<any>) => {
      //console.log(`received message: ${event.data}`);
      if (typeof event.data === 'string'){
        let json;
        try{
          json = JSON.parse(event.data);
        }
        catch (err){ return false; }
        if (isWWChatPackage(json))
          handlePack(json);
      }
      else if (typeof event.data === 'object'){
        if (isWWChatPackage(event.data))
          handlePack(event.data);
      }
      //else if (Array.isArray(message.data)){}
    },
  }, shouldConnect);



  function handlePack (pack: WWChatPackage){
    console.log(`Received socket package type :  ${pack.type}`);
    switch (pack.type){
      case 'error': {  /*{type:'error', message: string}*/    
        dispatch(setChatState({state: DeliveryState.complete, enabled: true, message: (pack as WWChatError).message}));
        break;
      }
      case 'info': {  /*{type: 'info', max_updateNum: number, queue_limit: number, current_updateNum: number}*/
        /* handled by ChatWebSocket component */
        break;
      }
      case 'token': {  /*{type:'token', token: string}*/
        if (isWWChatToken(pack)){
          dispatch(setChatAwaitToken(pack.token));
        }
        break;
      }
      case 'chat': {  /*(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp:number, updateNum:number)*/
        if (isWWChatReceived(pack)){
          dispatch(setUpdateNum(pack.updateNum));

          if (awaitToken.current && pack.token === awaitToken.current){
            dispatch(setChatState({
              state: DeliveryState.complete, 
              enabled: true,
            }));
            awaitToken.current = null;
          }
      
          let username = (pack.user && pack.user.name) ? pack.user.name : UNKNOWN_USER;
          let html = (
            <div>
              {username+" :  "}
              {"\t"+pack.content}
            </div>
          );
          const chatElement: ChatElement = {html: html};
          let options: ChatElementOptions = {token: pack.token};
          if (pack.timestamp)
            options['timestamp'] = pack.timestamp;
          if (pack.user && pack.user.color)
            options.style = {borderColor: pack.user.color};
          options.class = ["chat-entry"];
          if (Object.keys(options).length > 0)
            chatElement.options = options;
          receiveMessage(chatElement);
        }  
      
        break;
      }
      case 'fetch_done': {  /*{type: 'fetch_done', token?:string}  |  {type: 'fetch_done', failed?:number[], nonexistent?:number[]}*/
        if (isWWChatFetchTokenDone(pack)){
          console.log('NOT IMPLEMENTED; fetch_done');
          //TODO
        }
        else if (isWWChatFetchMessagesDone(pack)){
          //for simplicity any fails are ignored 
        }
        break;
      }
      case 'non-existent': {  /*{type: 'non-existent', token: string } */
        //only returned when fetch token does not exist
        console.log('NOT IMPLEMENTED; non-existent');
        //TODO
        break;
      }
      default: {
        console.error(`Received invalid socket package of type: ${pack.type}`);
        return;
      }
    }
  }



//#endregion websocket
  





  return (
    <div className='chat'>
      <h3>Chat Console</h3>

      {(readyState !== ReadyState.OPEN) && (<button onClick={reconnect}>reconnect</button>)}


      <form onSubmit={submit}>
        <label htmlFor='chat_input' >{user ? user.name : "---"}</label>
        <input type="text" className="chat-input" id="chat_input"
            value={text}
            pattern={TEXT_PATTERN}
            required={true}
            disabled={!chatTextEnabled}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={(e:KeyboardEvent) => {
              if (focused && e.key.toLowerCase() === 'enter' && isValid((e.target as HTMLInputElement).value)){
                e.preventDefault();
                submit();
              }
                
            }}
            onChange={(e) => {
                setText(e.target.value)
                const valid = isValid(e.target.value);
                if (valid && !chatSubmitEnabled)
                  dispatch(setChatSubmitEnabled(true));
                else if (!valid && chatSubmitEnabled)
                  dispatch(setChatSubmitEnabled(false));
            }} />
        <input type="submit" disabled={!chatSubmitEnabled} value={"Send Message"}/>
        <input type="button" onClick={toggleChatScroll} value={autoScroll.current ? 'Disable Jump-To-Newest' : 'Enable Jump-To-Newest'}/>
      </form>

      <div className="chat-log-container">
          <div className="chat-log" ref={chatLogRef}>
            {chatQueue}
          </div>
          <div className="chat-notif">
            {Object.values(notifications.current)}
          </div>
      </div>


    </div>
  )
}

export default Chat