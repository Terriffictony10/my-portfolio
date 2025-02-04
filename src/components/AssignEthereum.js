// components/AssignEthereum.js
import { useEffect } from 'react';
import { useClient } from 'wagmi';

export default function AssignEthereum() {
  const client = useClient();

  useEffect(() => {
    if (client && !window.ethereum) {
      // For debugging purposes, you might log the provider
      console.log('Assigning provider to window.ethereum:', provider);
      window.ethereum = client;
    }
  }, [client]);

  return null;
}
