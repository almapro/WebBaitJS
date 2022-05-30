import { put, all, takeLatest, delay, race, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { AgentCommands } from '../../models';
import { ADD_AGENT_COMMAND, SET_AGENT_COMMANDS, SET_FETCHING, SET_SUBMITTING, UPDATE_AGENT_COMMAND } from '../slicers';
import { agentCommandsService } from '../../services';
import { AxiosResponse } from 'axios';
import { TOGGLE_ACTION_ERROR_ACTION, TOGGLE_ACTION_SUCCESS_ACTION } from './app.saga';
import { Filter } from '@loopback/repository';

export const ADD_AGENT_COMMAND_ACTION = createAction('ADD_AGENT_COMMAND_ACTION', (payload: AgentCommands, pathParams?: { [key: string]: number }) => ({
  payload: {
    payload,
    pathParams,
  }
}));

export function* addAgentCommandSaga(action: ReturnType<typeof ADD_AGENT_COMMAND_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentCommands>
    }
    const { result }: RaceResult = yield race({
      result: call(agentCommandsService.create, action.payload.payload, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(ADD_AGENT_COMMAND(result.data));
      yield put(TOGGLE_ACTION_SUCCESS_ACTION('actions.agentcommands.success.add'));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchAddAgentCommandSaga() {
  yield takeLatest(ADD_AGENT_COMMAND_ACTION.toString(), addAgentCommandSaga);
}

export const UPDATE_AGENT_COMMAND_ACTION = createAction('UPDATE_AGENT_COMMAND_ACTION', (id: number, payload: AgentCommands, pathParams?: { [key: string]: number }) => ({
  payload: {
    id,
    payload,
    pathParams
  }
}));

export function* updateAgentCommandSaga(action: ReturnType<typeof UPDATE_AGENT_COMMAND_ACTION>) {
  yield put(SET_SUBMITTING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentCommands>
    }
    const { result }: RaceResult = yield race({
      result: call(agentCommandsService.update, action.payload.id, action.payload.payload, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(UPDATE_AGENT_COMMAND(result.data));
      yield put(TOGGLE_ACTION_SUCCESS_ACTION('actions.agentcommands.success.update'));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.invalid'));
  }
  yield put(SET_SUBMITTING(false));
}

export function* watchUpdateAgentCommandSaga() {
  yield takeLatest(UPDATE_AGENT_COMMAND_ACTION.toString(), updateAgentCommandSaga);
}

export const FETCH_AGENT_COMMANDS_ACTION = createAction('FETCH_AGENT_COMMANDS_ACTION', (filter?: Filter<AgentCommands>, pathParams?: { [key: string]: number }) => ({
  payload: {
    filter,
    pathParams,
  }
}));

export function* fetchAgentCommandsSaga(action: ReturnType<typeof FETCH_AGENT_COMMANDS_ACTION>) {
  yield put(SET_FETCHING(true));
  try {
    type RaceResult = {
      result: AxiosResponse<AgentCommands[]>
    }
    const { result }: RaceResult = yield race({
      result: call(agentCommandsService.fetchAll, action.payload.filter, action.payload.pathParams),
      timeout: delay(5000)
    });
    if (result) {
      yield put(SET_AGENT_COMMANDS(result.data));
    } else {
      yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.timeout'));
    }
  } catch (_) {
    yield put(TOGGLE_ACTION_ERROR_ACTION('actions.agentcommands.errors.invalid'));
  }
  yield put(SET_FETCHING(false));
}

export function* watchFetchAgentCommandsSaga() {
  yield takeLatest(FETCH_AGENT_COMMANDS_ACTION.toString(), fetchAgentCommandsSaga);
}

export function* watchAgentCommandsSagas() {
  yield all([
    watchAddAgentCommandSaga(),
    watchUpdateAgentCommandSaga(),
    watchFetchAgentCommandsSaga(),
  ]);
}
