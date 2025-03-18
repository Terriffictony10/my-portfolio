const { ethers } = require("hardhat");
const IUniswapV3Factory = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json")

// Helper to convert numbers to BigNumber (18 decimals)
const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

async function main() {
  const  provider = new ethers.WebSocketProvider(`wss://base-mainnet.g.alchemy.com/v2/0BF2YEv0FZrq3x1a8z0Xuj_0ELf_iVNb`)
  const uniswap = await new ethers.Contract("0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9", IUniswapV3Factory.abi, ethers.provider);
  const pool = await uniswap.getPool("0x4200000000000000000000000000000000000006", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 3000)
  console.log(pool)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
