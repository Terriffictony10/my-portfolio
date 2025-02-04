// pages/_app.js

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import ReactModal from 'react-modal';

// If you use absolute import '@', make sure it's configured in your jsconfig.json/tsconfig.json
import store, { persistor } from '@/store';
import { ProviderContextProvider } from '@/context/ProviderContext';

// CSS imports here
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';

ReactModal.setAppElement('#__next'); // For react-modal accessibility

export default function MyApp({ Component, pageProps }) {
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
