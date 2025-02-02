import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Loading from '../components/Loading.js';
import Buy from '../components/crowdsaleBuy.js';
import CrowdsaleProgress from '../components/crowdsaleProgress.js';

import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';

// Config
import config from '../config.json';

function CrowdsaleBody() {
  const [provider, setProvider] = useState(null);
  const [crowdsale, setCrowdsale] = useState(null);

  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);

  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('0');
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const loadBlockchainData = async () => {
        // Instantiate provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        // Fetch Chain ID
        const { chainId } = await provider.getNetwork();

        // Instantiate contracts
        const token = new ethers.Contract(
          config[chainId].token.address,
          TOKEN_ABI,
          provider
        );
        const crowdsale = new ethers.Contract(
          config[chainId].crowdsale.address,
          CROWDSALE_ABI,
          provider
        );
        setCrowdsale(crowdsale);

        // Fetch account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0]);
        setAccount(account);

        // Fetch account balance
        const accountBalance = ethers.formatUnits(await token.balanceOf(account), 18);
        setAccountBalance(accountBalance);

        // Fetch price
        const price = ethers.formatUnits(await crowdsale.price(), 18);
        setPrice(price);

        // Fetch max tokens
        const maxTokens = ethers.formatUnits(await crowdsale.maxTokens(), 18);
        setMaxTokens(maxTokens);

        // Fetch tokens sold
        const tokensSold = ethers.formatUnits(await crowdsale.tokensSold(), 18);
        setTokensSold(tokensSold);

        setIsLoading(false);
      };

      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    // This id allows other UI elements (like the Donate Now button) to scroll here
    <div id="crowdsale-section">
      <div>
        <p>
          <strong>Account:</strong> {account}
        </p>
        <p>
          <strong>Tokens Owned:</strong> {accountBalance}
        </p>
      </div>

      {/* Additional description about what the token purchase supports */}
      <div
        className="crowdsale-description"
        style={{
          margin: '20px 0',
          padding: '15px',
          backgroundColor: '#f1f1f1',
          borderRadius: '8px',
        }}
      >
        <p>
          <strong>About Your Contribution:</strong> By purchasing tokens in our crowdsale, you are
          directly contributing to the development of <em>Decentratality</em>—a groundbreaking,
          blockchain-powered software service for hospitality companies. Your donation helps fund
          the creation of a comprehensive platform that integrates financial management, payroll,
          inventory control, and property cost management. This innovative solution is designed to
          streamline operations and lower costs for vendors and service providers worldwide.
        </p>
      </div>

      <div className="crowdsaleUi">
        <div className="content">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <p>
                <strong>Current Price:</strong> {price} ETH
              </p>
              <Buy
                provider={provider}
                price={price}
                crowdsale={crowdsale}
                setIsLoading={setIsLoading}
              />
              <CrowdsaleProgress maxTokens={maxTokens} tokensSold={tokensSold} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrowdsaleBody;
