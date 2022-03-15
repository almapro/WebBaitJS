import { all } from "redux-saga/effects";
import { watchAppSagas } from "./app.saga";

export function* rootSaga() {
  yield all([
    watchAppSagas(),
  ]);
}
