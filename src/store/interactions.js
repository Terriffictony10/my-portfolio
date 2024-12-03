// src/store/interactions.js

import { ethers } from 'ethers'
import RESTAURANT_ABI from "../abis/Restaurant.json"
import DECENTRATALITYSERVICEFACTORY_ABI from "../abis/decentratalityServiceFactory.json"
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
    let Restaurants, Restaurant, RestaurantsRaw
    Restaurant = []
    Restaurants = []
    const block = await provider.getBlockNumber()

    const restaurantStream = await factory.queryFilter('RestaurantCreated', 0, block)
    RestaurantsRaw = restaurantStream.map(event => event.args)

    if(GlobalRestaurants.length == 0){
        for (let i = 0; i < RestaurantsRaw.length; i++) {
            let restaurant = RestaurantsRaw[i];
                
            for (let key in restaurant) {
                if(typeof restaurant[key] === 'bigint'){
                    Restaurant.push(Number(restaurant[key]))
                } else {
                    Restaurant.push(restaurant[key])
                }

                
            }
            Restaurants.push(Restaurant)
            Restaurant = []
        }        
    }
    GlobalRestaurants = Restaurants
    
    
    for (let i = GlobalRestaurants.length; i < Restaurants.length - 1; i++) {
        
                let restaurant = RestaurantsRaw[i];
                
                for (let key in restaurant) {
                    if(typeof restaurant[key] === 'bigint'){
                       Restaurant.push(Number(restaurant[key]))
                    } else {
                       Restaurant.push(restaurant[key])
                    }

                    
                }
                Restaurants.push(Restaurant)
                Restaurant = []
    }

    
    GlobalRestaurants = Restaurants
    
    
    dispatch({ type: 'All_RESTAURANTS_LOADED', Restaurants })

    

    return Restaurants
}
export const loadMyRestaurants = async (provider, user, Restaurants, dispatch) => {
    
    let myRestaurants = []
    for(let i = 0; i < Restaurants.length; i++){
        if(Restaurants[i][2] == user){
            myRestaurants.push(Restaurants[i])
        }
    }
    if(myRestaurants.length == 0) {
        return
    }
    dispatch({ type: 'MY_RESTAURANTS_LOADED', myRestaurants })
    return myRestaurants
}
export const decorateMyRestaurants = async (provider, myRestaurants) => {
    const user = await provider.getSigner()
    const decoratedRestaurants = []
    try{
    for(let i = 0; i < myRestaurants.length; i++) {
        
        const contract = await new ethers.Contract(myRestaurants[i][0], RESTAURANT_ABI, user)
        const name = await contract.name()
        const cash = Number(await provider.getBalance(contract.target))

        // Create a new object instead of mutating the existing one
        const decoratedRestaurant = {
            ...myRestaurants[i],
            name,
            cash
        }

        decoratedRestaurants.push(decoratedRestaurant)
    }
}catch(error){
    console.log(error)
}
    return decoratedRestaurants

}
export const createNewRestaurant = async (provider, factory, restaurantName, restaurantLiquidity, dispatch) => {
    let newRestaurant
    const user = await provider.getSigner()
    const balance = await provider.getBalance(user)
    try{
        
        if(Number(balance) >= restaurantLiquidity){
        newRestaurant = await factory.createRestaurant(restaurantName, restaurantLiquidity, { value: restaurantLiquidity })
        dispatch({ type: 'RESTAURANT_CREATION_REQUEST', myRestaurants })
        }
        else {
            console.log("welp")
        }
        
    }catch(error){
        dispatch({ type: "RESTAURANT_CREATION_FAIL"})
    }
    return newRestaurant
}
export const loadDashboardRestaurantContractData = async (provider, Restaurant, dispatch) => {
    const user = await provider.getSigner()
    const contractAddress = Restaurant[0]
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
      dispatch({ type: 'POS_CREATED', pos: { id: posId, address: posAddress, name } });
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
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Fetch the array of POS IDs
    const posIds = await contract.POSIds();

    const posArray = [];
    for (let i = 0; i < posIds.length; i++) {
      const posId = Number(posIds[i]);
      const posAddress = await contract.POSMapping(posId);

      posArray.push({
        id: posId.toString(),
        address: posAddress,
      });
    }

    // Dispatch action to update POS in Redux store
    dispatch({ type: 'POS_LOADED', posArray });
  } catch (error) {
    console.error('Error in loadAllPOS:', error);
  }
};