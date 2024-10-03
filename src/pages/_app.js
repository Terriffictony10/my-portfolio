import { ProviderContextProvider } from '../context/ProviderContext';
import { Provider } from 'react-redux';
import  store  from '@/store'; // Using alias for 'src'

import 'bootstrap/dist/css/bootstrap.min.css';
import "@/styles/globals.css";


export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ProviderContextProvider>
        <Component {...pageProps} />
      </ProviderContextProvider>
    </Provider>
  );
}
