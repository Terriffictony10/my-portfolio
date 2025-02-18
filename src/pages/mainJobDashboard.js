import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Image from 'next/image';
import { useProvider } from '../context/ProviderContext';

// Import your actions
import {
  loadEmployeeRelevantPOS,
  clockInEmployee,
  clockOutEmployee
} from '../store/interactions';

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


export default function EmployeePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });

  // 1) Grab user address, plus contract from Redux
  const userAddress = useSelector((state) => state.provider.account);
  
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);

  const restaurantAddress = dashboardRestaurant.contractAddress;
  const restaurantAbi = dashboardRestaurant.abi;

  // ----- CLOCK-IN STATE -----
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null); // a JS timestamp in ms
  const [clockedInDuration, setClockedInDuration] = useState(0);
  const clockIntervalRef = useRef(null);

  // ***************************
  // 2) On page load, once we have userAddress, contract, and ABI, fetch chain status
  // ***************************
  useEffect(() => {
    if (!userAddress || !restaurantAddress || !restaurantAbi) return;

    async function fetchChainStatus() {
      try {
        // POST to /api/employeeStatus
        const res = await fetch('/api/employeeStatus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAddress,
            contractAddress: restaurantAddress,
            abi: restaurantAbi
          }),
        });
        const data = await res.json();

        if (data.isClockedIn) {
          // The contract says user is clocked in
          // data.clockInTime is a "block.timestamp" in seconds
          // Convert to ms
          const blockTimeMs = data.clockInTime * 1000;

          setIsClockedIn(true);
          setClockInTime(blockTimeMs);

          // If you want to set an initial "clockedInDuration" right away:
          if (data.shiftSeconds) {
            setClockedInDuration(data.shiftSeconds);
          }
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
          setClockedInDuration(0);
        }
      } catch (error) {
        console.error('Error fetching chain status:', error);
      }
    }

    fetchChainStatus();
  }, [userAddress, restaurantAddress, restaurantAbi]);

  // ***************************
  // 3) Start an interval if clocked in
  // ***************************
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      clockIntervalRef.current = setInterval(() => {
        const nowMs = Date.now();
        // difference in seconds
        const diff = Math.floor((nowMs - clockInTime) / 1000);
        setClockedInDuration(diff);
      }, 1000);
    } else {
      // Clear interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      setClockedInDuration(0);
    }

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, [isClockedIn, clockInTime]);

  // ***************************
  // 4) Once loaded, optionally load relevant POS, etc.
  // ***************************
  useEffect(() => {
    if (!restaurantAddress) return;
    if(isConnected && ethersSigner){
      
      loadEmployeeRelevantPOS(ethersSigner, restaurantAddress, dispatch);
    }
  }, [restaurantAddress, dispatch]);

  // Utility: Save local changes to your own API, if needed
  const persistClockStatus = async (currentIsClockedIn, currentClockInTime) => {
    // only do this if you have a route expecting these fields
    // or you can remove this altogether if your chain is the only source of truth
    try {
      await fetch('/api/employeeStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          contractAddress: restaurantAddress,
          abi: restaurantAbi,
          // plus your local fields:
          isClockedIn: currentIsClockedIn,
          clockInTime: currentClockInTime,
        }),
      });
    } catch (error) {
      console.error('Error persisting clock-in status to API:', error);
    }
  };

  // ----- HANDLERS -----
  const handleOpenPOS = () => {
    
    router.push('/POSterminal');
    loadEmployeeRelevantPOS(ethersSigner, restaurantAddress, dispatch);
  };

  const navigateToIndex = () => router.push('/');
  const navigateToDashboard = () => router.push('/Dashboard');

  // Clock in/out
  const handleClockButton = async () => {
    

    try {
      if (!isClockedIn) {
        // Clock in on-chain
        await clockInEmployee(ethersSigner, restaurantAddress, restaurantAbi, 1); // or find employeeId

        const nowMs = Date.now();
        setIsClockedIn(true);
        setClockInTime(nowMs);

        // Optionally persist to your API
        persistClockStatus(true, nowMs);
      } else {
        // Clock out on-chain
        await clockOutEmployee(ethersSigner, restaurantAddress, restaurantAbi, 1); // or find employeeId

        setIsClockedIn(false);
        setClockInTime(null);
        setClockedInDuration(0);

        // Optionally persist to your API
        persistClockStatus(false, null);
      }
    } catch (error) {
      console.error('Clock in/out error:', error);
    }
  };

  const formatDuration = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Render
  return (
    <div
      className="BlueBackground"
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    >
      {/* Logo */}
      <div
        width={250}
        height={250}
        onClick={navigateToIndex}
        style={{ position: 'absolute', top: 0, left: 0, cursor: 'pointer' }}
      >
        <Image
          src="/Decentralized.png"
          alt="Decentralized Logo"
          width={250}
          height={250}
          priority
        />
      </div>

      {/* Page Content */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          display: 'grid',
          gridTemplateAreas: `
            "hours schedule"
            "info pos"
            "clockin clockin"
          `,
          gridTemplateColumns: '2fr 1fr',
          gridGap: '20px',
          padding: '40px',
        }}
      >
        {/* Employee Hours Box */}
        <div
          style={{
            gridArea: 'hours',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #fff',
            borderRadius: '10px',
            padding: '20px',
            minHeight: '150px',
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Hours</h3>
          <p style={{ color: '#aaa' }}>
            A table or list of shifts could go here.
          </p>
        </div>

        {/* Employee Schedule Box */}
        <div
          style={{
            gridArea: 'schedule',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #fff',
            borderRadius: '10px',
            padding: '20px',
            minHeight: '150px',
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Schedule</h3>
          <p style={{ color: '#aaa' }}>
            Upcoming shifts, if any, appear here.
          </p>
        </div>

        {/* Employee Info Box */}
        <div
          style={{
            gridArea: 'info',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #fff',
            borderRadius: '10px',
            padding: '20px',
            minHeight: '150px',
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Info</h3>
          <p style={{ color: '#aaa' }}>
            General employee info, e.g. name, job title, etc.
          </p>
        </div>

        {/* Open POS Button */}
        <div
          style={{
            gridArea: 'pos',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #fff',
            borderRadius: '10px',
            padding: '20px',
            minHeight: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleOpenPOS}
            style={{
              backgroundColor: '#17a2b8',
              border: 'none',
              color: '#fff',
              padding: '15px 30px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Open POS
          </button>
        </div>

        {/* Clock In/Out Box */}
        <div
          style={{
            gridArea: 'clockin',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleClockButton}
            style={{
              backgroundColor: isClockedIn ? '#dc3545' : '#28a745',
              color: '#fff',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '1rem',
            }}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>

          {isClockedIn && (
            <div style={{ color: 'white', fontSize: '1.1rem' }}>
              You have been clocked in for: {formatDuration(clockedInDuration)}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        className="RestaurantSelectorHomeButtons"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={navigateToIndex}
          style={{
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '5px',
            color: '#fff',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Go to Main Page
        </button>
        <button
          onClick={navigateToDashboard}
          style={{
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '5px',
            color: '#fff',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Go Back to Main Dashboard
        </button>
      </div>
    </div>
  );
}
