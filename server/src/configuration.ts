import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as typeorm from '@midwayjs/typeorm';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    koa,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    typeorm,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware([ReportMiddleware]);
  }
}
