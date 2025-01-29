import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Image from 'next/image';

// Import your actions
import {
  loadEmployeeRelevantPOS,
  loadAllTicketsForPOS,
  clockInEmployee,
  clockOutEmployee
} from '../store/interactions';

export default function EmployeePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // ----- SELECTORS FROM REDUX -----
  const provider = useSelector((state) => state.provider.connection);
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);
  const restaurantAddress = dashboardRestaurant.contractAddress;
  const restaurantAbi = dashboardRestaurant.abi;

  // You need an actual employee ID for the connected wallet. 
  // If you haven't set up logic to find that ID, you can hard-code or reference the store. 
  // For demonstration, we'll assume it's "1":
  const employeeId = 1;

  // ----- CLOCK-IN LOGIC -----
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockedInDuration, setClockedInDuration] = useState(0);
  const clockIntervalRef = useRef(null);

  // Start or clear the timer interval based on isClockedIn
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      clockIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - clockInTime) / 1000);
        setClockedInDuration(diff);
      }, 1000);
    } else {
      // Clear any existing interval
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      // Reset timer display if you're not clocked in
      setClockedInDuration(0);
    }

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, [isClockedIn, clockInTime]);

  // ----- MOUNT / LOAD DATA -----
  useEffect(() => {
    if (!restaurantAddress) return; // If not set yet, skip
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    async function loadData() {
      await loadEmployeeRelevantPOS(ethersProvider, restaurantAddress, dispatch);
    }
    loadData();
  }, [restaurantAddress, dispatch]);

  // ----- HANDLERS -----
  const handleOpenPOS = async () => {
    if (!provider || !restaurantAddress) {
      console.log("Provider or restaurant address not found");
      return;
    }
    router.push('/POSterminal');
  };

  const navigateToIndex = () => router.push('/');
  const navigateToDashboard = () => router.push('/Dashboard');

  // Clock In / Out button
  const handleClockButton = async () => {
    if (!provider || !restaurantAddress || !restaurantAbi) {
      console.log("Missing provider or contract details");
      return;
    }

    try {
      if (!isClockedIn) {
        // Clock In
        await clockInEmployee(provider, restaurantAddress, restaurantAbi, employeeId);
        setIsClockedIn(true);
        setClockInTime(Date.now());
      } else {
        // Clock Out
        await clockOutEmployee(provider, restaurantAddress, restaurantAbi, employeeId);
        setIsClockedIn(false);
        setClockInTime(null);
      }
    } catch (error) {
      console.error("Clock in/out error:", error);
    }
  };

  // Format the duration into hh:mm:ss or something similar
  const formatDuration = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // ----- RENDER -----
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
          alt="Decentralized Logo"
          width={250}
          height={250}
          priority={true}
        />
      </div>

      {/* Page Content in Grid Layout */}
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
          <p style={{ color: '#aaa' }}>A table or list of shifts could go here.</p>
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
          <p style={{ color: '#aaa' }}>Upcoming shifts, if any, appear here.</p>
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
          <p style={{ color: '#aaa' }}>General employee info, e.g. name, job title, etc.</p>
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

        {/* Clock In/Out Button + Timer */}
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
