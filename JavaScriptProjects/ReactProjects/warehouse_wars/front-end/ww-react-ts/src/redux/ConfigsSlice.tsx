import { PayloadAction, createSlice } from '@reduxjs/toolkit'


interface ConfigsInitState {
  setNetAddr: boolean,
  netAddr: NetAddrConfigs,
}
interface NetAddrConfigs {
  address: string,
  port: number,
}
export function isNetAddrConfigs (object: any): object is NetAddrConfigs {
  return typeof object === 'object' 
    && (object.hasOwnProperty('address') 
      && typeof object.address === 'string')
    && (object.hasOwnProperty('port')
      && (typeof object.port === 'number' || typeof object.port === 'string'))
}

const initState: ConfigsInitState = {
  netAddr: {
    address: 'localhost',
    port: 8080,
  },
  setNetAddr: true,
}

export const ConfigsSlice = createSlice({

  name: 'configs',
  
  
  initialState: initState,


  reducers: {

    setNetAddrConfigs: (state, action: PayloadAction<NetAddrConfigs>) => {
      if (state.setNetAddr){
        state.setNetAddr = false;
        state.netAddr.address = action.payload.address === "0.0.0.0" ? 'localhost' : action.payload.address;
        state.netAddr.port = action.payload.port;
      }
    },

  },


})

// Action creators are generated for each case reducer function
export const { setNetAddrConfigs } = ConfigsSlice.actions

export default ConfigsSlice.reducer