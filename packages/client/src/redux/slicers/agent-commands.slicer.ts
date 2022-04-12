import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AgentCommands } from '../../models';

const initialState: AgentCommands[] = [];

export const AgentCommandsSlicer = createSlice({
  name: 'AGENT_COMMANDS',
  initialState,
  reducers: {
    SET_AGENT_COMMANDS: (state, action: PayloadAction<AgentCommands[]>) => {
      state = _.merge(state, action.payload);
    },
    ADD_AGENT_COMMAND: (state, action: PayloadAction<AgentCommands>) => {
      state.push(action.payload);
    },
    UPDATE_AGENT_COMMAND: (state, action: PayloadAction<AgentCommands>) => {
      state = state.map(agentcommand => {
        if (agentcommand.id === action.payload.id) {
          return _.merge(agentcommand, action.payload);
        }
        return agentcommand;
      });
    },
  },
});

export const {
  SET_AGENT_COMMANDS,
  ADD_AGENT_COMMAND,
  UPDATE_AGENT_COMMAND,
} = AgentCommandsSlicer.actions;

export const AgentCommandsReducer = AgentCommandsSlicer.reducer;
