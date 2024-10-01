// store/reducers/index.js
import { combineReducers } from 'redux';
import  {provider } from './provider'; // Import your reducer(s)
import  {Restaurants } from './Restaurants';
const rootReducer = combineReducers({
  provider,
  Restaurants
  // Add other reducers here
});

export default rootReducer;
