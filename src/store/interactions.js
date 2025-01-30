// src/store/interactions.js

import { ethers } from 'ethers'
import RESTAURANT_ABI from "../abis/Restaurant.json"
import DECENTRATALITYSERVICEFACTORY_ABI from "../abis/decentratalityServiceFactory.json"
import POS_ABI from "../abis/POS.json";
import { useSelector } from 'react-redux'

let GlobalRestaurants = []
export const loadProvider = async (dispatch) => {
	const connection = await new ethers.BrowserProvider(window.ethereum);
    
    
    dispatch({ type: 'PROVIDER_LOADED', connection })

    return connection
}
export const loadAccount = async (provider, dispatch) => {
	const accounts = await provider.send("eth_requestAccounts", []);
	const account = ethers.getAddress(accounts[0]); 

    dispatch({ type: 'ACCOUNT_LOADED', account})

    return account
}
export const loadNetwork = async (provider, dispatch) => {
    let { chainId } = await provider.getNetwork()
    chainId = Number(chainId)
    dispatch({ type: 'NETWORK_LOADED', chainId })

    return chainId
}
export const subscribeToEvents = async (restaurantFactory, dispatch, ...Restaurants) => {
        restaurantFactory.on('RestaurantCreated', (restaurant, id, owner, event) => {
        const _restaurant = event.args
        dispatch({ type: 'NEW_RESTAURANT_CREATION_SUCCESS', _restaurant, event })
    })
        for(restaurant in Restaurants) {
            restaurant.on('JobAdded', (id, timestamp, job, event) => {
                
            })
        }
    
}
export const loadFactory = async (provider, address, dispatch) => {
    const user = await provider.getSigner()
    const decentratalityServiceFactory = new ethers.Contract(address, DECENTRATALITYSERVICEFACTORY_ABI.abi, user);
    dispatch({ type: 'DECENTRATALITY_SERVICE_FACTORY_LOADED', decentratalityServiceFactory })
    return decentratalityServiceFactory
}
export const loadAllRestaurants = async (provider, factory, dispatch) => {
    try {
        const Restaurants = [];
        const user = await provider.getSigner();

        // Call the `getAllRestaurants` function from the factory contract
        const restaurantAddresses = await factory.getAllRestaurants();

        // Iterate through the returned restaurant addresses
        for (let i = 0; i < restaurantAddresses.length; i++) {
            const restaurantAddress = restaurantAddresses[i];

            // Create a new contract instance for the restaurant
            const restaurantContract = new ethers.Contract(
                restaurantAddress,
                RESTAURANT_ABI,
                user
            );

            // Fetch restaurant details
            const name = await restaurantContract.name();
            const owner = await restaurantContract.owner();
            const balance = await provider.getBalance(restaurantAddress);

            // Format the restaurant data
            Restaurants.push({
                id: i + 1,
                address: restaurantAddress,
                name,
                owner,
                balance: Number(ethers.formatEther(balance)), // Convert balance to Ether for easier readability
            });
        }

        // Update global state or Redux store
        dispatch({ type: "ALL_RESTAURANTS_LOADED", Restaurants });
        return Restaurants;
    } catch (error) {
        console.error("Error loading all restaurants:", error);
        return [];
    }
};



export const loadMyRestaurants = async (provider, user, Restaurants, dispatch) => {
    const myRestaurants = Restaurants.filter((restaurant) => restaurant.owner === user); // Assuming `owner` is the correct key
    if (myRestaurants.length === 0) return;

    dispatch({ type: 'MY_RESTAURANTS_LOADED', myRestaurants });
    return myRestaurants;
};

