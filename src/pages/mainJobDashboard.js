import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function EmployeePage() {
  const router = useRouter();
  const account = useSelector((state) => state.provider?.account);
  const dashboardRestaurant = useSelector((state) => state.DashboardRestaurant);

  const [myJobs, setMyJobs] = useState([]);

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

      const myEmployeeRecords = employees.filter(
        (employee) =>
          employee.address &&
          employee.address.toLowerCase() === account?.toLowerCase()
      );

      const jobNames = myEmployeeRecords
        .map((employee) => {
          const job = jobs.find((j) => j.id === employee.jobId);
          return job ? job.jobName : null;
        })
        .filter(Boolean);

      setMyJobs(jobNames);
    }
  }, [account, dashboardRestaurant]);

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

      {/* Center Box to Display Jobs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid white',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          minWidth: '300px',
          zIndex: 9999,
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
                border: 'none',
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
            minHeight: '150px'
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Hours</h3>
          {/* Insert logic/content for employee hours here */}
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
            minHeight: '150px'
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Schedule</h3>
          {/* Insert logic/content for employee schedule here */}
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
            minHeight: '150px'
          }}
        >
          <h3 style={{ color: '#fff' }}>Employee Info</h3>
          {/* Insert logic/content for employee info here */}
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
            justifyContent: 'center'
          }}
        >
          <button
            onClick={openPOS}
            style={{
              backgroundColor: '#17a2b8',
              border: 'none',
              color: '#fff',
              padding: '15px 30px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Open POS
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
