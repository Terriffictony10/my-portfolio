import React, { useState } from 'react';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden'
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
          alignItems: 'center'
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
};

const InfoAccordion = () => {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '800px',
        margin: '20px auto',
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
          Our innovative onboarding system links blockchain accounts to real-life identities, ensuring that payroll processes remain secure and compliant.
        </p>
      </AccordionItem>
      <AccordionItem title="Support the Future">
        <p>
          This project is still in development. Help us complete the system by contributing to our crowdsale.
        </p>
        <button
          style={{
            padding: '8px 16px',
            marginTop: '10px',
            backgroundColor: '#FF5722',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => (window.location.href = '/Donate')}
        >
          Donate Now
        </button>
      </AccordionItem>
    </div>
  );
};

export default InfoAccordion;
