import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { AgentActivities } from '../../models';
import { SET_AGENT_ACTIVITIES, SET_FETCHING } from '../slicers';
import { agentActivitiesService } from '../../services';
import { AxiosResponse } from 'axios';
import { TOGGLE_ACTION_ERROR_ACTION } from './app.saga';
import { Filter } from '@loopback/repository';

export const FETCH_AGENT_ACTIVIES_ACTION = createAction('FETCH_AGENT_ACTIVIES_ACTION', (filter?: Filter<AgentActivities>, pathParams?: { [key: string]: number }) => ({
  payload: {
    filter,
    pathParams,
  }
}));

export function* fetchAgentActivitiesSaga(action: ReturnType<typeof FETCH_AGENT_ACTIVIES_ACTION>) {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentActivities[]>
    }
    const { result }: RaceResult = yield race({
      result: call(agentActivitiesService.fetchAll, action.payload.filter, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENT_ACTIVITIES(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agents.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agents.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentActivitiesSaga() {
  yield takeLatest(FETCH_AGENT_ACTIVIES_ACTION.toString(), fetchAgentActivitiesSaga);
}

export function* watchAgentActivitiesSagas() {
  yield all([
    watchFetchAgentActivitiesSaga(),
  ]);
}
