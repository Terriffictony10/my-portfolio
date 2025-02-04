// components/AssignEthereum.js
import { useEffect, useState } from 'react';
import { useClient } from 'wagmi';

export default function AssignEthereum() {
  const client = useClient();
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    async function assignProviderShim() {
      // Make sure we have a client and a connector that exposes getProvider
      if (client?.connector && typeof client.connector.getProvider === 'function' && !window.ethereum) {
        try {
          // Get the actual provider from the connector
          const underlyingProvider = await client.connector.getProvider();
          console.log('Assigning provider to window.ethereum:', underlyingProvider);
          // Assign the underlying provider to window.ethereum
          window.ethereum = underlyingProvider;
          setAssigned(true);
        } catch (error) {
          console.error('Error retrieving provider from connector:', error);
        }
      }
    }

    assignProviderShim();
  }, [client]);

  return null;
}
