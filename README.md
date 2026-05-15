# 化学方程式动态推演工具

一个用于化学方程式配平学习的动态可视化工具，支持动画效果和练习记录。

## 功能特性

### 动画效果
- 配平系数动态跳动动画
- 化学物质渐变过渡
- 反应过程粒子特效
- 生成物逐步浮现
- 进度条光影流动

### 数据管理
- 练习记录持久化存储
- 易错方程式自动归档
- 详细的数据统计分析（正确率、平均耗时等）

## 技术栈

### 前端
- React 18
- TypeScript (严格模式)
- Vite
- Framer Motion (动画)
- Styled Components
- ESLint

### 后端
- NestJS
- TypeScript
- SQLite + TypeORM
- RESTful API

## 项目结构

```
dogfooding2/
├── frontend/          # 前端React项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── EquationBalancer.tsx    # 方程式配平组件
│   │   │   ├── Particle.tsx            # 粒子动画组件
│   │   │   ├── PracticeRecords.tsx     # 练习记录组件
│   │   │   ├── Statistics.tsx          # 数据统计组件
│   │   │   └── Navigation.tsx          # 导航组件
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts  # Vite配置 (端口: 3876)
│   ├── tsconfig.json   # TypeScript严格配置
│   └── package.json
├── backend/           # 后端NestJS项目
│   ├── src/
│   │   ├── entities/  # 数据库实体
│   │   ├── controllers/  # API控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── main.ts
│   │   └── app.module.ts
│   └── package.json
├── package.json       # 根目录配置，支持并发启动
└── .gitignore
```

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖（包含concurrently）
npm install

# 安装前端依赖
cd frontend
npm install
cd ..

# 安装后端依赖
cd backend
npm install
cd ..
```

### 2. 并发启动项目

```bash
# 在根目录执行，同时启动前端和后端
npm run dev
```

- 前端访问: http://localhost:3876
- 后端API: http://localhost:9876

### 3. 单独启动

```bash
# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend
```

### 4. 构建项目

```bash
# 构建前后端
npm run build
```

## API接口

### 记录管理
- `GET /api/records` - 获取所有练习记录
- `POST /api/records` - 创建新记录

### 统计数据
- `GET /api/statistics` - 获取统计数据

## 端口说明

- 前端: 3876（不常用端口）
- 后端: 9876（不常用端口）

## 开发规范

### 前端
- TypeScript 严格模式（strict: true）
- ESLint 代码规范检查
- 组件化开发

### 后端
- NestJS 模块化架构
- TypeORM 数据库操作
- RESTful API 设计
