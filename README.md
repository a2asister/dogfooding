# 极简动态日志记录工具

一个功能完整的全栈日志记录应用，具有精美的动态动画效果。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + Apollo Client
- **后端**: NestJS + GraphQL + SQLite
- **构建工具**: concurrently 并发启动

## 功能特性

### 前端
- ✨ 日志卡片滑动新增动画
- 🗑️ 删除消散动画效果
- 📅 时间轴动态排布
- 🎯 内容高亮滚动效果
- 🃏 卡片堆叠渐变动画
- 🔒 TypeScript 强类型校验

### 后端
- 📝 用户日常日志录入
- 📂 日志分类存储
- 📅 日志时间归档
- 🔐 个人日志内容管理
- 🔗 GraphQL API 接口

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖（用于concurrently）
npm install

# 安装前后端依赖
npm run install:all
```

### 启动项目

```bash
# 并发启动前后端
npm run dev
```

- 前端地址: http://localhost:8964
- 后端 GraphQL Playground: http://localhost:4396/graphql

### 单独启动

```bash
# 仅启动后端
npm run dev:backend

# 仅启动前端
npm run dev:frontend
```

## 项目结构

```
.
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── log/            # 日志模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── components/    # 组件目录
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
├── package.json           # 根目录配置
└── .gitignore
```

## 端口说明

- 后端: 4396（非常用端口）
- 前端: 8964（非常用端口）

## GraphQL 查询示例

### 查询所有日志
```graphql
query {
  logs {
    id
    title
    content
    category
    createdAt
  }
}
```

### 创建日志
```graphql
mutation {
  createLog(createLogInput: {
    title: "测试标题",
    content: "测试内容",
    category: "工作"
  }) {
    id
    title
  }
}
```

### 删除日志
```graphql
mutation {
  removeLog(id: 1) {
    id
  }
}
```
