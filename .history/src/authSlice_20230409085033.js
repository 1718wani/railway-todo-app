import { createSlice } from "@reduxjs/toolkit";
import { Cookies } from "react-cookie";

const cookie = new Cookies();

const initialState = {
  isSignIn: cookie.get("token") !== undefined,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn: (state) => {
      const state1 = state
      state1.isSignIn = true;
    },
    signOut: (state) => {
      const state1 = state
      state1.isSignIn = false;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
