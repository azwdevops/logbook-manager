// Importing the createSlice function from Redux Toolkit to create slices of state
import { createSlice } from "@reduxjs/toolkit";

// Initial state for the authentication slice
const initialState = {
  user: null, // Stores the user object (null if not logged in)
  openLogin: false, // Boolean indicating if the login modal is open
  openSignup: false, // Boolean indicating if the signup modal is open
};

// Creating the auth slice, which includes actions and reducers for the authentication state
const authSlice = createSlice({
  name: "auth", // Name of the slice, used for debugging
  initialState, // Setting the initial state
  reducers: {
    // Defining actions that modify the state
    // Action to set the user object after a successful authentication
    authSuccess: (state, action) => {
      state.user = action?.payload; // Payload contains the user object
    },

    // Action to update the user object in the state
    updateUser: (state, action) => {
      state.user = action.payload; // Payload contains the updated user object
    },

    // Action to toggle the visibility of the login modal
    toggleLogin: (state, action) => {
      state.openLogin = action?.payload; // Payload is a boolean indicating modal visibility
    },

    // Action to toggle the visibility of the signup modal
    toggleSignup: (state, action) => {
      state.openSignup = action?.payload; // Payload is a boolean indicating modal visibility
    },

    // Action to log the user out and reset the relevant state
    logoutUser: (state, action) => {
      state.user = {}; // Reset the user object
      state.openLogin = false; // Close the login modal
      state.openSignup = false; // Close the signup modal
      localStorage.removeItem("access_token"); // Remove the access token from localStorage
    },
  },
});

// Exporting the reducer function to be used in the store
export default authSlice.reducer;

// Exporting the actions to be dispatched in components
export const { authSuccess, logoutUser, updateUser, toggleLogin, toggleSignup } = authSlice.actions;
