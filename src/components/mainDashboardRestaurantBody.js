import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers';
import Loading from "../components/Loading.js";

import { 
loadProvider, 
loadAccount,
loadNetwork,
loadFactory,
loadAllRestaurants,
loadMyRestaurants,
subscribeToEvents,
createNewRestaurant,
decorateMyRestaurants,
loadDashboardRestaurantContractData,
reloadRestaurantData
} from '../store/interactions'


import Image from 'next/image';

import { useRouter } from 'next/router';
import config from '../config.json'
import { useProvider } from '../context/ProviderContext';

function MainDashboardRestaurantBody() {
  const { provider, setProvider } = useProvider();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contract, setContract] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantCash, setRestaurantCash] = useState('');
  const account = useSelector(state => state.provider.account)
  const name = useSelector(state => state.DashboardRestaurant.name)
  
  const cash = useSelector(state => state.DashboardRestaurant.cash)
  const restaurant = useSelector(state => state.DashboardRestaurant.restaurant)
  const index = useSelector(state => state.Restaurants.indexOfDashRestaurant)
  
  const dispatch = useDispatch()
  
  const router = useRouter();

  
  

 const loadBlockchainData = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        const myaccount = await loadAccount(ethersProvider, dispatch)
        const chainId = await loadNetwork(ethersProvider, dispatch)
        const Factory = await loadFactory(ethersProvider, config[chainId].decentratalityServiceFactory.address, dispatch)
        const Restaurants = await loadAllRestaurants(ethersProvider, Factory, dispatch)
       
        const myRestaurants = await loadMyRestaurants(ethersProvider, myaccount, Restaurants, dispatch)
        const myDecoratedRestaurants = await decorateMyRestaurants(ethersProvider, myRestaurants)
        await loadDashboardRestaurantContractData(ethersProvider, MyRestaurants[index], dispatch)
          
        
      } catch (error) {
        console.error("Error loading blockchain data:", error.message);
          // In case of error, set account to null
      } finally {
        setIsLoading(false); // Ensure loading ends
      }
    } else {
      console.error("MetaMask not detected");
      setAccount(null);  // Handle case where MetaMask isn't available
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }


  }, [ isLoading. name, cash]);

 
  const navigateToCrowdsale = () => {
    router.push('/Crowdsale');
  };
  const navigateToIndex = () => {
   router.push('/');
  };

  const navigateToNFT = () => {
    router.push('/NFT');
  };
  const navigateToDemo = () => {
    router.push('/Demo');
  };
  const navigateToDashboard = () => {
    router.push('/Dashboard');
  };
   const navigateToRestaurantDashboard = () => {
    router.push('/RestaurantDashboard');
  };
  const navigateToEmployeeDashboard = () => {
    router.push('/EmployeeDashboard');
  };

  return (
    <div> 
      {isLoading ? <Loading /> : (
        <div>
          <div>
          <p className="MainDashboardAccount">
           <strong className="account-label">Account : </strong>
            {account ? account : 'no account detected'}
          </p>
          <div  className="MainDashboardRestaurantBox">
            <div className="restaurant-text">
            Restaurant Data
            </div>
            <div className="MainDashboardRestaurantDataBox">
              <p>
               <strong className="account-label"> Name : </strong>
               {name ? name : 'no name found'}
              </p>
              <p>
               <strong className="account-label"> Cash : </strong>
               {cash ? (cash / (10 ** 18)) : 'no cash found'} ETH
              </p>
            </div>
          </div>
          </div>
        </div>
        )}
    </div>
  );
}

export default MainDashboardRestaurantBody;
