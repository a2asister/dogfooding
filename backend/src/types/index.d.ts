import Koa from 'koa'

declare module 'koa' {
  interface Context {
    user?: {
      id: number
      username: string
      role: string
    }
  }
}
