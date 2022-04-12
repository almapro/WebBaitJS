import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import _ from 'lodash';
import { createAction } from '@reduxjs/toolkit';
import { Agents } from '../../models';
import { SET_AGENTS, SET_FETCHING } from '../slicers';
import { agentsService } from '../../services';
import { AxiosResponse } from 'axios';
import { TOGGLE_ACTION_ERROR_ACTION } from './app.saga';
import { Filter } from '@loopback/repository';

export const FETCH_AGENTS_ACTION = createAction('FETCH_AGENTS_ACTION', (filter?: Filter<Agents>, pathParams?: { [key: string]: number }) => ({
  payload: {
    filter,
    pathParams,
  }
}));

export function* fetchAgentsSaga(action: ReturnType<typeof FETCH_AGENTS_ACTION>) {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<Omit<Agents, 'connected'>[]>
    }
    const { result }: RaceResult = yield race({
      result: call(agentsService.fetchAll, action.payload.filter, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENTS(result.data.map(agent => ({ ...agent, connected: false }))));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agents.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agents.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentsSaga() {
  yield takeLatest(FETCH_AGENTS_ACTION.toString(), fetchAgentsSaga);
}

export function* watchAgentsSagas() {
  yield all([
    watchFetchAgentsSaga(),
  ]);
}
