import type { FastifyInstance } from 'fastify';

let isShuttingDown = false;

export const createGracefulShutdownHandler =
  (server: FastifyInstance) => async (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    server.log.info(`${signal} received. Gracefully shutting down…`);

    const timeout = setTimeout(() => {
      server.log.warn('Forcefully shutting down after 10 seconds.');
      process.exit(1); // Exit with a non-zero code to indicate an issue on shutdown
    }, 10_000);
    timeout.unref();

    await server.close();

    server.log.debug('Closed out remaining connections.');
    clearTimeout(timeout);

    process.exit(0);
  };
