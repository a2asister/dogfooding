# 动态渐变融色艺术创作工具

一个全栈的动态渐变艺术创作平台，支持多色块流体融合、无边界色彩流动、触碰式色彩扩散和全局柔光动态流转。

## 技术栈

- **前端**: Astro + React + TypeScript + Three.js
- **后端**: NestJS + TypeScript + SQLite + TypeORM
- **并发启动**: concurrently

## 端口配置

- 前端: http://localhost:3456
- 后端: http://localhost:7890

## 功能特性

### 🎨 创作功能
- 多色块流体融合动画
- 无边界色彩流动效果
- 鼠标触碰式色彩扩散
- 色块挤压形变物理模拟
- 全局柔光动态流转
- 手动拖拽调色
- 自动/暂停循环渐变动画
- 艺术成品导出

### 💾 数据管理
- 保存用户调色参数
- 配色方案归档
- 艺术成品导出记录
- 个人专属配色库管理
- SQLite 本地数据库存储

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install

# 返回根目录
cd ..
```

### 开发模式（同时启动前后端）

```bash
npm run dev
```

### 分别启动

```bash
# 仅前端
npm run dev:frontend

# 仅后端
npm run dev:backend
```

### 生产构建

```bash
npm run build
```

## 项目结构

```
dogfooding4/
├── frontend/                 # Astro 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── GradientArtCanvas.tsx
│   │   │   └── ColorPaletteManager.tsx
│   │   └── pages/
│   │       └── index.astro
│   ├── package.json
│   ├── tsconfig.json
│   ├── astro.config.mjs
│   └── .eslintrc.js
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── entity/          # 数据库实体
│   │   └── palette/         # 配色模块
│   │       ├── palette.controller.ts
│   │       ├── palette.service.ts
│   │       └── palette.module.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── package.json             # 根目录配置（并发启动）
└── .gitignore
```

## API 接口

### 配色方案

- `GET /api/palettes` - 获取所有配色方案
- `POST /api/palettes` - 保存新配色方案
  ```json
  {
    "name": "方案名称",
    "colors": ["#ff6b6b", "#4ecdc4", ...]
  }
  ```
- `DELETE /api/palettes/:id` - 删除配色方案

## 代码规范

- TypeScript 严格模式
- ESLint 代码检查
- 统一的代码风格
