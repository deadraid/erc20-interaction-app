const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('Starting deployment to Sepolia testnet...');

  // Ensure we have the necessary environment variables
  const RPC_URL = process.env.RPC_URL;
  if (!RPC_URL) {
    throw new Error('RPC_URL environment variable is not set.');
  }

  // Get the contract factory
  const ERC20Factory = await ethers.getContractFactory('ERC20');
  console.log('Contract factory created.');

  // Deploy the contract with constructor arguments
  console.log('Deploying ERC20 token to Sepolia...');
  const token = await ERC20Factory.deploy(
    'MyToken', // name
    'MTK', // symbol
    18, // decimals
  );

  // Wait for the contract to be deployed
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log(`✅ ERC20 token deployed to: ${contractAddress}`);
  console.log(
    `View on Etherscan (Sepolia): https://sepolia.etherscan.io/address/${contractAddress}`,
  );

  // Create a deployment info file
  const deploymentInfo = {
    network: 'sepolia',
    contractAddress,
    name: 'MyToken',
    symbol: 'MTK',
    decimals: 18,
    deploymentTime: new Date().toISOString(),
  };

  const deployInfoPath = path.join(__dirname, '..', 'deployment-sepolia.json');
  fs.writeFileSync(deployInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deployInfoPath}`);

  // Mint some tokens to the deployer
  const [deployer] = await ethers.getSigners();
  const mintAmount = ethers.parseUnits('1000000', 18);
  console.log(
    `Minting ${ethers.formatUnits(mintAmount, 18)} MTK to ${deployer.address}...`,
  );
  const mintTx = await token.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(
    `✅ Minted ${ethers.formatUnits(mintAmount, 18)} MTK to ${deployer.address}`,
  );

  // Verify the new total supply
  const totalSupply = await token.totalSupply();
  console.log(`Total supply: ${ethers.formatUnits(totalSupply, 18)} tokens`);

  console.log('Deployment completed successfully.');
  console.log('-----------------------------------');
  console.log('Deployment Summary:');
  console.log(`- Network: Sepolia Testnet`);
  console.log(`- Contract: ERC20 Token`);
  console.log(`- Name: MyToken`);
  console.log(`- Symbol: MTK`);
  console.log(`- Decimals: 18`);
  console.log(`- Address: ${contractAddress}`);
  console.log(`- Initial Supply: ${ethers.formatUnits(totalSupply, 18)} MTK`);
  console.log('-----------------------------------');
  console.log('Next steps:');
  console.log('1. Update your .env file with the contract address');
  console.log('2. Verify your contract on Etherscan');
  console.log('3. Start your backend API to interact with the token');
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
