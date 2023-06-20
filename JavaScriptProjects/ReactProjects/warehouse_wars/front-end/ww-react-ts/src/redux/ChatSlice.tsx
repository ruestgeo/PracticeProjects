import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DeliveryState } from '../types/chat/DeliveryState';
import { ChatState } from '../types/chat/ChatState';



interface ChatSliceState extends ChatInitInfo {
  shouldConnect: boolean,
  chatState: ChatState,
  awaitToken: string,
  infoInit: boolean,
  textEnabled: boolean, 
  submitEnabled: boolean,
}
interface ChatInitInfo {
  queueLimit: number,
  updateNum: number,
  maxUpdateNum: number,
}

const initState: ChatSliceState = {
  shouldConnect: false,
  chatState: {
    state: DeliveryState.default,
    enabled: false,
    message: ''
  },
  awaitToken: '',
  queueLimit: -1,
  updateNum: -1,
  maxUpdateNum: -1,
  infoInit: false,
  textEnabled: false,
  submitEnabled: false,
}

export const ChatSlice = createSlice({

  name: 'chat',
  
  
  initialState: initState,


  reducers: {

    setChatInitInfo: (state, action: PayloadAction<ChatInitInfo>) => {
      state.queueLimit = action.payload.queueLimit;
      state.updateNum = action.payload.updateNum;
      state.maxUpdateNum = action.payload.maxUpdateNum;
      state.infoInit = true;
    },

    setUpdateNum: (state, action: PayloadAction<number>) => {
      state.updateNum = action.payload;
    },

    setChatState: (state, action: PayloadAction<ChatState>) => {
      state.chatState = action.payload;
    },

    setChatAwaitToken: (state, action: PayloadAction<string>) => {
      state.awaitToken = action.payload;
    },

    dontConnectChat: (state) => {
      state.shouldConnect = false;
    },
    doConnectChat: (state) => {
      state.shouldConnect = true;
    },


    setChatTextEnabled: (state, action: PayloadAction<boolean>) => {
      state.textEnabled = action.payload;
    },
    setChatSubmitEnabled: (state, action: PayloadAction<boolean>) => {
      state.submitEnabled = action.payload;
    },

  },


})

// Action creators are generated for each case reducer function
export const { 
  setChatInitInfo,
  setUpdateNum,
  setChatState,
  setChatAwaitToken,
  doConnectChat, 
  dontConnectChat,
  setChatTextEnabled,
  setChatSubmitEnabled,

} = ChatSlice.actions

export default ChatSlice.reducer