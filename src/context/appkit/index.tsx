'use client'

import { wagmiAdapter} from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()
const projectId = "6df9df8b72567f05d2f0d1503b13538f"
if (!projectId) {
  throw new Error('Project ID is not defined')
}


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

// Create the modal
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
    '--w3m-accent': '#000000'
  }
});

function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default AppKitProvider;