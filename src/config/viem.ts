import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  publicActions,
  walletActions,
  Chain,
} from 'viem';
import * as chains from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from './config.js';

if (!config.RPC_URL) {
  throw new Error('RPC_URL is required in configuration');
}

if (!config.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is required in configuration');
}

const privateKey = config.PRIVATE_KEY as `0x${string}`;
const rpcUrl = config.RPC_URL as string;

function getChain(): Chain {
  // Quick detection for common testnets
  if (rpcUrl.includes('sepolia')) {
    return {
      ...chains.sepolia,
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
    };
  }

  // Try to match against known chain RPC URLs
  const knownChains = Object.values(chains) as Chain[];
  for (const chain of knownChains) {
    if (
      chain.rpcUrls.default.http.some((url) =>
        url.includes(new URL(rpcUrl).hostname),
      )
    ) {
      return {
        ...chain,
        rpcUrls: {
          default: { http: [rpcUrl] },
          public: chain.rpcUrls.public || { http: [rpcUrl] },
        },
      };
    }
  }

  // Fallback to config chain ID
  return defineChain({
    id: config.CHAIN_ID,
    name: config.CHAIN_ID === 11155111 ? 'Sepolia' : 'Custom Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  });
}

const selectedChain = getChain();

export const publicClient = createPublicClient({
  chain: selectedChain,
  transport: http(rpcUrl),
}).extend(publicActions);

export const account = privateKeyToAccount(privateKey);

export const walletClient = createWalletClient({
  account,
  chain: selectedChain,
  transport: http(rpcUrl),
}).extend(walletActions);

console.log(
  `Targeting chain: ${selectedChain.name} (ID: ${selectedChain.id}) via ${rpcUrl}`,
);
console.log(`Using account: ${account.address}`);
