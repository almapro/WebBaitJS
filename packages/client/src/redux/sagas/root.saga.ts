import { all } from "redux-saga/effects";
import { watchAppSagas } from "./app.saga";
import { watchUsersSagas } from "./users.saga";

export function* rootSaga() {
  yield all([
    watchAppSagas(),
    watchUsersSagas(),
  ]);
}
