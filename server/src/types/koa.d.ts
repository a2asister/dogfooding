import type { JwtPayload } from '../utils/auth';

declare module 'koa' {
  interface Context {
    user?: JwtPayload;
  }
}
