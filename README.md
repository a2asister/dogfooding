# 健身动作动态跟练系统

## 功能特性

### 前端功能
- ✅ 人体骨骼线条动态演示
- ✅ 动作逐帧平滑过渡
- ✅ 训练进度环形流光显示
- ✅ 打卡图标弹跳动画
- ✅ 运动轨迹动态绘制
- ✅ 课程列表展示
- ✅ 个人课程收藏管理
- ✅ 训练次数简单统计
- ✅ 用户打卡记录保存

### 后端功能
- ✅ NestJS 框架
- ✅ SQLite 数据库
- ✅ 课程信息存储
- ✅ 用户打卡记录保存
- ✅ 训练统计 API
- ✅ 课程收藏 API

## 技术栈

### 前端
- Angular 17+
- TypeScript (严格模式)
- SVG 动画

### 后端
- NestJS
- TypeORM
- SQLite

## 启动说明

### 安装依赖

```bash
# 安装根目录依赖（包含 concurrently）
npm install

# 安装前后端依赖
cd frontend && npm install
cd ../backend && npm install
```

### 启动项目

#### 方式一：同时启动前后端（推荐）
```bash
npm start
```
- 前端：http://localhost:4280
- 后端：http://localhost:3080

#### 方式二：单独启动
```bash
# 启动前端
cd frontend && npm start

# 启动后端（新终端）
cd backend && npm start
```

## API 接口

### 课程
- `GET /api/courses` - 获取所有课程

### 打卡
- `GET /api/checkins` - 获取打卡记录
- `POST /api/checkins` - 新增打卡

### 收藏
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:courseId` - 取消收藏

### 统计
- `GET /api/stats` - 获取用户统计

## 错误修复说明

### 后端修复
1. 创建了 `backend/src/main.ts` - NestJS 应用入口
2. 创建了 `backend/src/app.module.ts` - 主模块配置
3. 创建了 `backend/src/stats/stats.module.ts` - 统计模块

### 前端修复
1. 修复了 `app.component.ts:130` - 日期字符串类型断言
2. 修复了 `user-stats.component.html` - 模板解析错误，添加 `getStatValue()` 方法
3. 创建了 `tsconfig.spec.json` - 测试配置
4. 确保 TypeScript 严格模式类型安全
