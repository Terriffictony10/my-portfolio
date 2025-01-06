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
  allTickets: {
    loaded: false,
    data: [], 
  },
  allServices: {
    loaded: false,
    data: [],
  },
  allMenuItems: { data: [], loaded: false, loading: false },
  currentRelevantPOS: [],
  posCreationInProgress: false,
  events: []
};

const dashboardRestaurantPersistConfig = {
  key: 'dashboardRestaurant',
  storage,
  whitelist: ['contractAddress', 'abi', 'name', 'cash', 'allTickets']
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
    case 'RELEVANT_POS_LOADED_FOR_EMPLOYEE':
      return {
        ...state,
        currentRelevantPOS: action.payload
      };
    case 'LOAD_ALL_MENU_ITEMS_SUCCESS':
      return {
        ...state,
        allMenuItems: { data: action.payload, loaded: true, loading: false },
      };
    case 'TICKETS_LOADED': {
  const newTickets = action.payload && action.payload.tickets
    ? action.payload.tickets
    : [];

  return {
    ...state,
    allTickets: {
      loaded: true,
      data: newTickets, 
    }
  };
}
    case 'CREATE_TICKET_SUCCESS':
      return {
        ...state,
        transaction: { isSuccessful: true }
      };
    case 'CREATE_TICKET_FAIL':
      return {
        ...state,
        transaction: { isSuccessful: false }
      };
    case 'ACTIVE_TICKET_SET':
      return {
        ...state,
        activeTicket: action.payload
      };

    case 'ACTIVE_TICKET_CLEAR':
      return {
        ...state,
        activeTicket: null
      };
    case 'ACTIVE_TICKET_DETAILS_LOADED':
  return {
    ...state,
    activeTicket: action.payload
  };

case 'ACTIVE_TICKET_DETAILS_FAIL':
  // fallback, possibly set activeTicket: null
  return {
    ...state,
    activeTicket: null
  };

    default:
      return state;
  }
};

export const DashboardRestaurant = persistReducer(
  dashboardRestaurantPersistConfig,
  dashboardRestaurantReducer
);
