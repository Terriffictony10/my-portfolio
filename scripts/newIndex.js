import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
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
    ensAddress:
      chain.contracts && chain.contracts.ensRegistry
        ? chain.contracts.ensRegistry.address
        : undefined,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}


export default function Home() {
  const { isConnected } = useAppKitAccount();
  const ethersProvider = useEthersProvider({ chainId: 8453 });
  const ethersSigner = useEthersSigner({ chainId: 8453 });
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
        const mynetwork = await provider.getNetwork();
        const chainId = mynetwork.chainId;
        const token = new ethers.Contract(
          config[chainId].token.address,
          TOKEN_ABI,
          ethersSigner
        );
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-300 to-white">
      <h1 className="text-5xl font-serif font-thin mb-10">
        Elegant Title
      </h1>
      <div className="w-4/5 flex bg-gray-200 bg-opacity-90 shadow-lg rounded-2xl overflow-hidden h-[300px]">
        <div className="w-1/2 p-10 border-r border-gray-400">
          {/* Left half content goes here */}
        </div>
        <div className="w-1/2 p-10">
          {/* Right half content goes here */}
        </div>
      </div>
    </div>
  );
}
