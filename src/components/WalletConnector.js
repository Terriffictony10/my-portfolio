'use client';

import React from 'react';

// This component simply renders the Reown AppKit custom wallet connect button.
// Reown AppKit automatically handles the modal and wallet connection when this button is clicked.
const WalletConnector = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <appkit-button
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
      >
        Connect Wallet
      </appkit-button>
    </div>
  );
};

export default WalletConnector;
