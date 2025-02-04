import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Loading from "../components/Loading.js";

import Image from 'next/image';

import { useRouter } from 'next/router';
import { useAppKitAccount } from '@reown/appkit/react'

function DashboardBody({ onclick2, onclick3}) {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAppKitAccount();


  

  useEffect(() => {
    const loadProvider = async () => {
    if (isConnected) {
      try {

      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
      } else {
        console.error("No accounts found");
        setAccount(null);
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error.message);
      setAccount(null);  // In case of error, set account to null
    } finally {
      setIsLoading(false); // Ensure loading ends
    }
  } else {
    console.error("MetaMask not detected");
    setAccount(null);  // Handle case where MetaMask isn't available
    setIsLoading(false);
  }
    }
    loadProvider()
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
    <div>
 
      {isLoading ? <Loading /> : (
        <div>
        
        <div className='DashboardLoginContainer'>
          Login
        </div>
        
        <div className="DashboardButtonContainer">
        
        <button className="clean-button-red" onClick={onclick2}>
          As Restaurant Owner
        </button>
        <button className="clean-button-green" onClick={onclick3}>
          As Restaurant Employee
        </button>
        </div>
        <p className="DashboardAccount">
          <strong className="account-label">Account : </strong>
          {account ? account : "No account connected"}
        </p>
        </div>
      )}
    </div>
  );
}

export default DashboardBody;
