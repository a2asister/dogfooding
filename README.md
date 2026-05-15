# SQL 可视化工具

基于 Astro + Koa + TypeScript 的 Web 端 SQLite 可视化工具。

## 功能特性

- SQLite 数据库连接配置
- SQL 语句编辑器（支持语法高亮）
- 数据表结构可视化
- 查询结果表格展示
- 执行日志记录

## 技术栈

- **前端**: Astro + Vue 3 + TypeScript + CodeMirror
- **后端**: Koa + TypeScript + better-sqlite3
- **并发启动**: concurrently

## 端口配置

- 前端: 38765
- 后端: 39876

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 创建示例数据库（可选）

```bash
node create_sample_db.js
```

### 3. 启动开发服务

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问: `http://localhost:38765`

### 5. 连接数据库

在页面左侧输入 SQLite 数据库文件的绝对路径，点击连接即可。

## 项目结构

```
.
├── server/                 # 后端代码
│   ├── index.ts           # 服务器入口
│   ├── routes/            # 路由
│   ├── controllers/       # 控制器
│   └── models/            # 数据模型
├── src/                   # 前端代码
│   ├── pages/             # 页面
│   ├── layouts/           # 布局
│   └── components/        # 组件
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── astro.config.mjs
└── .eslintrc.cjs
```

## API 接口

- `POST /api/connect` - 连接数据库
- `GET /api/tables` - 获取所有表名
- `GET /api/tables/:tableName` - 获取表结构
- `POST /api/execute` - 执行 SQL
- `GET /api/logs` - 获取执行日志

## 代码规范

项目启用了严格的 TypeScript 类型检查和 ESLint 代码规范检查。

```bash
# 运行代码检查
npm run lint
```

## 构建

```bash
npm run build
```
