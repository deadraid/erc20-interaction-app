import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { config } from './config/config.js';
import registerTokenRoutes from './components/token/token.routes.js';
import { logger } from './config/logger.js';

async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: true,
  });

  server.log = logger;

  await server.register(cors, {
    origin: '*',
  });
  await server.register(sensible);

  await server.register(registerTokenRoutes, { prefix: '/api' });

  server.get('/health', async () => {
    return { status: 'ok' };
  });

  return server;
}

async function start() {
  let server: FastifyInstance | null = null;
  try {
    server = await buildServer();
    await server.listen({ port: config.PORT, host: config.HOST });

    // Graceful shutdown handling
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, () => {
        if (server) {
          server.log.info(`Received ${signal}, shutting down gracefully...`);
          void server.close().then(() => {
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

void start();
