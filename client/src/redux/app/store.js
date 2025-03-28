import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/authSlice";
import sharedReducer from "../features/sharedSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  shared: sharedReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
