import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

import Loading from "../components/Loading.js"
import Buy from "../components/crowdsaleBuy.js"
import CrowdsaleProgress from "../components/crowdsaleProgress.js"

import CROWDSALE_ABI from '../abis/Crowdsale.json'
import TOKEN_ABI from '../abis/Token.json'

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

  const loadBlockchainData = async () => {
    // Instantiate provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    // Fetch Chain ID
    const { chainId } = await provider.getNetwork();

    // Instantiate contracts (config and ABIs must be imported or defined)
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
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

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [loadBlockchainData, isLoading, maxTokens, tokensSold]);

  return (
    <div>
      <div>
        <p><strong>Account:</strong> {account}</p>
        <p><strong>Tokens Owned:</strong> {accountBalance}</p>
      </div>
      <div className="crowdsaleUi">
        <div className="content">
          {isLoading ? (
            <Loading />
          ) : (
          <>
            <p><strong>Current Price:</strong> {price} ETH</p>
            <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} /> 
            <CrowdsaleProgress maxTokens={maxTokens} tokensSold={tokensSold} />
          </>
        )}
        </div>
      </div>
    </div>
  );
}

export default CrowdsaleBody;
