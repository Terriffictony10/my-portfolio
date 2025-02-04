import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {
  const [amount, setAmount] = useState('0');
  const [isWaiting, setIsWaiting] = useState(false);

  const buyHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    try {
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const response = await fetch(`/api/merkleProof?address=${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Merkle proof');
      }
      const { proof } = await response.json();
      const value = ethers.parseUnits((amount * price).toString(), 'ether');
      const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');
      const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, proof, { value: value });
      await transaction.wait();
    } catch (error) {
      console.error(error);
      window.alert('User rejected or transaction reverted');
    }
    setIsLoading(true);
    setIsWaiting(false);
  };

  return (
    <Form onSubmit={buyHandler} style={{ fontSize: '0.6rem' }}>
      <Form.Group as={Row} style={{ marginBottom: '0.2rem' }}>
        <Col>
          <Form.Control
            type="number"
            placeholder="Enter token amount"
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: '0.6rem', padding: '0.2rem' }}
          />
        </Col>
        <Col>
          {isWaiting ? (
            <Spinner animation="border" style={{ width: '0.8rem', height: '0.8rem' }} />
          ) : (
            <button
              type="submit"
              style={{
                fontSize: '0.6rem',
                padding: '0.2rem 0.4rem',
                cursor: 'pointer'
              }}
            >
              Purchase Tokens
            </button>
          )}
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Buy;
