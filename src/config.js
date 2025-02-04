import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, defineChain } from '@reown/appkit/networks';

export const projectId = '6df9df8b72567f05d2f0d1503b13538f';

const customNetwork = defineChain({
  id: 11155111,
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
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org/' }
  },
  contracts: {
    // Add the contracts here if needed.
  }
});

export const networks = [mainnet, arbitrum, customNetwork];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
