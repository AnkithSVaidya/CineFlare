const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Film Funding Platform...");

  // Deploy ProjectFactory (which deploys all core contracts)
  const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
  const factory = await ProjectFactory.deploy();
  await factory.deployed();

  console.log("ProjectFactory deployed to:", factory.address);

  // Get core contract addresses
  const [claimSBT, rewardNFT, stakeManager, oracle, splitter] = await factory.getCoreContracts();
  
  console.log("Core contracts deployed:");
  console.log("ClaimSBT:", claimSBT);
  console.log("RewardNFT:", rewardNFT);
  console.log("StakeManager:", stakeManager);
  console.log("OracleAdapter:", oracle);
  console.log("RevenueSplitter:", splitter);

  // Deploy a mock FLR token for testing
  const MockFLR = await ethers.getContractFactory("MockFLR");
  const mockFLR = await MockFLR.deploy();
  await mockFLR.deployed();

  console.log("MockFLR deployed to:", mockFLR.address);

  // Save deployment info
  const deploymentInfo = {
    network: "flare",
    factory: factory.address,
    claimSBT,
    rewardNFT,
    stakeManager,
    oracle,
    splitter,
    mockFLR: mockFLR.address,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    './deployments.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
