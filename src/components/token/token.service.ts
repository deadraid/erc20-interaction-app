import {
  publicClient,
  walletClient,
  account as serviceAccount, // Rename to avoid conflict if needed elsewhere
} from '../../config/viem.js';
import { config } from '../../config/config.js';
import { erc20ABI } from './token.abi.js';
import {
  formatUnits,
  parseUnits,
  Hex,
  ContractFunctionExecutionError,
  BaseError,
} from 'viem';
import { logger } from '../../config/logger.js';

const contractConfig = {
  address: config.CONTRACT_ADDRESS as `0x${string}`,
  abi: erc20ABI,
};

/**
 * Fetches basic ERC20 token information.
 */
async function getTokenInfo() {
  try {
    logger.info('Fetching token info...');

    // Replace multicall with individual reads
    const name = await publicClient.readContract({
      ...contractConfig,
      functionName: 'name',
    });
    const symbol = await publicClient.readContract({
      ...contractConfig,
      functionName: 'symbol',
    });
    const totalSupply = await publicClient.readContract({
      ...contractConfig,
      functionName: 'totalSupply',
    });
    const decimals = await publicClient.readContract({
      ...contractConfig,
      functionName: 'decimals',
    });

    const formattedTotalSupply = formatUnits(
      totalSupply as bigint,
      decimals as number,
    );

    logger.info(
      `Token info fetched: ${String(name)}, ${String(symbol)}, ${String(formattedTotalSupply)}`,
    );
    return {
      name: name as string,
      symbol: symbol as string,
      totalSupply: formattedTotalSupply,
      decimals: decimals as number,
    };
  } catch (error) {
    logger.error({ err: error }, 'Error fetching token info');
    throw new Error('Failed to fetch token information from the contract.');
  }
}

/**
 * Fetches the token balance for a given address.
 */
async function getBalance(address: Hex) {
  try {
    logger.info(`Fetching balance for address: ${address}...`);

    // Replace multicall with individual reads
    const balance = await publicClient.readContract({
      ...contractConfig,
      functionName: 'balanceOf',
      args: [address],
    });
    const decimals = await publicClient.readContract({
      ...contractConfig,
      functionName: 'decimals',
    });

    const formattedBalance = formatUnits(balance as bigint, decimals as number);
    logger.info(`Balance for ${address}: ${formattedBalance}`);
    return { balance: formattedBalance };
  } catch (error) {
    logger.error({ err: error, address }, 'Error fetching balance');
    throw new Error(`Failed to fetch balance for address ${address}.`);
  }
}

/**
 * Executes a transferFrom transaction.
 * Requires the service account (from PRIVATE_KEY) to have allowance.
 */
async function transferFrom(from: Hex, to: Hex, amount: string) {
  logger.info(
    `Initiating transferFrom: ${amount} tokens from ${from} to ${to} via ${serviceAccount.address}`,
  );

  try {
    const decimals = (await publicClient.readContract({
      ...contractConfig,
      functionName: 'decimals',
    })) as number;

    const parsedAmount = parseUnits(amount, decimals);

    logger.info(
      `Parsed amount: ${parsedAmount.toString()} (decimals: ${decimals})`,
    );

    // Check allowance (optional but good practice before sending tx)
    const allowance = (await publicClient.readContract({
      ...contractConfig,
      functionName: 'allowance',
      args: [from, serviceAccount.address],
    })) as bigint;

    logger.info(
      `Current allowance for ${
        serviceAccount.address
      } from ${from}: ${formatUnits(allowance, decimals)}`,
    );

    if (allowance < parsedAmount) {
      logger.error(
        `Insufficient allowance: required ${parsedAmount}, available ${allowance}`,
      );
      throw new Error(
        `Insufficient allowance. The spender (${serviceAccount.address}) is not approved for ${amount} tokens from ${from}.`,
      );
    }

    // Simulate the transaction first (catches many potential issues)
    logger.info('Simulating transferFrom transaction...');
    const { request } = await publicClient.simulateContract({
      account: serviceAccount, // The account executing the transferFrom
      address: contractConfig.address,
      abi: erc20ABI,
      functionName: 'transferFrom',
      args: [from, to, parsedAmount],
    });
    logger.info('Simulation successful. Sending transaction...');

    // Send the actual transaction
    const txHash = await walletClient.writeContract(request);

    logger.info(`Transaction sent: ${txHash}. Waiting for confirmation...`);

    // Wait for the transaction to be confirmed
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1, // Number of confirmations to wait for
    });

    logger.info(
      { receipt },
      `Transaction confirmed: ${txHash} in block ${receipt.blockNumber}`,
    );

    return {
      success: receipt.status === 'success',
      transactionHash: txHash,
      blockNumber: receipt.blockNumber.toString(),
    };
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error executing transferFrom');

    if (error instanceof BaseError) {
      const baseError = error;
      if (baseError.cause instanceof ContractFunctionExecutionError) {
        const execError = baseError.cause;
        // Potentially decode revert reason if ABI is comprehensive
        logger.error(`Contract execution error: ${execError.shortMessage}`);
        throw new Error(`Contract execution failed: ${execError.shortMessage}`);
      }
      throw new Error(`Transaction failed: ${baseError.shortMessage}`);
    }

    // Fallback generic error
    throw new Error(
      `Failed to execute transferFrom: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

export const TokenService = {
  getTokenInfo,
  getBalance,
  transferFrom,
};
