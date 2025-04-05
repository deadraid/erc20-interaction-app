import { Type, Static } from '@sinclair/typebox';

// Reusable type for Ethereum addresses (0x-prefixed hex string, 42 chars)
const AddressType = Type.String({
  pattern: '^0x[a-fA-F0-9]{40}$',
  description: 'An Ethereum address (0x prefixed hex string)',
});

// Reusable type for amounts (string representation of a number, potentially large)
const AmountStringType = Type.String({
  description: 'Token amount as a string to handle large numbers',
  pattern: '^[0-9]+(?:\\.[0-9]+)?$', // Allows integers and decimals
});

// === Schemas for API Endpoints ===

// GET /token/info
export const TokenInfoResponseSchema = Type.Object({
  name: Type.String(),
  symbol: Type.String(),
  totalSupply: AmountStringType,
  decimals: Type.Number(),
});
export type TokenInfoResponseType = Static<typeof TokenInfoResponseSchema>;

// GET /account/:address/balance
export const GetBalanceParamsSchema = Type.Object({
  address: AddressType,
});
export type GetBalanceParamsType = Static<typeof GetBalanceParamsSchema>;

export const BalanceResponseSchema = Type.Object({
  balance: AmountStringType,
});
export type BalanceResponseType = Static<typeof BalanceResponseSchema>;

// POST /token/transfer-from
export const TransferFromRequestSchema = Type.Object({
  from: AddressType,
  to: AddressType,
  amount: AmountStringType,
});
export type TransferFromRequestType = Static<typeof TransferFromRequestSchema>;

export const TransferFromResponseSchema = Type.Object({
  success: Type.Boolean(),
  transactionHash: Type.String(),
  blockNumber: Type.String(), // Block number as string
});
export type TransferFromResponseType = Static<
  typeof TransferFromResponseSchema
>;

// POST /token/approve
export const ApproveRequestSchema = Type.Object({
  spender: AddressType,
  amount: AmountStringType,
});
export type ApproveRequestType = Static<typeof ApproveRequestSchema>;

// Reuse TransferFromResponseSchema for ApproveResponse as they have the same structure

// Generic Error Response Schema
export const ErrorResponseSchema = Type.Object({
  error: Type.Boolean(), // Changed from Type.String()
  message: Type.String(),
  errorCode: Type.Optional(Type.String()),
});
export type ErrorResponseType = Static<typeof ErrorResponseSchema>;
