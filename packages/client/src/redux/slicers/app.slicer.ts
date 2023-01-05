import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppSlicerState = {
  loggedIn: boolean;
  username: string;
  submitting: boolean;
  fetching: boolean;
  actionError: boolean;
  actionErrorMessage: string;
  actionSuccess: boolean;
  actionSuccessMessage: string;
};

const initialState: AppSlicerState = {
  loggedIn: false,
  username: '',
  submitting: false,
  fetching: false,
  actionError: false,
  actionErrorMessage: '',
  actionSuccess: false,
  actionSuccessMessage: '',
};

export const AppSlicer = createSlice({
  name: 'APP',
  reducers: {
    SET_LOGGED_IN: (state) => { state.loggedIn = true; },
    SET_LOGGED_OUT: (state) => { state.loggedIn = false; },
    SET_USERNAME: (state, action: PayloadAction<string>) => { state.username = action.payload; },
    SET_SUBMITTING: (state, action: PayloadAction<boolean>) => { state.submitting = action.payload; },
    SET_FETCHING: (state, action: PayloadAction<boolean>) => { state.fetching = action.payload; },
    SET_ACTION_ERROR: (state, action: PayloadAction<boolean>) => { state.actionError = action.payload; },
    SET_ACTION_ERROR_MESSAGE: (state, action: PayloadAction<string>) => { state.actionErrorMessage = action.payload; },
    SET_ACTION_SUCCESS: (state, action: PayloadAction<boolean>) => { state.actionSuccess = action.payload; },
    SET_ACTION_SUCCESS_MESSAGE: (state, action: PayloadAction<string>) => { state.actionSuccessMessage = action.payload; },
  },
  initialState,
});

export const {
  SET_LOGGED_IN,
  SET_LOGGED_OUT,
  SET_USERNAME,
  SET_SUBMITTING,
  SET_FETCHING,
  SET_ACTION_ERROR,
  SET_ACTION_ERROR_MESSAGE,
  SET_ACTION_SUCCESS,
  SET_ACTION_SUCCESS_MESSAGE,
} = AppSlicer.actions;

export const AppReducer = AppSlicer.reducer;
