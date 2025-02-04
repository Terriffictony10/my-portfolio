// src/components/WalletConnector.js
import React, { useState, useEffect, useCallback } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

const WalletConnector = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  // Configure provider options for Web3Modal with WalletConnect.
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "f35a83b4eba0446989ef9be5172774a5", // Replace with your actual Infura ID.
        mobileLinks: ["metamask", "trust", "rainbow"] // Wallets to display on mobile.
      }
    }
  };

  // Initialize Web3Modal
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: "light"
  });

  // Function to attempt opening MetaMask via its custom URL scheme using a hidden iframe.
  const openMetaMaskApp = async () => {
    // Create a hidden iframe that attempts to open the MetaMask app.
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'metamask://';
    document.body.appendChild(iframe);
    // Wait a short time (e.g., 800ms) to allow the scheme to trigger.
    await new Promise(resolve => setTimeout(resolve, 800));
    document.body.removeChild(iframe);
  };

  // Main wallet connection function.
  const connectWallet = useCallback(async () => {
    try {
      // If MetaMask is installed, try to open its app.
      
        await openMetaMaskApp();
        // Then request account access via MetaMask.
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
    // Otherwise, fall back to Web3Modal (which uses WalletConnect).
        const instance = await web3Modal.connect();
        const ethersProvider = new ethers.BrowserProvider(instance);
        setProvider(ethersProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
  }, [web3Modal]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet, web3Modal.cachedProvider]);

  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      {account ? (
        <p style={{ fontSize: '1rem', color: '#2d3436' }}>Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0d79d0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0984e3')}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnector;
