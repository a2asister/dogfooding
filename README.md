# 文件上传系统

一个基于 Vue3 + TypeScript + NestJS + SQLite 的现代化文件上传系统。

## 特性

### 前端特性
- 🎨 **动态进度条**：渐变色填充 + 流动光泽动画，模拟液体填充效果
- 📁 **文件图标浮动动画**：上传过程中文件图标产生轻微上下浮动
- 🔢 **计数器动画**：进度百分比使用平滑滚动动画
- 🌊 **波浪式入场**：多文件上传时以交错延迟动画依次出现
- ✅ **对勾路径绘制**：上传完成时SVG路径绘制动画 + 绿色发光脉冲
- ❌ **错误抖动警告**：上传失败时显示红色抖动警告
- 🖱️ **拖拽上传**：支持文件拖拽上传
- 📦 **分块上传**：大文件自动分块，支持断点续传

### 后端特性
- 🚀 **GraphQL API**：使用 GraphQL 提供文件元数据接口
- 📦 **分块上传**：1MB 分块，支持大文件上传
- 💾 **SQLite 存储**：轻量级数据库存储文件信息
- 🔄 **实时进度**：实时返回上传进度

## 技术栈

**前端**
- Vue 3 (Composition API)
- TypeScript (严格模式)
- Apollo Client
- SCSS
- ESLint (严格校验)

**后端**
- NestJS
- TypeScript (严格模式)
- GraphQL (Apollo)
- SQLite + TypeORM
- Multer

## 端口配置
- 前端: `9876`
- 后端: `8765`

## 安装和启动

### 1. 安装所有依赖

```bash
npm run install:all
```

### 2. 并发启动前后端

```bash
npm run dev
```

### 3. 单独启动

**启动后端**
```bash
cd backend
npm run start:dev
```

**启动前端**
```bash
cd frontend
npm run serve
```

## 项目结构

```
.
├── frontend/           # 前端 Vue3 项目
│   ├── src/
│   │   ├── components/  # 组件目录
│   │   │   └── FileUpload.vue  # 文件上传组件（含所有动画）
│   │   ├── App.vue     # 主应用组件
│   │   └── main.ts      # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vue.config.js
├── backend/            # 后端 NestJS 项目
│   ├── src/
│   │   ├── file/       # 文件模块
│   │   │   ├── file.entity.ts    # 文件实体
│   │   │   ├── file.service.ts  # 文件服务
│   │   │   ├── file.resolver.ts  # GraphQL 解析器
│   │   │   └── file.controller.ts # REST 控制器（分块上传）
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json         # 根目录（并发启动）
└── README.md
```

## 动画效果说明

### 进度条动画
- **渐变流动**：使用 `linear-gradient` 配合 `background-position` 动画实现流动效果
- **光泽扫过**：伪元素从左到右扫过，增强视觉效果

### 文件图标动画
- **上下浮动**：使用 `@keyframes float` 实现上传过程中的浮动效果

### 计数器动画
- **平滑过渡**：使用 `requestAnimationFrame` 和缓动函数实现数字平滑滚动

### 入场动画
- **波浪效果**：每个文件项使用 `animationDelay` 实现交错延迟入场

### 完成动画
- **路径绘制**：SVG `stroke-dasharray` + `stroke-dashoffset` 实现对勾绘制
- **发光脉冲**：`box-shadow` 动画实现绿色脉冲效果

### 错误动画
- **抖动警告**：左右抖动动画提示上传失败

## GraphQL 接口

### Mutations
- `createFile(input: CreateFileInput!): FileEntity! - 创建文件记录

### Queries
- `file(id: String!): FileEntity - 获取单个文件信息
- `files: [FileEntity!]! - 获取所有文件列表
- `uploadProgress(id: String!): Int! - 获取上传进度

## REST 接口

- `POST /files/chunk/:fileId/:chunkIndex` - 上传文件块
  - Body: `FormData` 包含 `chunk` 字段

## TypeScript 严格模式
- 启用 `strict: true`
- 启用 `strictNullChecks`
- 启用 `noImplicitAny`
- 启用 `strictBindCallApply`
- 启用 `strictFunctionTypes`
- 启用 `noImplicitReturns`
- 启用 `noFallthroughCasesInSwitch`

## ESLint 规则
- 禁止使用 `any` 类型
- 要求显式函数返回类型
- 严格布尔表达式检查
- 未使用变量警告

## License

MIT
