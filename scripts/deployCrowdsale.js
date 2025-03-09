const { ethers } = require("hardhat");

// Helper to convert numbers to BigNumber (18 decimals)
const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

async function main() {
  const [owner, donor1, donor2] = await ethers.getSigners();

  // Deploy ERC20 token
  const Token = await ethers.getContractFactory("Decentratality");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log(`Token deployed at: ${token.target}`);

  // Crowdsale configuration
  const highPrice = ethers.parseEther("0.5"); // 0.5 ETH per token
  const maxTokens = tokens(1000000);
  const dummyMerkleRoot = ethers.ZeroHash;

  // Deploy Crowdsale contract
  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(
    token.target,
    highPrice,
    maxTokens,
    dummyMerkleRoot
  );
  await crowdsale.waitForDeployment();
  console.log(`Crowdsale deployed at: ${crowdsale.target}`);

  // Transfer tokens to crowdsale
  await token.transfer(crowdsale.target, tokens(500000));

  // Schedule Crowdsale: Starts in 1 min, lasts 5 mins, goal 10 ETH
  const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  const saleStart = currentTime + 60; // starts in 1 min
  const saleEnd = saleStart + 300;    // lasts 5 mins
  const fundingGoal = ethers.parseEther("10");

  await crowdsale.scheduleCrowdsale(saleStart, saleEnd, fundingGoal);
  console.log(`Crowdsale scheduled from ${saleStart} to ${saleEnd}`);

  // Fast forward to sale start
  await ethers.provider.send("evm_increaseTime", [61]);
  await ethers.provider.send("evm_mine");

  // Donors purchase tokens to meet the goal
  const tokensToBuyDonor1 = tokens(10);  // 10 tokens = 5 ETH
  const tokensToBuyDonor2 = tokens(10);  // another 10 tokens = 5 ETH, total = 10 ETH

  await crowdsale.connect(donor1).buyTokens(tokensToBuyDonor1, [], {
    value: highPrice * 10n,
  });
  await crowdsale.connect(donor2).buyTokens(tokensToBuyDonor2, [], {
    value: highPrice * 10n,
  });

  console.log("Donors bought tokens, goal reached.");

  // Fast forward beyond sale end
  await ethers.provider.send("evm_increaseTime", [308]);
  await ethers.provider.send("evm_mine");

  // Check owner's ETH balance before finalizing
  let ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  console.log("Owner's ETH before finalize:", ethers.formatEther(ownerBalanceBefore), "ETH");

  // Finalize the Crowdsale
  // const tx = await crowdsale.finalize();
  await tx.wait();
  console.log("Crowdsale finalized successfully.");

  // Check owner's ETH balance after finalizing
  let ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
  console.log("Owner's ETH after finalize:", ethers.formatEther(ownerBalanceAfter), "ETH");

  const raisedEth = ownerBalanceAfter - ownerBalanceBefore;
  console.log("ETH transferred to owner:", ethers.formatEther(raisedEth), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
