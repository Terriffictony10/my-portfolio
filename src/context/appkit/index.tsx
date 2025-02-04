'use client';

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { projectId, networks } from '@/config';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Set up metadata with redirect so that MetaMask is one of the wallet options.
const metadata = {
  name: 'Decentratality',
  description: 'Stable crypto project for hospitality',
  url: 'https://your-project-website.com',
  icons: ['https://your-project-website.com/logo.png'],
  redirect: {
    // On mobile, this tells the wallet connector to open MetaMask
    native: 'metamask://',
    universal: 'https://metamask.app.link'
  }
};

export const modal = createAppKit({
  adapters: [new WagmiAdapter()],
  projectId,
  networks,
  metadata,
  themeMode: 'light',
  features: {
    analytics: true
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
});

function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default AppKitProvider;
