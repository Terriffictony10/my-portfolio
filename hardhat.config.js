require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || ''

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27"
  },
  networks: {
    localhost: {},
    sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/bql2av9VfQgvrsog9dCYuLXajvw3bKje`,
      accounts: [privateKeys]
    }
  },
}