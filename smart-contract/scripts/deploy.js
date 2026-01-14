// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // 1. Deploy PropertyRegistry first
  const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.waitForDeployment();
  const propertyRegistryAddress = await propertyRegistry.getAddress();

  console.log(`✅ PropertyRegistry deployed to: ${propertyRegistryAddress}`);

  // 2. Deploy LeaseRegistry, passing the PropertyRegistry address
  const LeaseRegistry = await hre.ethers.getContractFactory("LeaseRegistry");
  const leaseRegistry = await LeaseRegistry.deploy(propertyRegistryAddress);
  await leaseRegistry.waitForDeployment();
  const leaseRegistryAddress = await leaseRegistry.getAddress();

  console.log(`✅ LeaseRegistry deployed to: ${leaseRegistryAddress}`);

  // This is the address your frontend Web3Context will need!
  console.log("\nDeployment complete!");
  console.log(`PropertyRegistry Address: ${propertyRegistryAddress}`);
  console.log(`LeaseRegistry Address: ${leaseRegistryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});