import { configureStore } from '@reduxjs/toolkit'
import { uiStateReducer, dataStateReducer } from './slices'

const store = configureStore({
  reducer: {
    uiState: uiStateReducer,
    dataState: dataStateReducer
  }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
