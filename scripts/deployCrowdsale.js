const { ethers } = require("hardhat");

// Helper to convert numbers to BigNumber (18 decimals)
const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

async function main() {
  const [owner] = await ethers.getSigners();

  // Deploy ERC20 token (Decentratality)
  const Token = await ethers.getContractFactory("Decentratality", owner);
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log(`Token deployed at: ${token.target}`);

  // Set funding goal to 2000 ETH and determine price so that selling 500,000 tokens reaches that goal.
  // Price per token = 2000 ETH / 500,000 tokens = 0.004 ETH per token.
  const fundingGoal = ethers.parseEther("2000");
  const tokensForSale = tokens(500000);
  const price = fundingGoal / BigInt(500000); // equals 0.004 ETH per token

  // Crowdsale configuration
  const maxTokens = tokens(1000000);
  const dummyMerkleRoot = ethers.ZeroHash; // Using ethers.ZeroHash as dummyMerkleRoot

  // Deploy Crowdsale contract with parameters
  const Crowdsale = await ethers.getContractFactory("Crowdsale", owner);
  const crowdsale = await Crowdsale.deploy(
    token.target,
    price,
    maxTokens,
    dummyMerkleRoot
  );
  await crowdsale.waitForDeployment();
  console.log(`Crowdsale deployed at: ${crowdsale.target}`);

  // Log addresses to the console
  console.log(`Owner address: ${owner.address}`);
  console.log(`Token address: ${token.target}`);
  console.log(`Crowdsale contract address: ${crowdsale.target}`);

  // Transfer tokens to Crowdsale contract (500,000 tokens available for sale)
  await token.transfer(crowdsale.target, tokens(500000));
  console.log("Transferred tokens to Crowdsale contract.");

  // Schedule Crowdsale to start at midnight on March 18th Pacific Time.
  // Note: March 18th midnight PT (PDT, UTC-7) corresponds to 2025-03-18T00:00:00-07:00.
  const saleStart = Math.floor(new Date("2025-03-18T00:00:00-07:00").getTime() / 1000);
  const saleEnd = Math.floor(new Date("2025-09-18T00:00:00-07:00").getTime() / 1000);; // lasts 5 minutes (adjust as needed)
  await crowdsale.scheduleCrowdsale(saleStart, saleEnd, fundingGoal);
  console.log(`Crowdsale scheduled from ${saleStart} to ${saleEnd} (Funding goal: 2000 ETH)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
