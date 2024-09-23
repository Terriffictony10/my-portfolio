import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'



export default function Home() {
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
  }, []);

  const navigateToCrowdsale = () => {
    window.location.href = '/Crowdsale';
  };
  const navigateToIndex = () => {
    window.location.href = '/';
  };

  const navigateToNFT = () => {
    window.location.href = '/NFT';
  };
  const navigateToDemo = () => {
    window.location.href = '/Demo';
  };
  const navigateToDashboard = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <div>
    
    </div>
  );
}
