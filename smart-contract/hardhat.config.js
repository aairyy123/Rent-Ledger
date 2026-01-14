// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20", // Use the recommended version 
    settings: {
      optimizer: {
        enabled: true, // Enable the optimizer
        runs: 200,     // Default runs count
      },
      viaIR: true,     // <--- ADD THIS LINE (Enables the new IR compiler pipeline)
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://sepolia.infura.io/v3/87ffde9afd7d4ed9aadd3386ce8c726d",
      accounts: ["53dd18730215b67f2a3e60cccb152781d674fd2aad576550ea7deff0b78240e9"]
    }
  }
};