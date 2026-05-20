import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Environment } from '../entity/Environment';
import { Host } from '../entity/Host';
import { HostMetric } from '../entity/HostMetric';
import { Container } from '../entity/Container';
import { ContainerMetric } from '../entity/ContainerMetric';
import { App } from '../entity/App';
import { AppMetric } from '../entity/AppMetric';
import { Log } from '../entity/Log';
import { AlertRule } from '../entity/AlertRule';
import { AlertRecord } from '../entity/AlertRecord';
import { createInitialData } from './seed';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || './data/monitor.db',
  synchronize: true,
  logging: false,
  entities: [
    User,
    Environment,
    Host,
    HostMetric,
    Container,
    ContainerMetric,
    App,
    AppMetric,
    Log,
    AlertRule,
    AlertRecord,
  ],
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize().then(() => {
  createInitialData();
});
