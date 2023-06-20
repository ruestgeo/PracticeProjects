import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { WWUser, WWUserProfile } from '../types/user/WWUser'

export const UNKNOWN_USER = WWUserProfile.DEFAULT_NAME;
export const UNKNOWN_ID = WWUserProfile.DEFAULT_ID;


interface AuthState {
  user: WWUser | null,
  expiry: string,
  expired: boolean,
}

const initState: AuthState = {
  user: null,
  expiry: '',
  expired: false,
}

export const AuthSlice = createSlice({

  name: 'auth',
  
  
  initialState: initState,


  reducers: {

    setUser: (state, action: PayloadAction<WWUser>) => {
      if (state.user === null){
        console.log('user prev null');
        state.user = action.payload;
      }
      else {
        console.log('user prev not null');
        state.user = {...state.user, ...action.payload};
      }
    },

    setUserCookieExpiry: (state, action: PayloadAction<string>) => {
      state.expiry = action.payload;
      const expiry = new Date(action.payload);
      console.log(`expiry ${expiry}`);
      if (expiry.getTime() < Date.now()){
        console.log('expiry past');
        state.expired = true;
      }
      else {
        console.log('expiry future');
        state.expired = false;
      }
    },

    setUserCookieExpired: (state) => {
      state.expired = true;
    }

  },


})

// Action creators are generated for each case reducer function
export const { 
  setUser,
  setUserCookieExpiry,
  setUserCookieExpired,

} = AuthSlice.actions

export default AuthSlice.reducer



