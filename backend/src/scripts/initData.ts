import 'reflect-metadata';
import { initializeDatabase } from '../config/database';
import { initializeDefaultTags } from '../services/userProfile.service';
import { initializeDefaultRoles } from '../services/admin.service';

const runInit = async () => {
  try {
    console.log('开始初始化数据...');
    await initializeDatabase();
    
    console.log('1. 初始化默认标签...');
    await initializeDefaultTags();
    console.log('默认标签初始化完成');
    
    console.log('2. 初始化默认角色和权限...');
    await initializeDefaultRoles();
    console.log('默认角色和权限初始化完成');
    
    console.log('所有数据初始化完成!');
    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

runInit();
