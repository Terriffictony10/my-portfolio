// components/AutoFinalize.js
import { useEffect } from 'react';
import { ethers } from 'ethers';

const AutoFinalize = ({ provider, crowdsale }) => {
  useEffect(() => {
    const checkAndFinalize = async () => {
      try {
        // Fetch the sale end time and finalization status from the contract.
        const saleEnd = await crowdsale.saleEnd();
        const finalized = await crowdsale.finalized();

        // If the sale has ended and the crowdsale is not finalized…
        if (Date.now() / 1000 >= saleEnd && !finalized) {
          // Await the provider.getSigner() call
          const signer = await provider.getSigner();
          const account = await signer.getAddress();
          const owner = await crowdsale.owner();
          if (account.toLowerCase() === owner.toLowerCase()) {
            console.log("Finalizing crowdsale automatically...");
            const tx = await crowdsale.connect(signer).finalize();
            await tx.wait();
            console.log("Crowdsale finalized.");
            // Optionally, if refunds need to be processed automatically, you can add that logic here.
          }
        }
      } catch (error) {
        console.error("Error during auto-finalization:", error);
      }
    };

    const interval = setInterval(checkAndFinalize, 10000);
    return () => clearInterval(interval);
  }, [provider, crowdsale]);

  return null;
};

export default AutoFinalize;
