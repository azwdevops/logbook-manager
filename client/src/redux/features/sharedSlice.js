// Importing the createSlice function from Redux Toolkit to create slices of state
import { createSlice } from "@reduxjs/toolkit";

// Initial state for the shared slice
const initialState = {
  loading: false, // Boolean indicating if a loading process is active
  isReduxStoreReady: true, // Boolean indicating if the Redux store is ready (usually for initial setup)
};

// Creating the shared slice, which includes actions and reducers for the shared state
const sharedSlice = createSlice({
  name: "shared", // Name of the slice, used for debugging
  initialState, // Setting the initial state
  reducers: {
    // Defining actions that modify the state
    // Action to toggle the loading state (true for loading, false for not loading)
    toggleLoading: (state, action) => {
      state.loading = action?.payload; // Payload contains the boolean value for loading state
    },
  },
});

// Exporting the reducer function to be used in the store
export default sharedSlice.reducer;

// Exporting the actions to be dispatched in components
export const { toggleLoading } = sharedSlice.actions;
