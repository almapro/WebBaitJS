import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Users } from '../../models';

const initialState: Users[] = [];

export const UsersSlicer = createSlice({
  name: 'USERS',
  initialState,
  reducers: {
    SET_USERS: (state, action: PayloadAction<Users[]>) => {
      state = _.merge(state, action.payload);
    },
    ADD_USER: (state, action: PayloadAction<Users>) => {
      state.push(action.payload);
    },
    DELETE_USER: (state, action: PayloadAction<number>) => {
      state.filter(user => {
        return user.id !== action.payload;
      });
    },
    UPDATE_USER: (state, action: PayloadAction<Users>) => {
      state = state.map(user => {
        if (user.id === action.payload.id) {
          return _.merge(user, action.payload);
        }
        return user;
      });
    },
  },
});

export const {
  SET_USERS,
  ADD_USER,
  DELETE_USER,
  UPDATE_USER,
} = UsersSlicer.actions;

export const UsersReducer = UsersSlicer.reducer;
