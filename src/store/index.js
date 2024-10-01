// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['PROVIDER_LOADED', 'DECENTRATALITY_SERVICE_FACTORY_LOADED'],
        ignoredPaths: ['provider.connection', 'Restaurants.contract'],
      },
    }),
});

export default store;

