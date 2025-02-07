import { useState, useMemo  } from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';

import { useWalletInfo } from '@reown/appkit/react';
import wagmi from "../context/appkit/index.tsx";
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';

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
      const { provider, address} = await ethersSigner;
      const userAddress = await signer.getAddress();
      const response = await fetch(`/api/merkleProof?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Merkle proof');
      }
      const { proof } = await response.json();
      const value = ethers.parseUnits((amount * price).toString(), 'ether');
      const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');
      const transaction = await crowdsale.connect(ethersSigner).buyTokens(formattedAmount, proof, { value: value });
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
            style={{ fontSize: '1.4rem', padding: '0.2rem' }}
            className={"buy-text-input"}
          />
        </Col>
        <Col>
          {isWaiting ? (
            <Spinner animation="border" style={{ width: '0.8rem', height: '0.8rem' }} />
          ) : (
            <button
              type="submit"
              style={{
                fontSize: '1.6rem',
                padding: '0.2rem 0.4rem',
                cursor: 'pointer',
                backgroundColor: "green"
              }}
              className={"crowdsale-buy-button"}
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