export const decorateMyRestaurants = async (provider, myRestaurants) => {
    const user = provider.getSigner();
    const decoratedRestaurants = [];

    if (myRestaurants) {
        for (const restaurant of myRestaurants) {
            try {
                const contract = new ethers.Contract(restaurant.address, RESTAURANT_ABI, user);
                const name = await contract.name; // Use the new getName() function
                const myName = name.toString()
                const cash = Number(await provider.getBalance(restaurant.address));

                decoratedRestaurants.push({
                    ...restaurant,
                    myName,
                    cash,
                });
            } catch (error) {
                console.error(`Error decorating restaurant ${restaurant.address}:`, error);
            }
        }
    }

    return decoratedRestaurants;
};

export const createNewRestaurant = async (provider, factory, restaurantName, totalCostWei, dispatch) => {
  try {
    const user = await provider.getSigner();

    // Ensure totalCostWei is converted to an integer BigInt by truncating decimals
    const totalCost = BigInt(Math.floor(Number(totalCostWei)));

    // Check if the user has enough balance
    const balance = await provider.getBalance(user.getAddress());
    if (BigInt(balance) < totalCost) {
      alert("Insufficient funds to create restaurant");
      return;
    }

    // Call the contract function with the converted total cost
    const tx = await factory.createRestaurant(restaurantName, totalCost, {
      value: totalCost, // Attach the funds in Wei
    });

    // Wait for the transaction to be mined
    await tx.wait();

    // Dispatch success action
    dispatch({ type: "RESTAURANT_CREATION_SUCCESS", restaurant: tx });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    dispatch({ type: "RESTAURANT_CREATION_FAIL", error });
  }
};

export const loadDashboardRestaurantContractData = async (provider, Restaurant, dispatch) => {
    const user = await provider.getSigner()
    const contractAddress = Restaurant.address
    const abi = RESTAURANT_ABI
    const contract = await new ethers.Contract(contractAddress, abi, user)
    const name = await contract.name()
    const myCash = await provider.getBalance(contractAddress)
    const cash = Number(myCash).toString()

    dispatch({ type: 'DASHBOARD_RESTAURANT_LOADED', contractAddress, abi, name, cash })

    return contract
    
}
// interactions.js

export const createNewJob = async (provider, contractAddress, abi, name, wage, dispatch) => {
  const user = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, user);

  // Call the contract function to add a new job
  const tx = await contract.addJob(wage, name);

  // Wait for the transaction to be mined
  await tx.wait();

  // Reload all jobs
  await loadAllJobs(provider, contractAddress, abi, dispatch);
};
export const hireNewEmployee = async (provider, contractAddress, abi, jobId, name, employeeAddress, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    // Call the contract function to hire a new employee
    const tx = await contract.hireEmployee(jobId, name, employeeAddress);

    // Wait for the transaction to be mined
    await tx.wait();

    // Reload all employees
    await loadAllEmployees(provider, contractAddress, abi, dispatch);
  } catch (error) {
    console.error('Error in hireNewEmployee:', error);
  }
};

export const loadAllEmployees = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    // Fetch the array of employee IDs
    const employeeIds = await contract.getEmployeeIds();

    const employeesArray = [];
    for (let i = 0; i < employeeIds.length; i++) {
      const employeeId = Number(employeeIds[i]); // Convert BigNumber to Number
      const employee = await contract.employees(employeeId);

      employeesArray.push({
        id: employeeId.toString(),
        jobId: employee.jobId.toString(),
        name: employee.name,
        address: employee.employeeAddress,
        clockStamp: employee.clockStamp.toString(),
        employeePension: employee.employeePension.toString(),
      });
    }

    // Dispatch action to update employees in Redux store
    dispatch({ type: 'EMPLOYEES_LOADED', employees: employeesArray });
  } catch (error) {
    console.error('Error in loadAllEmployees:', error);
  }
};
export const loadAllJobs = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    // Fetch the array of job IDs
    const jobIds = await contract.getJobIds();

    const jobsArray = [];
    
    for (let i = 0; i < jobIds.length; i++) {
      const jobId = Number(jobIds[i]); // Convert BigNumber to Number
      const job = await contract.jobs(jobId);

      jobsArray.push({
        id: jobId.toString(),
        hourlyWageInWei: job.hourlyWageInWei.toString(),
        jobName: job.jobName,
      });
    }

    // Dispatch action to update jobs in Redux store
    dispatch({ type: 'JOBS_LOADED', jobs: jobsArray });
  } catch (error) {
    console.error('Error in loadAllJobs:', error.message);
  }
};
export const startService = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    const tx = await contract.startService();
    const receipt = await tx.wait();

    // Get the block timestamp from the transaction receipt
    const block = await provider.getBlock(receipt.blockNumber);
    const serviceStartTime = block.timestamp;

    // Dispatch the service start time
    dispatch({ type: 'SERVICE_STARTED', serviceStartTime });
  } catch (error) {
    console.error('Error in startService:', error);
  }
};

