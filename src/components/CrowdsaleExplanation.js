import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

const CrowdsaleExplanation = () => {
  return (
    <div style={{ fontSize: '1rem', lineHeight: '1.5rem', marginBottom: '2rem' }}>
      <p>
        Welcome to the Decentratality Crowdsale! Your investment drives a revolutionary project with a smart safety net:
      </p>
      <ul>
        <li>
          <strong>Refund Guarantee:</strong> If the funding goal is not reached by the end of the sale, every investor is automatically refunded.
        </li>
        <li>
          <strong>When the Goal Is Met:</strong> If we hit our funding goal, funds will be allocated as follows:
          <ul>
            <li>
              <strong>50%</strong> to create a liquidity pool on a decentralized exchange&mdash;ensuring you can easily convert your tokens into value.
            </li>
            <li>
              <strong>40%</strong> to hiring additional support staff&mdash;providing robust customer and technical support.
            </li>
            <li>
              <strong>10%</strong> to the current development team&mdash;fueling continuous innovation.
            </li>
          </ul>
        </li>
        <li>
          <strong>Future Enhancements:</strong> If you&apos;re tired of malicious developers scamming you with meme-coins and want a stable crypto project to invest in, look no further. Don&apos;t miss your chance to be an early investor in essentially the &quot;Facebook of Food.&quot; Decentratality is designed to be a secure hub where employees can store all their employment-related information safely while building a public profile that highlights their strengths in hospitality. Our platform will also offer professional classes with tracked progress for career advancement, community conversation similar to Reddit/Instagram, and an all-in-one web app for POS transactions, employee payments, and document management.
        </li>
      </ul>
      <p>
        The visual breakdown below shows exactly how funds will be divided if the funding goal is met:
      </p>
      <ProgressBar style={{ height: '1.2rem', marginBottom: '1rem' }}>
        <ProgressBar variant="success" now={50} key={1} label="50% Pool" />
        <ProgressBar variant="info" now={40} key={2} label="40% Hiring" />
        <ProgressBar variant="warning" now={10} key={3} label="10% Dev" />
      </ProgressBar>
      <p>
        Invest with confidence&mdash;if the goal isn&apos;t reached, you get your money back automatically. Join us and be a part of the future of hospitality!
      </p>
    </div>
  );
};

export default CrowdsaleExplanation;
