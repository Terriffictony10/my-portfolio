// src/config.js

import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, defineChain } from '@reown/appkit/networks';
import  { injected }  from '@wagmi/connectors';

export const projectId = '6df9df8b72567f05d2f0d1503b13538f';

const localHardhatNetwork = defineChain({
  id: 31337,
  caipNetworkId: 'eip155:31337',
  chainNamespace: 'eip155',
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
      webSocket: ['ws://127.0.0.1:8545']
    }
  }
});

const customNetwork = defineChain({
  id: 84532,
  caipNetworkId: 'eip155:84532',
  chainNamespace: 'eip155',
  name: 'BaseSepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'BASESEP'
  },
  rpcUrls: {
    default: {
      http: ['https://base-sepolia.infura.io/v3/f35a83b4eba0446989ef9be5172774a5'],
      webSocket: ['wss://base-sepolia.infura.io/ws/v3/f35a83b4eba0446989ef9be5172774a5']
    }
  }
});
const baseNetwork = defineChain({
  id: 8453,
  caipNetworkId: 'eip155:8453',
  chainNamespace: 'eip155',
  name: 'Base',
  nativeCurrency: {
    decimals: 18,
    name: 'Base Ether',
    symbol: 'BASE'
  },
  rpcUrls: {
    default: {
      http: ['https://base-mainnet.infura.io/v3/f35a83b4eba0446989ef9be5172774a5'],
      webSocket: ['wss://base-mainnet.infura.io/ws/v3/f35a83b4eba0446989ef9be5172774a5']
    }
  }
});

export const networks = [baseNetwork];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  projectId,
  networks,
  connectors: [
    injected({
      chains: networks, // Provide your supported chains here
      options: {
        name: 'Injected Wallet',
        shimDisconnect: true,
      },
    }),
    // You can add additional connectors if desired
  ],
});

export const config = wagmiAdapter.wagmiConfig;
