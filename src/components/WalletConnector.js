// src/components/WalletConnector.js
import React, { useState, useEffect, useCallback } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

const WalletConnector = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "YOUR_INFURA_ID" // Replace with your Infura ID
      }
    }
  };

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
  });

  const connectWallet = useCallback(async () => {
    try {
      const instance = await web3Modal.connect();
      const ethersProvider = new ethers.BrowserProvider(instance);
      setProvider(ethersProvider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
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
