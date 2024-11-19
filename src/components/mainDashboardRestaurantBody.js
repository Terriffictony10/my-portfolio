// src/components/MainDashboardRestaurantBody.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers, isAddress } from 'ethers';
import Loading from '../components/Loading.js';
import { useRouter } from 'next/router';
import { useProvider } from '../context/ProviderContext';
import {
  loadAllJobs,
  hireNewEmployee,
  loadAllEmployees,
  startService,
  endService,
  loadAllServices,
} from '../store/interactions';

function MainDashboardRestaurantBody() {
  const { provider, setProvider } = useProvider();
  const [isLoading, setIsLoading] = useState(true);
  const account = useSelector((state) => state.provider.account);
  const name = useSelector((state) => state.DashboardRestaurant.name);
  const cash = useSelector((state) => state.DashboardRestaurant.cash);
  const contractAddress = useSelector((state) => state.DashboardRestaurant.contractAddress);
  const abi = useSelector((state) => state.DashboardRestaurant.abi);
  const employees = useSelector((state) => state.DashboardRestaurant.allEmployees.data || []);
  const jobs = useSelector((state) => state.DashboardRestaurant.allJobs.data || []);
  const services = useSelector((state) => state.DashboardRestaurant.allServices.data || []);
  const dispatch = useDispatch();
  const router = useRouter();

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeJobId, setEmployeeJobId] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');

  // State variables for service management
  const [serviceActive, setServiceActive] = useState(false);
  const [serviceStart, setServiceStart] = useState(null);
  const [serviceElapsedTime, setServiceElapsedTime] = useState(0);
  const [serviceLoading, setServiceLoading] = useState(false);

  // Handlers for employee form
  const employeeNameHandler = (e) => {
    setEmployeeName(e.target.value);
  };

  const employeeJobIdHandler = (e) => {
    setEmployeeJobId(e.target.value);
  };

  const employeeAddressHandler = (e) => {
    setEmployeeAddress(e.target.value);
  };

  // Handler to add new job (you can implement this as needed)
  const addNewJobHandler = () => {
    // Your code to handle adding a new job
  };

  const hireEmployeeHandler = async (e) => {
    e.preventDefault();
    if (!provider) {
      console.error('Provider not initialized');
      return;
    }
    if (!isAddress(employeeAddress)) {
      alert('Invalid Ethereum address');
      return;
    }
    await hireNewEmployee(
      provider,
      contractAddress,
      abi,
      employeeJobId,
      employeeName,
      employeeAddress,
      dispatch
    );
    // Reset form fields
    setEmployeeName('');
    setEmployeeJobId('');
    setEmployeeAddress('');
    setShowEmployeeForm(false);
  };

  const addEmployeeHandler = () => {
    setShowEmployeeForm(true);
  };

  const closeEmployeeForm = () => {
    setShowEmployeeForm(false);
  };

  // Function to toggle service
  const toggleServiceHandler = async () => {
    if (!provider) {
      console.error('Provider not initialized');
      return;
    }
    setServiceLoading(true);
    try {
      if (serviceActive) {
        // Stop the service
        await endService(provider, contractAddress, abi, dispatch);
      } else {
        // Start the service
        await startService(provider, contractAddress, abi, dispatch);
      }
      // After starting/stopping service, refresh the service status
      await getServiceStatus();
    } catch (error) {
      console.error('Error toggling service:', error);
    }
    setServiceLoading(false);
  };

  // Function to get the service status
  const getServiceStatus = async () => {
    if (provider && contractAddress && abi) {
      try {
        const user = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, user);
        const service = await contract.service();
        const serviceStartTime = await contract.serviceStart();

        setServiceActive(service);
        if (service) {
          setServiceStart(Number(serviceStartTime));
        } else {
          setServiceStart(null);
        }
      } catch (error) {
        console.error('Error getting service status:', error);
      }
    }
  };

  const formatElapsedTime = (elapsedSeconds) => {
    if (elapsedSeconds < 0) elapsedSeconds = 0; // Prevent negative time

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    // Pad with zeros to ensure two digits
    const hoursDisplay = String(hours).padStart(2, '0');
    const minutesDisplay = String(minutes).padStart(2, '0');
    const secondsDisplay = String(seconds).padStart(2, '0');

    return `${hoursDisplay}:${minutesDisplay}:${secondsDisplay}`;
  };

  // First useEffect: Load blockchain data on mount
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          await ethersProvider.send('eth_requestAccounts', []);
          if (contractAddress && abi) {
            await loadAllJobs(ethersProvider, contractAddress, abi, dispatch);
            await loadAllEmployees(ethersProvider, contractAddress, abi, dispatch);
            await loadAllServices(ethersProvider, contractAddress, abi, dispatch);
            await getServiceStatus();
          }
        } catch (error) {
          console.error('Error loading blockchain data:', error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error('MetaMask not detected');
        setIsLoading(false);
      }
    };

    loadBlockchainData();
  }, [contractAddress, abi]);

  // Second useEffect: Set up interval to refresh data
  useEffect(() => {
    if (provider) {
      const refreshData = () => {
        loadAllJobs(provider, contractAddress, abi, dispatch);
        loadAllEmployees(provider, contractAddress, abi, dispatch);
        loadAllServices(provider, contractAddress, abi, dispatch);
        getServiceStatus();
      };

      // Initial call to refresh data
      refreshData();

      // Set up periodic refresh every second
      const interval = setInterval(refreshData, 1000);

      // Clear interval on cleanup
      return () => clearInterval(interval);
    }
  }, [provider, contractAddress, abi]);

  // useEffect to update service elapsed time
  useEffect(() => {
    let interval;
    if (!serviceLoading && serviceActive && serviceStart) {
      // Update elapsed time every second
      interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        let elapsedTime = currentTime - serviceStart;
        if (elapsedTime < 0) elapsedTime = 0; // Prevent negative time
        setServiceElapsedTime(elapsedTime);
      }, 1000);
    } else {
      setServiceElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [serviceLoading, serviceActive, serviceStart]);

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="main-dashboard-container">
          {/* Left Side Content */}
          <div className="left-side-content">
            {/* Account Information */}
            <p className="MainDashboardAccount">
              <strong className="account-label">Account :</strong> {account || 'No account detected'}
            </p>

            {/* Restaurant Data */}
            <div className="MainDashboardRestaurantBox">
              <div className="restaurant-text">Restaurant Data</div>
              <div className="MainDashboardRestaurantDataBox">
                <p>
                  <strong className="account-label">Name :</strong> {name || 'No name found'}
                </p>
                <p>
                  <strong className="account-label">Cash :</strong> {cash ? cash / 1e18 : 'No cash found'} ETH
                </p>
              </div>
            </div>

            {/* Jobs Section */}
            <div className="MainDashboardRestaurantJobsBox">
              <h2>All Jobs</h2>
              <button className="addJobButton" onClick={addNewJobHandler}>
                Add Job
              </button>
            </div>
            <div className="MainDashboardRestaurantJobsContainer">
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <div key={index} className="job">
                    <p>Job ID: {job.id}</p>
                    <p>Job Name: {job.jobName}</p>
                    <p>Hourly Wage (in Wei): {job.hourlyWageInWei}</p>
                  </div>
                ))
              ) : (
                <p>No jobs available</p>
              )}
            </div>

            {/* Employees Section */}
            <div className="MainDashboardRestaurantEmployeesBox">
              <h2>Employees</h2>
              <button className="addEmployeeButton" onClick={addEmployeeHandler}>
                Hire Employee
              </button>
            </div>
            <div className="MainDashboardRestaurantEmployeesContainer">
              {employees.length > 0 ? (
                employees.map((employee, index) => (
                  <div key={index} className="employee">
                    <p>Employee ID: {employee.id}</p>
                    <p>Name: {employee.name}</p>
                    <p>Job ID: {employee.jobId}</p>
                    <p>Address: {employee.address}</p>
                  </div>
                ))
              ) : (
                <p>No employees available</p>
              )}
            </div>
          </div>

          {/* Right Side Content */}
          <div className="right-side-content">
            {/* Service Control */}
            <div className="service-control">
              <button
                className={`service-button ${serviceActive ? 'stop' : 'start'}`}
                onClick={toggleServiceHandler}
                disabled={serviceLoading}
              >
                {serviceLoading ? 'Processing...' : serviceActive ? 'Stop Service' : 'Start Service'}
              </button>
              {serviceActive && (
                <div className="service-timer">
                  Service Time: {formatElapsedTime(serviceElapsedTime)}
                </div>
              )}
            </div>

            {/* Services List */}
            <div className="services-list">
              <h3>Service History</h3>
              {services.length > 0 ? (
                <table className="services-table">
                  <thead>
                    <tr>
                      <th>Start Time</th>
                      <th>Financials</th>
                      <th>#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services
                      .slice()
                      .reverse()
                      .map((service, index) => (
                        <tr key={service.id}>
                          <td>{new Date(service.startTime * 1000).toLocaleString()}</td>
                          <td className="financials-cell">
                            <div className="financials-item cost">
                              Cost: {Number(ethers.utils.formatEther(service.cost)).toFixed(4)} ETH
                            </div>
                            <div className="financials-item profit">
                              Profit: {Number(ethers.utils.formatEther(service.profit)).toFixed(4)} ETH
                            </div>
                            <div className="financials-item revenue">
                              Revenue: {Number(ethers.utils.formatEther(service.revenue)).toFixed(4)} ETH
                            </div>
                          </td>
                          <td>{service.id}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p>No services recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="employeeFormOverlay">
          <div className="employeeFormContainer">
            <form onSubmit={hireEmployeeHandler}>
              <p>
                <input
                  type="text"
                  id="employeeName"
                  placeholder="Enter the Employee's Name"
                  value={employeeName}
                  onChange={employeeNameHandler}
                />
              </p>
              <p>
                <input
                  type="number"
                  id="employeeJobId"
                  placeholder="Enter the Job ID"
                  value={employeeJobId}
                  onChange={employeeJobIdHandler}
                />
              </p>
              <p>
                <input
                  type="text"
                  id="employeeAddress"
                  placeholder="Enter the Employee's Address"
                  value={employeeAddress}
                  onChange={employeeAddressHandler}
                />
              </p>
              <button className="button" type="submit">
                Hire Employee
              </button>
              <button className="button" type="button" onClick={closeEmployeeForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainDashboardRestaurantBody;