export const loadAllServices = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    // Fetch the array of service IDs
    const serviceIds = await contract.getServiceIds();

    const servicesArray = [];
    for (let i = 0; i < serviceIds.length; i++) {
      const serviceId = Number(serviceIds[i]);
      const service = await contract.services(serviceId);

      servicesArray.push({
        id: serviceId.toString(),
        startTime: service.startTime.toString(),
        endTime: service.endTime.toString(),
        cost: service.cost.toString(),
        profit: service.profit.toString(),
        revenue: service.revenue.toString(),
      });
    }

    // Dispatch action to update services in Redux store
    dispatch({ type: 'SERVICES_LOADED', services: servicesArray });
  } catch (error) {
    console.error('Error in loadAllServices:', error);
  }
};

export const endService = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, user);

    const tx = await contract.endService();
    await tx.wait();

    // Optionally dispatch an action to update the service status in Redux
    dispatch({ type: 'SERVICE_STOPPED' });
  } catch (error) {
    console.error('Error in endService:', error);
  }
};

export const createPOS = async (provider, contractAddress, abi, name, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Call the createPOS function on the contract
    const tx = await contract.createPOS(name);
    const receipt = await tx.wait();

    // Extract the POSCreated event from the receipt
    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsedLog) => parsedLog && parsedLog.name === 'POSCreated');

    if (event) {
      const posId = event.args.id.toString();
      const posAddress = event.args.pos;

      // Dispatch action to update Redux store
      
    }

    // Reload POS list
    await loadAllPOS(provider, contractAddress, abi, dispatch);
  } catch (error) {
    console.error('Error in createPOS:', error);
  }
};

export const loadAllPOS = async (provider, contractAddress, abi, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, RESTAURANT_ABI, signer);

    // Fetch the array of POS IDs
    const posIds = await contract.getPOSIds();

    const posArray = [];
    for (let i = 0; i < posIds.length; i++) {
      const posId = Number(posIds[i]);
      const posAddress = await contract.POSMapping(posId);
      const posContract = await new ethers.Contract(posAddress, POS_ABI, signer)
      const posName = await posContract.getName()
      

      posArray.push({
        id: posId.toString(),
        address: posAddress,
        name: posName.toString()
      });
    }

    // Dispatch action to update POS in Redux store
    dispatch({ type: 'POS_LOADED', posArray });
  } catch (error) {
    console.error('Error in loadAllPOS:', error);
  }
};
  export const loadAllMenuItems = async (provider, contractAddress, abi, dispatch) => {
  try {
    const user = await provider.getSigner()
    const restaurantContract = new ethers.Contract(contractAddress, RESTAURANT_ABI, user);

    // Get all POS addresses associated with the restaurant
    const posAddresses = await restaurantContract.getAllPOSAddresses();
    console.log('hello')
    if (posAddresses.length === 0) {
      dispatch({ type: 'LOAD_ALL_MENU_ITEMS_SUCCESS', payload: [] });
      return;
    }

    const firstPOSAddress = posAddresses[0];

    const posContract = new ethers.Contract(firstPOSAddress, POS_ABI, provider);

    const menuItemIds = await posContract.getMenuItemIds();
    let menuItems = [];

    for (let i = 0; i < menuItemIds.length; i++) {
      const id = Number(menuItemIds[i]);
      const menuItem = await posContract.menu(id);

      menuItems.push({
        id: id,
        cost: ethers.formatEther(menuItem.cost),
        name: menuItem.name,
      });
    }

    dispatch({ type: 'LOAD_ALL_MENU_ITEMS_SUCCESS', payload: menuItems });
  } catch (error) {
    console.error('Error loading menu items:', error);
  }
};


