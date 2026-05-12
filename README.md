# 团队展示系统

基于 Vue2 + TypeScript + NestJS + GraphQL + SQLite 的团队成员展示系统。

## 功能特性

- 🎭 **3D 头像堆叠动画** - 悬停时头像扇形展开，带有 Z 轴旋转效果
- 🔵 **在线状态指示器** - 呼吸式脉冲动画，离线时半透明灰度
- 📝 **成员信息卡片** - 点击头像查看详情，支持编辑个人信息
- 💓 **心跳机制** - 实时更新在线状态
- 🔐 **用户认证** - 登录/登出功能
- 📱 **响应式设计** - 美观的渐变背景和毛玻璃效果

## 技术栈

### 前端
- Vue 2.7 + TypeScript
- Vue Router
- Vue Apollo + GraphQL
- SCSS

### 后端
- NestJS 10
- GraphQL + Apollo Server
- TypeORM + SQLite
- TypeScript

## 项目结构

```
.
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── components/  # Vue 组件
│   │   ├── views/     # 页面视图
│   │   ├── router/    # 路由配置
│   │   └── types/     # 类型定义
│   └── package.json
├── backend/           # 后端项目
│   ├── src/
│   │   └── member/    # 成员模块
│   └── package.json
└── package.json       # 根配置
```

## 快速开始

### 1. 安装依赖

```bash
# 安装根依赖（包含 concurrently 用于并发启动）
npm install

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install
```

### 2. 启动项目

```bash
# 方式一：并发启动前后端（推荐）
npm run dev

# 方式二：单独启动
# 前端 (http://localhost:4200)
npm run dev:frontend

# 后端 (http://localhost:4201)
npm run dev:backend
```

### 3. 访问应用

- 前端页面: http://localhost:4200
- GraphQL Playground: http://localhost:4201/graphql

## 测试账号

系统自动初始化 5 个测试账号，密码均为 `123456`：

| 姓名 | 邮箱 | 职位 |
|------|------|------|
| 张三 | zhangsan@example.com | 前端工程师 |
| 李四 | lisi@example.com | 后端工程师 |
| 王五 | wangwu@example.com | 产品经理 |
| 赵六 | zhaoliu@example.com | UI设计师 |
| 钱七 | qianqi@example.com | 测试工程师 |

## GraphQL API

### Queries
- `members` - 获取所有成员列表
- `member(id)` - 获取单个成员信息

### Mutations
- `login(email, password)` - 用户登录
- `logout(userId)` - 用户登出
- `heartbeat(userId)` - 心跳更新在线状态
- `updateMember(id, input)` - 更新成员信息

## 端口配置

- 前端: 4200
- 后端: 4201
