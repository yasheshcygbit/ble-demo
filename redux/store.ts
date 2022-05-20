import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { deviceReducer } from "./slices/deviceSlices";
export const store = configureStore({
  reducer: {
    deviceReducer
  },
})

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;