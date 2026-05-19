# 🔐 文件加密仓库 (File Encryption Repository)

一个安全的浏览器本地文件加密存储系统，采用 AES-256-GCM 加密算法，支持文件分片加密存储。

## ✨ 功能特性

- 📁 **文件管理 UI**: 现代化的文件管理界面，支持拖拽上传
- 🔒 **AES-256 加密**: 采用高级加密标准，保障文件安全
- 📦 **分片加密**: 大文件分片加密处理，支持并发写入
- 👁️ **解密预览**: 支持图片、文本等文件在线预览
- 💾 **本地存储索引**: SQLite 数据库管理文件元数据
- ⚡ **WASM 加速**: WebAssembly 加密模块（可选）
- 🚀 **并发启动**: 使用 concurrently 同时启动前后端

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite |
| 后端 | Express + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| 加密 | AES-256-GCM / AES-CTR |
| WASM | AssemblyScript |
| 工具 | ESLint + concurrently |

## 📦 项目结构

```
dogfooding/
├── client/                 # 前端 Vue3 应用
│   ├── src/
│   │   ├── services/       # API 和加密服务
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # 后端 Express 服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 加密服务
│   │   ├── database.ts     # SQLite 数据库
│   │   └── index.ts        # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── wasm/                   # WASM 加密模块
│   ├── assembly/
│   │   └── index.ts        # AssemblyScript 代码
│   └── package.json
├── package.json            # 根目录配置（concurrently）
├── .gitignore
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
npm install
cd server && npm install
cd ../client && npm install
```

### 2. 启动开发服务

```bash
# 同时启动前后端（推荐）
npm run dev

# 或者分别启动
npm run dev:server    # 后端: http://localhost:23756
npm run dev:client    # 前端: http://localhost:34567
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 代码检查

```bash
npm run lint
```

## 🌐 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 34567 | 不常用端口，避免冲突 |
| 后端 | 23756 | 不常用端口，避免冲突 |

## 🔐 加密说明

### 加密流程

1. 文件上传时，后端自动生成 256 位随机密钥和 12 字节 IV
2. 大文件按 1MB 分片处理
3. 非最后一片使用 AES-CTR 模式加密
4. 最后一片使用 AES-GCM 模式加密并生成认证标签
5. 加密后的文件存储在 `server/encrypted/` 目录
6. 文件元数据和密钥存储在 SQLite 数据库

### 安全特性

- 密钥每文件独立生成
- IV 随机生成，不重复使用
- GCM 模式提供完整性校验
- 支持分片并行加密处理

## 📁 API 接口

### 文件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/files/upload` | 上传文件 |
| GET | `/api/files/list` | 获取文件列表 |
| GET | `/api/files/:id` | 获取文件信息 |
| GET | `/api/files/download/:id` | 下载文件 |
| GET | `/api/files/preview/:id` | 预览文件 |
| DELETE | `/api/files/:id` | 删除文件 |

### 加密工具

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/encryption/generate-key` | 生成密钥和 IV |
| POST | `/api/encryption/encrypt-chunk` | 加密分片 |
| POST | `/api/encryption/decrypt-chunk` | 解密分片 |

## 📝 TypeScript 强校验

项目启用了严格的 TypeScript 检查：

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`

## 🎨 界面预览

- 深色主题设计，护眼舒适
- 渐变配色，现代化 UI
- 响应式布局，支持移动端
- 拖拽上传，交互友好
- 文件卡片展示，信息清晰

## ⚙️ 配置说明

### 后端配置 (server/src/index.ts)

```typescript
const PORT = 23756;           // 服务端口
const CHUNK_SIZE = 1024 * 1024; // 分片大小 (1MB)
```

### 前端配置 (client/vite.config.ts)

```typescript
server: {
  port: 34567,               // 前端端口
  proxy: {
    '/api': 'http://localhost:23756' // API 代理
  }
}
```

## 📄 License

MIT
