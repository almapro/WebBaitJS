import { all } from "redux-saga/effects";
import { watchAgentCommandsSagas } from "./agent-commands.saga";
import { watchAgentsSagas } from "./agents.saga";
import { watchAppSagas } from "./app.saga";
import { watchStatisticsSagas } from "./statistics.saga";
import { watchUsersSagas } from "./users.saga";

export function* rootSaga() {
  yield all([
    watchAppSagas(),
    watchUsersSagas(),
    watchStatisticsSagas(),
    watchAgentsSagas(),
    watchAgentCommandsSagas(),
  ]);
}
