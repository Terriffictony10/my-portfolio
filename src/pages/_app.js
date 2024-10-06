import { ProviderContextProvider } from '../context/ProviderContext';
import { Provider } from 'react-redux';
import store, { persistor } from '@/store'; // Using alias for 'src'
import { PersistGate } from 'redux-persist/integration/react';

import 'bootstrap/dist/css/bootstrap.min.css';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ProviderContextProvider>
          <Component {...pageProps} />
        </ProviderContextProvider>
      </PersistGate>
    </Provider>
  );
}
