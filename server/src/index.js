import Koa from 'koa';
import cors from '@koa/cors';
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const app = new Koa();

const schema = createSchema({
  typeDefs,
  resolvers
});

const yoga = createYoga({
  schema,
  graphiql: true,
  healthCheckEndpoint: '/health'
});

app.use(cors());

app.use(async (ctx) => {
  const req = ctx.req;
  const res = ctx.res;
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  const headers = new Headers(req.headers);
  
  const request = new Request(url.toString(), {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? req : undefined,
    duplex: 'half'
  });
  
  const response = await yoga.handleRequest(request);
  
  ctx.status = response.status;
  response.headers.forEach((value, key) => {
    ctx.set(key, value);
  });
  
  ctx.body = response.body;
});

const PORT = 47823;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
  console.log(`📊 GraphiQL available at http://localhost:${PORT}/graphql`);
});
