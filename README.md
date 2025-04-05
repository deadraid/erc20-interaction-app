# ERC20 Smart Contract Interaction API

## Project Description

A simple Node.js backend application built with Fastify and TypeScript that interacts with a deployed ERC20 token smart contract using Viem.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:deadraid/erc20-interaction-app.git
    cd erc20-interaction-app
    ```
2.  **Install dependencies:**
    ```bash
    yarn install
    ```
3.  **Configure environment variables:**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and provide the necessary values:
      - `RPC_URL`: URL of your Ethereum node (local or public testnet).
      - `PRIVATE_KEY`: Private key of the account you want to use for transactions (ensure this account has funds on the chosen network).
      - `CONTRACT_ADDRESS`: Address of the deployed ERC20 contract.
      - `CHAIN_ID`: ID of the blockchain network (11155111 for Sepolia).
      - `PORT` (optional): Port for the server (defaults to 3000).
      - `HOST` (optional): Host for the server (defaults to 0.0.0.0).

## Deploying the ERC20 Contract

### Option 1: Local Deployment

```bash
# Start a local Hardhat node in a separate terminal
yarn node:local

# Deploy the contract to the local node
yarn deploy:local

# After deployment, update your .env file with the CONTRACT_ADDRESS
# from the deployment-local.json file that is generated
```

### Option 2: Sepolia Testnet Deployment

1. **Prerequisites for Sepolia deployment:**

   - Create an [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/) account to get an API key
   - Obtain Sepolia ETH from a [faucet](https://sepoliafaucet.com/) for your wallet address
   - Make sure you have a private key with sufficient Sepolia ETH for gas fees

2. **Set up your environment for Sepolia:**

   ```bash
   # Update your .env file with these values
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   CHAIN_ID=11155111
   ```

3. **Deploy the contract:**

   ```bash
   yarn deploy:sepolia
   ```

4. **After deployment:**
   - The contract address will be displayed in the console
   - A `deployment-sepolia.json` file will be generated with contract details
   - Update your `.env` file with the new contract address
   - Your tokens will be automatically minted to the deployer's address (1,000,000 tokens)

## Running the Server

```bash
# Development mode with hot reload
yarn dev

# Production mode
yarn build && yarn start
```

The server will start, typically at `http://localhost:3000`.

## API Endpoints and Usage

### 1. Get Token Information

```http
GET /api/token/info
```

Example response:

```json
{
  "name": "MyToken",
  "symbol": "MTK",
  "totalSupply": "1000000",
  "decimals": 18
}
```

### 2. Get Token Balance

```http
GET /api/token/balance/0xYOUR_ADDRESS
```

Example response:

```json
{
  "balance": "1000000"
}
```

### 3. Approve Token Transfers

Before transferring tokens using the transferFrom method, you must approve the service account as a spender:

```http
POST /api/token/approve
Content-Type: application/json

{
  "spender": "0xSERVICE_ACCOUNT_ADDRESS",
  "amount": "1000.0"
}
```

Example response:

```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": "12345678"
}
```

### 4. Transfer Tokens

After approval, you can transfer tokens:

```http
POST /api/token/transfer-from
Content-Type: application/json

{
  "from": "0xSENDER_ADDRESS",
  "to": "0xRECIPIENT_ADDRESS",
  "amount": "10.0"
}
```

Example response:

```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": "12345678"
}
```

## Running with Docker

1.  **Build the Docker image:**
    ```bash
    docker build -t erc20-interaction-app .
    ```
2.  **Run the Docker container:**
    ```bash
    # Make sure your .env file is populated
    docker run -p 3000:3000 --env-file .env erc20-interaction-app
    ```

## Component Architecture

The application is structured using a component-based architecture that follows these key principles:

### Component Architecture Principles

1. **Self-contained Components**: Each business component has its own folder at the appropriate level of the project hierarchy and is standalone. Other components interact with it only through its public interface or API.

2. **Reusability**: Components are designed to be reusable across different scenarios and applications. While some components are created for specific tasks, the architecture promotes maximum reuse.

3. **Interchangeability**: Components can be easily replaced by other similar components with minimal impact on the application.

4. **Context-independence**: Components are designed to work in different environments and contexts. State data and contextual information are passed to components rather than being retrieved or maintained internally.

5. **Extensibility**: Components can extend existing components to provide new behavior without modifying the original implementation.

6. **Encapsulation**: Each component provides clear interfaces that allow callers to use its functionality without needing to understand implementation details, internal processes, or state.

7. **Independence**: Components have minimal dependencies on other components, allowing them to be deployed in any suitable environment without affecting other parts of the system.

### Component Structure

Each component typically contains:

- Controller: Handles HTTP requests and responses
- Service: Contains business logic
- Routes: Defines API endpoints
- Schemas: Defines data validation schemas
- Helpers: Supporting functions
- Tests: Unit and integration tests specific to the component

This structure can be seen in the token component, which manages all interactions with the ERC20 smart contract.

## Troubleshooting

### Chain ID Mismatch

If you see an error like `invalid chain id for signer: have 1337 want 11155111`, make sure your .env file has the correct CHAIN_ID value for the network you're using.

### Insufficient Allowance

If transfers fail with "insufficient allowance," you need to call the approve endpoint before transferring tokens.

### Missing Balance

If you deployed to Sepolia but see zero balances, confirm the deployment transaction was successful and that the tokens were minted to the owner's address during deployment.

## Testing

1. **Smart Contract Tests:**

   The project includes comprehensive tests for the ERC20 smart contract covering all major functionality:

   ```bash
   # Run smart contract tests
   yarn test:contracts
   ```

   Tests cover:

   - Basic token functionality (transfer, balanceOf)
   - Approval mechanism (approve, allowance, transferFrom)
   - Custom minting and burning functions
   - Ownership management
   - Edge cases and security considerations

2. **Backend API Tests:**

   ```bash
   # Run backend service tests
   yarn test
   ```
