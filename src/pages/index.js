import React from 'react';
import CrowdsaleBody from '../components/crowdsaleBody.js';

export default function Home() {
  const navigateToDemo = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <div className="home-container">
      {/* Title / Heading */}
      <h1 className="site-title">Decentratality</h1>

      {/* Crowdsale Pane */}
      <div className="crowdsale-section">
        <CrowdsaleBody />
      </div>

      {/* Demo Navigation Button */}
      <button className="demo-button" onClick={navigateToDemo}>
        Go to Demo
      </button>
    </div>
  );
}
