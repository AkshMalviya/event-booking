import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  email: string;
  name: string;
  id: string;
}

const initialState: UserState = {
  email: "",
  name: "",
  id: "",
};

export const userSlice = createSlice({
  name: "userSlice",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.id = action.payload.id;
    },
    clearUser: (state) => {
      state.email = "";
      state.name = "";
      state.id = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