export const addNewMenuItem = async (provider, contractAddress, abi, cost, name, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const restaurantContract = new ethers.Contract(contractAddress, RESTAURANT_ABI, signer);

    // Get all POS addresses from the restaurant contract
    const posAddresses = await restaurantContract.getAllPOSAddresses();

    // Loop through each POS address and add the menu item
    for (let i = 0; i < posAddresses.length; i++) {
      const posAddress = posAddresses[i];

      // Create a new contract instance for each POS
      const posContract = new ethers.Contract(posAddress, POS_ABI, signer);

      // Call the addMenuItem function on each POS contract
      const costInWei = ethers.parseUnits(cost.toString(), 'ether');
      const tx = await posContract.addMenuItem(costInWei, name);
      await tx.wait();
    }

    dispatch({ type: 'MENU_ITEM_ADDED', payload: { cost, name } });

    await loadAllMenuItems(provider, contractAddress, abi, dispatch);
  } catch (error) {
    console.error('Error adding new menu item:', error);
  }
};

// In interactions.js (near loadAllPOS or after it):
export const loadEmployeeRelevantPOS = async (provider, restaurantAddress, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const restaurantContract = new ethers.Contract(restaurantAddress, RESTAURANT_ABI, signer);
    const posIds = await restaurantContract.getPOSIds();
    
    const posArray = [];

    for (let i = 0; i < posIds.length; i++) {
      const posId = Number(posIds[i]);
      const posAddress = await restaurantContract.POSMapping(posId);
      const posContract = new ethers.Contract(posAddress, POS_ABI, signer);
      const posName = await posContract.getName();
      posArray.push({
        id: posId.toString(),
        address: posAddress,
        name: posName.toString()
      });
      console.log('1')
    }
    console.log(posArray)

    // Dispatch an action that specifically stores POS addresses relevant to the current employee's restaurant
    dispatch({ type: 'RELEVANT_POS_LOADED_FOR_EMPLOYEE', payload: posArray });
    return posArray;
  } catch (error) {
    console.error('Error in loadEmployeeRelevantPOS:', error);
  }
};


