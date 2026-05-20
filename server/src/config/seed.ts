import { AppDataSource } from './database';
import { User } from '../entity/User';
import { Environment } from '../entity/Environment';
import { Host } from '../entity/Host';
import { Container } from '../entity/Container';
import { App } from '../entity/App';
import { AlertRule } from '../entity/AlertRule';
import * as bcrypt from 'bcryptjs';

export async function createInitialData() {
  const userRepository = AppDataSource.getRepository(User);
  const envRepository = AppDataSource.getRepository(Environment);
  const hostRepository = AppDataSource.getRepository(Host);
  const containerRepository = AppDataSource.getRepository(Container);
  const appRepository = AppDataSource.getRepository(App);
  const alertRuleRepository = AppDataSource.getRepository(AlertRule);

  const existingUsers = await userRepository.find();
  if (existingUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      nickname: '超级管理员',
      email: 'admin@example.com',
    });
    await userRepository.save(admin);
    console.log('Default admin user created: admin/admin123');
  }

  const existingEnvs = await envRepository.find();
  if (existingEnvs.length === 0) {
    const envs = [
      { name: '开发环境', code: 'dev', description: '开发测试环境', sort: 1 },
      { name: '测试环境', code: 'test', description: '功能测试环境', sort: 2 },
      { name: '预发布环境', code: 'pre', description: '预发布验证环境', sort: 3 },
      { name: '生产环境', code: 'prod', description: '正式生产环境', sort: 4 },
    ];
    await envRepository.save(envs.map(e => envRepository.create(e)));
    console.log('Default environments created');
  }

  const existingHosts = await hostRepository.find();
  if (existingHosts.length === 0) {
    const hosts = [
      { ip: '192.168.1.101', hostname: 'prod-web-01', env: 'prod', cpuCores: 8, memoryTotal: 16, status: 'online' },
      { ip: '192.168.1.102', hostname: 'prod-web-02', env: 'prod', cpuCores: 8, memoryTotal: 16, status: 'online' },
      { ip: '192.168.1.103', hostname: 'prod-db-01', env: 'prod', cpuCores: 16, memoryTotal: 64, status: 'online' },
      { ip: '192.168.2.101', hostname: 'test-web-01', env: 'test', cpuCores: 4, memoryTotal: 8, status: 'online' },
      { ip: '192.168.2.102', hostname: 'test-app-01', env: 'test', cpuCores: 4, memoryTotal: 8, status: 'online' },
      { ip: '127.0.0.1', hostname: 'localhost', env: 'dev', cpuCores: 4, memoryTotal: 8, status: 'online' },
    ];
    await hostRepository.save(hosts.map(h => hostRepository.create(h)));
    console.log('Default hosts created');
  }

  const existingContainers = await containerRepository.find();
  if (existingContainers.length === 0) {
    const containers = [
      { containerId: 'nginx-prod-01', name: 'nginx-proxy', image: 'nginx:1.25', hostId: 1, env: 'prod', status: 'running' },
      { containerId: 'java-app-01', name: 'api-service', image: 'openjdk:17', hostId: 2, env: 'prod', status: 'running' },
      { containerId: 'mysql-prod-01', name: 'mysql-master', image: 'mysql:8.0', hostId: 3, env: 'prod', status: 'running' },
      { containerId: 'redis-prod-01', name: 'redis-cache', image: 'redis:7.2', hostId: 2, env: 'prod', status: 'running' },
      { containerId: 'java-test-01', name: 'test-api', image: 'openjdk:17', hostId: 5, env: 'test', status: 'running' },
    ];
    await containerRepository.save(containers.map(c => containerRepository.create(c)));
    console.log('Default containers created');
  }

  const existingApps = await appRepository.find();
  if (existingApps.length === 0) {
    const apps = [
      { name: '用户中心服务', code: 'user-service', env: 'prod', type: 'java', status: 'running' },
      { name: '订单服务', code: 'order-service', env: 'prod', type: 'java', status: 'running' },
      { name: '支付网关', code: 'payment-gateway', env: 'prod', type: 'java', status: 'running' },
      { name: '消息队列服务', code: 'mq-service', env: 'prod', type: 'java', status: 'running' },
      { name: '管理后台', code: 'admin-web', env: 'prod', type: 'node', status: 'running' },
      { name: '测试应用', code: 'test-app', env: 'test', type: 'java', status: 'running' },
    ];
    await appRepository.save(apps.map(a => appRepository.create(a)));
    console.log('Default apps created');
  }

  const existingAlertRules = await alertRuleRepository.find();
  if (existingAlertRules.length === 0) {
    const rules = [
      { name: 'CPU使用率过高', metric: 'cpu_usage', operator: '>', threshold: 80, duration: 60, level: 'warning', enabled: true },
      { name: '内存使用率过高', metric: 'memory_usage', operator: '>', threshold: 85, duration: 60, level: 'warning', enabled: true },
      { name: '磁盘使用率过高', metric: 'disk_usage', operator: '>', threshold: 90, duration: 120, level: 'critical', enabled: true },
      { name: '应用异常退出', metric: 'app_status', operator: '==', threshold: 0, duration: 0, level: 'critical', enabled: true },
    ];
    await alertRuleRepository.save(rules.map(r => alertRuleRepository.create(r)));
    console.log('Default alert rules created');
  }
}
