import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

const initialState: { loggedIn: boolean; username: string } = {
  loggedIn: false,
  username: '',
};

export const UserSlicer = createSlice({
  name: 'USER',
  reducers: {
    SET_LOGGED_IN: (state) => { state.loggedIn = true; },
    SET_LOGGED_OUT: (state) => { state.loggedIn = false; },
    SET_USERNAME: (state, action: PayloadAction<string>) => { state.username = action.payload; },
  },
  initialState,
});

export const {
  SET_LOGGED_IN,
  SET_LOGGED_OUT,
  SET_USERNAME,
} = UserSlicer.actions;

export const UserReducer = UserSlicer.reducer;
