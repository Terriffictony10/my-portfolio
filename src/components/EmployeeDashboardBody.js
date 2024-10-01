import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers';
import Loading from "../components/Loading.js";

import { 
loadProvider, 
loadAccount
} from '../store/interactions'

import Image from 'next/image';

import { useRouter } from 'next/router';

function EmployeeDashboardBody({ onclick2, onclick3}) {

  const dispatch = useDispatch()
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = await loadProvider(dispatch)
      setProvider(provider);

      const account = await loadAccount(provider, dispatch)
      setAccount(account);
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
};

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [loadBlockchainData, isLoading]);

 
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
        <p className="DashboardAccount">
          <strong className="account-label">Account : </strong>
          {account ? account : "No account connected"}
        </p>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboardBody;
