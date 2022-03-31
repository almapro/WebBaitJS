import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Agents } from '../../models';

const initialState: Agents[] = [];

export const AgentsSlicer = createSlice({
  name: 'AGENTS',
  initialState,
  reducers: {
    SET_AGENTS: (state, action: PayloadAction<Agents[]>) => {
      state = _.merge(state, action.payload);
    },
  },
});

export const {
  SET_AGENTS,
} = AgentsSlicer.actions;

export const AgentsReducer = AgentsSlicer.reducer;
