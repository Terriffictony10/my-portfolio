// store/reducers/index.js

import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { provider } from './provider';
import { Restaurants } from './Restaurants';
import { DashboardRestaurant } from './dashboardRestaurant';
import { myJob } from './myJob';

// Root persist configuration
const rootPersistConfig = {
  key: 'root/DashboardRestaurant',
  storage,
};

const rootReducer = combineReducers({
  provider,
  Restaurants,
  DashboardRestaurant, 
  myJob
});

export default persistReducer(rootPersistConfig, rootReducer);
