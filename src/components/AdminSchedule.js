import { useState, useRef, useEffect, useMemo } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import config from '../config.json';
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

const AdminSchedule = ({ provider }) => {
  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600 * 1000));
  const [fundingGoalEth, setFundingGoalEth] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  useEffect(() => {
    if (startDateInputRef.current) {
      flatpickr(startDateInputRef.current, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        defaultDate: startDate,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) setStartDate(selectedDates[0]);
        }
      });
    }
    if (endDateInputRef.current) {
      flatpickr(endDateInputRef.current, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        defaultDate: endDate,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) setEndDate(selectedDates[0]);
        }
      });
    }
  }, [startDate, endDate]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { provider, address} = await ethersSigner;
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, ethersSigner);
      const saleStartTimestamp = Math.floor(startDate.getTime() / 1000);
      const saleEndTimestamp = Math.floor(endDate.getTime() / 1000);
      const fundingGoalWei = ethers.parseUnits(fundingGoalEth.toString(), 'ether');
      const tx = await crowdsale.scheduleCrowdsale(saleStartTimestamp, saleEndTimestamp, fundingGoalWei);
      await tx.wait();
      alert('Crowdsale scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling crowdsale:', error);
      alert('Error scheduling crowdsale. See console for details.');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSchedule} style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
        <input type="text" ref={startDateInputRef} style={{ padding: '8px', width: '100%' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
        <input type="text" ref={endDateInputRef} style={{ padding: '8px', width: '100%' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Funding Goal (ETH):</label>
        <input
          type="number"
          step="0.01"
          placeholder="Enter funding goal in ETH"
          value={fundingGoalEth}
          onChange={(e) => setFundingGoalEth(e.target.value)}
          style={{ padding: '8px', width: '100%' }}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px' }}>
        {isSubmitting ? 'Scheduling...' : 'Schedule Crowdsale'}
      </button>
    </form>
  );
};

export default AdminSchedule;
