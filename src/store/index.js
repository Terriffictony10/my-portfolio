// store/store.js

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // Import the rootReducer with persist config
import { persistStore } from 'redux-persist';

// Create the Redux store with the persisted reducer
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignore non-serializable check for redux-persist
    }),
});

// Create the persistor for the store
export const persistor = persistStore(store);

export default store;
