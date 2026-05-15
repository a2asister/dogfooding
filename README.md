# 按钮交互动效工作室

一个全栈按钮动画自定义工具，支持配置多种按钮状态和动画效果。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Framer Motion
- **后端**: Fastify + TypeScript + SQLite (better-sqlite3)
- **代码规范**: ESLint + TypeScript 严格模式

## 功能特性

- ✨ **多状态样式配置**: 支持配置默认、悬停、点击、加载、成功、错误六种状态
- 🎬 **丰富动画效果**: 基于 Framer Motion 实现弹性缓冲、形变、光影等组合动画
- 🔧 **实时预览**: 配置参数实时生效，即时看到效果
- 💾 **模板管理**: 保存自定义配置为模板，支持批量导入导出
- 🎯 **动画参数微调**: 刚度、阻尼、质量、持续时间等参数精细控制

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── services/      # API 服务
│   │   ├── types.ts       # 类型定义
│   │   ├── defaultConfig.ts # 默认配置
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # 后端项目
│   ├── src/
│   │   ├── index.ts       # 服务器入口
│   │   ├── routes.ts      # API 路由
│   │   ├── database.ts    # 数据库操作
│   │   ├── validation.ts  # 参数校验
│   │   └── types.ts       # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── package.json            # 根目录配置（并发启动）
└── .gitignore
```

## 端口配置

- 前端开发服务器: **23456**
- 后端 API 服务器: **38765**

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或者分别安装
npm install          # 根目录（concurrently）
cd client && npm install
cd ../server && npm install
```

### 2. 启动开发服务器

```bash
# 并发启动前后端
npm run dev

# 或者分别启动
npm run dev:server   # 仅后端
npm run dev:client   # 仅前端
```

### 3. 访问应用

打开浏览器访问: **http://localhost:23456**

## 使用说明

### 配置面板

左侧为配置面板，包含以下配置项：

- **基础配置**: 按钮名称
- **基础样式**: 背景色、文字色、字体大小、内边距、圆角、边框、阴影等
- **悬停样式**: 鼠标悬停时的样式效果
- **点击样式**: 按钮按下时的样式效果
- **加载样式**: 加载状态的样式和加载器配置
- **成功样式**: 成功状态的样式和图标颜色
- **错误样式**: 错误状态的样式和图标颜色
- **动画配置**: 动画类型（弹性/渐变）、刚度、阻尼、质量、持续时间等

### 实时预览

右侧为预览区域：

- 中央展示当前配置的按钮效果
- 下方状态按钮可强制切换按钮状态进行演示
- 点击"查看模板"可浏览已保存的模板

### 模板管理

- **保存模板**: 将当前配置保存为新模板
- **查看模板**: 浏览所有可用模板，点击即可应用
- **删除模板**: 删除不需要的模板
- **导出**: 将所有模板导出为 JSON 文件
- **导入**: 从 JSON 文件导入模板

## API 接口

### 健康检查
```
GET /api/health
```

### 模板管理
```
GET    /api/templates              # 获取所有模板
GET    /api/templates/:id          # 获取单个模板
POST   /api/templates              # 创建模板
PUT    /api/templates/:id          # 更新模板
DELETE /api/templates/:id          # 删除模板
```

### 批量操作
```
POST   /api/templates/bulk-import  # 批量导入
GET    /api/templates/export/all   # 导出所有模板
```

## 构建生产版本

```bash
# 构建前后端
npm run build

# 或者分别构建
npm run build:server
npm run build:client
```

## 代码检查

```bash
# 检查所有代码
npm run lint
```

## 开发说明

### 后端开发

后端使用 Fastify 框架，SQLite 数据库使用 better-sqlite3 驱动，数据存储在 `server/data/` 目录下。

### 前端开发

前端使用 Vite 作为构建工具，Framer Motion 负责动画效果，TypeScript 严格模式确保类型安全。

## 许可证

MIT
