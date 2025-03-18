import React, { useEffect, useState, useCallback } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Loading from './Loading';
import Buy from './crowdsaleBuy';
import CrowdsaleProgress from './crowdsaleProgress';
import AutoFinalize from './AutoFinalize';
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';
import { BentoCard } from './magicui/bento-grid';
import AnimatedCircularProgressBar from './magicui/animated-circular-progress-bar';

// Return a provider using the client’s transport data.
export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new ethers.JsonRpcProvider(transport.url, network);
}
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId });
  return client ? clientToProvider(client) : undefined;
}

// Updated: Validate that required properties exist before creating a signer.
export function clientToSigner(client) {
  if (!client || !client.account || !client.chain || !client.transport) {
    throw new Error("Invalid client object: missing required properties.");
  }
  const { account, chain, transport } = client;
  if (!chain.id) {
    throw new Error("Invalid client object: chain.id is undefined.");
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new ethers.JsonRpcSigner(provider, account.address);
}
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  const [signer, setSigner] = useState(undefined);
  useEffect(() => {
    if (client) {
      try {
        const s = clientToSigner(client);
        setSigner(s);
      } catch (error) {
        console.error('Error converting client to signer:', error);
      }
    }
  }, [client]);
  return signer;
}

function CrowdsaleBody() {
  const [crowdsale, setCrowdsale] = useState(null);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [fundingGoal, setFundingGoal] = useState(0);
  const [saleStart, setSaleStart] = useState(0);
  const [saleEnd, setSaleEnd] = useState(0);
  const [finalized, setFinalized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [myprovider, setProvider] = useState(null);
  const [isLive, setIsLive] = useState(false); // State for live status

  const ethersProvider = useEthersProvider({ chainId: 8453 });
  const ethersSigner = useEthersSigner({ chainId: 8453 });
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    async function loadBlockchainData() {
      if (isConnected && ethersSigner && ethersProvider) {
        try {
          const address = await ethersSigner.getAddress();
          setAccount(address);
          setProvider(ethersSigner.provider);
          const mynetwork = await ethersSigner.provider.getNetwork();
          const chainId = mynetwork.chainId;
          const token = new ethers.Contract(
            config[chainId].token.address,
            TOKEN_ABI,
            ethersSigner
          );
          const crowdsaleContract = new ethers.Contract(
            config[chainId].crowdsale.address,
            CROWDSALE_ABI,
            ethersSigner
          );
          setCrowdsale(crowdsaleContract);
          const balance = await token.balanceOf(address);
          setAccountBalance(ethers.formatUnits(balance, 18));
          const priceVal = ethers.formatUnits(await crowdsaleContract.price(), 18);
          setPrice(priceVal);
          const maxTokensVal = ethers.formatUnits(await crowdsaleContract.maxTokens(), 18);
          setMaxTokens(maxTokensVal);
          const tokensSoldVal = ethers.formatUnits(await crowdsaleContract.tokensSold(), 18);
          setTokensSold(tokensSoldVal);
          const fundingGoalWei = await crowdsaleContract.fundingGoal();
          setFundingGoal(ethers.formatUnits(fundingGoalWei, 18));
          const saleStartTimestamp = await crowdsaleContract.saleStart();
          setSaleStart(Number(saleStartTimestamp));
          const saleEndTimestamp = await crowdsaleContract.saleEnd();
          setSaleEnd(Number(saleEndTimestamp));
          const finalizedStatus = await crowdsaleContract.finalized();
          setFinalized(finalizedStatus);
          const ownerAddress = await crowdsaleContract.owner();
          setOwner(ownerAddress);
        } catch (error) {
          console.error('Error loading blockchain data:', error);
        }
        setIsLoading(false);
      }
    }
    loadBlockchainData();
  }, [isConnected, ethersSigner, ethersProvider, finalized]);

  // Update isLive based on saleStart timestamp.
  useEffect(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    if (saleStart === 0) {
      setIsLive(false);
    } else if (currentTime >= saleStart) {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, [saleStart]);

  const handleFinalize = useCallback(async () => {
    if (!crowdsale) return;
    try {
      setFinalizeLoading(true);
      const tx = await crowdsale.finalize();
      await tx.wait();
      alert('Crowdsale finalized successfully!');
      setFinalized(true);
    } catch (error) {
      console.error('Error finalizing crowdsale:', error);
      alert('Error finalizing crowdsale. See console for details.');
    }
    setFinalizeLoading(false);
  }, [crowdsale, ethersSigner]);

  // Calculate status text inline.
  let statusText = '';
  if (finalized) {
    statusText = 'Finalized';
  } else if (saleStart === 0) {
    statusText = 'Crowdsale is not scheduled';
  } else if (!isLive) {
    statusText = 'Starts at: ' + new Date(saleStart * 1000).toLocaleString();
  } else {
    statusText = 'Live, ends at: ' + new Date(saleEnd * 1000).toLocaleString();
  }

  // Ensure numbers for the progress bar.
  const tokensSoldNumber = Number(tokensSold) || 0;
  const maxTokensNumber = Number(maxTokens) || 0;

 

  return (
    <div className="crowdsale-menu p-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-xl">
      <div className="mb-6 text-center">
        <p className="text-white mt-2">
          Price: {price} ETH | Goal: {fundingGoal} ETH
        </p>
      </div>
      <div className="crowdsale-grid">
        {/* Left Column: Circular Progress Counter */}
        <div className="flex flex-col items-center justify-center">
          <AnimatedCircularProgressBar
            value={tokensSoldNumber}
            min={0}
            max={maxTokensNumber}
            gaugePrimaryColor="limegreen"
            gaugeSecondaryColor="darkgreen"
          />
          <p className="text-white mt-4 text-sm">
            {tokensSoldNumber} / {maxTokensNumber} tokens sold
          </p>
        </div>
        {/* Right Column: Crowdsale Details & Buy Form */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-sm">
            <strong>Current Price:</strong> {price} ETH
          </p>
          <p className="text-white text-sm">
            <strong>Status:</strong> {statusText}
          </p>
          <p className="text-white text-sm">
            <strong>Funding Goal:</strong> {fundingGoal} ETH
          </p>
          <Buy provider={myprovider} price={price} crowdsale={crowdsale} setIsLoading={() => {}} />
          {myprovider && crowdsale && <AutoFinalize provider={myprovider} crowdsale={crowdsale} />}
          {myprovider &&
            crowdsale &&
            account &&
            owner &&
            account.toLowerCase() === owner.toLowerCase() && (
              <div className="mt-4">
                <button
                  onClick={handleFinalize}
                  disabled={finalizeLoading}
                  className="finalize-button bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  {finalizeLoading ? 'Finalizing...' : 'Finalize Crowdsale'}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default CrowdsaleBody;
