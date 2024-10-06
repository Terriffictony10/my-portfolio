import { ethers } from 'ethers'
import RESTAURANT_ABI from "../abis/Restaurant"
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
        
        const contract = await new ethers.Contract(myRestaurants[i][0], RESTAURANT_ABI.abi, user)
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
    const abi = RESTAURANT_ABI.abi
    const contract = await new ethers.Contract(contractAddress, abi, user)
    const name = await contract.name()
    const myCash = await provider.getBalance(contractAddress)
    const cash = Number(myCash).toString()

    dispatch({ type: 'DASHBOARD_RESTAURANT_LOADED', contractAddress, abi, name, cash })

    return contract
    
}
export const addJob = async (provider, dispatch, contractAddress, jobName, jobWage ) => {
    const user = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, RESTAURANT_ABI.abi, user)
    await contract.addJob(jobWage, jobName)
}
