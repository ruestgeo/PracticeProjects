import { useEffect, useState, useRef, useCallback,
  KeyboardEvent, MouseEvent, ChangeEvent, FormEvent, useMemo } from "react";
  import useWebSocket, { ReadyState } from "react-use-websocket";
  import { useDispatch, useSelector } from "react-redux";
  import { useLocation, useNavigate } from "react-router-dom";
  
import { RootState } from "../../redux/_store";
import { UNKNOWN_USER } from "../../redux/AuthSlice";
import { activateSpinner, deactivateSpinner } from "../../redux/SpinnerSlice";

import GameFormInput from "./GameFormInput";

import { getValue, getNumValue } from "../../utils/HtmlUtils";

import { CreateRoom, JoinRoom, LeaveRoom, RoomConfigs } from "../../types/game/ClientSend";
import { isEnterRoom, isEnterRoomFull, isErrorPackage } from "../../types/game/ClientReceive";
import { GamePackage, isGamePackage } from "../../types/game/GamePackage";
import { initRoom } from "../../redux/GameSlice";




const UPDATE_DELAY = 600;
const TIMEOUT_SECONDS = 60;
const DEFAULT_INTERVAL = 200;
const DEFAULT_NUM_PLAYERS = 4;
const DEFAULT_HEALTH = 3;
const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 10;
const ROOM_ID_MIN = 6;
const ROOM_ID_MAX = 8;
const ROOM_NAME_MIN = 3;
const ROOM_NAME_MAX = 20;
const ROOM_NAME_PATTERN = `^[a-zA-Z0-9_ ]{${ROOM_NAME_MIN},${ROOM_NAME_MAX}}\$`;
const JOIN_ID_PATTERN = `^[a-zA-Z0-9]{${ROOM_ID_MIN},${ROOM_ID_MAX}}\$`;
const MAX_WEIGHT = 10000;





