const hre = require("hardhat");
const config = require('../src/config.json'); // if needed for additional configuration
// Helper functions for unit conversions.
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
};
const ether = tokens;

async function main() {
  // Get the deployer account (the first signer)
  const accounts = await ethers.getSigners();
  const funder = accounts[0];
  console.log("Deploying contracts with account:", funder.address);

  // ====================================================
  // 1. Deploy the Decentratality token contract.
  // (Our current token contract is named "Decentratality")
  // ====================================================
  const Token = await hre.ethers.getContractFactory("Decentratality");
  const decentratality = await Token.deploy();
  await decentratality.waitForDeployment();
  console.log(`Decentratality Token deployed to: ${decentratality.target}\n`);

  // ====================================================
  // 2. Deploy auxiliary contracts.
  // ====================================================
  // Deploy POSDeployer.
  // const POSDeployer = await ethers.getContractFactory('POSDeployer');
  // const posDeployer = await POSDeployer.deploy();
  // await posDeployer.waitForDeployment();
  // console.log(`POSDeployer deployed to: ${posDeployer.target}\n`);

  // // Deploy RestaurantDeployer.
  // const RestaurantDeployer = await ethers.getContractFactory('RestaurantDeployer');
  // const restaurantDeployer = await RestaurantDeployer.deploy();
  // await restaurantDeployer.waitForDeployment();
  // console.log(`RestaurantDeployer deployed to: ${restaurantDeployer.target}\n`);

  // // Deploy decentratalityServiceFactory.
  // const Factory = await ethers.getContractFactory('decentratalityServiceFactory');
  // const decentratalityAddress = decentratality.target;
  // const restaurantDeployerAddress = restaurantDeployer.target;
  // const posDeployerAddress = posDeployer.target;
  // const decentratalityServiceFactory = await Factory.deploy(
  //   decentratalityAddress,
  //   restaurantDeployerAddress,
  //   posDeployerAddress
  // );
  // await decentratalityServiceFactory.waitForDeployment();
  // console.log(`decentratalityServiceFactory deployed to: ${decentratalityServiceFactory.target}\n`);

  // ====================================================
  // 3. Deploy the DAO contract.
  // ====================================================
 
  // ====================================================
  // 4. (Crowdsale Deployment Section – Skipped)
  // ====================================================
  // Our Crowdsale contract (the one we have been working on) has the following constructor parameters:
  //    ERC20 _token, uint256 _price, uint256 _maxTokens, bytes32 _merkleRoot
  // For deployment we set:
  //    - token: decentratality.token address,
  //    - price: 0.025 ETH,
  //    - maxTokens: 1,000,000 tokens,
  //    - merkleRoot: a dummy value (you can replace it later).
  const PRICE = ethers.parseUnits('0.0025', 'ether');
  const MAX_SUPPLY = '1000000'; // as a string
  const dummyMerkleRoot = "0x" + "0".repeat(64); // dummy merkle root

  // Instead of actually deploying the Crowdsale contract, we skip deployment.
  // Uncomment the code below if/when you wish to deploy it.
  
  const Crowdsale = await hre.ethers.getContractFactory('Crowdsale');
  const crowdsale = await Crowdsale.deploy(
    decentratality.target,
    PRICE,
    ethers.parseUnits(MAX_SUPPLY, 'ether'),
    dummyMerkleRoot
  );
  await crowdsale.waitForDeployment();
  console.log(`Crowdsale deployed to: ${crowdsale.target}\n`);

  // Transfer the maximum token supply to the Crowdsale contract.
  transaction = await decentratality.connect(funder).transfer(crowdsale.target, ethers.parseUnits(MAX_SUPPLY, 'ether'));
  await transaction.wait();
  console.log('Tokens transferred to Crowdsale');
  
  console.log("Crowdsale deployment skipped.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
