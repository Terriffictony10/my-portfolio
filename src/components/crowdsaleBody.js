import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import Loading from './Loading';
import Buy from './crowdsaleBuy';
import CrowdsaleProgress from './crowdsaleProgress';
import AutoFinalize from './AutoFinalize';
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';
import { useWalletInfo } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useClient, useConnectorClient } from 'wagmi';

/** Convert a viem Client to an ethers.js Provider. */
export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new ethers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}

/** Convert a viem Wallet Client to an ethers.js Signer. */
export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress:
      chain.contracts && chain.contracts.ensRegistry
        ? chain.contracts.ensRegistry.address
        : undefined,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
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
  // Local component state
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

  // Get the ethers provider and signer via our custom hooks
  const ethersProvider = useEthersProvider({ chainId: 84532 });
  const ethersSigner = useEthersSigner({ chainId: 84532 });
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    async function loadBlockchainData() {
      if (isConnected && ethersSigner && ethersProvider) {
        try {
          // Get the signer's address and provider
          const { provider, address } = await ethersSigner;
          setAccount(address);
          setProvider(provider);
          
          const mynetwork = await provider.getNetwork();
          const chainId = mynetwork.chainId;
          
          // Instantiate the Token and Crowdsale contracts using the signer
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
  }, [isConnected, ethersSigner, ethersProvider]);

  const handleFinalize = useCallback(async () => {
    try {
      setFinalizeLoading(true);
      const signer = myprovider.getSigner();
      const tx = await crowdsale.connect(signer).finalize();
      await tx.wait();
      alert('Crowdsale finalized successfully!');
      setFinalized(true);
    } catch (error) {
      console.error('Error finalizing crowdsale:', error);
      alert('Error finalizing crowdsale. See console for details.');
    }
    setFinalizeLoading(false);
  }, [crowdsale, myprovider]);

  const isLive = Date.now() / 1000 >= saleStart;

  return (
    <div id="crowdsale-section" className="crowdsale-section">
      <div className="account-info">
        <p className="account-text dashboard-account">
          <strong>Account:</strong> {account}
        </p>
        <p className="account-text dashboard-tokens">
          <strong>Tokens Owned:</strong> {accountBalance}
        </p>
      </div>

      <div className="crowdsale-description">
        <p className="mini-description">
          <strong>About Your Contribution:</strong> The crowdsale is not yet live, but will be deployed on Base chain before the end of February 2025. By purchasing tokens in our crowdsale, you are directly contributing to the development of <em>Decentratality</em>.
        </p>
      </div>

      <div className="crowdsaleUi">
        <div className="content">
          {isLoading ? (
            <Loading className="loading-text" />
          ) : (
            <>
              <p className="info-text">
                <strong>Current Price:</strong> {price} ETH
              </p>
              <p className="info-text">
                <strong>Status:</strong>{' '}
                {finalized
                  ? 'Finalized'
                  : isLive
                  ? 'Ends at: ' + new Date(saleEnd * 1000).toLocaleString()
                  : 'Starts at: ' + new Date(saleStart * 1000).toLocaleString()}
              </p>
              <p className="info-text">
                <strong>Funding Goal:</strong> {fundingGoal} ETH
              </p>
              <Buy provider={myprovider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
              <CrowdsaleProgress maxTokens={maxTokens} tokensSold={tokensSold} fundingGoal={fundingGoal} />
              {myprovider && crowdsale && <AutoFinalize provider={myprovider} crowdsale={crowdsale} />}
              {myprovider &&
                crowdsale &&
                account &&
                owner &&
                account.toLowerCase() === owner.toLowerCase() && (
                  <div className="finalize-container">
                    <button
                      onClick={handleFinalize}
                      disabled={finalizeLoading}
                      className="finalize-button"
                    >
                      {finalizeLoading ? 'Finalizing...' : 'Finalize Crowdsale'}
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrowdsaleBody;
