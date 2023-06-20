import { configureStore } from '@reduxjs/toolkit'
import indexReducer from './IndexSlice'

export default configureStore({
  reducer: {
    index: indexReducer,
  },
})