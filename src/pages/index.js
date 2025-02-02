import React, { useState } from 'react';
import CrowdsaleBody from '../components/crowdsaleBody.js';

// A simple modal component
function LearnMoreModal({ isOpen, onClose }) {
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
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.26)',
          textAlign: 'center',
        }}
      >
        <h2>About Decentratality</h2>
        <p>
          Decentratality is developing a software service for hospitality companies that
          leverages EVM-compatible blockchains. Our system will integrate financial management
          with payroll, inventory, property costs/permits, and more.
        </p>
        <p>
          Accessible globally, our platform uses blockchain information to securely identify users,
          and it includes employee onboarding systems that link blockchain accounts to real-life
          identities—ensuring secure and compliant payroll.
        </p>
        <p>
          This system is under development, and we invite you to support its evolution through our
          crowdsale. Your donation helps us build a future where vendors and service providers
          worldwide can simplify their operations and reduce costs.
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            borderRadius: '4px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// A simple AccordionItem component
function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#f9f9f9',
          padding: '10px 15px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div style={{ padding: '10px 15px', backgroundColor: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// The InfoAccordion component containing several accordion items
function InfoAccordion() {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '800px',
        margin: '20px auto',
        textAlign: 'left',
      }}
    >
      <AccordionItem title="Our Vision">
        <p>
          We aim to revolutionize the hospitality industry by integrating multiple management
          systems into one secure, blockchain-powered platform.
        </p>
      </AccordionItem>
      <AccordionItem title="Blockchain Integration">
        <p>
          Leveraging EVM-compatible blockchains, our service ensures every transaction and piece
          of financial data is recorded securely and is easily verifiable.
        </p>
      </AccordionItem>
      <AccordionItem title="Employee Onboarding">
        <p>
          Our innovative onboarding system links blockchain accounts to real-life identities,
          ensuring that payroll processes remain secure and compliant.
        </p>
      </AccordionItem>
      <AccordionItem title="Support the Future">
        <p>
          This project is still in development. Help us complete the system by contributing to our
          crowdsale.
        </p>
        <button
          style={{
            padding: '8px 16px',
            marginTop: '10px',
            backgroundColor: '#FF5722',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => (window.location.href = '/Donate')}
        >
          Donate Now
        </button>
      </AccordionItem>
    </div>
  );
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const navigateToDemo = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <div
      className="home-container"
      style={{
        background: 'linear-gradient(135deg, #81ecec, #74b9ff)',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      {/* Title / Heading */}
      <h1
        className="site-title"
        style={{ textAlign: 'center', color: '#2d3436', marginBottom: '20px' }}
      >
        Decentratality
      </h1>

      {/* Crowdsale Pane */}
      <div
        className="crowdsale-section"
        style={{
          margin: '20px auto',
          maxWidth: '800px',
          backgroundColor: '#dfe6e9',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <CrowdsaleBody />
      </div>

      {/* Navigation & Learn More Buttons */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          className="demo-button"
          onClick={navigateToDemo}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#0984e3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go to Demo
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c5ce7',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Learn More
        </button>
      </div>

      {/* Accordion Section with Additional Information */}
      <InfoAccordion />

      {/* Learn More Modal */}
      <LearnMoreModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