function Lobby({route}: {route: string}) {

  const emptyFunc = useCallback<(()=>void)>(()=>{}, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const { room } = useSelector((state: RootState) => state.game);
  const { netAddr: configs }  = useSelector((state: RootState) => state.configs);
  const { shouldConnect }     = useSelector((state: RootState) => state.game.socket);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  
//#region outputs

  const [joinId,    setJoinId]    = useState('');
  const [roomName,  setRoomName]  = useState('');

  const [boxesAvailable,  setBoxesAvailable]  = useState('');
  const [wallsAvailable,  setWallsAvailable]  = useState('');
  const [mobsAvailable,   setMobsAvailable]   = useState('');
  const [boxesAvailableClass, /*setBoxesAvailableClass*/] = useState<string[]>([]);
  const [wallsAvailableClass, /*setWallsAvailableClass*/] = useState<string[]>([]);
  const [mobsAvailableClass,  setMobsAvailableClass]      = useState<string[]>([]);

  const [bouncerWeight,   setBouncerWeight]   = useState(1);
  const [chargerWeight,   setChargerWeight]   = useState(1);
  const [crawlerWeight,   setCrawlerWeight]   = useState(1);
  const [mimicWeight,     setMimicWeight]     = useState(1);
  const [pusherWeight,    setPusherWeight]    = useState(1);
  const [wandererWeight,  setWandererWeight]  = useState(1);
  const [warperWeight,    setWarperWeight]    = useState(1);

  const [bouncerChance,   setBouncerChance]   = useState('');
  const [chargerChance,   setChargerChance]   = useState('');
  const [crawlerChance,   setCrawlerChance]   = useState('');
  const [mimicChance,     setMimicChance]     = useState('');
  const [pusherChance,    setPusherChance]    = useState('');
  const [wandererChance,  setWandererChance]  = useState('');
  const [warperChance,    setWarperChance]    = useState('');


  const [intervalValue, setIntervalValue]   = useState(DEFAULT_INTERVAL);
  const [intervalStep,  /*setIntervalStep*/]  = useState(100);
  const [intervalMin,   /*setIntervalMin*/]   = useState(100);
  const [intervalMax,   /*setIntervalMax*/]   = useState(1000);
  
  const [playersValue,  setPlayersValue]    = useState(DEFAULT_NUM_PLAYERS);
  const [playersStep,   /*setPlayersStep*/] = useState(1);
  const [playersMin,    /*setPlayersMin*/]  = useState(1);
  const [playersMax,    /*setPlayersMax*/]  = useState(8);
  
  const [healthValue, setHealthValue]     = useState(DEFAULT_HEALTH);
  const [healthStep,  /*setHealthStep*/]  = useState(1);
  const [healthMin,   /*setHealthMin*/]   = useState(0);
  const [healthMax,   /*setHealthMax*/]   = useState(16);
  
  const [widthValue,  setWidthValue]    = useState(DEFAULT_WIDTH);
  const [widthStep,   /*setWidthStep*/] = useState(1);
  const [widthMin,    /*setWidthMin*/]  = useState(8);
  const [widthMax,    /*setWidthMax*/]  = useState(256);
  
  const [heightValue,   setHeightValue]   = useState(DEFAULT_HEIGHT);
  const [heightStep,  /*setHeightStep*/]  = useState(1);
  const [heightMin,   /*setHeightMin*/]   = useState(8);
  const [heightMax,   /*setHeightMax*/]   = useState(256);
  
  const [boxesValue,  setBoxesValue]    = useState(0); //updated dynamically
  const [boxesStep,  /*setBoxesStep*/]  = useState(1);
  const [boxesMin,    setBoxesMin]      = useState(0);
  const [boxesMax,    setBoxesMax]      = useState(0); //updated dynamically
  
  const [wallsValue,  setWallsValue]  = useState(0);
  const [wallsStep,   /*setWallsStep*/] = useState(1);
  const [wallsMin,    /*setWallsMin*/]  = useState(0);
  const [wallsMax,    setWallsMax]      = useState(0); //updated dynamically

  const [randomValue,   setRandomValue]   = useState(1);
  const [randomStep,  /*setRandomStep*/]  = useState(1);
  const [randomMin,   /*setRandomMin*/]   = useState(0);
  const [randomMax,   setRandomMax]       = useState(0); //updated dynamically

  const [weightMax, setWeightMax] = useState(100);

  const [bouncerMax,  setBouncerMax]  = useState(0); //updated dynamically
  const [chargerMax,  setChargerMax]  = useState(0); //updated dynamically
  const [crawlerMax,  setCrawlerMax]  = useState(0); //updated dynamically
  const [mimicMax,    setMimicMax]    = useState(0); //updated dynamically
  const [pusherMax,   setPusherMax]   = useState(0); //updated dynamically
  const [wandererMax, setWandererMax] = useState(0); //updated dynamically
  const [warperMax,   setWarperMax]   = useState(0); //updated dynamically

  const [bouncerValue,  setBouncerValue]  = useState(0);
  const [chargerValue,  setChargerValue]  = useState(0);
  const [crawlerValue,  setCrawlerValue]  = useState(0);
  const [mimicValue,    setMimicValue]    = useState(0);
  const [pusherValue,   setPusherValue]   = useState(0);
  const [wandererValue, setWandererValue] = useState(0);
  const [warperValue,   setWarperValue]   = useState(0);

  //#endregion outputs

  
  const roomNameMin = ROOM_NAME_MIN;
  const roomNameMax = ROOM_NAME_MAX;
  
  const [configsVisible,    setConfigsVisible]    = useState(false);
  const [randomMobsVisible, setRandomMobsVisible] = useState(false);
  const [fixedMobsVisible,  setFixedMobsVisible]  = useState(false);

  const [availableNumMobs,setAvailableNumMobs]  = useState(0); //updated dynamically
  const minNumMobs  = useRef(1);
  const maxNumMobs  = useRef(0); //updated dynamically
  const minNumBoxes = useRef(0); //updated dynamically
  const maxNumBoxes = useRef(0); //updated dynamically
//const maxNumWalls = useRef(0); //dependent on maxNumMisc and numBoxes
  const maxNumMisc  = useRef(0); //updated dynamically

  const [configInvalids, setConfigInvalids] = useState<string[]>([]);
  const configsInvalid = useRef(false);

  const [submitConfigsEnabled,  setSubmitConfigsEnabled]  = useState(false);
  const [inputConfigsEnabled,    setInputConfigsEnabled]    = useState(false);

  const [submitJoinEnabled, setSubmitJoinEnabled] = useState(false);
  const [textJoinEnabled,   setTextJoinEnabled]   = useState(true);

  const buttonLock = useRef(false);


  const [awaitingJoin, awaitJoin] = useState(false);
  const awaitJoinFunction = useRef<(()=>void)>(emptyFunc);
  const awaitJoinExpiry   = useRef<Date>(new Date());
  const awaitToken        = useRef('');
  const joinTimeout       = useRef<NodeJS.Timeout|number|null>(null);


  



  useEffect(() => {
    console.log(`Lobby component at "/${route}"`);   

    updateAvailableActors();
    updateMobWeights();
    checkConfigValidity();

    return () => {
      console.log('Lobby component unmounting');

      if (joinTimeout.current !== null){
        clearTimeout(joinTimeout.current);
        joinTimeout.current = null;
        console.log(`destroying join timeout on lobby unmount`);
      }
    }
  }, []);






  useEffect(() => {
    if (buttonLock.current) 
      return;
    const match = joinId.match(new RegExp(JOIN_ID_PATTERN,'g'));
    const joinIdIsValid = (match !== null && match[0] === joinId);
    if (joinIdIsValid && !submitJoinEnabled)
      setSubmitJoinEnabled(true);
    else if (!joinIdIsValid && submitJoinEnabled)
      setSubmitJoinEnabled(false);
  }, [joinId]);


  useEffect (() => {
    if (buttonLock.current) 
      return;
    if (configInvalids.length > 0 && submitConfigsEnabled)
      setSubmitConfigsEnabled(false);
    else if (configInvalids.length === 0 && !submitConfigsEnabled)
      setSubmitConfigsEnabled(true);
  }, [configInvalids])




  useMemo(()=>{
    if (awaitingJoin){
      let time = awaitJoinExpiry.current.getTime() - Date.now();
      console.log(`creating new join timeout set to ${time}ms`);
      joinTimeout.current = setTimeout(awaitJoinFunction.current, time);
    }
    else if (!awaitingJoin) {
      if (joinTimeout.current !== null){
        clearTimeout(joinTimeout.current);
        joinTimeout.current = null;
        console.log(`destroying join timeout`);
      }
      awaitJoinFunction.current = emptyFunc;
      awaitJoinExpiry.current = new Date();
    }
  }, [awaitingJoin]);


//#region configsView

  function returnToLobby (){
    if (!buttonLock.current){
      setConfigsVisible(false);
    }
    if (room.id !== ''){
      const pack: LeaveRoom = {
        type: 'leave_room',
        player_id: user?.id!,
        room_id: room.id
      };
      sendMessage(JSON.stringify(pack));
    }
  }



  function createRoom (){
    if (configsInvalid.current){
      alert('Invalid configs');
      return;
    }
    else if (readyState !== ReadyState.OPEN){
      alert('Websocket not open');
      return;
    }
    buttonLock.current = true;
    if (inputConfigsEnabled)
      setInputConfigsEnabled(false);
    if (submitConfigsEnabled)
      setSubmitConfigsEnabled(false);
    dispatch(activateSpinner('Creating room...'));

    const configs: RoomConfigs = {
      intervalTime:     intervalValue,
      maxNumPlayers:    playersValue,
      maxHealthPoints:  healthValue,
      gridHeight:       heightValue,
      gridWidth:        widthValue,
      numBoxes:         boxesValue,
      numWalls:         wallsValue,
      numRandomMobs:    randomValue,
      randomMobWeights: {
        Bouncer:  bouncerWeight,
        Charger:  chargerWeight,
        Crawler:  crawlerWeight,
        Mimic:    mimicWeight,
        Pusher:   pusherWeight,
        Wanderer: wandererWeight,
        Warper:   warperWeight,
      },
      fixedMobAmounts: {
        numBouncers:   bouncerValue,
        numChargers:   chargerValue,
        numCrawlers:   crawlerValue,
        numMimics:     mimicValue,
        numPushers:    pusherValue,
        numWanderers:  wandererValue,
        numWarpers:    warperValue,
      }
    }
    let pack: CreateRoom = {
      type: 'create_room',
      player_id: user!.id ,
      name: roomName,
      configs: configs
    }

    if (joinTimeout.current !== null){
      clearTimeout(joinTimeout.current);
    }
    awaitJoinExpiry.current = new Date(Date.now() + (TIMEOUT_SECONDS * 1000));
    awaitJoinFunction.current = () => {
      joinTimeout.current = null;
      console.log('!! lobby create room timed out'); 
      dispatch(deactivateSpinner());
      awaitJoin(false);
      buttonLock.current = false;
      setInputConfigsEnabled(true);
      setSubmitConfigsEnabled(true);
      alert('Could not create game room, request timed out!');
    };
    //joinTimeout.current = setTimeout(awaitJoinFunction.current, awaitJoinExpiry.current.getTime() - Date.now());
    awaitToken.current = (user?.id ?? UNKNOWN_USER)+"_"+Date.now();
    pack.token = awaitToken.current;
    awaitJoin(true);
    sendMessage(JSON.stringify(pack));
  }





  const toggleRandomView = () => {
    setRandomMobsVisible(!randomMobsVisible);
  }

  const toggleFixedView = () => {
    setFixedMobsVisible(!fixedMobsVisible);
  }
  



  const updateAvailableMisc = //useCallback(
  () => {
    let numBoxes = boxesValue;
    let fixedBoxes = Math.min(maxNumBoxes.current, Math.max(minNumBoxes.current, numBoxes));
    let numWalls = wallsValue;
    let availableNumBoxes = maxNumBoxes.current - fixedBoxes;
    let availableNumWalls = maxNumMisc.current - (fixedBoxes + numWalls);
    if (boxesMin !== minNumBoxes.current)
      setBoxesMin(minNumBoxes.current);
    if (boxesMax !== maxNumBoxes.current)
      setBoxesMax(maxNumBoxes.current);
    if (wallsMax !== (maxNumMisc.current - fixedBoxes))
      setWallsMax(maxNumMisc.current - fixedBoxes);
    
    if ((numBoxes !== fixedBoxes || numBoxes > boxesMax || numBoxes < boxesMin)
    && boxesValue !== fixedBoxes){
      setBoxesValue(fixedBoxes);
    }
    if (numWalls > wallsMax && wallsValue !== numWalls){
      setWallsValue(numWalls);
    }
    if (boxesAvailable !== `Available # of Boxes: ${availableNumBoxes}`)
      setBoxesAvailable(`Available # of Boxes: ${availableNumBoxes}`);
    if (wallsAvailable !== `Available # of Walls: ${availableNumWalls}`)
      setWallsAvailable(`Available # of Walls: ${availableNumWalls}`);
  }
  // , [boxesValue, wallsValue, maxNumBoxes, minNumBoxes, maxNumMisc,
  //   boxesMin, boxesMax, wallsMax, boxesAvailable, wallsAvailable]);



  const updateAvailableMobs = //useCallback(
  () => {
    let numFixedMobs = bouncerValue + chargerValue + crawlerValue + mimicValue + pusherValue + wandererValue + warperValue;
    let numRandomMobs = randomValue;
    var totalNumMobs = (numRandomMobs + numFixedMobs);
    const updatedAvailableNumMobs = maxNumMobs.current - totalNumMobs
    if (availableNumMobs !== updatedAvailableNumMobs)
      setAvailableNumMobs(updatedAvailableNumMobs)
    if (totalNumMobs >= minNumMobs.current && totalNumMobs <= maxNumMobs.current){
      if (availableNumMobs !== updatedAvailableNumMobs)
        setMobsAvailable(`Available # of Mobs: ${updatedAvailableNumMobs}`);
      if (mobsAvailableClass.includes('invalid_input')){
        const newMobsAvailableClass = mobsAvailableClass.filter(klass => klass !== 'invalid_input');
        newMobsAvailableClass.push('valid_input');
        setMobsAvailableClass(newMobsAvailableClass);
      }
    }
    else {
      if (totalNumMobs < minNumMobs.current)
        setMobsAvailable(`Required # of Mobs: ${minNumMobs.current-totalNumMobs}`);
      else if (totalNumMobs > maxNumMobs.current)
        setMobsAvailable(`# of Mobs to remove: ${updatedAvailableNumMobs}`);
      if (!mobsAvailableClass.includes('invalid_input')){
        const newMobsAvailableClass = mobsAvailableClass.filter(klass => klass !== 'valid_input');
        newMobsAvailableClass.push('invalid_input');
        setMobsAvailableClass(newMobsAvailableClass);
      }
    }
    const newRandomMax = maxNumMobs.current - numFixedMobs
    if (randomMax !== newRandomMax)
      setRandomMax(newRandomMax);
    
    //decided not to update exact and/or force value to at most max
    const newBouncerMax = maxNumMobs.current - numRandomMobs;
    const newChargerMax = maxNumMobs.current - numRandomMobs;
    const newCrawlerMax = maxNumMobs.current - numRandomMobs;
    const newMimicMax = maxNumMobs.current - numRandomMobs;
    const newPusherMax = maxNumMobs.current - numRandomMobs;
    const newWandererMax = maxNumMobs.current - numRandomMobs;
    const newWarperMax = maxNumMobs.current - numRandomMobs;
    if (bouncerMax !== newBouncerMax)
      setBouncerMax(newBouncerMax);
    if (chargerMax !== newChargerMax)
      setChargerMax(newChargerMax);
    if (crawlerMax !== newCrawlerMax)
      setCrawlerMax(newCrawlerMax);
    if (mimicMax !== newMimicMax)
      setMimicMax(newMimicMax);
    if (pusherMax !== newPusherMax)
      setPusherMax(newPusherMax);
    if (wandererMax !== newWandererMax)
      setWandererMax(newWandererMax);
    if (warperMax !== newWarperMax)
      setWarperMax(newWarperMax);
  }
  // , [randomValue, bouncerValue, chargerValue, crawlerValue, mimicValue, pusherValue, wandererValue, warperValue,
  //   randomMax, bouncerMax, chargerMax, crawlerMax, mimicMax, pusherMax, wandererMax, warperMax,
  //   availableNumMobs, mobsAvailableClass, minNumMobs, maxNumMobs])



  const updateAvailableActors = //useCallback(
  () => {
    maxNumMobs.current = Math.round(widthValue*heightValue*0.15)
    minNumBoxes.current = Math.round(widthValue*heightValue*0.15);
    maxNumBoxes.current = Math.round(widthValue*heightValue*0.50);
    maxNumMisc.current  = Math.round(widthValue*heightValue*0.60);
    updateAvailableMisc();
    updateAvailableMobs();
  }
  // , [widthValue, heightValue, maxNumMobs, maxNumBoxes, minNumBoxes, maxNumMisc,
  //   updateAvailableMisc, updateAvailableMobs]);
  


  const updateMobWeights = //useCallback(
  () =>{
    const totalWeight = bouncerWeight + chargerWeight + crawlerWeight + mimicWeight + pusherWeight + wandererWeight + warperWeight;
    setBouncerChance(`${(bouncerWeight / totalWeight *100).toFixed(2)}% ( ${bouncerWeight} / ${totalWeight} ) chance to spawn`);
    setChargerChance(`${(chargerWeight / totalWeight *100).toFixed(2)}% ( ${chargerWeight} / ${totalWeight} ) chance to spawn`);
    setCrawlerChance(`${(crawlerWeight / totalWeight *100).toFixed(2)}% ( ${crawlerWeight} / ${totalWeight} ) chance to spawn`);
    setMimicChance(`${(mimicWeight / totalWeight *100).toFixed(2)}% ( ${mimicWeight} / ${totalWeight} ) chance to spawn`);
    setPusherChance(`${(pusherWeight / totalWeight *100).toFixed(2)}% ( ${pusherWeight} / ${totalWeight} ) chance to spawn`);
    setWandererChance(`${(wandererWeight / totalWeight *100).toFixed(2)}% ( ${wandererWeight} / ${totalWeight} ) chance to spawn`);
    setWarperChance(`${(warperWeight / totalWeight *100).toFixed(2)}% ( ${warperWeight} / ${totalWeight} ) chance to spawn`);
  }
  //, [bouncerWeight, chargerWeight, crawlerWeight, mimicWeight, pusherWeight, wandererWeight, warperWeight]);


  const checkConfigValidity = //useCallback(
  () => {
    const invalids: string[] = [];
    //const match = roomName.match(new RegExp(ROOM_NAME_PATTERN,'g'));
    //const roomNameValid = (match !== null && match[0] ===  roomName);
    const intervalValid = intervalValue >= intervalMin && intervalValue <= intervalMax;
    const playersValid = playersValue >= playersMin && playersValue <= playersMax;
    const healthValid = healthValue >= healthMin && healthValue <= healthMax;
    const widthValid = widthValue >= widthMin && widthValue <= widthMax;
    const heightValid = heightValue >= heightMin && heightValue <= heightMax;
    const boxesValid = boxesValue >= boxesMin && boxesValue <= boxesMax;
    const wallsValid = wallsValue >= wallsMin && wallsValue <= wallsMax;
    const weightValid = weightMax >= 1 && weightMax <= MAX_WEIGHT;
    const bouncerWeightValid = bouncerWeight >= 0 && bouncerWeight <= weightMax;
    const chargerWeightValid = chargerWeight >= 0 && chargerWeight <= weightMax;
    const crawlerWeightValid = crawlerWeight >= 0 && crawlerWeight <= weightMax;
    const mimicWeightValid = mimicWeight >= 0 && mimicWeight <= weightMax;
    const pusherWeightValid = pusherWeight >= 0 && pusherWeight <= weightMax;
    const wandererWeightValid = wandererWeight >= 0 && wandererWeight <= weightMax;
    const warperWeightValid = warperWeight >= 0 && warperWeight <= weightMax;
    const bouncerValid = bouncerValue >= 0 && bouncerValue <= bouncerMax;
    const chargerValid = chargerValue >= 0 && chargerValue <= chargerMax;
    const crawlerValid = crawlerValue >= 0 && crawlerValue <= crawlerMax;
    const mimicValid = mimicValue >= 0 && mimicValue <= mimicMax;
    const pusherValid = pusherValue >= 0 && pusherValue <= pusherMax;
    const wandererValid = wandererValue >= 0 && wandererValue <= wandererMax;
    const warperValid = warperValue >= 0 && warperValue <= warperMax;

    //if (!roomNameValid) {invalids.push('- room name');}
    if (!intervalValid) {invalids.push('- interval');}
    if (!playersValid) {invalids.push('- max number of players');}
    if (!healthValid) {invalids.push('- health points');}
    if (!widthValid) {invalids.push('- grid width');}
    if (!heightValid) {invalids.push('- grid height');}
    if (!boxesValid) {invalids.push('- number of boxes');}
    if (!wallsValid) {invalids.push('- number of walls');}
    if (!(weightValid || bouncerWeightValid || chargerWeightValid || crawlerWeightValid || mimicWeightValid || pusherWeightValid || wandererWeightValid || warperWeightValid)) 
      {invalids.push('- number of weighted random mob spawns');}
    if (!(bouncerValid || chargerValid || crawlerValid || mimicValid || pusherValid || wandererValid || warperValid)) 
      {invalids.push('- number of fixed mob spawns');}

    if (invalids.length !== configInvalids.length){
      setConfigInvalids(invalids);
      return true;
    }
      
    else {
      const intersection = configInvalids.filter(item => invalids.includes(item));
      if (intersection.length !== configInvalids.length){
        setConfigInvalids(invalids);
        return true;
      }
        
    }
    return false;
  }
  // , [configInvalids,
  //   bouncerMax,bouncerValue,bouncerWeight,
  //   boxesMax,boxesMin,boxesValue,
  //   chargerMax,chargerValue,chargerWeight,
  //   crawlerMax,crawlerValue,crawlerWeight,
  //   healthMax,healthMin,healthValue,
  //   heightMax,heightMin,heightValue,
  //   intervalMax,intervalMin,intervalValue,
  //   mimicMax,mimicValue,mimicWeight,
  //   playersMax,playersMin,playersValue,
  //   pusherMax,pusherValue,pusherWeight,
  //   wallsMax,wallsMin,wallsValue,
  //   wandererMax,wandererValue,wandererWeight,
  //   warperMax,warperValue,warperWeight,
  //   weightMax,
  //   widthMax,widthMin,widthValue 
  // ]);


  //configsInvalid.current = useMemo(() => configInvalids.length > 0,[configInvalids]);
  configsInvalid.current = configInvalids.length > 0;



  
//#region inputUpdates


  const updateIntervalValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    const val = Math.max(Math.min(value,intervalMax),intervalMin);
    if (intervalValue !== val) {
      setIntervalValue(val);
      //checkConfigValidity();
    }
  }//, [intervalValue, intervalMin, intervalMax, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => checkConfigValidity(), UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[intervalValue]);



  const updatePlayersValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    const val = Math.max(Math.min(value,playersMax),playersMin);
    if (playersValue !== val) {
      setPlayersValue(val);
      //checkConfigValidity();
    }
  }//, [playersValue, playersMin, playersMax, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => checkConfigValidity(), UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[playersValue]);



  const updateHealthValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    const val = Math.max(Math.min(value,healthMax),healthMin);
    if (healthValue !== val) {
      setHealthValue(val);
      //checkConfigValidity();
    }
  }//, [healthValue, healthMin, healthMax, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => checkConfigValidity(), UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[healthValue]);



  const updateWidthValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    const val = Math.min(Math.max(value, widthMin), widthMax);
    if (widthValue !== val) {
      setWidthValue(val);
      //updateAvailableActors(); 
      //checkConfigValidity();
    }
  }//, [widthValue, widthMin, widthMax, updateAvailableActors, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAvailableActors(); 
      checkConfigValidity();
    }, UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[widthValue]);
  



  const updateHeightValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;

    const val = Math.min(Math.max(value, heightMin), heightMax);
    if (heightValue !== val) {
      setHeightValue(val);
      //updateAvailableActors(); 
      //checkConfigValidity();
    }
  }//, [heightValue, heightMin, heightMax, updateAvailableActors, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAvailableActors(); 
      checkConfigValidity();
    }, UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[heightValue]);
  



  const updateBoxesValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;
    
    //max/min/value updated in updateAvailableMisc
    if (boxesValue !== value) {
      setBoxesValue(value);
      //updateAvailableMisc(); 
      //checkConfigValidity();
    }
  }//, [boxesValue, updateAvailableMisc, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAvailableMisc(); 
      checkConfigValidity();
    }, UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[boxesValue]);
  



  const updateWallsValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;
    
    //max/min/value updated in updateAvailableMisc
    if (wallsValue !== value) {
      setWallsValue(value);
      //updateAvailableMisc(); 
      //checkConfigValidity();
    }
  }//, [wallsValue, updateAvailableMisc, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAvailableMisc(); 
      checkConfigValidity();
    }, UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[wallsValue]);
  



  const updateRandomValue = //useCallback(
  (target: EventTarget) => {
    const element: HTMLInputElement = (target as HTMLInputElement);
    const value: number = parseInt(element.value);
    if (typeof value !== 'number' || isNaN(value) 
    || element.value === '' || element.value === null)
      return;
    //max/min updated in updateAvailableMobs
    if (randomValue !== value) {
      setRandomValue(value);
      //updateAvailableMobs();
      //checkConfigValidity();
    }
  }//, [randomValue, updateAvailableMobs, checkConfigValidity]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAvailableMobs();
      checkConfigValidity();
    }, UPDATE_DELAY);
    return () => clearTimeout(timeout);
  },[randomValue]);
  



