import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  isReduxStoreReady: true,
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    toggleLoading: (state, action) => {
      state.loading = action?.payload;
    },
  },
});

export default sharedSlice.reducer;

export const { toggleLoading } = sharedSlice.actions;
