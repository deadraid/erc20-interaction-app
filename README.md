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
      - `PORT` (optional): Port for the server (defaults to 3000).
      - `HOST` (optional): Host for the server (defaults to 0.0.0.0).
4.  **Deploy ERC20 Contract:**

    - To deploy on a local testnet:

      ```bash
      # Start a local Hardhat node in a separate terminal
      yarn node:local

      # Deploy the contract to the local node
      yarn deploy:local

      # After deployment, update your .env file with the CONTRACT_ADDRESS
      # from the deployment-local.json file that is generated
      ```

    - To deploy on Sepolia testnet:
      ```bash
      # Ensure you have ETH on your account for gas fees
      yarn deploy:sepolia
      ```

## Usage Examples

1.  **Run the development server:**

    ```bash
    yarn dev
    ```

    The server will start, typically at `http://localhost:3000`.

2.  **API Endpoints:**

    - `GET /token/info`: Get token name, symbol, and total supply.
    - `GET /account/:address/balance`: Get the token balance for a specific address.
    - `POST /token/transfer-from`: Execute a `transferFrom` transaction (requires `spender` address, `from` address, `to` address, and `amount` in the request body).

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