//#endregion inputUpdates

//#endregion configsView

//#region lobbyView

  function backToLogin (){
    if (room.id !== ''){
      const pack: LeaveRoom = {
        type: 'leave_room',
        player_id: user?.id!,
        room_id: room.id
      };
      sendMessage(JSON.stringify(pack));
    }
    navigate('/login', {state: {from: location.pathname}});
  }

  function viewConfigs (){
    if (!buttonLock.current)
      setConfigsVisible(true);
  }

  function joinRoom (){
    const match = joinId.match(new RegExp(JOIN_ID_PATTERN,'g'));
    if (!(match !== null && match[0] ===  joinId)){
      alert('Invalid room id');
      return;
    }
    else if (readyState !== ReadyState.OPEN){
      alert('Websocket not open');
      return;
    }
    buttonLock.current = true;
    if (textJoinEnabled)
      setTextJoinEnabled(false);
    if (submitJoinEnabled)
      setSubmitJoinEnabled(false);
    dispatch(activateSpinner('Creating room...'));

    const pack: JoinRoom = {
      type: 'join_room',
      player_id: user!.id,
      room_id: joinId,
    }

    if (joinTimeout.current !== null){
      clearTimeout(joinTimeout.current);
    }
    awaitJoinExpiry.current = new Date(Date.now() + (TIMEOUT_SECONDS * 1000));
    awaitJoinFunction.current = () => {
      joinTimeout.current = null;
      console.log('!! lobby create room timed out'); 
      dispatch(deactivateSpinner());
      awaitJoin(false);
      buttonLock.current = false;
      setTextJoinEnabled(true);
      setSubmitJoinEnabled(true);

      alert('Could not create game room, request timed out!');
    };
    //joinTimeout.current = setTimeout(awaitJoinFunction.current, awaitJoinExpiry.current.getTime() - Date.now());
    awaitToken.current = (user?.id ?? UNKNOWN_USER)+"_"+Date.now();
    pack.token = awaitToken.current;
    awaitJoin(true);
    sendMessage(JSON.stringify(pack));
  }

