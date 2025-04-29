// pages/index.js

import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import Image from 'next/image'
import WarpBackground from '../components/magicui/warp-background'
import WalletConnector from '../components/WalletConnector'
import CROWDSALE_ABI from '../abis/Crowdsale.json'
import TOKEN_ABI from '../abis/Token.json'
import config from '../config.json'
import { useAppKitAccount } from '@reown/appkit/react'
import { useClient, useConnectorClient } from 'wagmi'

// crowdsale UI pieces
import CrowdsaleProgress from '../components/crowdsaleProgress'
import Buy from '../components/crowdsaleBuy'

// ethers.js provider/signer hooks (unchanged)
export function clientToProvider(client) {
  const { chain, transport } = client
  const network = { chainId: chain.id, name: chain.name, ensAddress: chain.contracts?.ensRegistry?.address }
  return new ethers.JsonRpcProvider(transport.url, network)
}
export function useEthersProvider({ chainId } = {}) {
  const client = useClient({ chainId })
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client])
}
export function clientToSigner(client) {
  const { account, chain, transport } = client
  const network = { chainId: chain.id, name: chain.name, ensAddress: chain.contracts?.ensRegistry?.address }
  const provider = new ethers.BrowserProvider(transport, network)
  return new ethers.JsonRpcSigner(provider, account.address)
}
export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId })
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}

