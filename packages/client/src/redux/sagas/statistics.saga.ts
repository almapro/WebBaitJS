import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import _ from 'lodash';
import { createAction } from '@reduxjs/toolkit';
import { statisticsService } from '../../services';
import { AxiosResponse } from 'axios';
import { TOGGLE_ACTION_ERROR_ACTION } from './app.saga';
import { AgentsByCountry, AgentsBySite, SET_AGENTS_BY_COUNTRY, SET_AGENTS_BY_SITE, SET_AGENTS_PER_MONTH, SET_FETCHING } from '../slicers';

export const FETCH_AGENTS_PER_MONTH_ACTION = createAction('FETCH_AGENTS_PER_MONTH_ACTION');

export function* fetchAgentsPerMonthSaga() {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<number[]>
    }
    const { result }: RaceResult = yield race({
      result: call(statisticsService.getAgentsPerMonth),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENTS_PER_MONTH(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentsPerMonthSaga() {
  yield takeLatest(FETCH_AGENTS_PER_MONTH_ACTION.toString(), fetchAgentsPerMonthSaga);
}

export const FETCH_AGENTS_BY_COUNTRY_ACTION = createAction('FETCH_AGENTS_BY_COUNTRY_ACTION');

export function* fetchAgentsByCountrySaga() {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentsByCountry[]>
    }
    const { result }: RaceResult = yield race({
      result: call(statisticsService.getAgentsByCountry),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENTS_BY_COUNTRY(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentsByCountrySaga() {
  yield takeLatest(FETCH_AGENTS_BY_COUNTRY_ACTION.toString(), fetchAgentsByCountrySaga);
}

export const FETCH_AGENTS_BY_SITE_ACTION = createAction('FETCH_AGENTS_BY_SITE_ACTION');

export function* fetchAgentsBySiteSaga() {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentsBySite[]>
    }
    const { result }: RaceResult = yield race({
      result: call(statisticsService.getAgentsBySite),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENTS_BY_SITE(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.statistics.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentsBySiteSaga() {
  yield takeLatest(FETCH_AGENTS_BY_SITE_ACTION.toString(), fetchAgentsBySiteSaga);
}

export function* watchStatisticsSagas() {
  yield all([
    watchFetchAgentsPerMonthSaga(),
    watchFetchAgentsByCountrySaga(),
    watchFetchAgentsBySiteSaga(),
  ]);
}
