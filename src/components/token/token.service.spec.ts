import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import {
  BaseError,
  ContractFunctionExecutionError,
  parseUnits,
  Hex,
} from 'viem';
import { erc20ABI } from './token.abi.js';

describe('TokenService', () => {
  let TokenService: any;
  let publicClient: any;
  let walletClient: any;
  let account: { address: Hex };
  let logger: any;

  let readContractSpy: ReturnType<typeof jest.spyOn>;
  let simulateContractSpy: ReturnType<typeof jest.spyOn>;
  let waitForTransactionReceiptSpy: ReturnType<typeof jest.spyOn>;
  let writeContractSpy: ReturnType<typeof jest.spyOn>;
  let loggerInfoSpy: ReturnType<typeof jest.spyOn>;
  let loggerErrorSpy: ReturnType<typeof jest.spyOn>;
  let consoleLogSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(async () => {
    jest.resetModules();

    process.env.RPC_URL = 'https://mock.rpc.url';
    process.env.PRIVATE_KEY =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    process.env.CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    const viemModule = await import('../../config/viem.js');
    const loggerModule = await import('../../config/logger.js');
    const tokenServiceModule = await import('./token.service.js');

    publicClient = viemModule.publicClient;
    walletClient = viemModule.walletClient;
    account = viemModule.account;
    logger = loggerModule.logger;
    TokenService = tokenServiceModule.TokenService;

    if (publicClient && typeof publicClient.readContract === 'function') {
      readContractSpy = jest
        .spyOn(publicClient, 'readContract')
        .mockImplementation(jest.fn());
    } else {
      publicClient = { ...publicClient, readContract: jest.fn() };
      readContractSpy = publicClient.readContract;
    }

    if (publicClient && typeof publicClient.simulateContract === 'function') {
      simulateContractSpy = jest
        .spyOn(publicClient, 'simulateContract')
        .mockImplementation(jest.fn());
    } else {
      publicClient = { ...publicClient, simulateContract: jest.fn() };
      simulateContractSpy = publicClient.simulateContract;
    }

    if (
      publicClient &&
      typeof publicClient.waitForTransactionReceipt === 'function'
    ) {
      waitForTransactionReceiptSpy = jest
        .spyOn(publicClient, 'waitForTransactionReceipt')
        .mockImplementation(jest.fn());
    } else {
      publicClient = { ...publicClient, waitForTransactionReceipt: jest.fn() };
      waitForTransactionReceiptSpy = publicClient.waitForTransactionReceipt;
    }

    if (walletClient && typeof walletClient.writeContract === 'function') {
      writeContractSpy = jest
        .spyOn(walletClient, 'writeContract')
        .mockImplementation(jest.fn());
    } else {
      walletClient = { ...walletClient, writeContract: jest.fn() };
      writeContractSpy = walletClient.writeContract;
    }

    if (logger && typeof logger.info === 'function') {
      loggerInfoSpy = jest.spyOn(logger, 'info').mockImplementation(jest.fn());
    } else {
      logger = { ...logger, info: jest.fn() };
      loggerInfoSpy = logger.info;
    }
    if (logger && typeof logger.error === 'function') {
      loggerErrorSpy = jest
        .spyOn(logger, 'error')
        .mockImplementation(jest.fn());
    } else {
      logger = { ...logger, error: jest.fn() };
      loggerErrorSpy = logger.error;
    }

    // Silence console.log during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenInfo', () => {
    it('should fetch and return token information correctly', async () => {
      // ARRANGE
      const mockName = 'Mock Token';
      const mockSymbol = 'MCK';
      const mockTotalSupply = BigInt('1000000000000000000000000');
      const mockDecimals = 18;
      const expectedFormattedSupply = '1000000';

      readContractSpy
        .mockResolvedValueOnce(mockName)
        .mockResolvedValueOnce(mockSymbol)
        .mockResolvedValueOnce(mockTotalSupply)
        .mockResolvedValueOnce(mockDecimals);

      // ACT
      const result = await TokenService.getTokenInfo();

      // ASSERT
      expect(result).toEqual({
        name: mockName,
        symbol: mockSymbol,
        totalSupply: expectedFormattedSupply,
        decimals: mockDecimals,
      });
      expect(readContractSpy).toHaveBeenCalledTimes(4);
      expect(loggerInfoSpy).toHaveBeenCalledWith('Fetching token info...');
    });

    it('should handle errors during fetch and throw a user-friendly error', async () => {
      // ARRANGE
      const contractError = new Error('RPC Error');
      readContractSpy.mockRejectedValueOnce(contractError);

      // ACT & ASSERT
      await expect(TokenService.getTokenInfo()).rejects.toThrow(
        'Failed to fetch token information from the contract.',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { err: contractError },
        'Error fetching token info',
      );
    });
  });

  describe('getBalance', () => {
    it('should fetch and return the formatted balance for a given address', async () => {
      // ARRANGE
      const targetAddress: Hex = '0x1234567890123456789012345678901234567890';
      const mockBalance = BigInt('500000000000000000000');
      const mockDecimals = 18;
      const expectedFormattedBalance = '500';

      readContractSpy
        .mockResolvedValueOnce(mockBalance)
        .mockResolvedValueOnce(mockDecimals);

      // ACT
      const result = await TokenService.getBalance(targetAddress);

      // ASSERT
      expect(result).toEqual({ balance: expectedFormattedBalance });
      expect(readContractSpy).toHaveBeenCalledTimes(2);
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        `Fetching balance for address: ${targetAddress}...`,
      );
    });

    it('should handle errors during balance fetch', async () => {
      // ARRANGE
      const targetAddress: Hex = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
      const fetchError = new Error('Network timeout');
      readContractSpy.mockRejectedValueOnce(fetchError);

      // ACT & ASSERT
      await expect(TokenService.getBalance(targetAddress)).rejects.toThrow(
        `Failed to fetch balance for address ${targetAddress}.`,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { err: fetchError, address: targetAddress },
        'Error fetching balance',
      );
    });
  });

  describe('transferFrom', () => {
    const fromAddress: Hex = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const toAddress: Hex = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const transferAmount = '100';
    const mockDecimals = 18;
    const parsedTransferAmount = parseUnits(transferAmount, mockDecimals);

    it('should successfully execute transferFrom after checking allowance and simulating', async () => {
      // ARRANGE
      const sufficientAllowance = parseUnits('1000', mockDecimals);
      const mockSimulatedRequest = {
        request: { data: '0xmocktxdata', gas: BigInt(100000) },
      };
      const mockTxHash: Hex = '0x123abc_mock_tx_hash_def456';
      const mockReceipt = {
        status: 'success' as const,
        blockNumber: BigInt(123456),
        transactionHash: mockTxHash,
      };

      readContractSpy
        .mockResolvedValueOnce(mockDecimals)
        .mockResolvedValueOnce(sufficientAllowance);
      simulateContractSpy.mockResolvedValueOnce(mockSimulatedRequest);
      writeContractSpy.mockResolvedValueOnce(mockTxHash);
      waitForTransactionReceiptSpy.mockResolvedValueOnce(mockReceipt);

      // ACT
      const result = await TokenService.transferFrom(
        fromAddress,
        toAddress,
        transferAmount,
      );

      // ASSERT
      expect(result).toEqual({
        success: true,
        transactionHash: mockTxHash,
        blockNumber: '123456',
      });
      expect(readContractSpy).toHaveBeenCalledTimes(2);
      expect(simulateContractSpy).toHaveBeenCalledTimes(1);
      expect(writeContractSpy).toHaveBeenCalledTimes(1);
      expect(waitForTransactionReceiptSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if allowance is insufficient', async () => {
      // ARRANGE
      const insufficientAllowance = parseUnits('50', mockDecimals);
      readContractSpy
        .mockResolvedValueOnce(mockDecimals)
        .mockResolvedValueOnce(insufficientAllowance);

      // ACT & ASSERT
      await expect(
        TokenService.transferFrom(fromAddress, toAddress, transferAmount),
      ).rejects.toThrow(
        `Insufficient allowance. The spender (${account.address}) is not approved for ${transferAmount} tokens from ${fromAddress}.`,
      );
      expect(readContractSpy).toHaveBeenCalledTimes(2);
      expect(simulateContractSpy).not.toHaveBeenCalled();
    });

    it('should handle simulation errors (e.g., ContractFunctionExecutionError)', async () => {
      // ARRANGE
      const sufficientAllowance = parseUnits('1000', mockDecimals);
      const internalError = new Error(
        'execution reverted: Insufficient balance',
      );
      const causeError = new BaseError(internalError.message, {
        cause: internalError,
      });

      const executionError = new ContractFunctionExecutionError(causeError, {
        abi: erc20ABI,
        functionName: 'transferFrom',
        args: [fromAddress, toAddress, parsedTransferAmount],
      });
      const baseError = new BaseError('Simulation failed.', {
        cause: executionError,
        details: internalError.message,
      });

      readContractSpy
        .mockResolvedValueOnce(mockDecimals)
        .mockResolvedValueOnce(sufficientAllowance);
      simulateContractSpy.mockRejectedValueOnce(baseError);

      // ACT & ASSERT
      await expect(
        TokenService.transferFrom(fromAddress, toAddress, transferAmount),
      ).rejects.toThrow(/^Failed to execute transferFrom: Simulation failed./);

      expect(simulateContractSpy).toHaveBeenCalledTimes(1);
      expect(writeContractSpy).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { err: baseError },
        'Error executing transferFrom',
      );
    });

    it('should handle generic errors during simulation or transaction sending', async () => {
      // ARRANGE
      const sufficientAllowance = parseUnits('1000', mockDecimals);
      const networkError = new Error('RPC disconnected');

      readContractSpy
        .mockResolvedValueOnce(mockDecimals)
        .mockResolvedValueOnce(sufficientAllowance);
      simulateContractSpy.mockRejectedValueOnce(networkError);

      // ACT & ASSERT
      await expect(
        TokenService.transferFrom(fromAddress, toAddress, transferAmount),
      ).rejects.toThrow(
        `Failed to execute transferFrom: ${networkError.message}`,
      );

      expect(simulateContractSpy).toHaveBeenCalledTimes(1);
      expect(writeContractSpy).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        { err: networkError },
        'Error executing transferFrom',
      );
    });

    it('should handle transaction revert status from receipt', async () => {
      // ARRANGE
      const sufficientAllowance = parseUnits('1000', mockDecimals);
      const mockSimulatedRequest = { request: { data: '0xmocktxdata' } };
      const mockTxHash: Hex = '0xrevert_tx_hash_789';
      const mockFailedReceipt = {
        status: 'reverted' as const,
        blockNumber: BigInt(123457),
        transactionHash: mockTxHash,
      };

      readContractSpy
        .mockResolvedValueOnce(mockDecimals)
        .mockResolvedValueOnce(sufficientAllowance);
      simulateContractSpy.mockResolvedValueOnce(mockSimulatedRequest);
      writeContractSpy.mockResolvedValueOnce(mockTxHash);
      waitForTransactionReceiptSpy.mockResolvedValueOnce(mockFailedReceipt);

      // ACT
      const result = await TokenService.transferFrom(
        fromAddress,
        toAddress,
        transferAmount,
      );

      // ASSERT
      expect(result).toEqual({
        success: false,
        transactionHash: mockTxHash,
        blockNumber: '123457',
      });
      expect(waitForTransactionReceiptSpy).toHaveBeenCalledTimes(1);
    });
  });
});
