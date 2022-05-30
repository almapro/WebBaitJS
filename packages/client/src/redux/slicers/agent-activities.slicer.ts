import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { AgentActivities } from '../../models';

const initialState: AgentActivities[] = [];

export const AgentActivitiesSlicer = createSlice({
  name: 'AGENT_ACTIVITIES',
  initialState,
  reducers: {
    SET_AGENT_ACTIVITIES: (state, action: PayloadAction<AgentActivities[]>) => {
      state = _.uniqBy(_.merge(state, action.payload), 'id');
    },
    UPDATE_AGENT_ACTIVITY: (state, action: PayloadAction<AgentActivities>) => {
      state = state.map(agentActivity => {
        if (agentActivity.id === action.payload.id) {
          return _.merge(agentActivity, action.payload);
        }
        return agentActivity;
      });
    },
  },
});

export const {
  SET_AGENT_ACTIVITIES,
  UPDATE_AGENT_ACTIVITY,
} = AgentActivitiesSlicer.actions;

export const AgentActivitiesReducer = AgentActivitiesSlicer.reducer;
