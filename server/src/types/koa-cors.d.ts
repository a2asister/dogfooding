declare module 'koa-cors' {
  import { Middleware } from 'koa';

  interface CorsOptions {
    origin?: string | ((ctx: any) => string);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  }

  function cors(options?: CorsOptions): Middleware;
  export default cors;
}
