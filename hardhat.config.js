require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || ''

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27"
  },
  networks: {
    localhost: {
      // Fork from Base Sepolia to simulate the Base chain locally.
      forking: {
        url: "https://base-mainnet.g.alchemy.com/v2/bql2av9VfQgvrsog9dCYuLXajvw3bKje"
      }
    },
    // sepolia: {
    //   url: `https://base-sepolia.g.alchemy.com/v2/bql2av9VfQgvrsog9dCYuLXajvw3bKje`,
    //   accounts: [privateKeys]
    // }
  },
}