//#endregion lobbyView


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
  //console.log(`awaitingJoin: ${awaitingJoin}\npack.token: ${pack.token}\nawaitToken: ${awaitToken.current}`);
  if (!awaitingJoin || (pack.hasOwnProperty('token') && pack.token !== awaitToken.current))
    return;
        
      
  if (isEnterRoom(pack)){
    const {type: _, room_id: id, room_name: name, capacity, players: playersReady} = pack;
    dispatch(initRoom({id, name, capacity, playersReady}));
    navigate('/game', {state: {from: location.pathname}});
  }
  else if (isEnterRoomFull(pack)){
    console.log(`roomFull: ${pack.token}`);
    finishWaiting(pack);
    alert(`Room is full`);
  }
  else if(isErrorPackage(pack)){
    console.log(`error: ${pack.message}`);
    finishWaiting(pack);
    alert(`An error occurred: ${pack.message}`);
  }
}

function finishWaiting (pack: GamePackage){
  if (awaitingJoin && pack.hasOwnProperty('token') && pack.token === awaitToken.current){
    if (joinTimeout.current) 
      clearTimeout(joinTimeout.current);
    joinTimeout.current = null;
    awaitJoin(false);
    awaitToken.current = '';
    buttonLock.current = false;
    setInputConfigsEnabled(true);
    setSubmitConfigsEnabled(true);
    setTextJoinEnabled(true);
    setSubmitJoinEnabled(true);
    dispatch(deactivateSpinner());
  }
}


