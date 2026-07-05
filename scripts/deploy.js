const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying PetitionPlatform with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const PetitionPlatform = await ethers.getContractFactory("PetitionPlatform");
  const contract = await PetitionPlatform.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ PetitionPlatform deployed to:", address);
  console.log("Owner (you):", deployer.address);
  console.log("\nVerify on Basescan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
