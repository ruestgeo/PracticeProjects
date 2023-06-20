import { createSlice } from '@reduxjs/toolkit'


const initState: {value: {[key: string]: any}} = {
  value: {},
}

export const IndexSlice = createSlice({

  name: 'global_index',
  
  
  initialState: initState,


  reducers: {

    addIndex: (state, action) => {
      if (typeof action.payload !== 'object') return;
      Object.keys(action.payload).forEach(key => {
        let value = action.payload[key];
        if (!state.value.hasOwnProperty(key)){
          state.value[key] = value;
        }
      });
    },

    setIndex: (state, action) => {
      if (typeof action.payload !== 'object') return;
      Object.keys(action.payload).forEach(key => {
        state.value[key] = action.payload[key];
      });
    },

  },


})

// Action creators are generated for each case reducer function
export const { setIndex, addIndex } = IndexSlice.actions

export default IndexSlice.reducer