// store/reducers/index.js

import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage as storage
import { provider } from './provider'; 
import { Restaurants } from './Restaurants';
import { DashboardRestaurant } from './dashboardRestaurant';

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['DashboardRestaurant'], // Specify which state slices to persist
};

// Combine all reducers
const rootReducer = combineReducers({
  provider,
  Restaurants,
  DashboardRestaurant,
  // Add other reducers here
});

// Wrap the root reducer with persistReducer to enable persistence
export default persistReducer(persistConfig, rootReducer);
