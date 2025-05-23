import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'
import Image from 'next/image';

import DashboardBody from "../components/DashboardBody.js"

import { useRouter } from 'next/router';
import { useAppKitAccount } from '@reown/appkit/react'


export default function Home() {
  const { address, isConnected } = useAppKitAccount();
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

  // Detect when screen size changes and reset the inline styles
  useEffect(() => {
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
  }, [isConnected]);

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
    <div width={250} height={250} onClick={navigateToIndex} style={{ position: 'absolute', top: 0, left: 0 }}  >
        <Image

          src="/Decentralized.png" 
          alt="Decentralized Image" 
          width={250}   // Replace with actual width
          height={250}  // Replace with actual height
          style={{ position: 'relative', top: 0, left: 0 }} 
          priority={true}  // Adds priority to improve page load speed
        />
      </div>
      <div className="DashboardBackground">
      <DashboardBody onclick1={navigateToIndex} onclick2={navigateToRestaurantDashboard} onclick3={navigateToEmployeeDashboard}/>
      <button className="clean-button-home" onClick={navigateToIndex}>
          go Home
        </button>
      </div>
      
    </div>
  );
}
