const DEFAULT_RESTAURANTS_STATE = {
	loaded: false,
	contract: {},  
	transaction: {
		isSuccessful: false
	},
	allRestaurants: {
		loaded: false,
		data: []
	},
	restaurantCreationInProgress: false,
	events: []
}
export const Restaurants = (state = DEFAULT_RESTAURANTS_STATE, action) => {
	switch (action.type) {
		case 'DECENTRATALITY_SERVICE_FACTORY_LOADED':
			return {
				...state,
				loaded: true,
				contract: action.decentratalityServiceFactory
			}
		case 'All_RESTAURANTS_LOADED':
			return {
				...state,
				allRestaurants: {
					loaded: true,
					data : [
						action.Restaurants
						]
				}
			}
		case 'MY_RESTAURANTS_LOADED':
			return {
				...state,
				myRestaurants: action.myRestaurants
			}
		case 'NEW_RESTAURANT_CREATION_SUCCESS':
			return {
				...state,
				myRestaurants: [
					...myRestaurants,
					action.restaurant
				],
				events: [
					...events,
					action.event
				]
			}
		case 'RESTAURANT_CREATION_REQUEST':
			return{
				...state,
				transaction: {
					transactionType: 'NewRestaurant',
					isPending: true,
					isSuccessful: false
				},
				restaurantCreationInProgress: true
			}
		case 'RESTAURANT_CREATION_FAIL':
			return{
				...state,
				transaction: {
					transactionType: 'newRestaurant',
					isPending: false,
					isSuccessful: false,
					isError: true
				},
				restaurantCreationInProgress: false
			}
		
		default:
			return state    
	}
}