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
createNewRestaurant
} from '../store/interactions'

import Image from 'next/image';

import { useRouter } from 'next/router';
import config from '../config.json'

function RestaurantSelectionDashboardBody({ onclick, fun }) {

  const dispatch = useDispatch()
  const [provider, setProvider] = useState(null);
  const [myRestaurants, setMyRestaurants] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const account = useSelector(state => state.provider.account)


  const loadBlockchainData = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = await loadProvider(dispatch)
        setProvider(provider);

        const chainId = await loadNetwork(provider, dispatch)
        const Factory = await loadFactory(provider, config[chainId].decentratalityServiceFactory.address, dispatch)
        const Restaurants = await loadAllRestaurants(provider, Factory, dispatch)
        const myRestaurants = await loadMyRestaurants(provider, account, Restaurants, dispatch)
        console.log(myRestaurants)
        setMyRestaurants(myRestaurants)
        subscribeToEvents(Factory, dispatch)
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


  }, [loadBlockchainData, isLoading, dispatch, provider]);

 
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
          <p className="DashboardAccount">
            <strong className="account-label">Account : </strong>
            {account ? account : 'no account detected'}
          </p>
          </div>
          <div className="fullFlexCenter">
            <div className="RestaurantSelectorDashboardFrame">
              { ((myRestaurants) ? ((myRestaurants.length() > 0) ? (
                <div >
                  
                </div>
              ) : (
                (<div >
                  
                </div>)
              )) : (
                <div className="newRestaurantButton" onClick={onclick}>

                  <Image
                    src="/newRestaurant.png" 
                    alt="new Restaurant Image" 
                    width={250}   // Replace with actual width
                    height={250}  // Replace with actual height
                    style={{ position: 'relative', top: 0, left: 0 }} 
                    priority={true}  // Adds priority to improve page load speed
                  />
                  <div>
                    Add New Restaurant
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantSelectionDashboardBody;
