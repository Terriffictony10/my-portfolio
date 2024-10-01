import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'
import Image from 'next/image';

import RestaurantSelectionDashboardBody from "../components/RestaurantSelectionDashboardBody.js"

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
import config from '../config.json'

export default function Home() {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true);
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const [newRestaurantLiquidity, setNewRestaurantLiquidity] = useState(null)
  const router = useRouter();
  const showSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const menu = document.querySelector('.menu');
    sidebar.style.display = 'flex';
    menu.style.display = 'hidden'; 
  };

  const hideSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const menu = document.querySelector('.menu');
    sidebar.style.display = 'none';
    menu.style.display = 'flex';
  };
  const addNewRestaurant = (e, factory, name, liquidity) => {
    e.preventDefault()

    createNewRestaurant(provider, factory, name, liquidity, dispatch)
  }

  const newRestaurantPopupHandler = (e) => {
    const _Background = document.querySelector('.newRestaurantForm');
    _Background.style.zIndex = '500';
    const _Form = document.querySelector('.newRestaurantFormContainer');
     _Form.style.zIndex = '501';

  }
  const newRestaurantNameHandler = (e) => {
    setNewRestaurantName(e.target.value)
    
  }
  const newRestaurantLiquidityHandler = (e) => {
    setNewRestaurantLiquidity(e.target.value)
    
  }

   const loadBlockchainData = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = await loadProvider(dispatch)

        loadAccount(provider, dispatch)
        
        const chainId = await loadNetwork(provider, dispatch)
        const Factory = await loadFactory(provider, config[chainId].decentratalityServiceFactory.address, dispatch)
        const Restaurants = await loadAllRestaurants(provider, Factory, dispatch)
        const myRestaurants = await loadMyRestaurants(provider, account, Restaurants, dispatch)
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
        // Handle case where MetaMask isn't available
      setIsLoading(false);
    }
  };

  // Detect when screen size changes and reset the inline styles
  useEffect(() => {

    if (isLoading) {
      loadBlockchainData();
    }

    const handleResize = () => {
      const menu = document.querySelector('.menu');
      if (window.innerWidth > 800) {
        menu.style.display = ''; // Reset inline style to let CSS handle it
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading]);

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
      <div className="newRestaurantForm">
        <div className="newRestaurantFormContainer">
          <form onSubmit={(e) => addNewRestaurant(e, factory, newRestaurantName, liquidity)}>
            <li>
            <input 
            type="text" 
            id='name' 
            placeholder='Enter the name of your new Restaurant' 
            value={newRestaurantName === '' ? "" : newRestaurantName}
            onChange={(e) => newRestaurantNameHandler(e)}/
            >
            </li>
            <li>
            <input 
            type="number" 
            id='liquidity' 
            placeholder='Enter the starting liquidity for your new Restaurant' 
            value={newRestaurantLiquidity === '' ? "" : newRestaurantLiquidity}
            onChange={(e) => newRestaurantLiquidityHandler(e)}/
            >
            </li>

            <button className='button' type='submit'>
              Create New Restaurant
            </button>
          </form>
        </div>
      </div>
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
      <RestaurantSelectionDashboardBody onclick={newRestaurantPopupHandler}/>
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
