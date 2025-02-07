import { configureStore } from '@reduxjs/toolkit';
import { appReducer } from './slices';

function createStore() {
  const store = configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  return store;
}

const reduxStore = createStore();

export function getReduxStore() {
  return reduxStore;
}
export type AppStore = ReturnType<typeof createStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export { Provider as ReduxProvider } from 'react-redux';
