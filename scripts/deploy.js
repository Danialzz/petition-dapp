const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("──────────────────────────────────────────────");
  console.log("  PetitionBase — deployment");
  console.log("──────────────────────────────────────────────");
  console.log("  Network :", network.name);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("──────────────────────────────────────────────\n");

  // 1. PetitionPlatform
  const PetitionPlatform = await ethers.getContractFactory("PetitionPlatform");
  const platform = await PetitionPlatform.deploy();
  await platform.waitForDeployment();
  const platformAddress = await platform.getAddress();
  console.log("✅ PetitionPlatform deployed to:", platformAddress);

  // 2. ProfileRegistry
  const ProfileRegistry = await ethers.getContractFactory("ProfileRegistry");
  const registry = await ProfileRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ ProfileRegistry deployed to:", registryAddress);

  console.log("\n──────────────────────────────────────────────");
  console.log("  Paste these into frontend/js/config.js");
  console.log("──────────────────────────────────────────────");
  console.log(`  CONTRACT_ADDRESS         = "${platformAddress}"`);
  console.log(`  PROFILE_CONTRACT_ADDRESS = "${registryAddress}"`);

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n  Verify on Basescan:");
    console.log(`  npx hardhat verify --network ${network.name} ${platformAddress}`);
    console.log(`  npx hardhat verify --network ${network.name} ${registryAddress}`);
  }
  console.log("──────────────────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
