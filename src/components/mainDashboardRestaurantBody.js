// mainDashboardRestaurantBody.js

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import Loading from '../components/Loading.js';
import { useRouter } from 'next/router';
import { useProvider } from '../context/ProviderContext';
import {
  loadAllJobs,
  createNewJob,
} from '../store/interactions';

function MainDashboardRestaurantBody() {
  const { provider, setProvider } = useProvider();
  const [isLoading, setIsLoading] = useState(true);
  const account = useSelector((state) => state.provider.account);
  const name = useSelector((state) => state.DashboardRestaurant.name);
  const cash = useSelector((state) => state.DashboardRestaurant.cash);
  const contractAddress = useSelector((state) => state.DashboardRestaurant.contractAddress);
  const abi = useSelector((state) => state.DashboardRestaurant.abi);
  const jobs = useSelector((state) => state.DashboardRestaurant.allJobs.data || []);
  const dispatch = useDispatch();
  const router = useRouter();

  const addNewJobHandler = (e) => {
    const _Background = document.querySelector('.newJobForm');
    _Background.style.zIndex = '500';
    const _Form = document.querySelector('.newJobFormContainer');
    _Form.style.zIndex = '501';
  };

  // First useEffect: Load blockchain data on mount
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          await ethersProvider.send('eth_requestAccounts', []);
          await loadAllJobs(ethersProvider, contractAddress, abi, dispatch);
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
    // Empty dependency array ensures this runs only once
  }, []);

  // Second useEffect: Set up interval to refresh jobs
  useEffect(() => {
    if (provider) {
      // Define the function to load jobs
      const refreshJobs = () => {
        loadAllJobs(provider, contractAddress, abi, dispatch);
      };

      // Initial call to refresh jobs
      refreshJobs();

      // Set up periodic refresh every second
      const interval = setInterval(refreshJobs, 1000);

      // Clear interval on cleanup
      return () => clearInterval(interval);
    }
  }, [provider, contractAddress, abi]);

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <div>
            <p className="MainDashboardAccount">
              <strong className="account-label">Account :</strong> {account || 'No account detected'}
            </p>
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
            <div className="MainDashboardRestaurantJobsBox">
              All Jobs
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
          </div>
        </div>
      )}
    </div>
  );
}

export default MainDashboardRestaurantBody;
