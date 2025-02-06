import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Container } from 'react-bootstrap';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers'
import Image from 'next/image';
import { Row } from 'react-bootstrap'
import RestaurantSelectionDashboardBody from "../components/RestaurantSelectionDashboardBody.js"
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
import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
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

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  let dispatch, Factory
  dispatch = useDispatch()
  const [myprovider, setProvider] = useState(null);
  const [factory, setFactory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newRestaurantName, setNewRestaurantName] = useState('')
  const [myRestaurants, setMyRestaurants] = useState('')
  const [newRestaurantLiquidity, setNewRestaurantLiquidity] = useState(0)
  const [cost] = useState(0); // Hardcoded cost for creating a restaurant (0.03 ETH)
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

  const addNewRestaurant = async (e, _factory, name, liquidity) => {
    e.preventDefault();
    
    // Add the hardcoded cost to the liquidity (cost + liquidity)
    const totalAmount = liquidity + cost;

    createNewRestaurant(ethersSigner, _factory, name, totalAmount.toString(), dispatch);
    const _Background = document.querySelector('.newRestaurantForm');
    _Background.style.zIndex = '-1';
    const _Form = document.querySelector('.newRestaurantFormContainer');
    _Form.style.zIndex = '-2';
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

  // Detect when screen size changes and reset the inline styles
  useEffect(() => {
    if(isConnected && ethersSigner && ethersProvider){
    const loadProvider = async () => {
      
        try {
          const { provider, address} = await ethersSigner;
          setProvider(provider);
          const account = await loadAccount(provider, dispatch);
          const chainId = await loadNetwork(provider, dispatch);
          
          const Factory = await loadFactory(
            ethersSigner,
            config[chainId].decentratalityServiceFactory.address,
            dispatch
          );
          
          setFactory(Factory);

          const Restaurants = await loadAllRestaurants(ethersSigner, Factory, dispatch);
          const myRestaurants = await loadMyRestaurants(provider, account, Restaurants, dispatch);

          setMyRestaurants(myRestaurants);
          subscribeToEvents(Factory, dispatch);
        } catch (error) {
          console.error("Error loading blockchain data:", error.message);
        } finally {
          setIsLoading(false);
        }
      }
      loadProvider();
    }
        
        
      
      

    
    
  
    

     // Call once without adding to dependencies to prevent re-renders

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
  }, [ethersSigner]); // 

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
          <form onSubmit={(e) => addNewRestaurant(e, factory, newRestaurantName, ((newRestaurantLiquidity) * (10 ** 18)))}>
            <p>
              <input 
                type="text" 
                id="name" 
                placeholder="Enter the name of your new Restaurant" 
                value={newRestaurantName === '' ? "" : newRestaurantName}
                onChange={(e) => newRestaurantNameHandler(e)}
              />
            </p>
            <p>
              <input 
                type="number" 
                id="liquidity" 
                placeholder="Enter the starting liquidity for your new Restaurant" 
                value={newRestaurantLiquidity === '' ? "" : newRestaurantLiquidity}
                onChange={(e) => newRestaurantLiquidityHandler(e)}
              />
            </p>
            <p>
              <span>Cost Per Restaurant: 0.03 ETH / $100 USD</span> {/* Displaying the hardcoded cost */}
            </p>
            <button className="button" type="submit">
              Create New Restaurant
            </button>
          </form>
        </div>
      </div>
      <div width={250} height={250} onClick={navigateToIndex} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Image
          src="/Decentralized.png" 
          alt="Decentralized Image" 
          width={250}   
          height={250}  
          style={{ position: 'relative', top: 0, left: 0 }} 
          priority={true}  
        />
      </div>
      <div className="DashboardBackground">
        <button  style={{ position: 'absolute', top: '21%', left: '72%', transform: 'translate(-50%, -50%)' }} className="addNewRestaurantButtonAlreadyOwnOne" onClick={newRestaurantPopupHandler}>
            new Restaurant
        </button>
        <Row style={{ position: 'absolute', top: '21%', left: '50%', transform: 'translate(-50%, -50%)' }}> 
          Your Restaurants 
        </Row>
      
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
