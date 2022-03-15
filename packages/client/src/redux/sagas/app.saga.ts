import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import _ from 'lodash';
import { createAction } from '@reduxjs/toolkit';
import { SET_ACTION_ERROR, SET_ACTION_ERROR_MESSAGE, SET_LOGGED_IN, SET_LOGGED_OUT, SET_SUBMITTING, SET_USERNAME } from '../slicers';
import { userService } from '../../services';
import { AxiosResponse } from 'axios';

export const LOGIN_ACTION = createAction('LOGIN_ACTION', (payload: { username: string, password: string }) => ({
  payload
}));

export function* loginSaga(action: ReturnType<typeof LOGIN_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<{ token: string }>
    }
    const { result }: RaceResult = yield race({
      result: call(userService.login, action.payload),
      timeout: delay(5000)
    });
    if (result) {
      localStorage.setItem('WEBBAIT_TOKEN', result.data.token);
      yield put(SET_LOGGED_IN());
      yield put(SET_USERNAME(action.payload.username));
    } else {
      yield put(SET_ACTION_ERROR(true));
      yield put(SET_ACTION_ERROR_MESSAGE('actions.login.errors.timeout'));
    }
  } catch (_) {
    yield put(SET_ACTION_ERROR(true));
    yield put(SET_ACTION_ERROR_MESSAGE('actions.login.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchLoginSaga() {
  yield takeLatest(LOGIN_ACTION.toString(), loginSaga);
}

export const LOGOUT_ACTION = createAction('LOGOUT_ACTION');

export function* logoutSaga() {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<{ token: string }>
    }
    const { result }: RaceResult = yield race({
      result: call(userService.logout),
      timeout: delay(5000)
    });
    if (result) {
      localStorage.removeItem('WEBBAIT_TOKEN');
      yield put(SET_LOGGED_OUT());
      yield put(SET_USERNAME(''));
    } else {
      yield put(SET_ACTION_ERROR(true));
      yield put(SET_ACTION_ERROR_MESSAGE('actions.logout.errors.timeout'));
    }
  } catch (_) {
    yield put(SET_ACTION_ERROR(true));
    yield put(SET_ACTION_ERROR_MESSAGE('actions.logout.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchLogoutSaga() {
  yield takeLatest(LOGOUT_ACTION.toString(), logoutSaga);
}

export const CHECK_LOGGED_ACTION = createAction('CHECK_LOGGED_ACTION');

export function* checkLoggedSaga() {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<{ username: string }>
    }
    const { result }: RaceResult = yield race({
      result: call(userService.checkLogged),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_LOGGED_IN());
      yield put(SET_USERNAME(result.data.username));
    }
  } catch (_) { }
  yield put(SET_SUBMITTING(false));
}

export function* watchCheckLoggedSaga() {
  yield takeLatest(CHECK_LOGGED_ACTION.toString(), checkLoggedSaga);
}

export function* watchAppSagas() {
  yield all([
    watchLoginSaga(),
    watchLogoutSaga(),
    watchCheckLoggedSaga(),
  ]);
}
