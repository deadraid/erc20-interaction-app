import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { TokenController } from './token.controller.js';
import {
  TokenInfoResponseSchema,
  GetBalanceParamsSchema,
  BalanceResponseSchema,
  TransferFromRequestSchema,
  TransferFromResponseSchema,
  ApproveRequestSchema,
  ErrorResponseSchema,
} from './token.schemas.js';

// Prefix for all routes defined in this plugin
const ROUTE_PREFIX = '/token';

// Convert to a plugin that returns a Promise
const registerTokenRoutes: FastifyPluginAsync = (fastify: FastifyInstance) => {
  // Apply route prefix to all routes in this plugin
  fastify.register(
    (instance, _, done) => {
      // GET /token/info
      instance.get(
        '/info',
        {
          schema: {
            response: {
              200: TokenInfoResponseSchema,
              '4xx': ErrorResponseSchema,
              '5xx': ErrorResponseSchema,
            },
          },
        },
        TokenController.getTokenInfoHandler,
      );

      // GET /token/balance/:address
      instance.get(
        '/balance/:address',
        {
          schema: {
            params: GetBalanceParamsSchema,
            response: {
              200: BalanceResponseSchema,
              '4xx': ErrorResponseSchema,
              '5xx': ErrorResponseSchema,
            },
          },
        },
        TokenController.getBalanceHandler,
      );

      // POST /token/transfer-from
      instance.post(
        '/transfer-from',
        {
          schema: {
            body: TransferFromRequestSchema,
            response: {
              200: TransferFromResponseSchema,
              '4xx': ErrorResponseSchema,
              '5xx': ErrorResponseSchema,
            },
          },
        },
        TokenController.transferFromHandler,
      );

      // POST /token/approve
      instance.post(
        '/approve',
        {
          schema: {
            body: ApproveRequestSchema,
            response: {
              200: TransferFromResponseSchema,
              '4xx': ErrorResponseSchema,
              '5xx': ErrorResponseSchema,
            },
          },
        },
        TokenController.approveHandler,
      );

      done();
    },
    { prefix: ROUTE_PREFIX },
  );

  return Promise.resolve();
};

export default registerTokenRoutes;
