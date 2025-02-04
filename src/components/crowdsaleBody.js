import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Loading from './Loading';
import Buy from './crowdsaleBuy';
import CrowdsaleProgress from './crowdsaleProgress.js';
import AutoFinalize from './AutoFinalize';
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';

function CrowdsaleBody() {
  const [provider, setProvider] = useState(null);
  const [crowdsale, setCrowdsale] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [fundingGoal, setFundingGoal] = useState(0);
  const [saleStart, setSaleStart] = useState(0);
  const [saleEnd, setSaleEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      const loadBlockchainData = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const { chainId } = await provider.getNetwork();
        const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
        const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
        setCrowdsale(crowdsale);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);
        const accountBalance = ethers.formatUnits(await token.balanceOf(account), 18);
        setAccountBalance(accountBalance);
        const price = ethers.formatUnits(await crowdsale.price(), 18);
        setPrice(price);
        const maxTokens = ethers.formatUnits(await crowdsale.maxTokens(), 18);
        setMaxTokens(maxTokens);
        const tokensSold = ethers.formatUnits(await crowdsale.tokensSold(), 18);
        setTokensSold(tokensSold);
        const fundingGoalWei = await crowdsale.fundingGoal();
        const fundingGoal = ethers.formatUnits(fundingGoalWei, 18);
        setFundingGoal(fundingGoal);
        const saleStartTimestamp = await crowdsale.saleStart();
        setSaleStart(Number(saleStartTimestamp));
        const saleEndTimestamp = await crowdsale.saleEnd();
        setSaleEnd(Number(saleEndTimestamp));
        setIsLoading(false);
      };
      loadBlockchainData();
    }
  }, [isLoading]);

  const isLive = Date.now() / 1000 >= saleStart;

  return (
    <div
      id="crowdsale-section"
      style={{
        fontSize: '0.9rem',
        width: '700px',
        margin: '0 auto',
        padding: '0.2rem',
        borderRadius: '4px'
      }}
    >
      <div style={{ 
        position: 'absolute',
        top: '10%',
        left: '60%',
        marginBottom: '0.9rem',
        fontSize: '1.5rem', 
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
        <p style={{ margin: '0.9rem 0' }}>
          <strong>About Your Contribution:</strong> By purchasing tokens in our crowdsale, you are directly
          contributing to the development of <em>Decentratality</em>.
        </p>
      </div>
      <div className="crowdsaleUi">
        <div className="content">
          {isLoading ? (
            <Loading style={{ fontSize: '0.6rem' }} />
          ) : (
            <>
              <p style={{ margin: '0.2rem 0' }}>
                <strong>Current Price:</strong> {price} ETH
              </p>
              <p style={{ margin: '0.2rem 0' }}>
                <strong>Status:</strong>{' '}
                {isLive
                  ? 'Ends at: ' + new Date(saleEnd * 1000).toLocaleString()
                  : 'Starts at: ' + new Date(saleStart * 1000).toLocaleString()}
              </p>
              <p style={{ margin: '0.2rem 0' }}>
                <strong>Funding Goal:</strong> {fundingGoal} ETH
              </p>
              <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
              <CrowdsaleProgress maxTokens={maxTokens} tokensSold={tokensSold} fundingGoal={fundingGoal} />
              {provider && crowdsale && <AutoFinalize provider={provider} crowdsale={crowdsale} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrowdsaleBody;
