const hre = require("hardhat");
const config = require('../src/config.json')
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const ether = tokens

async function main() {
	const SYMBOL = 'DHPT'
	const MAX_SUPPLY = '1000000'
	const PRICE = ethers.parseUnits('0.025', 'ether') 


	const accounts = await ethers.getSigners()
  	const funder = accounts[0]
  	const investor1 = accounts[1]
  	const investor2 = accounts[2]
  	const investor3 = accounts[3]
  	const recipient = accounts[4]


	const Token = await hre.ethers.getContractFactory("Decentratality")
	const decentratality = await Token.deploy()
	
	
	const POSDeployer = await ethers.getContractFactory('POSDeployer');
  posDeployer = await POSDeployer.deploy();

  const RestaurantDeployer = await ethers.getContractFactory('RestaurantDeployer');
  restaurantDeployer = await RestaurantDeployer.deploy();

  const Factory = await ethers.getContractFactory('decentratalityServiceFactory');

  const decentratalityAddress = await decentratality.getAddress();
  const restaurantDeployerAddress = await restaurantDeployer.getAddress();
  const posDeployerAddress = await posDeployer.getAddress();

  const decentratalityServiceFactory = await Factory.deploy(
    decentratalityAddress,
    restaurantDeployerAddress,
    posDeployerAddress
  );

	
	console.log(`Crowdsale Token deployed to: ${decentratality.target}\n`)
	console.log(`POSDeployer deployed to: ${posDeployer.target}\n`)
	console.log(`restaurantDeployer deployed to: ${restaurantDeployer.target}\n`)
	console.log(`decentratalityServiceFactory Token deployed to: ${decentratalityServiceFactory.target}\n`)
	

	const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')

	const crowdsale = await Crowdsale.deploy(decentratality.target, PRICE, ethers.parseUnits(MAX_SUPPLY, 'ether'))

	console.log(`Crowdsale deployed to: ${crowdsale.target}\n`)

	let transaction = await decentratality.connect(funder).transfer(crowdsale.target, ethers.parseUnits(MAX_SUPPLY, 'ether'))
	await transaction.wait()

	console.log('Tokens transferred to Crowdsale')

	const DAO = await hre.ethers.getContractFactory('DAO')
  const dao = await DAO.deploy(decentratality.target, '500000000000000000000001')

  console.log(`DAO deployed to: ${dao.target}\n`)
	
  transaction = await funder.sendTransaction({ to: dao.target, value: ether(1000) }) // 1,000 Ether
  await transaction.wait()

  

}


main().catch((error => {
	console.error(error);
	process.exitCode = 1;
}))