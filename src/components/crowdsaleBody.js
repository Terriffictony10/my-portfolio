// src/components/crowdsaleBody.js
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
import wagmi from "../context/appkit/index.tsx";
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

  // Use the RPC URL provided by the transport.
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
  const provider = new ethers.BrowserProvider(transport, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

/**
 * Hook to convert a viem Wallet Client to an ethers.js Signer.
 * This hook uses internal state and an effect to compute the signer.
 */
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
          // Get the signer's address
          const { provider, address} = await ethersSigner;
          
         
          
         
          setAccount(address)
          // Note: some implementations of JsonRpcSigner might expose the address via _address; otherwise use getAddress().
          // Set the provider (from our hook) into state
          setProvider(provider);
          
          console.log()
          // Retrieve the network and chainId
          const mynetwork = await provider.getNetwork();
          const chainId = mynetwork.chainId;
          console.log(chainId)
          // Instantiate the Token and Crowdsale contracts using the signer
          const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, ethersSigner);
          
          const crowdsaleContract = new ethers.Contract(
            config[chainId].crowdsale.address,
            CROWDSALE_ABI,
            ethersSigner
          );
          
          
          setCrowdsale(crowdsaleContract);
          

          const balance = await token.balanceOf(address);
          console.log(balance)
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
      const signer = provider.getSigner();
      const tx = await crowdsale.connect(signer).finalize();
      await tx.wait();
      alert('Crowdsale finalized successfully!');
      setFinalized(true);
    } catch (error) {
      console.error('Error finalizing crowdsale:', error);
      alert('Error finalizing crowdsale. See console for details.');
    }
    setFinalizeLoading(false);
  }, [ crowdsale]);

  const isLive = Date.now() / 1000 >= saleStart;

  return (
    <div
      id="crowdsale-section"
      style={{
        fontSize: '0.9rem',
        width: '700px',
        height: '700px',
        margin: '0 auto',
        padding: '0.2rem',
        borderRadius: '4px',
        color: "black"
      }}
    >

      <div style={{ 
        position: 'absolute',
        top: '4%',
        left: '70%',
        marginBottom: '0.9rem',
        fontSize: '1.0rem'
      }}>
        <p style={{ margin: '0.1rem 0' }}>
          <strong>Account:</strong> {account}
        </p>
        <p style={{ margin: '0.2rem 0' }}>
          <strong>Tokens Owned:</strong> {accountBalance}
        </p>
      </div>

      <div
        className="crowdsale-description"
        style={{
          margin: '0.2rem 0',
          padding: '0.2rem',
          backgroundColor: '#dfe6e9',
          borderRadius: '4px'
        }}
      >
      
        <p style={{ margin: '0.9rem 0', color: "black" }}>
          <strong>About Your Contribution:</strong> The crowdsale is not yet live, but will be deployed on Base chain before the end of February 2025. By purchasing tokens in our crowdsale, you are directly contributing to the development of <em>Decentratality</em>.
        </p>
      </div>
      <div className="crowdsaleUi">
        <div className="content" style={{  }}>
          {isLoading ? (
            <Loading style={{ fontSize: '0.6rem' }} />
          ) : (
            <>
              <p style={{ margin: '0.2rem 0'}}>
                <strong>Current Price:</strong> {price} ETH
              </p>
              <p style={{ margin: '0.2rem 0' }}>
                <strong>Status:</strong>{' '}
                {finalized
                  ? 'Finalized'
                  : isLive
                  ? 'Ends at: ' + new Date(saleEnd * 1000).toLocaleString()
                  : 'Starts at: ' + new Date(saleStart * 1000).toLocaleString()}
              </p>
              <p style={{ margin: '0.2rem 0' }}>
                <strong>Funding Goal:</strong> {fundingGoal} ETH
              </p>
              <Buy provider={myprovider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
              <CrowdsaleProgress maxTokens={maxTokens} tokensSold={tokensSold} fundingGoal={fundingGoal} />
              {myprovider && crowdsale && <AutoFinalize provider={myprovider} crowdsale={crowdsale} />}
              {myprovider && crowdsale && account && owner && account.toLowerCase() === owner.toLowerCase() && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={handleFinalize}
                    disabled={finalizeLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
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
