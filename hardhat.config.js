require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const privateKeys = process.env.PRIVATE_KEYS || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27"
  },
  networks: {
    localhost: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/0BF2YEv0FZrq3x1a8z0Xuj_0ELf_iVNb"
        
      }
    },
    sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/bql2av9VfQgvrsog9dCYuLXajvw3bKje`,
      accounts: [privateKeys]
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/0BF2YEv0FZrq3x1a8z0Xuj_0ELf_iVNb`,
      accounts: [privateKeys]
    }
  },
};
