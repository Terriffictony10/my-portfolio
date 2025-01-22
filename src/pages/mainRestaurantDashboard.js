// mainRestaurantDashboard.js

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';

import MainDashboardRestaurantBody from "../components/mainDashboardRestaurantBody.js";
import { createNewJob } from '../store/interactions';

import { useProvider } from '../context/ProviderContext';
import config from '../config.json';

export default function Home() {
  const dispatch = useDispatch();

  // Load the provider (browser environment only)
  let provider;
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  // Redux: get the currently connected account
  const account = useSelector((state) => state.provider.account);

  // Redux: get contract address & ABI if needed for creating jobs
  const contractAddress = useSelector((state) => state.DashboardRestaurant.contractAddress);
  const abi = useSelector((state) => state.DashboardRestaurant.abi);

  const [newJobName, setNewJobName] = useState('');
  const [newJobWage, setNewJobWage] = useState('');
  


  const router = useRouter();

  // ============= Handlers =============
  const addNewJob = async (e, name, wage) => {
    e.preventDefault();
    if (!provider || !contractAddress || !abi) {
      console.error('Provider, contract, or ABI not available');
      return;
    }
    await createNewJob(provider, contractAddress, abi, name, wage, dispatch);

    // Close the "new job" modal
    const _Background = document.querySelector('.newJobForm');
    const _Form = document.querySelector('.newJobFormContainer');
    if (_Background) _Background.style.zIndex = '-1';
    if (_Form) _Form.style.zIndex = '-2';
  };

  const newJobNameHandler = (e) => setNewJobName(e.target.value);
  const newJobWageHandler = (e) => setNewJobWage(e.target.value);

  // Navigation
  const navigateToIndex = () => router.push('/');
  const navigateToDashboard = () => router.push('/Dashboard');
  const navigateToKitchen = () => router.push('/Kitchen');

  // Request accounts if needed (once) on mount
  useEffect(() => {
    if (provider) {
      provider.send('eth_requestAccounts', []).catch((error) => {
        console.error('User rejected request:', error);
      });
    }
  }, [provider]);

  return (
    <div className="BlueBackground">
      {/* ===================== TOP BAR ===================== */}
      <div 
        className="top-bar" 
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0)'
        }}
      >
        {/* ---------- Logo on left ---------- */}
        <div style={{ cursor: 'pointer' }} onClick={navigateToIndex}>
          <Image
            src="/Decentralized.png"
            alt="Decentralized Logo"
            width={150}
            height={150}
            priority={true}
            style={{ marginRight: '20px' }}
          />
        </div>

        {/* ---------- Account Number in center ---------- */}
        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          {account ? (
            <p style={{ color: '#fff', margin: 0, fontFamily: 'CrowdsaleBuyBox' }}>
              <strong>Account:</strong> {account}
            </p>
          ) : (
            <p style={{ color: '#fff', margin: 0, fontFamily: 'CrowdsaleBuyBox' }}>
              No account detected
            </p>
          )}
        </div>

        {/* ---------- Kitchen Ticket Button on right ---------- */}
        <div>
          <button
            className="clean-button-home-Kitchen"
            style={{
              backgroundColor: '#f0ad4e',
              color: '#fff',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={navigateToKitchen}
          >
            Kitchen Ticket Printer
          </button>
        </div>
      </div>

      {/* ===================== NEW JOB FORM (MODAL) ===================== */}
      <div  className={"newJobForm"}>
        <div className="newJobFormContainer">
          <form onSubmit={(e) => addNewJob(e, newJobName, newJobWage)}>
            <p>
              <input 
                type="text"
                placeholder="Enter a name for the new Job"
                value={newJobName}
                onChange={newJobNameHandler}
              />
            </p>
            <p>
              <input 
                type="number"
                placeholder="Enter the wage of the new Job in ETH"
                value={newJobWage}
                onChange={newJobWageHandler}
              />
            </p>
            <button className="button" type="submit">
              Create New Job
            </button>
          </form>
        </div>
      </div>

      {/* ===================== DASHBOARD CONTENT ===================== */}
      <div className="DashboardBackground">
        {/* 
          Main dashboard body with the new Grid layout 
          ( Jobs, Employees, Menu, POS, etc. ) 
        */}
        <MainDashboardRestaurantBody />

        {/* ===================== BOTTOM BUTTONS ===================== */}
        <div className="RestaurantSelectorHomeButtons">
          <button
            className="clean-button-home-RestaurantSelector"
            onClick={navigateToIndex}
          >
            go to decentratality main page
          </button>

          <button
            className="clean-button-home-Dashboard"
            onClick={navigateToDashboard}
          >
            go back to main dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
