import React, { useState, useEffect, useMemo } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Image from 'next/image';
import AnimatedCircularProgressBar from '../components/magicui/animated-circular-progress-bar';
import WarpBackground from '../components/magicui/warp-background'; // Ensure the path is correct
import WalletConnector from '../components/WalletConnector';
import AdminSchedule from '../components/AdminSchedule';
import CrowdsaleBody from '../components/crowdsaleBody';
import CrowdsaleExplanation from '../components/CrowdsaleExplanation';
import { useWalletInfo } from '@reown/appkit/react';
import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
import { Configure, useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Use the RPC URL provided by the transport.
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
    <div className="accordion-item">
      <div
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const InfoAccordion = () => {
  return (
    <div style={{ textAlign: 'left' }}>
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
          className="action-button learnmore-button"
          onClick={() => window.scrollTo({ top: 600, left: 0, behavior: 'smooth' })}
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>About Decentratality</h2>
        <p>
          Tired of malicious developers scamming you with meme-coins? Look no further &mdash; Decentratality is the stable crypto project you&apos;ve been waiting for. Don&apos;t miss your chance to be an early investor in essentially the &quot;Facebook of Food.&quot;
        </p>
        <p>
          Our vision is to create a secure environment where employees can store all employment-related information safely &mdash; shielded from seizure &mdash; while linking that data to a public, customizable profile that highlights their strengths in the hospitality industry. Within the Decentratality Hub, users can take professional classes with tracked progress, engage in community conversations, and enjoy an all-in-one web app that handles POS transactions, employee payments, and document management.
        </p>
        <button
          className="action-button demo-button"
          onClick={onClose}
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
      if (isConnected && ethersSigner) {
        const { provider, address } = await ethersSigner;
        const response = await fetch(`/api/checkAdmin?address=${address}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    }
    if (isConnected && ethersSigner) {
      checkIfAdmin();
    }
  }, [isConnected, ethersSigner]);

  const navigateToDemo = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <WarpBackground
      perspective={200}
      beamsPerSide={4}
      beamSize={5}
      beamDelayMax={3}
      beamDelayMin={0}
      beamDuration={4}
      gridColor="hsl(0, 0%, 80%)"
      className="min-h-screen"
    >
      <div className="home-container">
        <WalletConnector />
        <div>
          <div className="landing-pane">
            <Image
              src="/logo.png"
              alt="Decentratality"
              width={300}
              height={100}
              className="dashboard-image"
            />
          </div>
        </div>
        {isAdmin && (
          <div className="admin-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Menu</h2>
            <p style={{ fontSize: '1.125rem' }}>This menu is only visible to the admin.</p>
            {ethersSigner && <AdminSchedule provider={provider} />}
          </div>
        )}
        <div className="crowdsale-section">
          <CrowdsaleExplanation />
          <CrowdsaleBody />
        </div>
        <div className="action-buttons">
          <button
            className="action-button demo-button"
            onClick={navigateToDemo}
          >
            Go to Demo
          </button>
          <button
            className="action-button learnmore-button"
            onClick={() => setModalOpen(true)}
          >
            Learn More
          </button>
        </div>
        <InfoAccordion />
        <LearnMoreModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        
      </div>
    </WarpBackground>
  );
}