export const createTicketForPOS = async (
  provider,
  posAddress,
  posAbi,
  ticketName,
  serverAddress,
  dispatch
) => {
  try {
    const signer = await provider.getSigner();
    const posContract = new ethers.Contract(posAddress, posAbi, signer);

    // The POS contract extends MenuTicketBase, which has createTicket(_server, _name)
    const tx = await posContract.createTicket(serverAddress, ticketName);
    await tx.wait();

    // After creation, reload tickets so the UI remains up-to-date
    await loadAllTicketsForPOS(provider, posAddress, posAbi, dispatch);

    dispatch({ type: 'CREATE_TICKET_SUCCESS' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    dispatch({ type: 'CREATE_TICKET_FAIL', error });
  }
};

/**
 * Loads all tickets from a given POS contract.
 * @param provider Ethers provider/signer
 * @param posAddress The POS contract address
 * @param posAbi The ABI for the POS contract
 * @param dispatch Redux dispatch function
 */
export const loadAllTicketsForPOS = async (provider, posAddress, posAbi, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const posContract = new ethers.Contract(posAddress, POS_ABI, signer);
    // The POS contract (via MenuTicketBase) has an array TicketIds, so we read that
    const ticketIds = await posContract.getTicketIds();
    const ticketsArray = [];

    for (let i = 0; i < ticketIds.length; i++) {
      const ticketIdBN = ticketIds[i];  // BigInt
      const ticketId = Number(ticketIdBN);
      const ticketStruct = await posContract.getTicket(ticketId); 
      // ticketStruct has { name, orders[], server, id, paid }

      ticketsArray.push({
        id: ticketStruct.id.toString(),
        name: ticketStruct.name,
        server: ticketStruct.server,
        paid: ticketStruct.paid,
        posAddress: posAddress // So we know which POS this ticket belongs to
      });
    }

    // Dispatch to store in Redux. 
    // We can store them POS-by-POS or in a single array. 
    // Below, we just push them all into a single array in Redux:
    dispatch({ 
      type: 'TICKETS_LOADED', 
      payload: { posAddress, tickets: ticketsArray } 
    });

  } catch (error) {
    console.error('Error loading tickets for POS:', error);
    dispatch({ type: 'TICKETS_LOAD_FAIL', error });
  }
};


export const setActiveTicket = async (dispatch, ticket) => {
  dispatch({ type: 'ACTIVE_TICKET_SET', payload: ticket });
};

/**
 * Clears the currently active ticket in Redux.
 * @param {Object} dispatch Redux dispatch
 */
export const clearActiveTicket = async (dispatch) => {
  dispatch({ type: 'ACTIVE_TICKET_CLEAR' });
};

/**
 * Loads all menu items for a given POS contract address and returns them as an array.
 * Optionally, you could dispatch a Redux action to store them if desired.
 *
 * @param {*} provider Ethers provider/signer
 * @param {String} posAddress The address of the POS
 * @param {Array} posAbi The ABI for the POS contract
 * @param {Object} dispatch Redux dispatch
 * @returns {Array} An array of menu items [{ id, name, cost }, ...]
 */
export const loadMenuItemsForPOS = async (provider, posAddress, posAbi, dispatch) => {
  try {
    // Optional: dispatch({ type: 'MENU_ITEMS_LOAD_REQUEST' });

    const signer = await provider.getSigner();
    const posContract = new ethers.Contract(posAddress, POS_ABI, signer);
    const menuItemIds = await posContract.getMenuItemIds();
    

    let menuItems = [];
    for (let i = 0; i < menuItemIds.length; i++) {
      const id = Number(menuItemIds[i]);
      const item = await posContract.menu(id);
      // Convert cost from wei to Ether (or you can store raw wei).
      menuItems.push({
        id,
        name: item.name,
        cost: Number(ethers.formatEther(item.cost)),
      });
    }

    // Optional: dispatch({ type: 'MENU_ITEMS_FOR_POS_LOADED', payload: menuItems });

    return menuItems;
  } catch (error) {
    console.error('Error loading menu for POS:', error);
    // Optional: dispatch({ type: 'MENU_ITEMS_LOAD_FAIL', error });
    return [];
  }
};


export const addTicketOrders = async (
  provider,
  posAddress,
  posAbi,
  ticketId,
  items, // array of { cost, name } to be appended
  dispatch
) => {
  try {
    const signer = await provider.getSigner();
    const posContract = new ethers.Contract(posAddress, POS_ABI, signer);
    const tx = await posContract.addTicketOrders(ticketId, items);
    await tx.wait();

    // Optionally reload the updated ticket...
    // await loadAllTicketsForPOS(provider, posAddress, posAbi, dispatch);

    dispatch({ type: 'ADD_TICKET_ORDERS_SUCCESS' });
  } catch (error) {
    console.error('Error adding orders:', error);
    dispatch({ type: 'ADD_TICKET_ORDERS_FAIL', error });
  }
};

export const loadFullTicketDetails = async (
  provider,
  posAddress,
  posAbi,
  ticketId,
  dispatch
) => {
  try {
    const signer = await provider.getSigner();
    const posContract = new ethers.Contract(posAddress, POS_ABI, signer);

    // Grab the entire ticket struct from the contract
    const ticketStruct = await posContract.getTicket(ticketId);
    // ticketStruct -> { name, orders[], server, id, paid }

    // Convert orders[] from contract (cost in wei) to a friendlier JS array
    const orders = [];
    for (let i = 0; i < ticketStruct.orders.length; i++) {
      const orderItem = ticketStruct.orders[i];
      orders.push({
        name: orderItem.name,
        cost: Number(ethers.formatEther(orderItem.cost)),
      });
    }

    const fullTicket = {
      id: Number(ticketStruct.id).toString(),
      name: ticketStruct.name,
      server: ticketStruct.server,
      paid: ticketStruct.paid,
      posAddress,
      orders
    };

    // Dispatch so Redux knows about the fully detailed ticket
    dispatch({ type: 'ACTIVE_TICKET_DETAILS_LOADED', payload: fullTicket });
  } catch (error) {
    console.error('Error loading full ticket details:', error);
    dispatch({ type: 'ACTIVE_TICKET_DETAILS_FAIL', error });
  }
};

export const bufferItemForTicket = (ticketId, item) => {
  return (dispatch) => {
    dispatch({
      type: 'ADD_ITEM_TO_PENDING_BUFFER',
      payload: { ticketId, item }
    });
  };
};

// 2) A function that *rings* all buffered items for a given ticketId
//    by calling `addTicketOrders` in the POS contract.

export const ringBufferedItems = async (
  provider,
  posAddress,
  pendingOrderBuffer,
  posAbi,
  ticketId,       // could be a number or string
  dispatch,
  getState
) => {
  try {
    const stringId = ticketId.toString()

    // Get the entire pending buffer
   
    const itemsToRing = pendingOrderBuffer[stringId] || []

    if (itemsToRing.length === 0) {
      console.log('No items to ring for this ticket.')
      return
    }

    // Format them for the contract
    const rungItems = itemsToRing.map((item) => ({
      cost: ethers.parseUnits(item.cost.toString(), 'ether'),
      name: item.name
    }))

    const signer = await provider.getSigner()
    const posContract = new ethers.Contract(posAddress, posAbi, signer)

    // Send transaction
    console.log('fun')
    const tx = await posContract.addTicketOrders(ticketId, rungItems)
    await tx.wait()
    console.log('fun')

    // Now tell Redux we succeeded
    dispatch({
      type: 'ORDER_RING_SUCCESS',
      payload: { 
        ticketId: ticketId,  // pass a string
        rungItems: itemsToRing
      }

    })
      
    console.log(`Successfully rang items for ticket: ${stringId}`)
  } catch (error) {
    console.error('Error in ringBufferedItems:', error)
  }
}
export const clockInEmployee = async (provider, contractAddress, abi, employeeId) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.clockIn(employeeId);
  await tx.wait();
};

export const clockOutEmployee = async (provider, contractAddress, abi, employeeId) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.clockOut(employeeId);
  await tx.wait();
};


// In store/interactions.js

// store/interactions.js
export const fetchEmployeeStatusFromServer =
  ({ signer, contractAddress, abi, jobName }) =>
  async (dispatch, getState) => {
    try {
      // 1) The public address of the user
      const userAddress = await signer.getAddress();

      // 2) Build the payload
      const payload = {
        contractAddress,
        userAddress,
        abi,
        jobName
      };

      // 3) POST to your custom route
      const response = await fetch('/api/employeeStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      // 4) Dispatch if you want to store in Redux
      dispatch({ type: 'EMPLOYEE_STATUS_FROM_SERVER', payload: data });
    } catch (error) {
      console.error('Error in fetchEmployeeStatusFromServer:', error);
      dispatch({ type: 'EMPLOYEE_STATUS_FROM_SERVER_ERROR', error });
    }
  };
