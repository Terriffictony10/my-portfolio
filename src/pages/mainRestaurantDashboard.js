// mainRestaurantDashboard.js

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
createNewRestaurant,
createNewJob
} from '../store/interactions'
import { useProvider } from '../context/ProviderContext';
import config from '../config.json'

export default function Home() {
  const dispatch = useDispatch()
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  const [newJobName, setNewJobName] = useState('')
  const [newJobWage, setNewJobWage] = useState('')

  const contractAddress = useSelector(state => state.DashboardRestaurant.contractAddress)
  const abi = useSelector(state => state.DashboardRestaurant.abi)
  

  const router = useRouter();
  
  const addNewJob = async (e, name, wage) => {
    e.preventDefault()
    createNewJob(provider, contractAddress, abi, name, wage, dispatch)  
    console.log('success')
    const _Background = document.querySelector('.newJobForm');
    _Background.style.zIndex = '-1';
    const _Form = document.querySelector('.newJobFormContainer');
     _Form.style.zIndex = '-2';  
  }

  const newJobNameHandler = (e) => {
    setNewJobName((e.target.value).toString())
    
  }
  const newJobWageHandler = (e) => {
    setNewJobWage((e.target.value).toString())
    
  }

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
    <div className="newJobForm">
        <div className="newJobFormContainer">
          <form onSubmit={(e) => addNewJob(e, newJobName, newJobWage)}>
            <p>
            <input 
            type="text" 
            id='name' 
            placeholder='Enter a name for the new Job' 
            value={newJobName === '' ? "" : newJobName}
            onChange={(e) => newJobNameHandler(e)}/
            >
            </p>
            <p>
            <input 
            type="number" 
            id='liquidity' 
            placeholder='Enter the wage of the new Job in ETH' 
            value={newJobWage === '' ? "" : newJobWage}
            onChange={(e) => newJobWageHandler(e)}/
            >
            </p>

            <button className='button' type='submit'>
              Create New Job
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
