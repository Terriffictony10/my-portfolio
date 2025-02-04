// pages/_app.js
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppKitProvider from '../context/appkit';
import { config } from '@/config';
import store, { persistor } from '@/store';
import AssignEthereum from '../components/AssignEthereum'; // import the shim component

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <AppKitProvider>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              {/* This will assign window.ethereum after connection */}
              <AssignEthereum />
              <Component {...pageProps} />
            </PersistGate>
          </ReduxProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </AppKitProvider>
  );
}

export default MyApp;
