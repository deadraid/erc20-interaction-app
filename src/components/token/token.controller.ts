import { FastifyReply, FastifyRequest } from 'fastify';
import { TokenService } from './token.service.js';
import {
  GetBalanceParamsType,
  TransferFromRequestType,
  ApproveRequestType,
} from './token.schemas.js';
import { Hex } from 'viem';
import { handleTokenControllerError } from './token.helper.js';

// --- Controller Handlers ---

async function getTokenInfoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const operationName = 'getTokenInfoHandler';
  const logContext: Record<string, unknown> = { requestId: request.id };
  try {
    const result = await TokenService.getTokenInfo();
    return reply.send(result);
  } catch (error) {
    // Get status code and message from the helper
    const { statusCode, message, errorCode } = handleTokenControllerError(
      error,
      request.log,
      operationName,
      logContext,
    );
    // Send the reply from the controller
    return reply.status(statusCode).send({ error: true, message, errorCode });
  }
}

async function getBalanceHandler(
  request: FastifyRequest<{ Params: GetBalanceParamsType }>,
  reply: FastifyReply,
) {
  const operationName = 'getBalanceHandler';
  const params = request.params;
  const address = params.address as Hex;
  const logContext: Record<string, unknown> = {
    address,
    requestId: request.id,
  };

  try {
    const result = await TokenService.getBalance(address);
    return reply.send(result);
  } catch (error) {
    // Get status code and message from the helper
    const { statusCode, message, errorCode } = handleTokenControllerError(
      error,
      request.log,
      operationName,
      logContext,
    );
    // Send the reply from the controller
    return reply.status(statusCode).send({ error: true, message, errorCode });
  }
}

async function transferFromHandler(
  request: FastifyRequest<{ Body: TransferFromRequestType }>,
  reply: FastifyReply,
) {
  const operationName = 'transferFromHandler';
  const body = request.body;
  const { from, to, amount } = body;
  const fromHex = from as Hex;
  const toHex = to as Hex;
  const logContext: Record<string, unknown> = {
    from: fromHex,
    to: toHex,
    amount,
    requestId: request.id,
  };

  try {
    const result = await TokenService.transferFrom(fromHex, toHex, amount);
    return reply.send(result);
  } catch (error) {
    // Get status code and message from the helper
    const { statusCode, message, errorCode } = handleTokenControllerError(
      error,
      request.log,
      operationName,
      logContext,
    );
    // Send the reply from the controller
    return reply.status(statusCode).send({ error: true, message, errorCode });
  }
}

async function approveHandler(
  request: FastifyRequest<{ Body: ApproveRequestType }>,
  reply: FastifyReply,
) {
  const operationName = 'approveHandler';
  const body = request.body;
  const { spender, amount } = body;
  const spenderHex = spender as Hex;
  const logContext: Record<string, unknown> = {
    spender: spenderHex,
    amount,
    requestId: request.id,
  };

  try {
    const result = await TokenService.approve(spenderHex, amount);
    return reply.send(result);
  } catch (error) {
    // Get status code and message from the helper
    const { statusCode, message, errorCode } = handleTokenControllerError(
      error,
      request.log,
      operationName,
      logContext,
    );
    // Send the reply from the controller
    return reply.status(statusCode).send({ error: true, message, errorCode });
  }
}

export const TokenController = {
  getTokenInfoHandler,
  getBalanceHandler,
  transferFromHandler,
  approveHandler,
};
