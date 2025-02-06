import React, { useEffect, useState, useMemo  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers, isAddress, BrowserProvider, JsonRpcSigner } from 'ethers';
import Loading from '../components/Loading.js';
import { useRouter } from 'next/router';
import { useProvider } from '../context/ProviderContext';

// Make sure this Restaurant ABI matches the "new" contract version
import RESTAURANT_ABI from '../abis/Restaurant.json'; 

import {
  loadAllJobs,
  hireNewEmployee,
  loadAllEmployees,
  startService,
  endService,
  loadAllServices,
  createPOS,
  loadAllPOS,
  loadAllMenuItems,
  addNewMenuItem
} from '../store/interactions';

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

function MainDashboardRestaurantBody() {
  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const [myprovider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for the Restaurant contract's on-chain balance
  const [contractBalance, setContractBalance] = useState('0');

  // Redux: basic info about the restaurant
  const account = useSelector((state) => state.provider.account);
  const name = useSelector((state) => state.DashboardRestaurant.name);
  const contractAddress = useSelector((state) => state.DashboardRestaurant.contractAddress);
  const abi = useSelector((state) => state.DashboardRestaurant.abi);

  // Redux: loaded data
  const jobs = useSelector((state) => state.DashboardRestaurant.allJobs.data || []);
  const employees = useSelector((state) => state.DashboardRestaurant.allEmployees.data || []);
  const services = useSelector((state) => state.DashboardRestaurant.allServices.data || []);
  const posDevices = useSelector((state) => state.DashboardRestaurant.allPOS.data || []);
  const menuItems = useSelector((state) => state.DashboardRestaurant.allMenuItems.data || []);

  const dispatch = useDispatch();
  const router = useRouter();

  // Modals & Forms
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [menuItemName, setMenuItemName] = useState('');
  const [menuItemCost, setMenuItemCost] = useState('');

  const [showPOSForm, setShowPOSForm] = useState(false);
  const [posName, setPOSName] = useState('');

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeJobId, setEmployeeJobId] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');

  // Service State
  const [serviceActive, setServiceActive] = useState(false);
  const [serviceStart, setServiceStart] = useState(null);
  const [serviceElapsedTime, setServiceElapsedTime] = useState(0);
  const [serviceLoading, setServiceLoading] = useState(false);

  // Handlers for forms
  const openPOSForm = () => setShowPOSForm(true);
  const closePOSForm = () => setShowPOSForm(false);
  const addMenuItemHandler = () => setShowMenuItemForm(true);
  const closeMenuItemForm = () => setShowMenuItemForm(false);
  const addEmployeeHandler = () => setShowEmployeeForm(true);
  const closeEmployeeForm = () => setShowEmployeeForm(false);

  const posNameHandler = (e) => setPOSName(e.target.value);
  const menuItemNameHandler = (e) => setMenuItemName(e.target.value);
  const menuItemCostHandler = (e) => setMenuItemCost(e.target.value);
  const employeeNameHandler = (e) => setEmployeeName(e.target.value);
  const employeeJobIdHandler = (e) => setEmployeeJobId(e.target.value);
  const employeeAddressHandler = (e) => setEmployeeAddress(e.target.value);

  // Just an example for a future Job creation popup
  const addNewJobHandler = async () => {
     const modalBackground = document.querySelector('.newJobForm');
  const modalContainer = document.querySelector('.newJobFormContainer');

  if (modalBackground) {
    modalBackground.style.zIndex = '500';
  }
  if (modalContainer) {
    modalContainer.style.zIndex = '501';
  }
  };

  // Create a new POS device on-chain
  const addPOSHandler = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      await createPOS(etherSigner, contractAddress, RESTAURANT_ABI, posName, dispatch);
      setPOSName('');
      setShowPOSForm(false);
    } catch (error) {
      console.error('Error creating POS:', error);
    }
  };

  // Hire a new employee
  const hireEmployeeHandler = async (e) => {
    e.preventDefault();
    if (!isConnected) return;

    if (!isAddress(employeeAddress)) {
      alert('Invalid Ethereum address');
      return;
    }

    await hireNewEmployee(
      etherSigner,
      contractAddress,
      RESTAURANT_ABI,
      employeeJobId,
      employeeName,
      employeeAddress,
      dispatch
    );

    setEmployeeName('');
    setEmployeeJobId('');
    setEmployeeAddress('');
    setShowEmployeeForm(false);
  };

  // Add a new menu item to all POS devices
  const addMenuItemSubmitHandler = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      await addNewMenuItem(
        etherSigner,
        contractAddress,
        RESTAURANT_ABI,
        menuItemCost,
        menuItemName,
        dispatch
      );
      setMenuItemName('');
      setMenuItemCost('');
      setShowMenuItemForm(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  // Start or stop the Restaurant service
  const toggleServiceHandler = async () => {
    if (!isConnected) return;
    setServiceLoading(true);
    try {
      if (serviceActive) {
        // Stop service
        await endService(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
      } else {
        // Start service
        await startService(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
      }
      await getServiceStatus(); // Reload local service state
    } catch (error) {
      console.error('Error toggling service:', error);
    }
    setServiceLoading(false);
  };

  // Read the "service" bool and "serviceStart" from the contract
  const getServiceStatus = async () => {
    if (!isConnected) return;
    try {
      
      const contract = new ethers.Contract(contractAddress, RESTAURANT_ABI, etherSigner);

      const service = await contract.service();
      const serviceStartTime = await contract.serviceStart();

      setServiceActive(service);
      setServiceStart(service ? Number(serviceStartTime) : null);
    } catch (error) {
      console.error('Error getting service status:', error);
    }
  };

  // Helper to format HH:MM:SS from total seconds
  const formatElapsedTime = (elapsedSeconds) => {
    if (elapsedSeconds < 0) elapsedSeconds = 0;
    const hours = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Initial load: connect to contract & load all data
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (isConnected && ethersSigner && ethersProvider && contractAddress) {
        try {
          const { provider, address} = await ethersSigner;
          
          setProvider(provider);

          // Request accounts if not already connected
          await ethersProvider.send('eth_requestAccounts', []);

          // Fetch & store the contract’s current balance
          const balance = await ethersProvider.getBalance(contractAddress);
          setContractBalance(balance);

          // Load needed data from the contract
          await loadAllJobs(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
          await loadAllEmployees(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
          await loadAllServices(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
          await loadAllPOS(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);
          await loadAllMenuItems(etherSigner, contractAddress, RESTAURANT_ABI, dispatch);

          // Check if service is active
          await getServiceStatus();
        } catch (error) {
          console.error('Error loading blockchain data:', error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No Ethereum provider or no contract address found
        setIsLoading(false);
      }
    };
    loadBlockchainData();
  }, [contractAddress, dispatch]);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    if (isConnected && ethersSigner && ethersProvider && contractAddress) {
      const refreshData = async () => {
        const { provider, address} = await ethersSigner;
        // Re-check contract balance
        const balance = await provider.getBalance(contractAddress);
        setContractBalance(balance);

        // Refresh all loaded data
        loadAllPOS(ethersSigner, contractAddress, RESTAURANT_ABI, dispatch);
        loadAllJobs(ethersSigner, contractAddress, RESTAURANT_ABI, dispatch);
        loadAllEmployees(ethersSigner, contractAddress, RESTAURANT_ABI, dispatch);
        loadAllServices(ethersSigner, contractAddress, RESTAURANT_ABI, dispatch);
        loadAllMenuItems(ethersSigner, contractAddress, RESTAURANT_ABI, dispatch);
        getServiceStatus();
      };

      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [ethersSigner, contractAddress, dispatch]);

  // If service is active, track elapsed time
  useEffect(() => {
    let interval;
    if (!serviceLoading && serviceActive && serviceStart) {
      interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        setServiceElapsedTime(currentTime - serviceStart);
      }, 1000);
    } else {
      setServiceElapsedTime(0);
    }
    return () => interval && clearInterval(interval);
  }, [serviceLoading, serviceActive, serviceStart]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="main-dashboard-container">
      {/* ========== TOP ROW (Account & Restaurant Info) ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>Account Info</h2>
        </div>
        <p><strong>Account:</strong> {account || "No account detected"}</p>
        <p><strong>Restaurant Name:</strong> {name || "No name found"}</p>
        <p>
          <strong>Balance:</strong>{" "}
          {ethers.formatEther(contractBalance || 0)} ETH
        </p>
      </section>

      {/* ========== SERVICE CONTROL ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>Service Control</h2>
        </div>
        <button
          className={`service-button ${serviceActive ? 'stop' : 'start'}`}
          onClick={toggleServiceHandler}
          disabled={serviceLoading}
        >
          {serviceLoading
            ? 'Processing...'
            : serviceActive
              ? 'Stop Service'
              : 'Start Service'
          }
        </button>
        {serviceActive && (
          <div className="service-timer">
            Service Time: {formatElapsedTime(serviceElapsedTime)}
          </div>
        )}
      </section>

      {/* ========== JOBS ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>All Jobs</h2>
          <button onClick={addNewJobHandler}>Add Job</button>
        </div>

        <div className="table-scroll">
          {jobs.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Hourly Wage (Wei)</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={index}>
                    <td>{job.id}</td>
                    <td>{job.jobName}</td>
                    <td>{job.hourlyWageInWei}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No jobs available</p>
          )}
        </div>
      </section>

      {/* ========== EMPLOYEES ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>Employees</h2>
          <button onClick={addEmployeeHandler}>Hire Employee</button>
        </div>

        <div className="table-scroll">
          {employees.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Job ID</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={index}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.jobId}</td>
                    <td>{employee.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No employees available</p>
          )}
        </div>
      </section>

      {/* ========== MENU ITEMS ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>Menu Items</h2>
          <button onClick={addMenuItemHandler}>Add Menu Item</button>
        </div>

        <div className="table-scroll">
          {menuItems.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Name</th>
                  <th>Cost (ETH)</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No menu items available</p>
          )}
        </div>
      </section>

      {/* ========== POS DEVICES ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>POS Terminals</h2>
          <button onClick={openPOSForm}>Add POS</button>
        </div>

        <div className="table-scroll">
          {posDevices.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>POS ID</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {posDevices.map((pos, index) => (
                  <tr key={index}>
                    <td>{pos.id}</td>
                    <td>{pos.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No POS devices available</p>
          )}
        </div>
      </section>

      {/* ========== SERVICE HISTORY ========== */}
      <section className="dashboard-section">
        <div className="section-navbar">
          <h2>Service History</h2>
        </div>

        <div className="table-scroll">
          {services.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Start Time</th>
                  <th>Cost (ETH)</th>
                  <th>Profit (ETH)</th>
                  <th>Revenue (ETH)</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {services.slice().reverse().map((service) => (
                  <tr key={service.id}>
                    <td>{new Date(service.startTime * 1000).toLocaleString()}</td>
                    <td>{Number(ethers.formatEther(service.cost)).toFixed(4)}</td>
                    <td>{Number(ethers.formatEther(service.profit)).toFixed(4)}</td>
                    <td>{Number(ethers.formatEther(service.revenue)).toFixed(4)}</td>
                    <td>{service.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No services recorded yet.</p>
          )}
        </div>
      </section>

      {/* ========== MODALS ========== */}
      {showMenuItemForm && (
        <div className="menuItemFormOverlay">
          <div className="menuItemFormContainer">
            <form onSubmit={addMenuItemSubmitHandler}>
              <p>
                <input
                  type="text"
                  placeholder="Menu Item Name"
                  value={menuItemName}
                  onChange={menuItemNameHandler}
                  required
                />
              </p>
              <p>
                <input
                  type="text"
                  placeholder="Menu Item Cost (ETH)"
                  value={menuItemCost}
                  onChange={menuItemCostHandler}
                  required
                />
              </p>
              <button type="submit">Add Menu Item</button>
              <button type="button" onClick={closeMenuItemForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showPOSForm && (
        <div className="posFormOverlay">
          <div className="posFormContainer">
            <form onSubmit={addPOSHandler}>
              <p>
                <input
                  type="text"
                  placeholder="POS Name"
                  value={posName}
                  onChange={posNameHandler}
                  required
                />
              </p>
              <button type="submit">Create POS</button>
              <button type="button" onClick={closePOSForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showEmployeeForm && (
        <div className="employeeFormOverlay">
          <div className="employeeFormContainer">
            <form onSubmit={hireEmployeeHandler}>
              <p>
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={employeeName}
                  onChange={employeeNameHandler}
                  required
                />
              </p>
              <p>
                <input
                  type="number"
                  placeholder="Job ID"
                  value={employeeJobId}
                  onChange={employeeJobIdHandler}
                  required
                />
              </p>
              <p>
                <input
                  type="text"
                  placeholder="Employee Address"
                  value={employeeAddress}
                  onChange={employeeAddressHandler}
                  required
                />
              </p>
              <button type="submit">Hire Employee</button>
              <button type="button" onClick={closeEmployeeForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainDashboardRestaurantBody;
