const hre = require("hardhat");

// Helper to convert a number into 18-decimal BigNumber (token units)
const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

async function main() {
  // Retrieve test accounts: owner, donor1, donor2.
  const [owner, donor1, donor2] = await ethers.getSigners();
  console.log("Owner address: ", owner.address);
  console.log("Donor1 address:", donor1.address);
  console.log("Donor2 address:", donor2.address);

  // -------------------------------------------------------------------
  // 1. Deploy the Decentratality ERC20 token contract.
  // -------------------------------------------------------------------
  const TestToken = await hre.ethers.getContractFactory("Decentratality");
  const token = await TestToken.deploy();
  await token.waitForDeployment();
  console.log(`Decentratality Token deployed to: ${token.target}\n`);

  // -------------------------------------------------------------------
  // 2. Deploy the Crowdsale contract.
  //    Constructor parameters:
  //      - ERC20 token address,
  //      - Price per token (0.0025 ETH per token unit),
  //      - Maximum token supply for the sale,
  //      - A dummy Merkle root.
  // -------------------------------------------------------------------
  const price = ethers.parseUnits("0.0025", "ether"); // price per token
  const maxTokens = tokens(1000000);
  const dummyMerkleRoot = "0x" + "0".repeat(64);
  const Crowdsale = await hre.ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(
    token.target || token.address,
    price,
    maxTokens,
    dummyMerkleRoot
  );
  await crowdsale.waitForDeployment();
  console.log(`Crowdsale deployed at: ${crowdsale.target}`);

  // -------------------------------------------------------------------
  // 3. Transfer tokens from the owner to the Crowdsale contract so that
  //    tokens are available for buyers.
  // -------------------------------------------------------------------
  let tx = await token.transfer(crowdsale.target, tokens(500000));
  await tx.wait();
  console.log("Transferred 500,000 tokens to Crowdsale contract");

  // -------------------------------------------------------------------
  // 4. Schedule the Crowdsale.
  //    For testing, set the sale to start 10 seconds from now and end 100 seconds from now,
  //    with a funding goal of 0.05 ETH.
  // -------------------------------------------------------------------
  const now = Math.floor(Date.now() / 1000);
  const saleStart = now + 200; // sale starts in 10 seconds
  const saleEnd = now + 300;  // sale ends in 100 seconds
  const fundingGoal = ethers.parseEther("0.1"); // funding goal of 0.05 ETH
  tx = await crowdsale.scheduleCrowdsale(saleStart, saleEnd, fundingGoal);
  await tx.wait();
  console.log(
    `Crowdsale scheduled from ${saleStart} to ${saleEnd} with funding goal ${ethers.formatEther(fundingGoal)} ETH`
  );

  // -------------------------------------------------------------------
  // 5. Fast-forward time to after the sale has started.
  //    (Using Hardhat's evm_increaseTime and evm_mine for testing.)
  // -------------------------------------------------------------------
  await hre.network.provider.send("evm_increaseTime", [200]); // advance 15 seconds
  await hre.network.provider.send("evm_mine");

  // -------------------------------------------------------------------
  // 6. Simulate donations by two accounts (donor1 and donor2).
  //    Each donor calls buyTokens() with the correct ETH value.
  // -------------------------------------------------------------------
  // Donor1 buys 10 tokens.
  const donor1TokenAmount = tokens(100);
  const donor1Eth = price * BigInt(100); // 10 tokens * 0.0025 ETH = 0.025 ETH
  console.log("Donor1 buying 10 tokens...");
  tx = await crowdsale.connect(donor1).buyTokens(donor1TokenAmount, [], { value: donor1Eth });
  await tx.wait();
  console.log("Donor1 purchase complete");

  // Donor2 buys 20 tokens.
  const donor2TokenAmount = tokens(200);
  const donor2Eth = price * BigInt(200); // 20 tokens * 0.0025 ETH = 0.05 ETH
  console.log("Donor2 buying 20 tokens...");
  tx = await crowdsale.connect(donor2).buyTokens(donor2TokenAmount, [], { value: donor2Eth });
  await tx.wait();
  console.log("Donor2 purchase complete");

  // -------------------------------------------------------------------
  // 7. Fast-forward time to after the saleEnd.
  // -------------------------------------------------------------------
  await hre.network.provider.send("evm_increaseTime", [100]); // advance 100 seconds
  await hre.network.provider.send("evm_mine");

  // -------------------------------------------------------------------
  // 8. Deploy Dummy WETH and Dummy BaseSwapFactory contracts.
  //    These dummies should implement the IWETH and IBaseSwapFactory interfaces.
  // -------------------------------------------------------------------
  const DummyWETH = await hre.ethers.getContractFactory("DummyWETH");
  const dummyWETH = await DummyWETH.deploy();
  await dummyWETH.waitForDeployment();
  console.log(`DummyWETH deployed at: ${dummyWETH.target}`);

  const DummyBaseSwapFactory = await hre.ethers.getContractFactory("DummyBaseSwapFactory");
  const dummyFactory = await DummyBaseSwapFactory.deploy();
  await dummyFactory.waitForDeployment();
  console.log(`DummyBaseSwapFactory deployed at: ${dummyFactory.target}`);

  // -------------------------------------------------------------------
  // 9. Finalize the crowdsale and create the trading pool.
  //    This function will:
  //      - Wrap half of the ETH balance into WETH,
  //      - Call the BaseSwap factory to create a pool pairing the token and WETH,
  //      - Transfer the remaining ETH to the owner.
  // -------------------------------------------------------------------
  console.log("Finalizing crowdsale and creating pool...");
  tx = await crowdsale.finalizeAndCreatePool(
    dummyFactory.target || dummyFactory.address,
    dummyWETH.target || dummyWETH.address
  );
  await tx.wait();
  console.log("Crowdsale finalized and pool creation attempted.");

  // -------------------------------------------------------------------
  // 10. Verify outcomes.
  //     Fetch the pool address from the dummy factory and log the owner's ETH balance.
  // -------------------------------------------------------------------
  const poolAddress = await dummyFactory.lastPool();
  console.log("Pool created at address:", poolAddress);

  const ownerBalance = await ethers.provider.getBalance(owner.address);
  console.log("Owner's ETH balance after finalization:", ethers.formatEther(ownerBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
