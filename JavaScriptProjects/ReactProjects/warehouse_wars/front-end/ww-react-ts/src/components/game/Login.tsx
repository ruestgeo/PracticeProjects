import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import { RootState } from "../../redux/_store";
import { setUser, setUserCookieExpiry, UNKNOWN_USER } from "../../redux/AuthSlice";
import { activateSpinner, deactivateSpinner } from "../../redux/SpinnerSlice";

import ColorSelect, { DEFAULT_COLOR } from "../ColorSelect";

import { isGamePackage } from "../../types/game/GamePackage";
import { WWChatPackage } from "../../types/chat/WWChatPackage";
import { isErrorPackage, isReceiveName } from "../../types/game/ClientReceive";
import { RequestName } from "../../types/game/ClientSend";







const TIMEOUT_SECONDS = 60;
const NAME_MIN = 3;
const NAME_MAX = 20;
const VALID_CHARS = 'a-zA-Z0-9_ ';  




function Login({route}: {route: string}) {

  const [cookies, setCookie] = useCookies(['warehouse-wars_user-id', 'warehouse-wars_user-name', 'warehouse-wars_user-expiry']);
  const initialName = cookies.hasOwnProperty('warehouse-wars_user-name') ? cookies['warehouse-wars_user-name'] : '';

  const { user } = useSelector((state: RootState) => state.auth);
  const { netAddr: configs } = useSelector((state: RootState) => state.configs);
  const { shouldConnect } = useSelector((state: RootState) => state.game.socket);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const emptyFunc = useCallback<(()=>void)>(()=>{}, []);

  const [text, setText] = useState(initialName);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [textEnabled, setTextEnabled] = useState(false);
  const [awaitingLogin, awaitLogin] = useState(false);
  const [invalidUsernames, setInvalidUsernames] = useState<string[]>([]);

  const touched = useRef(false);
  const awaitLoginFunction = useRef<(()=>void)>(emptyFunc);
  const awaitLoginExpiry = useRef<Date>(new Date());
  const awaitToken = useRef('');
  const loginTimeout = useRef<NodeJS.Timeout|number|null>(null);
  
  const invalidMessage: string = `A valid name should be between ${NAME_MIN} and ${NAME_MAX} characters long, \nand should be composed of only letters, numbers, underscore, and space.`;
  const currentPattern: string = `((?!^(${invalidUsernames.join('|')})$)[${VALID_CHARS}]{${NAME_MIN},${NAME_MAX}})`;
  const match = text.match(new RegExp(currentPattern,'g'));
  const isValid: boolean = (match !== null && match[0] ===  text);

  



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

  function handlePack(pack: WWChatPackage){
    //console.log(`awaitingLogin: ${awaitingLogin}\npack.token: ${pack.token}\nawaitToken: ${awaitToken.current}`);
    if (!awaitingLogin || (pack.hasOwnProperty('token') && pack.token !== awaitToken.current))
      return;
    if (isReceiveName(pack)){
      if (!pack.id){ //invalid name, update pattern
        awaitToken.current = '';
        awaitLogin(false);
        dispatch(deactivateSpinner());
        alert(`username ${pack.name} already exists, please choose another name`);
        setSubmitEnabled(true);
        setTextEnabled(true);
        setInvalidUsernames([pack.name, ...invalidUsernames]);
        return;
      }
      dispatch(setUser({id: pack.id, name: pack.name, color: color}));
      dispatch(setUserCookieExpiry(pack.expiry));
      setCookie('warehouse-wars_user-expiry', pack.expiry, {sameSite: 'strict'});
      setCookie('warehouse-wars_user-id', pack.id, {expires: new Date(pack.expiry), sameSite: 'strict'});
      setCookie('warehouse-wars_user-name', pack.name, {expires: new Date(pack.expiry),  sameSite: 'strict'});
      dispatch(deactivateSpinner());
      awaitToken.current = '';
      awaitLogin(false);
      if (loginTimeout.current !== null)
        clearTimeout(loginTimeout.current);
      navigate('/lobby', {state: {from: location.pathname}});
    }
    else if(isErrorPackage(pack)){
      console.log(`error: ${pack.message}`);
      loginTimeout.current = null;
      awaitLogin(false);
      setSubmitEnabled(true);
      setTextEnabled(true);
      dispatch(deactivateSpinner());
      alert(`An error occurred: ${pack.message}`);
    }
  }




  function submit (e: SyntheticEvent) {
    e.preventDefault();

    if (!text || text===''){
      alert('Username required');
      return;
    }
    else if (!isValid){
      alert(`Username invalid.\n${invalidMessage}`);
      return;
    }
    else if (readyState !== ReadyState.OPEN){
      alert('Websocket not open');
      return;
    }

    let pack: RequestName = {type: 'request_name', name: text};
    let id = cookies["warehouse-wars_user-id"] ?? '';
    let _expiry = cookies["warehouse-wars_user-expiry"] ?? '';
    let expiry = _expiry === '' ? -1 : new Date(_expiry).getTime();
    if (id !== '' && expiry > Date.now() )
      pack['id'] = id;
    awaitToken.current = (user?.id ?? UNKNOWN_USER)+"_"+Date.now();
    pack.token  = awaitToken.current;

    setSubmitEnabled(false);
    setTextEnabled(false);
    dispatch(activateSpinner('Logging in...'));
    if (loginTimeout.current !== null){
      clearTimeout(loginTimeout.current);
    }
    awaitLoginExpiry.current = new Date(Date.now() + (TIMEOUT_SECONDS * 1000));
    awaitLoginFunction.current = () => {
      loginTimeout.current = null;
      console.log('!! login timed out'); 
      dispatch(deactivateSpinner());
      awaitLogin(false);
      setSubmitEnabled(true);
      setTextEnabled(true);
      alert('Could not log in, request timed out!');
    };
    //loginTimeout.current = setTimeout(awaitLoginFunction.current, awaitLoginExpiry.current.getTime() - Date.now());
    awaitLogin(true);
    sendMessage(JSON.stringify(pack));
  }


  useMemo(()=>{
    if (awaitingLogin){
      let time = awaitLoginExpiry.current.getTime() - Date.now();
      console.log(`creating new login timeout set to ${time}ms`);
      loginTimeout.current = setTimeout(awaitLoginFunction.current, time);
    }
    else if (!awaitingLogin) {
      if (loginTimeout.current !== null){
        clearTimeout(loginTimeout.current);
        loginTimeout.current = null;
        console.log(`destroying login timeout`);
      }
      awaitLoginFunction.current = emptyFunc;
      awaitLoginExpiry.current = new Date();
    }
  }, [awaitingLogin]);

  

  
  useEffect(() => {
    console.log(`Login component at "/${route}"`);

    return () => {
      console.log('Login component unmounting');

      if (loginTimeout.current !== null){
        clearTimeout(loginTimeout.current);
        loginTimeout.current = null;
        console.log(`destroying login timeout on login unmount`);
      }
    }
  }, []);

  useEffect(() => {
    if (readyState === ReadyState.OPEN){
      setSubmitEnabled(true);
      setTextEnabled(true);
    }
  }, [readyState]);



  return (
    <>
      <form onSubmit={submit}> 
          <label htmlFor="request_name">Display Name:</label>
          <div className="input-container">
              <input type="text" 
                id="request_name"
                placeholder="Enter username"
                value={text}
                disabled={!textEnabled}
                required={true}
                pattern={currentPattern}
                onChange={(e) => {
                  setText(e.target.value);
                  if (!touched.current)
                    touched.current = true;
                  const match = e.target.value.match(new RegExp(currentPattern,'g'));
                  const valid = (match !== null && match[0] ===  e.target.value);
                  if (valid && !submitEnabled)
                    setSubmitEnabled(true);
                  else if (!valid && submitEnabled)
                    setSubmitEnabled(false);
                }} />
              <input type="submit" value={"Login"} disabled={!submitEnabled}/>
          </div>
          {!isValid && touched.current && (<div className="invalid_input">{invalidMessage}</div>)}
          {invalidUsernames.length > 0 && 
            <div className="invalid_input">
              <u>Invalid usernames attempted</u>
              { invalidUsernames.map((name, index) => (<p key={index}>{name}</p>) ) }
            </div>
          }
            
          <label>Color</label>
          <div className="input-container">
            <ColorSelect selectedColor={color} setColor={setColor}/>
          </div>
          <br/>
      </form>
    </>
  )
}

export default Login