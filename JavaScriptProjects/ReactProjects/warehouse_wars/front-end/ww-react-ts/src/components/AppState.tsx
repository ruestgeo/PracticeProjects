import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState, store } from '../redux/_store';
import { isNetAddrConfigs, setNetAddrConfigs } from '../redux/ConfigsSlice';
import { setUserCookieExpired } from '../redux/AuthSlice';
import { doConnectChat } from '../redux/ChatSlice';
import { doConnectGame } from '../redux/GameSlice';








function AppState() {

  

  const { user, expiry, expired } = useSelector((state: RootState) => state.auth);
  const { setNetAddr: fetchAndSetConfigs} = useSelector((state: RootState) => state.configs);

  const dispatch: AppDispatch = useDispatch();
  
  const expiryTimeout = useRef<NodeJS.Timeout|number>();



  useEffect(() => {
    console.log(`AppState mounted`);

    async function fetchConfigs () {
      
      let data;
      try {  data = await ( await fetch(`/configs/configs.json`) ).json();  }
      catch (err) {
        console.error(err);
      }
      if ( !isNetAddrConfigs(data) ){
        console.error(`error in fetch configs\n${data}`);
      }
      else {
        data.port = parseInt(data.port+'');
        dispatch(setNetAddrConfigs(data));
        dispatch(doConnectChat());
        dispatch(doConnectGame());
      }
    }
    if (fetchAndSetConfigs){
      fetchConfigs();
    }
    
    return () => {
      console.log('AppState unmounting');
    }

  }, []);


  useMemo(() => {
    if (expired){
      let expiryMessage = `UserId cookie expired\nid: [${user?.id}]\npath: ${location.pathname}`;
      console.log(expiryMessage);
    }
  }, [expired]);


  useMemo(() => {
    console.log(`UserId cookie expiry\nid: [${user?.id}]\nexpires: ${expiry}`);
    if (expiryTimeout.current){
      clearTimeout(expiryTimeout.current);
    }
    expiryTimeout.current = setTimeout(()=>{
      expiryTimeout.current = undefined;
      store.dispatch(setUserCookieExpired());
    }, Math.max(0, (new Date(expiry).getTime() - Date.now()) - (30*1000)), expiryTimeout); //to alert 30sec before expiry
    
  }, [expiry]);




  return (
    <></>
  )
}

export default AppState