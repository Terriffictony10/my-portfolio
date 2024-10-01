import { ethers } from 'ethers'
import DECENTRATALITYSERVICEFACTORY_ABI from "../abis/decentratalityServiceFactory.json"
export const loadProvider = (dispatch) => {
	const connection = new ethers.BrowserProvider(window.ethereum);
    dispatch({ type: 'PROVIDER_LOADED', connection })

    return connection
}
export const loadAccount = async (provider, dispatch) => {
	const accounts = await provider.send("eth_requestAccounts", []);
	const account = ethers.getAddress(accounts[0])

    dispatch({ type: 'ACCOUNT_LOADED', account})

    return account
}
export const loadNetwork = async (provider, dispatch) => {
    let { chainId } = await provider.getNetwork()
    chainId = Number(chainId)
    dispatch({ type: 'NETWORK_LOADED', chainId })

    return chainId
}
export const subscribeToEvents = async (restaurantFactory, dispatch) => {
        restaurantFactory.on('RestaurantCreated', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const restaurant = event.args
        dispatch({ type: 'NEW_RESTAURANT_CREATION_SUCCESS', restaurant, event })
    })
    
}
export const loadFactory = async (provider, address, dispatch) => {
    const decentratalityServiceFactory = new ethers.Contract(address, DECENTRATALITYSERVICEFACTORY_ABI.abi, provider);
    dispatch({ type: 'DECENTRATALITY_SERVICE_FACTORY_LOADED', decentratalityServiceFactory })
    return decentratalityServiceFactory
}
export const loadAllRestaurants = async (provider, factory, dispatch) => {

    const block = await provider.getBlockNumber()

    const restaurantStream = await factory.queryFilter('RestaurantCreated', 0, block)
    const Restaurants = restaurantStream.map(event => event.args)

    dispatch({ type: 'All_RESTAURANTS_LOADED', Restaurants })

    return Restaurants
}
export const loadMyRestaurants = async (provider, user, Restaurants, dispatch) => {
    let myRestaurants = []
    for(let i = 0; i < Restaurants.length(); i++){
        if(Restaurants[i][2] == user){
            myRestaurants.push(Restaurants[i])
        }
    }

    dispatch({ type: 'MY_RESTAURANTS_LOADED', myRestaurants })
    return myRestaurants
}
export const createNewRestaurant = async (provider, factory, restaurantName, restaurantLiquidity, dispatch) => {

    const user = provider.getSigner()
    const balance = provider.getBalance(user)
    try{
        if(Number(balance) >= restaurantLiquidity){
        const newRestaurant = factory.connect(user).createRestaurant(restaurantName, restaurantLiquidity, { value: restaurantLiquidity })
        dispatch({ type: 'RESTAURANT_CREATION_REQUEST', myRestaurants })
        }
        else {

        }
    }catch(error){
        dispatch({ type: "RESTAURANT_CREATION_FAIL"})
    }
    return myRestaurants
}