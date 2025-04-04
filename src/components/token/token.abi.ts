import ERC20ABI from '../../../contracts/ERC20.json' with { type: 'json' };
import { Abi } from 'viem';

// Basic validation to ensure it looks like an ABI array
if (!Array.isArray(ERC20ABI)) {
  throw new Error(
    'Failed to load contract ABI. Ensure contracts/ERC20.json is correct.',
  );
}

export const erc20ABI: Abi = ERC20ABI as Abi;
