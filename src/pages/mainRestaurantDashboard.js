import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'
import Image from 'next/image';

import MainDashboardRestaurantBody from "../components/mainDashboardRestaurantBody.js"
import Loading from "../components/Loading.js"
import DECENTRATALITYSERVICEFACTORY_ABI from "../abis/decentratalityServiceFactory.json"
import { useRouter } from 'next/router';
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
import { useProvider } from '../context/ProviderContext';
import config from '../config.json'

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    
  }, []);

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
  <div className="BlueBackground">

    <div width={250} height={250} onClick={navigateToIndex} style={{ position: 'absolute', top: 0, left: 0 }}  >
        <Image

          src="/Decentralized.png" 
          alt="Decentralized Image" 
          width={250}   // Replace with actual width
          height={250}  // Replace with actual height
          style={{ position: 'relative', top: 0, left: 0 }} 
          priority={true}  // Adds priority to improve page load speed
        />
      </div>
    
    <div className="DashboardBackground">
     <MainDashboardRestaurantBody />

        <div className="RestaurantSelectorHomeButtons">
          <button className="clean-button-home-RestaurantSelector" onClick={navigateToIndex}>
            go to decentratality main page
          </button>
          <button className="clean-button-home-Dashboard" onClick={navigateToDashboard}>
            go back to main dashboard
          </button>
        </div>
    </div> 
  </div>
);

}
