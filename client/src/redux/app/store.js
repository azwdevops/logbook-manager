// Importing necessary functions from Redux Toolkit
import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Importing the reducers for auth and shared features
import authReducer from "../features/authSlice";
import sharedReducer from "../features/sharedSlice";

// Combining individual reducers into one root reducer
const rootReducer = combineReducers({
  auth: authReducer, // Reducer responsible for authentication state
  shared: sharedReducer, // Reducer responsible for shared state
});

// Configuring the Redux store with the root reducer
export const store = configureStore({
  reducer: rootReducer, // The root reducer that manages the state of the application
});
