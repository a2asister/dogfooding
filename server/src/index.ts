import fastify from 'fastify';
import mercurius from 'mercurius';
import cors from '@fastify/cors';
import { schema, resolvers } from './schema.js';

const PORT = 18089;

const app = fastify({
  logger: true
});

await app.register(cors, {
  origin: true,
  credentials: true
});

await app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
});

app.get('/health', async () => {
  return { status: 'ok' };
});

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`GraphQL Playground: http://0.0.0.0:${PORT}/graphiql`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
