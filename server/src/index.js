import Fastify from 'fastify';
import cors from '@fastify/cors';
import mercurius from 'mercurius';
import { schema, resolvers } from './graphql.js';
import { initDB } from './database.js';

const fastify = Fastify({
  logger: true
});

initDB();

await fastify.register(cors, {
  origin: true
});

await fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
});

const PORT = 43210;

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL playground at http://localhost:${PORT}/graphiql`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
