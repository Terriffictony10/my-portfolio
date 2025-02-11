import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/react';
import { useEthersProvider, useEthersSigner } from './crowdsaleBody';
import { ShinyButton } from './magicui/shiny-button';

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
      const { address } = await ethersSigner;
      const response = await fetch(`/api/merkleProof?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Merkle proof');
      }
      const { proof } = await response.json();
      const value = ethers.parseUnits((amount * price).toString(), 'ether');
      const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');
      const transaction = await crowdsale.connect(ethersSigner).buyTokens(formattedAmount, proof, { value });
      await transaction.wait();
    } catch (error) {
      console.error(error);
      window.alert('User rejected or transaction reverted');
    }
    setIsLoading(true);
    setIsWaiting(false);
  };

  return (
    <form onSubmit={buyHandler} style={{transform: 'translate(-0%, 20%)'}}>
      <input
        type="number"
        placeholder="Enter token amount"
        onChange={(e) => setAmount(e.target.value)}
        className="buy-text-input p-2 rounded-md border"
      />
      {isWaiting ? (
        <span className="buy-spinner text-white">Processing...</span>
      ) : (
        <ShinyButton type="submit" className="crowdsale-buy-button">
          Purchase Tokens
        </ShinyButton>
      )}
    </form>
  );
};

export default Buy;
