import { FastifyBaseLogger } from 'fastify/types/logger.js';

// Define a return type for the helper
interface HandledErrorResponse {
  statusCode: number;
  message: string;
  errorCode?: string;
}

// Error codes for better client-side handling
export enum TokenErrorCode {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_EXECUTION_FAILED = 'CONTRACT_EXECUTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export function handleTokenControllerError(
  error: unknown,
  loggerInstance: FastifyBaseLogger,
  operationName: string,
  logContext: Record<string, unknown> = {},
): HandledErrorResponse {
  // Return the response details
  const baseLogContext = { ...logContext };
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';

  // Log the error safely
  if (error instanceof Error) {
    loggerInstance.error(
      { ...baseLogContext, err: error },
      `Error in ${operationName}: ${errorMessage}`,
    );
  } else {
    loggerInstance.error(
      { ...baseLogContext, errorValue: error },
      `Error in ${operationName}: ${errorMessage}`,
    );
  }

  // Determine status code and message based on error type/content
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Address not found or invalid
    if (
      message.includes('invalid address') ||
      message.includes('invalid ethereum address')
    ) {
      return {
        statusCode: 400,
        message: 'Invalid Ethereum address format',
        errorCode: TokenErrorCode.INVALID_ADDRESS,
      };
    }

    if (
      message.includes('failed to fetch balance') ||
      message.includes('address not found')
    ) {
      return {
        statusCode: 404,
        message: error.message,
        errorCode: TokenErrorCode.ADDRESS_NOT_FOUND,
      };
    }

    if (message.includes('insufficient allowance')) {
      return {
        statusCode: 403,
        message: error.message,
        errorCode: TokenErrorCode.INSUFFICIENT_ALLOWANCE,
      };
    }

    if (message.includes('insufficient funds')) {
      return {
        statusCode: 400,
        message: 'Insufficient funds for this transaction',
        errorCode: TokenErrorCode.INSUFFICIENT_FUNDS,
      };
    }

    if (message.includes('contract execution failed')) {
      return {
        statusCode: 400,
        message: `Transaction error: ${error.message}`,
        errorCode: TokenErrorCode.CONTRACT_EXECUTION_FAILED,
      };
    }

    if (message.includes('transaction failed')) {
      return {
        statusCode: 400,
        message: `Transaction error: ${error.message}`,
        errorCode: TokenErrorCode.TRANSACTION_FAILED,
      };
    }

    // Generic internal server error for other Error instances
    return {
      statusCode: 500,
      message: `Failed during ${operationName}: ${errorMessage}`,
      errorCode: TokenErrorCode.UNKNOWN_ERROR,
    };
  }

  // Fallback for non-Error types
  return {
    statusCode: 500,
    message: `An unexpected error occurred during ${operationName}.`,
    errorCode: TokenErrorCode.UNKNOWN_ERROR,
  };
}
