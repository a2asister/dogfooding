# 个人动态行程时间轴规划系统

一个功能丰富的行程时间轴规划系统，采用Vue3 + TypeScript + NestJS + GraphQL + SQLite技术栈开发。

## 功能特性

### 前端特性
- 🎨 **时间轴平滑推进** - 点击节点或自动播放，流畅的进度条动画
- 📍 **站点标记弹跳** - 活跃站点有弹跳动画效果
- 🃏 **行程卡片滑动切换** - 节点信息卡片平滑过渡
- 🌓 **昼夜场景渐变** - 一键切换日夜主题模式
- 🚀 **流光跑动效果** - 时间轴进度条有流光动画

### 后端特性
- 📝 **行程节点录入** - 支持创建行程和添加多个站点
- 📂 **行程分类归档** - 行程按分类管理，支持归档
- 🗄️ **个人行程库** - 完整的行程CRUD操作
- 📋 **行程备注存储** - 每个站点支持添加备注
- 🔗 **GraphQL接口** - 灵活的查询和变更接口

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 强类型检查
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Apollo Client** - GraphQL客户端
- **Vite** - 构建工具
- **ESLint** - 代码规范检查

### 后端
- **NestJS** - 企业级Node.js框架
- **GraphQL (@nestjs/apollo)** - GraphQL服务
- **TypeORM** - ORM框架
- **SQLite** - 嵌入式数据库
- **TypeScript** - 强类型检查
- **ESLint** - 代码规范检查

## 端口配置
- **前端**: 4399
- **后端**: 5399

## 快速开始

### 1. 安装依赖
```bash
# 安装根目录依赖 (concurrently)
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

或者使用一条命令：
```bash
npm run install:all
```

### 2. 启动开发服务器
```bash
npm run dev
```

启动后访问：
- 前端页面: http://localhost:4399
- GraphQL Playground: http://localhost:5399/graphql

### 3. 单独启动
```bash
# 仅启动后端
npm run dev:backend

# 仅启动前端
npm run dev:frontend
```

## 🐛 常见问题修复

### 问题1: 后端报错 "No driver (HTTP) has been selected"
**原因**: 缺少 `@nestjs/platform-express` 依赖

**已修复**: 已在 `backend/package.json` 中添加该依赖

### 问题2: 首次启动失败
请确保已安装所有依赖：
```bash
cd backend
npm install
cd ../frontend
npm install
```

## 项目结构

```
dogfooding2/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   │   ├── Timeline.vue
│   │   │   ├── TimelineNode.vue
│   │   │   ├── TripCard.vue
│   │   │   ├── TripSelector.vue
│   │   │   └── NavBar.vue
│   │   ├── views/           # 页面
│   │   │   ├── TimelineView.vue
│   │   │   ├── TripsView.vue
│   │   │   └── TripDetailView.vue
│   │   ├── stores/          # 状态管理
│   │   ├── router/          # 路由配置
│   │   ├── types/           # 类型定义
│   │   ├── style.css        # 全局样式
│   │   └── main.ts          # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── trip/            # 行程模块
│   │   │   ├── entities/    # 数据实体
│   │   │   ├── dto/         # 数据传输对象
│   │   │   ├── trip.service.ts
│   │   │   ├── trip.resolver.ts
│   │   │   └── trip.module.ts
│   │   ├── app.module.ts    # 应用模块
│   │   └── main.ts          # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── package.json              # 根目录配置
└── .gitignore
```

## GraphQL接口示例

### 查询所有行程
```graphql
query GetTrips {
  trips {
    id
    title
    description
    category
    isArchived
    createdAt
    nodes {
      id
      name
      address
      arrivalTime
      note
      order
    }
  }
}
```

### 创建行程
```graphql
mutation CreateTrip($input: CreateTripInput!) {
  createTrip(createTripInput: $input) {
    id
    title
  }
}
```

### 添加行程节点
```graphql
mutation CreateTripNode($input: CreateTripNodeInput!) {
  createTripNode(createTripNodeInput: $input) {
    id
    name
  }
}
```

## 使用说明

1. **创建行程**: 进入"行程管理"页面，点击"创建行程"按钮
2. **添加站点**: 进入行程详情页，点击"添加站点"，填写站点信息
3. **时间轴演示**: 返回首页，选择行程，点击播放按钮自动浏览所有站点
4. **切换主题**: 点击右上角月亮/太阳图标切换日夜模式

## 开发命令

```bash
# 代码检查
npm run lint

# 构建项目
npm run build

# 后端构建
npm run build:backend

# 前端构建
npm run build:frontend
```

## 许可证

MIT