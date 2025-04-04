'use client';

import React from 'react';

// This component renders the Reown AppKit custom wallet connect button.
// When the user clicks the button, the AppKit logic opens a modal with wallet options (including MetaMask).
const WalletConnector = () => {
  return (
    <div style={{ textAlign: 'center', zIndex: "900"}} className={"walletconnector"}>
      {/* The custom element below is provided by Reown AppKit */}
      <appkit-button
        label="Login"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0984e3',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'background-color 0.3s ease'
        }}
      />

    </div>
  );
};

export default WalletConnector;
