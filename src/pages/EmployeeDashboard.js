import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers'
import Image from 'next/image';

import EmployeeDashboardBody from "../components/EmployeeDashboardBody.js"
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const account = useSelector((state) => state.provider.account);
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);

  const [myJobs, setMyJobs] = useState([]);


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
    if (
      dashboardRestaurant &&
      dashboardRestaurant.allEmployees &&
      dashboardRestaurant.allEmployees.loaded &&
      dashboardRestaurant.allJobs &&
      dashboardRestaurant.allJobs.loaded
    ) {
      const employees = dashboardRestaurant.allEmployees.data || [];
      const jobs = dashboardRestaurant.allJobs.data || [];

      // Filter employees to find those belonging to the current account
      const myEmployeeRecords = employees.filter(
        (employee) =>
          employee.address &&
          employee.address.toLowerCase() === account?.toLowerCase()
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

    
  }, [account, dashboardRestaurant]);

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
  const navigateToMainJobDashboard = () => {
    router.push('/mainJobDashboard');
  };

  return (
    <div className="BlueBackground">
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* This box will always appear in the center. If no jobs, it shows the message. */}
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
          zIndex: 9999 // Ensure this is on top
        }}
      >
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Your Jobs</h2>
        {myJobs && myJobs.length > 0 ? (
          myJobs.map((jobName, index) => (
            <button
            onClick={navigateToMainJobDashboard}
              key={index}
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
      <div width={250} height={250} onClick={navigateToIndex} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Image
          src="/Decentralized.png" 
          alt="Decentralized Image" 
          width={250} 
          height={250}
          style={{ position: 'relative', top: 0, left: 0 }} 
          priority={true}
        />
      </div>
      <div className="DashboardBackground">
        <EmployeeDashboardBody />
        <div className="RestaurantSelectorHomeButtons">
          <button className="clean-button-home-RestaurantSelector" onClick={navigateToIndex}>
            go to decentratality main page
          </button>
          <button className="clean-button-home-Dashboard" onClick={navigateToDashboard}>
            go back to main dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

