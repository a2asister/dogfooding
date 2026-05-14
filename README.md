# 几何图形裂变动画工具

极简高级动态视觉创作平台，支持基础几何图形无限裂变、碎片扩散、旋转排布、回弹归位、渐变填充动画。

## 技术栈

- **前端**: Qwik + TypeScript + ESLint
- **后端**: NestJS + TypeScript + SQLite
- **并发启动**: concurrently

## 功能特性

- ✅ 5种基础几何图形（圆形、三角形、正方形、五边形、六边形）
- ✅ 自定义裂变数量 (5-100)
- ✅ 可调扩散速度 (0.5-10)
- ✅ 可控扩散范围 (100-500)
- ✅ 旋转速度调节
- ✅ 5种预设配色方案
- ✅ 拖尾效果开关
- ✅ 回弹归位效果
- ✅ 重力效果模拟
- ✅ 作品保存与归档
- ✅ 模板素材收录
- ✅ 创作记录留存

## 端口配置

- 前端: **3876**
- 后端: **3877**

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有依赖（包含前后端）
npm run install:all
```

### 2. 启动开发环境

```bash
# 同时启动前后端
npm run dev
```

或者分别启动：

```bash
# 启动前端
npm run dev:client

# 启动后端
npm run dev:server
```

### 3. 访问应用

- 前端: http://localhost:3876
- 后端API: http://localhost:3877/api

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── services/    # API服务
│   │   ├── types/       # 类型定义
│   │   ├── utils/       # 工具函数
│   │   ├── entry.dev.tsx
│   │   └── root.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   └── package.json
├── server/                 # 后端项目
│   ├── src/
│   │   ├── entities/    # 数据库实体
│   │   ├── types/       # 类型定义
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## API 接口

### 作品管理

- `GET /api/works` - 获取所有作品列表
- `POST /api/works` - 保存新作品
- `DELETE /api/works/:id` - 删除作品

### 模板管理

- `GET /api/templates` - 获取所有模板
- `POST /api/templates` - 保存新模板

### 创作记录

- `GET /api/records` - 获取创作记录
- `POST /api/records` - 添加创作记录

## 开发说明

### 前端开发

- 使用 Qwik 框架，支持服务端渲染和极致性能
- TypeScript 严格模式校验
- ESLint 代码规范检查
- Vite 构建工具

### 后端开发

- NestJS 模块化架构
- TypeORM + SQLite 数据库
- RESTful API 设计
- CORS 跨域支持

## 构建生产版本

```bash
# 构建前后端
npm run build

# 构建前端
npm run build:client

# 构建后端
npm run build:server
```

## 许可证

MIT
