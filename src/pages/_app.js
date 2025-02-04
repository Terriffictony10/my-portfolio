// pages/_app.js

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ReactModal from 'react-modal';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// If you use absolute import '@', make sure it's configured in your jsconfig.json/tsconfig.json
import store, { persistor } from '@/store';
import { ProviderContextProvider } from '@/context/ProviderContext';
import AppKitProvider from '../context/appkit'; // Your provider context file

// Import your wagmi configuration (created via the Reown AppKit adapter)
import { config } from '@/config';

// CSS imports here
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';

ReactModal.setAppElement('#__next'); // For react-modal accessibility

// Create a QueryClient instance for react-query
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  return (
    <AppKitProvider>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ProviderContextProvider>
                <Component {...pageProps} />
              </ProviderContextProvider>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </WagmiConfig>
    </AppKitProvider>
  );
}