export default function Home() {
  const { isConnected } = useAppKitAccount()
  const ethersProvider = useEthersProvider({ chainId: 8453 })
  const ethersSigner = useEthersSigner({ chainId: 8453 })

  // your existing state
  const [account, setAccount] = useState('')
  const [tokenBalance, setTokenBalance] = useState('')

  // ——— new crowdsale state ———
  const [crowdsale, setCrowdsale] = useState(null)
  const [csProvider, setCsProvider] = useState(null)
  const [price, setPrice] = useState('0')
  const [maxTokens, setMaxTokens] = useState('0')
  const [tokensSold, setTokensSold] = useState('0')
  const [fundingGoal, setFundingGoal] = useState('0')
  const [saleStart, setSaleStart] = useState(0)
  const [saleEnd, setSaleEnd] = useState(0)
  const [isLive, setIsLive] = useState(false)

  // ——— fetch user + token balance ———
  useEffect(() => {
    async function getAccountInfo() {
      if (isConnected && ethersSigner) {
        const { provider, address } = await ethersSigner
        setAccount(address)
        const network = await provider.getNetwork()
        const token = new ethers.Contract(
          config[network.chainId].token.address,
          TOKEN_ABI,
          ethersSigner
        )
        const bal = await token.balanceOf(address)
        setTokenBalance(ethers.formatUnits(bal, 18))
      }
    }
    getAccountInfo()
  }, [isConnected, ethersSigner])

  // ——— load crowdsale data on a 500ms loop ———
  useEffect(() => {
    let cancelled = false
    let timeoutId

    async function loadCrowdsaleData() {
      if (!isConnected || !ethersSigner || !ethersProvider) {
        timeoutId = setTimeout(loadCrowdsaleData, 500)
        return
      }
      try {
        const { provider } = await ethersSigner
        setCsProvider(provider)
        const { chainId } = await provider.getNetwork()

        const cs = new ethers.Contract(
          config[chainId].crowdsale.address,
          CROWDSALE_ABI,
          ethersSigner
        )
        setCrowdsale(cs)

        // fetch all on-chain values
        const [p, maxT, soldT, goalWei, startTs, endTs] = await Promise.all([
          cs.price(),
          cs.maxTokens(),
          cs.tokensSold(),
          cs.fundingGoal(),
          cs.saleStart(),
          cs.saleEnd(),
        ])
        setPrice(ethers.formatUnits(p, 18))
        setMaxTokens(ethers.formatUnits(maxT, 18))
        setTokensSold(ethers.formatUnits(soldT, 18))
        setFundingGoal(ethers.formatUnits(goalWei, 18))
        setSaleStart(Number(startTs))
        setSaleEnd(Number(endTs))

        setIsLive(Math.floor(Date.now() / 1000) >= Number(startTs))
      } catch (e) {
        console.error(e)
      }
      if (!cancelled) timeoutId = setTimeout(loadCrowdsaleData, 500)
    }

    loadCrowdsaleData()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [isConnected, ethersSigner, ethersProvider])

   return (
   <div className="relative min-h-screen min-w-screen bg-gradient-to-b from-blue-200 to-blue-100 flex flex-col items-center" style={{ paddingBottom: '200px' }}>
     {/* Wallet button top-right */}
      <div className="absolute top-4 right-4 z-50">
        <WalletConnector />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mt-16">Decentratality</h1>

     <div className="w-[70%]" style={{ border: '1px solid black' }}> Hello, have you ever worked at a hotel that is owned by a super big company, or even a restaurant owned by a family, if you have, I know that you know that
        families and super big companies are tired of loseing time and money because of outdated systems that havent been maintained or are just not reliable anymore. I have been there too,
        feeling inadequate for not being able to meet customer needs when in reality, the issue is an outdated vein of your business systems. Decentratality aims to solve all of that, by making an industry
        standard POS system readily available through any web browser. We hope to start as a subscription service that provides subscribers with access to a web based system that uses the blockchain to model
        the asset structure of your restaurant in a way never before possible all within a web based system. If this sounds interesting, and you want to know more, check out the videos below!! </div>
      <div className="flex items-center w-full max-w-5xl gap-4 my-4 mx-auto">

                  <div className="video-spot flex-1 min-w-[300px]">
                  <p style={{ fontSize: "1.4rem"}}>Tutorial</p>
                    <iframe
                      className="w-full video"
                      height="315"
                      src="https://www.youtube.com/embed/y4tL3pWq-Os"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="video-spot flex-1 min-w-[300px]">
                  <p style={{ fontSize: "1.4rem"}}>Explanation</p>
                    <iframe
                      className="w-full video2"
                      height="315"
                      src="https://www.youtube.com/embed/ICx8HkmynZc?si=vU6BeJmhvtaw-GsX"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
                <div className="w-[70%]" style={{ border: '1px solid black' }}> Decentratality not only aims to transform the hospitality sector but will also collaborate with industry partners to foster strong relationships and ensure long-term stability. To that end, it will be governed by a decentralized autonomous organization (DAO) funded by the proceeds of this crowdsale. Once the funding target is reached, all contributions will be transferred to the DAO contract, and token holders will be empowered to vote on Decentratality governance proposals. If the funding goal is not met by the specified end date, all Ether contributions will be fully refunded.</div>

      {/* ——— now the crowdsale box ——— */}
      <div className="w-[70%] bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg mt-8 flex divide-x divide-gray-300" >
        {/* Left: progress circle */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <CrowdsaleProgress
            maxTokens={maxTokens}
            tokensSold={tokensSold}
            fundingGoal={fundingGoal}
          />
        </div>

        {/* Right: details & buy form */}
        <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Price</h2>
            <p className="mt-1 text-gray-700">{price} ETH</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Status</h2>
            <p className="mt-1 text-gray-700">
              {saleStart === 0
                ? 'Not yet scheduled'
                : isLive
                ? `Live • Ends at ${new Date(saleEnd * 1000).toLocaleString()}`
                : `Starts at ${new Date(saleStart * 1000).toLocaleString()}`}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Funding Goal</h2>
            <p className="mt-1 text-gray-700">{fundingGoal} ETH</p>
          </div>

          {/* Buy form */}
          <Buy
            provider={csProvider}
            price={price}
            crowdsale={crowdsale}
            setIsLoading={() => {}}
          />
        </div>
      </div>
      <div className="w-[70%] flex justify-center my-8">
        <button
          onClick={() => window.location.href = '/Dashboard'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Demo
        </button>
      </div>
    </div>
  )
}
