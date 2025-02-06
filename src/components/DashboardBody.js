import { useEffect, useState, useMemo } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Loading from "../components/Loading.js";

import Image from 'next/image';

import { useRouter } from 'next/router';
import { useAppKitAccount } from '@reown/appkit/react'
import { Configure, useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Use the RPC URL provided by the transport.
  // (Make sure your configuration passes a valid URL instead of defaulting to localhost)
  return new ethers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}
export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts && chain.contracts.ensRegistry ? chain.contracts.ensRegistry.address : undefined,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

function DashboardBody({ onclick2, onclick3}) {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAppKitAccount();

  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });


  

  useEffect(() => {
    const loadProvider = async () => {
    if (isConnected && ethersSigner && ethersProvider) {
      try {
        const { provider, address} = await ethersSigner;
      
      setProvider(provider);
      

     

      
      setAccount(address);
      
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
  }, [isConnected, ethersSigner]);

 
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
