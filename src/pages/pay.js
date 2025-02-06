// pages/pay.js
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import POS_ABI from '../abis/POS.json';
import { useSelector, useDispatch } from 'react-redux';

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
export default function PayPage() {

  const { address, isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const router = useRouter();
  const  posAddress = useSelector((state) => state.DashboardRestaurant.currentRelevantPOS[0].address);
  const ticketId =  useSelector((state) => state.DashboardRestaurant.activeTicket.id);

  useEffect(() => {
    

    const payTicket = async () => {
      try {
        
        // 1) Connect to blockchain
        const { provider, address} = await ethersSigner;
        

        // 2) Load POS contract
        const posContract = new ethers.Contract(posAddress, POS_ABI, ethersSigner);

        // 3) Fetch the ticket to sum up costs in Wei
        
        const ticketStruct = await posContract.getTicket(ticketId);
         
        let totalCost = 0
        
        for (let i = 0; i < ticketStruct.orders.length; i++) {
          totalCost = totalCost + Number(ticketStruct.orders[i].cost);
        }

        // 4) Call payTicket, passing in the signer’s address & totalCost as msg.value
        
        const tx = await posContract.payTicket(ticketId, address.toString(), { value: BigInt(totalCost) });
        console.log(tx)
        await tx.wait();

        // 5) Once confirmed, redirect back to /POSterminal
        router.replace('/POSterminal');
      } catch (error) {
        console.error('Payment failed:', error);
        // You could optionally redirect them back anyway or show an error page
        // router.replace('/POSterminal');
      }
    };
    if(isConnected && ethersSigner){
      payTicket();
    }
    
  }, [router, posAddress, ticketId, isConnected, ethersSigner]);

  // No UI at all
  return null;
}
