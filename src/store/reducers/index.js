// store/reducers/index.js

import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { provider } from './provider';
import { Restaurants } from './Restaurants';
import { DashboardRestaurant } from './dashboardRestaurant';

// Root persist configuration
const rootPersistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  provider,
  Restaurants,
  DashboardRestaurant, 
});

export default persistReducer(rootPersistConfig, rootReducer);
