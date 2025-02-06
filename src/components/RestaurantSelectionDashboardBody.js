import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
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
  loadDashboardRestaurantContractData
} from '../store/interactions';
import Image from 'next/image';
import { useRouter } from 'next/router';
import config from '../config.json';
import { useProvider } from '../context/ProviderContext';

import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';


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

function RestaurantSelectionDashboardBody({ onclick, fun }) {

  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const dispatch = useDispatch();
  const [myprovider, setProvider] = useState(null);
  const [myRestaurants, setMyRestaurants] = useState(null);
  const [dashboardRestaurant, setDashboardRestaurant] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const account = useSelector(state => state.provider.account);
  const router = useRouter();
  
  const toRestaurantDashHandler = async (e, restaurant, myRestaurants) => {
    e.preventDefault();
    router.push('/mainRestaurantDashboard');
    
    await setDashboardRestaurant(restaurant);
    await loadDashboardRestaurantContractData(ethersSigner, restaurant, dispatch);
  };

  const loadBlockchainData = async () => {
    if (isConnected && ethersSigner && ethersProvider) {
      try {
        const { provider, address} = await ethersSigner;
        
        setProvider(provider);
        const chainId = await loadNetwork(provider, dispatch);
        const Factory = await loadFactory(
          ethersSigner,
          config[chainId].decentratalityServiceFactory.address,
          dispatch
        );

        const Restaurants = await loadAllRestaurants(ethersSigner, Factory, dispatch);


        const myRestaurants = await loadMyRestaurants(
          ethersProvider,
          address,
          Restaurants,
          dispatch
        );
        
        const myDecoratedRestaurants = await decorateMyRestaurants(
          ethersSigner,
          myRestaurants, 
        );
        setMyRestaurants(myDecoratedRestaurants);
        subscribeToEvents(Factory, dispatch);
      } catch (error) {
        console.error("Error loading blockchain data:", error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("MetaMask not detected");
      
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadBlockchainData();
    }
  }, [isLoading, ethersSigner]);

 
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
            
              { ((myRestaurants && myRestaurants.length > 0) ? (
              <div className="RestaurantSelectorDashboardFrameRestaurants">
                {myRestaurants.map((restaurant, i) => (
                  <div key={i} className="restaurantButton" onClick={(e) => toRestaurantDashHandler(e, restaurant, myRestaurants)}>
                    <p>{restaurant.name}</p>
                    <p>{Number(restaurant.cash) / (10 ** 18)} ETH</p>
                  </div>
                ))}
              </div>
              ) : (
              <div className="RestaurantSelectorDashboardFrame">
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
              </div>
              ))}
            
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantSelectionDashboardBody;
