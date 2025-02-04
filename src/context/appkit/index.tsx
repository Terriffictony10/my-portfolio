'use client'

import { wagmiAdapter} from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()
const projectId = "f35a83b4eba0446989ef9be5172774a5"
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
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider