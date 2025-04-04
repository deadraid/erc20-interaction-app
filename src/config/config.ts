import convict from 'convict';

// Define the schema
const configSchema = convict({
  PORT: {
    doc: 'The port to bind the server to',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  HOST: {
    doc: 'The host to bind the server to',
    format: String,
    default: '0.0.0.0',
    env: 'HOST',
  },
  RPC_URL: {
    doc: 'RPC URL for blockchain connection',
    format: String,
    default: null,
    env: 'RPC_URL',
  },
  PRIVATE_KEY: {
    doc: 'Private key for blockchain transactions (0x-prefixed hex string)',
    format: (val: string) => {
      if (!val || !val.startsWith('0x')) {
        throw new Error('PRIVATE_KEY must be a 0x-prefixed hex string');
      }

      const hexRegex = /^0x[0-9a-fA-F]+$/;
      if (!hexRegex.test(val) || val.length !== 66) {
        throw new Error(
          'PRIVATE_KEY must be a valid 64-character hex string (with 0x prefix)',
        );
      }
    },
    default: null,
    env: 'PRIVATE_KEY',
    sensitive: true,
  },
  CONTRACT_ADDRESS: {
    doc: 'ERC20 contract address (0x-prefixed hex string)',
    format: (val: string) => {
      if (!val || !val.startsWith('0x')) {
        throw new Error('CONTRACT_ADDRESS must be a 0x-prefixed hex string');
      }

      const hexRegex = /^0x[0-9a-fA-F]+$/;
      if (!hexRegex.test(val) || val.length !== 42) {
        throw new Error(
          'CONTRACT_ADDRESS must be a valid 40-character hex string (with 0x prefix)',
        );
      }
    },
    default: '',
    env: 'CONTRACT_ADDRESS',
  },
});

// Perform validation
configSchema.validate({ allowed: 'strict' });

// Export the validated config
export const config = configSchema.getProperties();

// Define types for TypeScript
export interface Config {
  PORT: number;
  HOST: string;
  RPC_URL: string;
  PRIVATE_KEY: string;
  CONTRACT_ADDRESS: `0x${string}`;
}
