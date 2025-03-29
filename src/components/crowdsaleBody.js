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
  let errorCode;

  useEffect(() => {
    let timeoutId;
    async function loadBlockchainData() {

      if (!isConnected || !ethersSigner || !ethersProvider) {
      // Retry after a short delay
      timeoutId = setTimeout(loadBlockchainData, 500);
      return;
    }
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
          errorCode = error;
          console.error('Error loading blockchain data:', error);
        }
        setIsLoading(false);
      }
    }
    loadBlockchainData();
  }, [isConnected, ethersSigner, ethersProvider, finalized, price, fundingGoal]);

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
    <>
    <div className="crowdsale-menu p-8 bg-gradient-to-r rounded-3xl shadow-xl flex items-center gap-8" style={{
                backgroundColor: 'black'
              }}>
  {/* Left Frame: Progress Bar */}
  <div className="progress-frame p-4 border border-white rounded-lg flex flex-col items-center" style={{ height: '400px', width: '400px', backgroundColor: 'black'}}>
    <p className="text-white mobile-text-white decentratalityfont mb-5 " style={{ 
      position: 'absolute',
      fontSize: "2.0rem", width: '500px',
      top: '850px',
      left: '250px',
    } }>Tokens Sold</p>
    <div className="w-48 mobile-text-white h-4 bg-gray-200 rounded-full overflow-hidden" style={{ 
      position: 'absolute', 
      width: '300px',
      top: '1050px',
      height: '40px',
      left: '360px'
     }}>
      <div
        className="h-full bg-limegreen"
        style={{ width: `${(tokensSoldNumber / maxTokensNumber) * 100}%` }}
      ></div>
    </div>
    <p className="text-white mobile-text-white mt-2 text-xs" style={{
      position: 'absolute',
      top: '970px',
      left: '450px',
    }}>
      {tokensSoldNumber} / {maxTokensNumber}
    </p>
  </div>
  
  {/* Right Frame: Single Row Data & Actions */}
  <div className="crowdsale-data" style={{ height: '400px', backgroundColor: 'black', position: 'absolute', top: '-10px', left: '40vw'}}>
    <div className="data-item mobile-text-buy text-white text-base" 
    style={{
      position: 'absolute',
      width: '500px',
      top: '850px',
    }}>
      <strong>Price:</strong> {price} ETH
    </div>
    <div className="data-item mobile-text-buy text-white text-base"
    style={{
      position: 'absolute',
      width: '500px',
      top: '870px',
    }}>
      <strong>Status:</strong> {statusText}
    </div>
    <div className="data-item mobile-text-buy text-white text-base"
    style={{
      position: 'absolute',
      width: '500px',
      top: '920px',
    }}>
      <strong>Goal:</strong> {fundingGoal} ETH
    </div>
    <div className="data-item mobile-text-buy text-white text-base"
    style={{
      position: 'absolute',
      width: '500px',
      top: '960px',
    }}>
      Join the pre-sale for the token that will drive the hospitality industry for years to come!!
    </div>
    <div className="buy-button mobile-text-buy"
    style={{
      position: 'absolute',
      top: '1040px',
    }}
    >
      <Buy provider={myprovider} price={price} crowdsale={crowdsale} setIsLoading={() => {}} />
    </div>
    {myprovider && crowdsale && <AutoFinalize provider={myprovider} crowdsale={crowdsale} />}
    {myprovider &&
      crowdsale &&
      account &&
      owner &&
      account.toLowerCase() === owner.toLowerCase() && (
        <div >
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

</>

  );
}

export default CrowdsaleBody;
