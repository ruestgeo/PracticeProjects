import { PayloadAction, createSlice } from '@reduxjs/toolkit'



const initState: {active: boolean, message: string} = {
  active: false,
  message: ''
}

export const SpinnerSlice = createSlice({

  name: 'spinner',
  
  
  initialState: initState,


  reducers: {

    activateSpinner: (state, action: PayloadAction<string>) => {
      if (!state.active){
        state.active = true;
        state.message = action.payload;
      }
    },

    deactivateSpinner: (state) => {
      if (state.active)
        state.active = false;
        state.message = '';
    },

  },


})

// Action creators are generated for each case reducer function
export const { activateSpinner, deactivateSpinner } = SpinnerSlice.actions

export default SpinnerSlice.reducer