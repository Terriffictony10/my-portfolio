// store/reducers/dashboardRestaurant.js

import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const DEFAULT_MY_JOBS_STATE = {
  loaded: false,
  restaurantContractAddress: null,
  employeeAddress: null,
  name: null,
  payoutBalance: null,
  events: []
};


export const myJob = (state = DEFAULT_MY_JOBS_STATE, action) => {
  switch (action.type) {
    case 'JOB_RESTAURANT_LOADED':
      return {
        ...state,
        loaded: true,
        contractAddress: action.contractAddress,
        abi: action.abi,
        name: action.name,
        cash: action.cash
      };
    case 'JOB_LOADED':
      return {
        ...state,
        allJobs: {
          loaded: true,
          data: action.jobs,
        },
      };
    case 'JOB_SHIFT_DATA_LOADED':
      return {
        ...state,
        allServices: {
          loaded: true,
          data: action.services,
        },
      };
    case 'JOB_PAY_DATA_LOADED':
      return {
        ...state,
        allEmployees: {
          loaded: true,
          data: action.employees,
        },
      };
   
    default:
      return state;
  }
};


