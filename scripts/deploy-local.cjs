const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting deployment to local network...');

  // Get the contract factory
  const ERC20Factory = await ethers.getContractFactory('ERC20');

  // Deploy the contract with constructor arguments
  const token = await ERC20Factory.deploy(
    'Test Token', // name
    'TST', // symbol
    18, // decimals
  );

  // Wait for the contract to be deployed
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log(`ERC20 token deployed to: ${contractAddress}`);

  // Get the contract ABI
  const artifactDir = path.join(
    __dirname,
    '..',
    'artifacts',
    'contracts',
    'ERC20.sol',
  );
  const artifact = JSON.parse(
    fs.readFileSync(path.join(artifactDir, 'ERC20.json'), 'utf8'),
  );

  // Create a deployment info file
  const deploymentInfo = {
    network: 'local',
    contractAddress,
    name: 'Test Token',
    symbol: 'TST',
    decimals: 18,
    deploymentTime: new Date().toISOString(),
  };

  const deployInfoPath = path.join(__dirname, '..', 'deployment-local.json');
  fs.writeFileSync(deployInfoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deployInfoPath}`);

  // Mint some tokens to the deployer
  const [deployer] = await ethers.getSigners();
  const mintAmount = ethers.parseUnits('1000000', 18);
  const mintTx = await token.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(
    `Minted ${ethers.formatUnits(mintAmount, 18)} TST to ${deployer.address}`,
  );

  console.log('Deployment completed successfully.');
  console.log('-----------------------------------');
  console.log('Deployment Summary:');
  console.log(`- Network: Local Hardhat Network`);
  console.log(`- Contract: ERC20 Token`);
  console.log(`- Name: Test Token`);
  console.log(`- Symbol: TST`);
  console.log(`- Decimals: 18`);
  console.log(`- Address: ${contractAddress}`);
  console.log('-----------------------------------');
  console.log('Next steps:');
  console.log('1. Update your .env file with the contract address');
  console.log('2. Start your backend API to interact with the token');
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
