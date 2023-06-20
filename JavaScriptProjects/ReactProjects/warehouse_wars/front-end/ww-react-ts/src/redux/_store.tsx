import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'

import IndexReducer from './IndexSlice'
import SpinnerReducer from './SpinnerSlice'
import FocusReducer from './FocusSlice'
import ChatReducer from './ChatSlice'
import AuthReducer from './AuthSlice'
import ConfigsReducer from './ConfigsSlice'
import GameReducer from './GameSlice'


// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware();

export const store = configureStore ({
  reducer: {
    index: IndexReducer,
    spinner: SpinnerReducer,
    auth: AuthReducer,
    configs: ConfigsReducer,
    chat: ChatReducer,
    focus: FocusReducer,
    game: GameReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


/*
Notes: 

  - when updating redux store, replace any mutable objects rather than modify 
  - redux store should hold immutable objects;  update 'immutably'

  - redux toolkit allows updates for psuedo-mutability (underlying logic is replacement if modified)

*/