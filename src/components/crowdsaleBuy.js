import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { useWalletInfo } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';
import { useEthersProvider, useEthersSigner, clientToProvider, clientToSigner } from './crowdsaleBody';

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {
  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const [amount, setAmount] = useState('0');
  const [isWaiting, setIsWaiting] = useState(false);

  const buyHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    try {
      // Retrieve the signer details
      const { address } = await ethersSigner;
      const response = await fetch(`/api/merkleProof?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Merkle proof');
      }
      const { proof } = await response.json();
      const value = ethers.parseUnits((amount * price).toString(), 'ether');
      const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');
      const transaction = await crowdsale
        .connect(ethersSigner)
        .buyTokens(formattedAmount, proof, { value });
      await transaction.wait();
    } catch (error) {
      console.error(error);
      window.alert('User rejected or transaction reverted');
    }
    setIsLoading(true);
    setIsWaiting(false);
  };

  return (
    <Form onSubmit={buyHandler} className="buy-form">
      <Form.Group as={Row} className="buy-form-group">
        <Col>
          <Form.Control
            type="number"
            placeholder="Enter token amount"
            onChange={(e) => setAmount(e.target.value)}
            className="buy-text-input"
          />
        </Col>
        <Col>
          {isWaiting ? (
            <Spinner animation="border" className="buy-spinner" />
          ) : (
            <button type="submit" className="crowdsale-buy-button">
              Purchase Tokens
            </button>
          )}
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Buy;
