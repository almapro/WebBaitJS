import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from './sagas';
import { AppReducer, UsersReducer } from './slicers';

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    app: AppReducer,
    users: UsersReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).prepend(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>;
