import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { Users } from '../../models';
import { ADD_USER, DELETE_USER, SET_USERS, SET_FETCHING, SET_SUBMITTING, UPDATE_USER } from '../slicers';
import { usersService } from '../../services';
import { AxiosResponse } from 'axios';
import { TOGGLE_ACTION_ERROR_ACTION, TOGGLE_ACTION_SUCCESS_ACTION } from './app.saga';
import { Filter } from '@loopback/repository';

export const ADD_USER_ACTION = createAction('ADD_USER_ACTION', (payload: Users, pathParams?: { [key: string]: number }) => ({
  payload: {
    payload,
    pathParams,
  }
}));

export function* addUserSaga(action: ReturnType<typeof ADD_USER_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<Users>
    }
    const { result }: RaceResult = yield race({
      result: call(usersService.create, action.payload.payload, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(ADD_USER(result.data));
      yield put(TOGGLE_ACTION_SUCCESS_ACTION('actions.users.success.add'));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchAddUserSaga() {
  yield takeLatest(ADD_USER_ACTION.toString(), addUserSaga);
}

export const DELETE_USER_ACTION = createAction('DELETE_USER_ACTION', (id: number, pathParams?: { [key: string]: number }) => ({
  payload: {
    id,
    pathParams,
  }
}));

export function* deleteUserSaga(action: ReturnType<typeof DELETE_USER_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<Users>
    }
    const { result }: RaceResult = yield race({
      result: call(usersService.delete, action.payload.id, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(DELETE_USER(action.payload.id));
      yield put(TOGGLE_ACTION_SUCCESS_ACTION('actions.users.success.delete'));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchDeleteUserSaga() {
  yield takeLatest(DELETE_USER_ACTION.toString(), deleteUserSaga);
}

export const UPDATE_USER_ACTION = createAction('UPDATE_USER_ACTION', (id: number, payload: Users, pathParams?: { [key: string]: number }) => ({
  payload: {
    id,
    payload,
    pathParams
  }
}));

export function* updateUserSaga(action: ReturnType<typeof UPDATE_USER_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<Users>
    }
    const { result }: RaceResult = yield race({
      result: call(usersService.update, action.payload.id, action.payload.payload, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(UPDATE_USER(result.data));
      yield put(TOGGLE_ACTION_SUCCESS_ACTION('actions.users.success.update'));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchUpdateUserSaga() {
  yield takeLatest(UPDATE_USER_ACTION.toString(), updateUserSaga);
}

export const FETCH_USERS_ACTION = createAction('FETCH_USERS_ACTION', (filter?: Filter<Users>, pathParams?: { [key: string]: number }) => ({
  payload: {
    filter,
    pathParams,
  }
}));

export function* fetchUsersSaga(action: ReturnType<typeof FETCH_USERS_ACTION>) {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<Users[]>
    }
    const { result }: RaceResult = yield race({
      result: call(usersService.fetchAll, action.payload.filter, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_USERS(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.users.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchUsersSaga() {
  yield takeLatest(FETCH_USERS_ACTION.toString(), fetchUsersSaga);
}

export function* watchUsersSagas() {
  yield all([
    watchAddUserSaga(),
    watchDeleteUserSaga(),
    watchUpdateUserSaga(),
    watchFetchUsersSaga(),
  ]);
}
