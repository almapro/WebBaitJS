import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Agents } from '../../models';

const initialState: Agents[] = [];

export const AgentsSlicer = createSlice({
  name: 'AGENTS',
  initialState,
  reducers: {
    SET_AGENTS: (state, action: PayloadAction<Agents[]>) => {
      state = _.uniqBy(_.merge(state, action.payload.map(agent => {
        const found = state.find(a => a.id === agent.id);
        if (found) return { ...agent, connected: found.connected };
        return agent;
      })), 'agentId');
    },
    UPDATE_AGENT: (state, action: PayloadAction<Agents>) => {
      state = state.map(agent => {
        if (agent.agentId === action.payload.agentId) {
          return _.merge(agent, action.payload);
        }
        return agent;
      });
    },
  },
});

export const {
  SET_AGENTS,
  UPDATE_AGENT,
} = AgentsSlicer.actions;

export const AgentsReducer = AgentsSlicer.reducer;
