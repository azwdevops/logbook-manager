import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  openLogin: false,
  openSignup: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authSuccess: (state, action) => {
      state.user = action?.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    toggleLogin: (state, action) => {
      state.openLogin = action?.payload;
    },
    toggleSignup: (state, action) => {
      state.openSignup = action?.payload;
    },
    logoutUser: (state, action) => {
      state.user = {};
      state.openLogin = false;
      state.openSignup = false;
      localStorage.removeItem("access_token");
    },
  },
});

export default authSlice.reducer;
export const { authSuccess, logoutUser, updateUser, toggleLogin, toggleSignup } = authSlice.actions;
