// store/reducers/dashboardRestaurant.js

import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const DEFAULT_DASHBOARD_RESTAURANTS_STATE = {
  loaded: false,
  contractAddress: null,
  abi: null,
  name: null,
  cash: null,
  transaction: {
    isSuccessful: false
  },
  allPOS: {
    loaded: false,
    data: []
  },
  allJobs: {
    loaded: false,
    data: []
  },
  allEmployees: {
    loaded: false,
    data: []
  },
  allServices: {
    loaded: false,
    data: [],
  },
  allPOS: {
    loaded: false,
    data: [],
  },
  allMenuItems: { data: [], loaded: false, loading: false },
  posCreationInProgress: false,
  events: []
};

// Persist config for DashboardRestaurant reducer
const dashboardRestaurantPersistConfig = {
  key: 'dashboardRestaurant',
  storage,
  whitelist: ['contractAddress', 'abi', 'name', 'cash'] // Only persist these keys
};

const dashboardRestaurantReducer = (state = DEFAULT_DASHBOARD_RESTAURANTS_STATE, action) => {
  switch (action.type) {
    case 'DASHBOARD_RESTAURANT_LOADED':
      return {
        ...state,
        loaded: true,
        contractAddress: action.contractAddress,
        abi: action.abi,
        name: action.name,
        cash: action.cash
      };
    case 'JOBS_LOADED':
      return {
        ...state,
        allJobs: {
          loaded: true,
          data: action.jobs,
        },
      };
    case 'SERVICES_LOADED':
      return {
        ...state,
        allServices: {
          loaded: true,
          data: action.services,
        },
      };
    case 'EMPLOYEES_LOADED':
      return {
        ...state,
        allEmployees: {
          loaded: true,
          data: action.employees,
        },
      };
    case 'POS_LOADED':
      return {
        ...state,
        allPOS: {
          loaded: true,
          data: action.posArray,
        },
      };
    case 'POS_CREATED':
      return {
        ...state,
        allPOS: {
          loaded: true,
          data: [...state.allPOS.data, action.pos],
        },
      };
    case 'LOAD_ALL_MENU_ITEMS_SUCCESS':
      return {
        ...state,
        allMenuItems: { data: action.payload, loaded: true, loading: false },
      };
    // Remove the case for 'NEW_JOB' as we won't store jobs in Redux
    default:
      return state;
  }
};

// Wrap the reducer with persistReducer
export const DashboardRestaurant = persistReducer(
  dashboardRestaurantPersistConfig,
  dashboardRestaurantReducer
);
