import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Image from 'next/image';
import {
  loadEmployeeRelevantPOS,
  loadAllTicketsForPOS
} from '../store/interactions';

export default function EmployeePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const provider = useSelector((state) => state.provider.connection);
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);
  // Assume dashboardRestaurant.contractAddress holds the active restaurant's address
  const restaurantAddress = dashboardRestaurant.contractAddress;

  useEffect(() => {
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    async function loadData() {
      await loadEmployeeRelevantPOS(ethersProvider, restaurantAddress, dispatch);
    }
    loadData()
  }, []);

   const handleOpenPOS = async () => {
    if (!provider || !restaurantAddress) {
      console.log("Provider or restaurant address not found");
      return;
    }


    // After loading is done (the above action dispatches state), navigate to POSterminal
    router.push('/POSterminal');
  };

  const navigateToMainJobDashboard = () => {
    router.push('/mainJobDashboard');
  };

  const navigateToIndex = () => {
    router.push('/');
  };

  const navigateToDashboard = () => {
    router.push('/Dashboard');
  };

  const openPOS = () => {
    router.push('/POSterminal');
  };

  const clockIn = () => {
    console.log('Clock In button clicked');
    // Add any logic for the Clock In functionality here
  };

  return (
    <div className="BlueBackground" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Logo */}
      <div
        width={250}
        height={250}
        onClick={navigateToIndex}
        style={{ position: 'absolute', top: 0, left: 0, cursor: 'pointer' }}
      >
        <Image
          src="/Decentralized.png"
          alt="Decentralized Image"
          width={250}
          height={250}
          priority={true}
          style={{ position: 'relative', top: 0, left: 0 }}
        />
      </div>

      {/* Non-symmetrical Grid Layout */}
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
          <p style={{ color: '#aaa' }}>This box will display the employee’s logged hours.</p>
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
          <p style={{ color: '#aaa' }}>This box will show the employee’s upcoming shifts.</p>
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
          <p style={{ color: '#aaa' }}>Here you can see general information about the employee.</p>
        </div>

        {/* Open POS Button Box */}
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

        {/* Clock In Button */}
        <div
          style={{
            gridArea: 'clockin',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <button
            onClick={clockIn}
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Clock In
          </button>
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
          className="clean-button-home-RestaurantSelector"
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
          className="clean-button-home-Dashboard"
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