useEffect(() => {
  if (readyState === ReadyState.OPEN){
    setTextJoinEnabled(true);
    setInputConfigsEnabled(true);
  }
}, [readyState]);

//#endregion websocket


  
  const blur = useCallback( (target: EventTarget|null) => {
    if (!target) return;
    (target as HTMLInputElement).blur();
  }, []);



  return (
    <div className="lobby_div">

      
      {!configsVisible && (
        <div>
          <input type="button" value="Choose new name" onClick={backToLogin} />
          <br />
          <br />
          <input type="button" value="Create Room" onClick={viewConfigs} />
          <br />
          <br />
          <br />
          <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            joinRoom();
          }}>
            <label htmlFor="join_room_id">Join Room</label>
            <input type="text" id="join_room_id" 
              placeholder="Enter the room id here"
              pattern={JOIN_ID_PATTERN}  required={true}
              value={joinId}
              onChange={(e: ChangeEvent)=> {
                setJoinId(getValue(e.target))
              }}
              disabled={!textJoinEnabled}
            />
            <input type="submit" 
              value={"Join"}
              disabled={!submitJoinEnabled} />
          </form>
        </div>
      )}


      {configsVisible && (
        <div>
          <input type="button" value="⏎ Return" onClick={returnToLobby} />
          <br />
          <br />
          <form  onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            createRoom();
          }} onKeyDown={(e:KeyboardEvent) => {
            if (e.key.toLowerCase() === 'enter')
              blur(e.target);
          }}>
            <input type="submit"  value={"Create Room"} />
            <div className={configInvalids.length === 0 ? '' : 'invalid_input'}>
              {configInvalids.length === 0 ? '' : 'Invalid configs: \n'+configInvalids.join('\n')}
            </div>
            <br />
            <br />
            <div >
              <label htmlFor="room_name_configs">Room Name: </label>
              <input type="text" id="room_name_configs"
                placeholder="Enter a room name" 
                minLength={roomNameMin}  maxLength={roomNameMax} 
                pattern={ROOM_NAME_PATTERN}  required={true}   
                value={roomName}
                onChange={(e: ChangeEvent)=> setRoomName(getValue(e.target))}
                disabled={!inputConfigsEnabled}
              />
                


              {/* CONFIG INPUT */}

              <div id="basic_configs">
                <GameFormInput id={"intervalTime"} label={"Update interval time: "} 
                  value={intervalValue} step={intervalStep} min={intervalMin} max={intervalMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateIntervalValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateIntervalValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateIntervalValue(event.target);
                  }} 
                />
                <br/>


                <GameFormInput id={"numPlayers"} label={"Maximum # of players: "} 
                  value={playersValue} step={playersStep} min={playersMin} max={playersMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updatePlayersValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updatePlayersValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updatePlayersValue(event.target);
                  }} 
                />
                <br />

    
                <GameFormInput id={"healthPoints"} label={"Additional lives: "} 
                  value={healthValue} step={healthStep} min={healthMin} max={healthMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateHealthValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateHealthValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateHealthValue(event.target);
                  }} 
                />
                <br />
    

                <GameFormInput id={"stageWidth"} label={"Stage width: "} 
                  value={widthValue} step={widthStep} min={widthMin} max={widthMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateWidthValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateWidthValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateWidthValue(event.target);
                  }} 
                />
                <br />
    

                <GameFormInput id={"stageHeight"} label={"Stage height: "} 
                  value={heightValue} step={heightStep} min={heightMin} max={heightMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateHeightValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateHeightValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateHeightValue(event.target);
                  }} 
                />
                <br />
    
    
                <GameFormInput id={"numBoxes"} label={"# of boxes to spawn: "} 
                  value={boxesValue} step={boxesStep} min={boxesMin} max={boxesMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateBoxesValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateBoxesValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateBoxesValue(event.target);
                  }} 
                />
                <p className={boxesAvailableClass.join(" ")}>{boxesAvailable}</p>
    

                <GameFormInput id={"numWalls"} label={"# of walls to spawn: "} 
                  value={wallsValue} step={wallsStep} min={wallsMin} max={wallsMax} 
                  rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                  onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                    updateWallsValue(event.target);
                  }}
                  onInput={(event: FormEvent<HTMLInputElement>) => {
                    updateWallsValue(event.target);
                  }} 
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    updateWallsValue(event.target);
                  }} 
                />
                <p className={wallsAvailableClass.join(" ")}>{wallsAvailable}</p>
              </div>
              
  



              {/* RANDOM MOBS */}

              <GameFormInput id={"randomMobs"} label={"# of mobs to spawn randomly: "} 
                value={randomValue} step={randomStep} min={randomMin} max={randomMax} 
                rangeInput={true} numberInput={true} output={true} enabled={inputConfigsEnabled}
                onMouseUp={(event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                  updateRandomValue(event.target);
                }}
                onInput={(event: FormEvent<HTMLInputElement>) => {
                  updateRandomValue(event.target);
                }} 
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  updateRandomValue(event.target);
                }}
                child={(
                  <input type="button" className="collapsible_button" value="Set spawn weights" 
                    onClick={toggleRandomView} />
                )}
              >

                {/* RANDOM MOBS INPUT */}

                {randomMobsVisible && (
                    <div>
                      <label htmlFor="weightMax">Max Weight</label>
                      <input type="number" value={weightMax} min={1} max={MAX_WEIGHT} id="weightMax"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setWeightMax(getNumValue(event.target));
                        }} />
                      <br />

                      <GameFormInput id={"weightBouncer"} label={"Bouncer(mob) weight: "} 
                        value={bouncerWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setBouncerWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{bouncerChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightCharger"} label={"Charger(mob) weight: "} 
                        value={chargerWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setChargerWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{chargerChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightCrawler"} label={"Crawler(mob) weight: "} 
                        value={crawlerWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setCrawlerWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{crawlerChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightMimic"} label={"Mimic(mob) weight: "} 
                        value={mimicWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setMimicWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{mimicChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightPusher"} label={"Pusher(mob) weight: "} 
                        value={pusherWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setPusherWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{pusherChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightWanderer"} label={"Wanderer(mob) weight: "} 
                        value={wandererWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setWandererWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{wandererChance}</p>
                      <br />
                      

                      <GameFormInput id={"weightWarper"} label={"Warper(mob) weight: "} 
                        value={warperWeight} step={1} min={0} max={weightMax} 
                        rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                        onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                          updateMobWeights();
                        }}
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          setWarperWeight(getNumValue(event.target))
                        }} 
                      /> 
                      <p>{warperChance}</p>

                    </div>)}

              </GameFormInput>
  

  

              <p className={mobsAvailableClass.join(" ")}>{mobsAvailable}</p>
  

              
              {/* FIXED MOBS */}

              <GameFormInput id={"fixedMobs"}
                value={0} step={0} min={0} max={0} 
                rangeInput={false} numberInput={false} output={false} enabled={inputConfigsEnabled}
                child={(
                  <input type="button" className="collapsible_button" value="Spawn Fixed Mobs"
                    onClick={toggleFixedView} />
                )}
              >

                {/* FIXED MOBS INPUT */}

                {fixedMobsVisible && (
                  <div>

                    <GameFormInput id={"numBouncers"} label={"# of Bouncer(mob) to force spawn: "} 
                      value={bouncerValue} step={1} min={0} max={bouncerMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setBouncerValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numChargers"} label={"# of Charger(mob) to force spawn: "} 
                      value={chargerValue} step={1} min={0} max={chargerMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setChargerValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numCrawlers"} label={"# of Crawler(mob) to force spawn: "} 
                      value={crawlerValue} step={1} min={0} max={crawlerMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setCrawlerValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numMimics"} label={"# of Mimic(mob) to force spawn: "} 
                      value={mimicValue} step={1} min={0} max={mimicMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setMimicValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numPushers"} label={"# of Pusher(mob) to force spawn: "} 
                      value={pusherValue} step={1} min={0} max={pusherMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setPusherValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numWanderers"} label={"# of Wanderer(mob) to force spawn: "} 
                      value={wandererValue} step={1} min={0} max={wandererMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setWandererValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                    

                    <GameFormInput id={"numWarpers"} label={"# of Warper(mob) to force spawn: "} 
                      value={warperValue} step={1} min={0} max={warperMax} 
                      rangeInput={true} numberInput={false} output={true} enabled={inputConfigsEnabled}
                      onMouseUp={(_event: MouseEvent<HTMLInputElement, globalThis.MouseEvent>) => {
                        updateAvailableMobs();
                        checkConfigValidity();
                      }}
                      onInput={(event: FormEvent<HTMLInputElement>) => {
                        setWarperValue(getNumValue(event.target))
                      }} 
                    />
                    <br />
                      
                  </div>

                )}
              </GameFormInput>

            </div>
          </form>
        </div>
      )}


    </div>
  )
}

export default Lobby



