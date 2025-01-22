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
  },   // We'll store rung items here (per your request)
  pendingOrderBuffer: {},
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
        allMenuItems: { data: action.payload.posArray, loaded: true, loading: false },
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
case 'ADD_ITEM_TO_PENDING_BUFFER': {
  const { ticketId, item } = action.payload
  // Always use a string key
  const stringId = ticketId.toString()

  const pending = state.pendingOrderBuffer || {}
  const currentBuffer = pending[stringId] || []

  const updatedBuffer = currentBuffer.length > 0 ? [...currentBuffer, item] : [item]

  return {
    ...state,
    pendingOrderBuffer: {
      ...pending,
      [stringId]: updatedBuffer
    }
  }
}

// CLEAR_PENDING_BUFFER remains the same, 
// but we consistently use a string key.

case 'CLEAR_PENDING_BUFFER': {
  const { ticketId } = action.payload
  const stringId = ticketId.toString()

  return {
    ...state,
    pendingOrderBuffer: {
      ...state.pendingOrderBuffer,
      [stringId]: []
    }
  }
}

case 'ORDER_RING_SUCCESS': {
  // action.payload: { ticketId, rungItems: [ ... ] }
  
  const { ticketId, rungItems } = action.payload;
  
  const stringId = ticketId.toString();
  
  const orderBuffer = state.pendingOrderBuffer
  
  // 1) If your code also saves rung items to "kitchenTickets", keep that logic:
  const currentKitchenOrders = state.kitchenTickets ? state.kitchenTickets[stringId] : [];
  
  const updatedKitchenOrders = currentKitchenOrders ? [...currentKitchenOrders, ...rungItems] : [];
  

  // 2) Merge rungItems into the "activeTicket" if it matches
  let newActiveTicket = state.activeTicket;
  
  if (newActiveTicket && newActiveTicket.id === stringId) {
    
    // existing orders on the left side
    const existingOrders = newActiveTicket.orders || [];
    
    // append the newly rung items
    const updatedOrders = [...existingOrders, ...rungItems];
      
    newActiveTicket = {
      ...newActiveTicket,
      orders: updatedOrders, // so left side updates instantly
    };
  }

  // 3) Clear the right side (the pending buffer) for this ticket
  return {
    ...state,
    activeTicket: newActiveTicket, // updated left side
    pendingOrderBuffer: {
    }
  };
}

 

    default:
      return state;
  }
};

export const DashboardRestaurant = persistReducer(
  dashboardRestaurantPersistConfig,
  dashboardRestaurantReducer
);
