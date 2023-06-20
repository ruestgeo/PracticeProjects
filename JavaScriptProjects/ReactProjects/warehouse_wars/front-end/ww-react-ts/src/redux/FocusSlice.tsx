import { createSlice } from '@reduxjs/toolkit'



const initState: {focused: boolean} = {
  focused: false
}

export const FocusSlice = createSlice({

  name: 'focus',
  
  
  initialState: initState,


  reducers: {

    focus: (state) => {
      state.focused = true
    },

    blur: (state) => {
      state.focused = false
    }

  },


})

// Action creators are generated for each case reducer function
export const { focus, blur } = FocusSlice.actions

export default FocusSlice.reducer