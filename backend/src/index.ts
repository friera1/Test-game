import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes/index.js';
import { env } from './lib/env.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true
});

await registerRoutes(app);

app.listen({ port: env.port, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Backend running on http://localhost:${env.port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
