import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';

import {
  loadAllJobs,
  fetchEmployeeStatusFromServer
} from '../store/interactions';

import EmployeeDashboardBody from "../components/EmployeeDashboardBody.js";

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
  const router = useRouter();
  const dispatch = useDispatch();
  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });

  // Redux
  const account = useSelector((state) => state.provider.account);
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);
  const contractAddress = dashboardRestaurant.contractAddress;
  const abi = dashboardRestaurant.abi;

  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    // Load data from Redux store if available
    if (
      isConnected && ethersSigner
    ) {
      const employees = dashboardRestaurant.allEmployees.data || [];
      const jobs = dashboardRestaurant.allJobs.data || [];

      // Filter to employees belonging to the current account
      const myEmployeeRecords = employees.filter(
        (employee) =>
          employee.address?.toLowerCase() === account?.toLowerCase()
      );

      // Map these employee records to their job names
      const jobNames = myEmployeeRecords
        .map((employee) => {
          const job = jobs.find((j) => j.id === employee.jobId);
          return job ? job.jobName : null;
        })
        .filter(Boolean);

      setMyJobs(jobNames);
    }

    // Optional: handle screen resize
    const handleResize = () => {
      const menu = document.querySelector('.menu');
      if (window.innerWidth > 800) {
        if (menu) menu.style.display = '';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [account, dashboardRestaurant, ethersSigner]);

  /**
   * Called when a user clicks one of their Job buttons.
   */
  const handleJobClick = async (jobName) => {
    try {
      // 1) Get a fresh provider + signer
      
    

      // 2) Dispatch an action that sends the needed info to the server
      dispatch(
        fetchEmployeeStatusFromServer({
          ethersSigner,
          contractAddress,
          abi,
          jobName,
        })
      );

      // 3) (Optional) navigate afterwards
      router.push('/mainJobDashboard');
    } catch (error) {
      console.error('Error handling job click:', error);
    }
  };

  const navigateToIndex = () => router.push('/');
  const navigateToDashboard = () => router.push('/Dashboard');

  return (
    <div className="BlueBackground">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Center Box */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid white',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            minWidth: '300px',
            zIndex: 9999
          }}
        >
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Your Jobs</h2>
          {myJobs.length > 0 ? (
            myJobs.map((jobName, index) => (
              <button
                key={index}
                onClick={() => handleJobClick(jobName)}
                style={{
                  margin: '10px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none'
                }}
              >
                {jobName}
              </button>
            ))
          ) : (
            <p style={{ color: '#fff', fontSize: '18px' }}>
              You currently hold no jobs at any restaurants.
            </p>
          )}
        </div>
      </div>

      {/* Logo in top-left */}
      <div
        width={250}
        height={250}
        onClick={navigateToIndex}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Image
          src="/Decentralized.png"
          alt="Decentralized Image"
          width={250}
          height={250}
          priority
        />
      </div>

      <div className="DashboardBackground">
        <EmployeeDashboardBody />
        <div className="RestaurantSelectorHomeButtons">
          <button
            className="clean-button-home-RestaurantSelector"
            onClick={navigateToIndex}
          >
            Go to Decentratality main page
          </button>
          <button
            className="clean-button-home-Dashboard"
            onClick={navigateToDashboard}
          >
            Go back to main dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
