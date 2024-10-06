const DEFAULT_DASHBOARD_RESTAURANTS_STATE = {
	loaded: false,
	contractAddress: null,
    abi: null, 
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
	posCreationInProgress: false,
	events: []
}
export const DashboardRestaurant = (state = DEFAULT_DASHBOARD_RESTAURANTS_STATE, action) => {
	switch (action.type) {
		case 'DASHBOARD_RESTAURANT_LOADED':
			return {
				...state,
				loaded: true,
				contractAddress: action.contractAddress,
                abi: action.abi,
                name: action.name,
                cash: action.cash

			}
		case 'NEW_JOB':
			return {
				...state,
				allJobs : {
					loaded: false,
					data: [
						...state.allJobs.data,
						action.job
						]
				}

			}
		
		default:
			return state    
	}
}