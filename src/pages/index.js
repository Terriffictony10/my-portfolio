import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Image from 'next/image';
import WarpBackground from '../components/magicui/warp-background';
import WalletConnector from '../components/WalletConnector';
import AdminSchedule from '../components/AdminSchedule';
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';

// Magic UI Components
import { BentoGrid, BentoCard } from '../components/magicui/bento-grid';
import { Terminal, TypingAnimation } from '../components/magicui/terminal';
import { Marquee } from '../components/magicui/marquee';
import { OrbitingCircles } from '../components/magicui/orbiting-circles';

// Our updated Crowdsale UI
import CrowdsaleBody from '../components/crowdsaleBody';

// -------------------------
// Blockchain Helpers
export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new ethers.JsonRpcProvider(transport.url, network);
}
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
  return new JsonRpcSigner(provider, account.address);
}
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

// -------------------------
// Navbar Component (Fixed at the top)
const Navbar = ({ account, tokenBalance }) => {
  return (
    <nav className="navbar">
  <div className="navbar-left">
    <WalletConnector />
  </div>
  <div className="navbar-right" style={{ position: 'relative' }}>
    <div 
      className="decentratalityfont"
      style={{ 
        fontSize: '5rem',
        transform: 'translateX(-350px)'
      }}
    >
      Decentratality
    </div>
    {/* This account info is now absolutely positioned, so it won't push the other elements */}
    {account && (
      <div 
        className="account-info-navbar"
        style={{
          color: 'blue',
          position: 'absolute',
          top: '30',        // Adjust as needed
          right: '0',      // Adjust as needed
          zIndex: 10,
          transform: 'translateX(-190px)',
          backgroundColor: 'rgba(0,0,0,0)',
                // Ensure it appears on top
           // Optional: a background to improve readability
          padding: '0.5rem'
        }}
      >
        <span className="account-text">
  Account: {account.slice(0, 4)}...{account.slice(-4)}
</span>
        <span className="token-balance" style={{ marginLeft: '1rem' }}>
          Tokens: {tokenBalance}
        </span>
      </div>
    )}
    <div className="logo">
      <Image 
        src="/logo.png" 
        alt="Decentratality" 
        width={150} 
        height={50} 
        className="dashboard-image" 
      />
    </div>
  </div>
</nav>
  );
};

// -------------------------
// Extra Dynamic Components
const CodeTerminal = () => (
  <Terminal className="mx-auto my-8">
    <TypingAnimation delay={0}>{"$ npm install decentratality"}</TypingAnimation>
    <TypingAnimation delay={500}>{"$ npm run start"}</TypingAnimation>
    <TypingAnimation delay={1000}>{"Connecting to blockchain..."}</TypingAnimation>
    <TypingAnimation delay={1500}>{"Initializing secure protocols..."}</TypingAnimation>
    <TypingAnimation delay={2000}>{"Success! Welcome to Decentratality."}</TypingAnimation>
  </Terminal>
);
const ExtraMarquee = () => (
  <Marquee pauseOnHover reverse className="mb-8">
    <span className="mx-4 text-xl text-white">Decentralized • Secure • Innovative</span>
  </Marquee>
);
const ExtraOrbitingCircles = () => (
  <OrbitingCircles radius={120} iconSize={40}>
    <span role="img" aria-label="star">⭐</span>
    <span role="img" aria-label="rocket">🚀</span>
    <span role="img" aria-label="shield">🛡️</span>
    <span role="img" aria-label="sparkles">✨</span>
  </OrbitingCircles>
);

// -------------------------
// Standard InfoAccordion
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>{children}</div>
    </div>
  );
};
const InfoAccordion = () => (
  <div className="info-accordion">
    <AccordionItem title="Our Vision">
      <p>
        We aim to revolutionize hospitality by integrating multiple management systems into one secure, blockchain-powered platform.
      </p>
    </AccordionItem>
    <AccordionItem title="Blockchain Integration">
      <p>
        Leveraging EVM-compatible blockchains, every transaction is securely recorded.
      </p>
    </AccordionItem>
    <AccordionItem title="Employee Onboarding">
      <p>
        Our system links blockchain accounts to real-life identities for secure, compliant profiles.
      </p>
    </AccordionItem>
    <AccordionItem title="Support the Future">
      <p>
        Contribute to our crowdsale and join us in building the future of hospitality.
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

// -------------------------
// Learn More Modal
const LearnMoreModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>About Decentratality</h2>
        <p>
          Decentratality is the secure crypto platform you’ve been waiting for. Our revolutionary approach combines blockchain integrity with modern financial management—empowering businesses and employees.
        </p>
        <p>
          With professional classes, community engagement, and an all-in-one web app for transactions and data management, we are redefining digital hospitality.
        </p>
        <button className="action-button demo-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// -------------------------
// Main Home Component
export default function Home() {
  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 8453 });
  const ethersSigner = useEthersSigner({ chainId: 8453});
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");

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

  useEffect(() => {
    async function getAccountInfo() {
      if (isConnected && ethersSigner) {
        const { provider, address } = await ethersSigner;
        setAccount(address);
        // Simulated token balance for demonstration purposes
        
          
          const mynetwork = await provider.getNetwork();
          const chainId = mynetwork.chainId;
          const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, ethersSigner);
        const crowdsaleContract = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, ethersSigner);
        const balance = await token.balanceOf(address);
          setTokenBalance(ethers.formatUnits(balance, 18));
      }
    }
    getAccountInfo();
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
      className="min-h-screen min-w-screen"
    >
      {/* Fixed Top Navbar */}
      <Navbar account={account} tokenBalance={tokenBalance} />

      {/* Main Content */}
      <div className="main-content">
        <div className="intro-section">
          <h1>Welcome to Decentratality</h1>
          <p>
            Discover a new era in digital hospitality where blockchain meets secure financial management.
          </p>
        </div>

        {/* Crowdsale Menu – Reworked with Magic UI components */}
        <div className="crowdsale-menu">
          <h2 className="crowdsale-title">Join the Crowdsale</h2>
          <p className="crowdsale-description-text">
            Take a look at these videos if you want to know more about how Decentratality will bring the blockchain to the front and back of house of your restaurant soon!
          </p>

          {/* Video Spots */}
          <div
            className="video-section"
            style={{
              display: 'flex',
              gap: '1rem',
              margin: '1rem 0',
              flexWrap: 'wrap'
            }}
          >
            <div className="video-section" style={{ display: 'flex', width: '1200px', gap: '1rem', margin: '1rem 0'}}>
  <div className="video-spot" style={{ flex: 1, minWidth: '300px' }}>
    <iframe 
  width="100%"
  height="315"
  src="https://www.youtube.com/embed/y4tL3pWq-Os"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
</div>
<div className="video-spot" style={{ flex: 1, minWidth: '300px' }}>
  <iframe
    width="100%"
    height="315"
    src="https://www.youtube.com/embed/ICx8HkmynZc?si=vU6BeJmhvtaw-GsX"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  ></iframe>

  </div>
</div>

          </div>

          <CrowdsaleBody />
        </div>

        {/* Terminal Demo */}
        <CodeTerminal />

        {/* Extras */}
        <div className="extras">
          <ExtraMarquee />
          <ExtraOrbitingCircles />
        </div>

        {/* Info Accordion */}
        <InfoAccordion />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button demo-button" onClick={navigateToDemo}>
            Go to Demo
          </button>
          <button className="action-button learnmore-button" onClick={() => setModalOpen(true)}>
            Learn More
          </button>
        </div>

        {/* Learn More Modal */}
        <LearnMoreModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </WarpBackground>
  );
}
