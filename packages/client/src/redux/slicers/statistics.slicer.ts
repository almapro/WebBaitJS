import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import sunburstData from '../../sunburst.json';
import lineData from '../../line.json';

export type AgentsBySite = {
  name: string
  color: string
  loc?: number
  children?: AgentsBySite[]
}

export type AgentsByCountry = {
  id: string
  value: number
}

const initialState: {
  agents_per_month: number[]
  agents_by_country: AgentsByCountry[]
  agents_by_site: AgentsBySite[]
} = {
  agents_per_month: lineData[0].data.map((d) => d.y),
  agents_by_country: [],
  agents_by_site: sunburstData.children,
};

export const StatisticsSlicer = createSlice({
  name: 'STATISTICS',
  initialState,
  reducers: {
    SET_AGENTS_PER_MONTH: (state, action: PayloadAction<number[]>) => { state.agents_per_month = action.payload; },
    SET_AGENTS_BY_SITE: (state, action: PayloadAction<AgentsBySite[]>) => { state.agents_by_site = action.payload; },
    SET_AGENTS_BY_COUNTRY: (state, action: PayloadAction<AgentsByCountry[]>) => { state.agents_by_country = action.payload; },
  },
});

export const {
  SET_AGENTS_BY_SITE,
  SET_AGENTS_PER_MONTH,
  SET_AGENTS_BY_COUNTRY,
} = StatisticsSlicer.actions;

export const StatisticsReducer = StatisticsSlicer.reducer;
