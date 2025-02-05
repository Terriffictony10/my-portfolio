// src/pages/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Image from 'next/image';
import WalletConnector from '../components/WalletConnector';
import AdminSchedule from '../components/AdminSchedule';
import CrowdsaleBody from '../components/crowdsaleBody';
import CrowdsaleExplanation from '../components/CrowdsaleExplanation';
import { useWalletInfo } from '@reown/appkit/react';
import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
import { Configure, useClient, useConnectorClient } from 'wagmi';

/** Convert a viem Client to an ethers.js Provider. */
export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Use the RPC URL provided by the transport.
  // (Make sure your configuration passes a valid URL instead of defaulting to localhost)
  return new ethers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}
export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts && chain.contracts.ensRegistry ? chain.contracts.ensRegistry.address : undefined,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div
        style={{
          maxHeight: isOpen ? '500px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          padding: isOpen ? '1rem' : '0 1rem'
        }}
      >
        {children}
      </div>
    </div>
  );
};

const InfoAccordion = () => {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '800px',
        margin: '2rem auto',
        textAlign: 'left'
      }}
    >
      <AccordionItem title="Our Vision">
        <p>
          We aim to revolutionize the hospitality industry by integrating multiple management systems into one secure, blockchain-powered platform.
        </p>
      </AccordionItem>
      <AccordionItem title="Blockchain Integration">
        <p>
          Leveraging EVM-compatible blockchains, our service ensures every transaction and piece of financial data is recorded securely and is easily verifiable.
        </p>
      </AccordionItem>
      <AccordionItem title="Employee Onboarding">
        <p>
          Our innovative onboarding system links blockchain accounts to real-life identities, ensuring that payroll processes remain secure and compliant while giving employees a customizable public profile.
        </p>
      </AccordionItem>
      <AccordionItem title="Support the Future">
        <p>
          This project is still in development. Contribute to our crowdsale and join us in building the future of hospitality.
        </p>
        <button
          style={{
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            backgroundColor: '#FF5722',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onClick={() => (window.location.href = '/Donate')}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e64a19')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF5722')}
        >
          Donate Now
        </button>
      </AccordionItem>
    </div>
  );
};

const LearnMoreModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.5s'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.26)',
          textAlign: 'center'
        }}
      >
        <h2>About Decentratality</h2>
        <p>
          Tired of malicious developers scamming you with meme-coins? Look no further &mdash; Decentratality is the stable crypto project you&apos;ve been waiting for. Don&apos;t miss your chance to be an early investor in essentially the &quot;Facebook of Food.&quot;
        </p>
        <p>
          Our vision is to create a secure environment where employees can store all employment-related information safely &mdash; shielded from seizure &mdash; while linking that data to a public, customizable profile that highlights their strengths in the hospitality industry. Within the Decentratality Hub, users can take professional classes with tracked progress, engage in community conversations, and enjoy an all-in-one web app that handles POS transactions, employee payments, and document management.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#43A047')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    async function checkIfAdmin() {
      if (isConnected) {
        // Determine which provider to use:
        // If an injected provider exists, use it; otherwise, use the ethersProvider from our hook.
        let providerInstance;
        if (window.ethereum) {
          providerInstance = new ethers.BrowserProvider(window.ethereum);
        } else if (ethersProvider) {
          providerInstance = ethersProvider;
        }
        if (providerInstance) {
          setProvider(providerInstance);
          try {
            const signer = await providerInstance.getSigner();
            const addr = await signer.getAddress();
            const response = await fetch(`/api/checkAdmin?address=${addr}`);
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          } catch (error) {
            console.error('Error getting signer or checking admin:', error);
          }
        }
      }
    }
    checkIfAdmin();
  }, [isConnected, ethersProvider]);

  const navigateToDemo = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <div
      className="home-container"
      style={{
        background: 'url("hospitality-bg.jpg") no-repeat center center/cover',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <WalletConnector />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Image
          src="/logo.png"
          alt="Decentratality"
          width={300}
          height={100}
          style={{ margin: '0 auto' }}
        />
      </div>
      {isAdmin && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Menu</h2>
          <p style={{ fontSize: '1.125rem' }}>This menu is only visible to the admin.</p>
          {provider && <AdminSchedule provider={provider} />}
        </div>
      )}
      <div
        className="crowdsale-section"
        style={{
          margin: '20px auto',
          maxWidth: '900px',
          backgroundColor: '#dfe6e9',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <CrowdsaleExplanation />
        <CrowdsaleBody />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={navigateToDemo}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '1rem',
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
          Go to Demo
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c5ce7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#5847b0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6c5ce7')}
        >
          Learn More
        </button>
      </div>
      <InfoAccordion />
      <LearnMoreModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
