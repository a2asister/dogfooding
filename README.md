# 3D 交互式元素周期表

基于 Vue3 + TypeScript + NestJS + SQLite 的全栈 3D 交互式元素周期表应用。

## ✨ 功能特性

### 🎨 3D 视觉效果
- **元素立方体3D翻转悬浮**：每个元素以立方体形式展示，自带旋转和悬浮动画
- **元素分组渐变点亮**：不同类别的元素使用不同颜色标识，hover时有发光效果
- **原子粒子环绕运动**：每个元素周围有粒子围绕旋转
- **视角拖拽旋转**：整个3D场景支持鼠标拖拽旋转和滚轮缩放

### 💡 交互功能
- **详情弹窗弹性弹出**：点击元素弹出详细信息面板，带有弹性动画
- **化学元素知识库**：展示元素基本信息（原子序数、原子质量、类别、族、周期等）

### 📚 学习管理
- **用户收藏元素**：支持收藏/取消收藏元素，方便复习
- **学习笔记保存**：可以为元素添加学习笔记
- **知识点分类管理**：笔记支持分类管理

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Three.js** - 3D 图形库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **Sass/SCSS** - 样式预处理

### 后端
- **NestJS** - 企业级 Node.js 框架
- **TypeScript** - 类型安全
- **TypeORM** - ORM 框架
- **SQLite** - 轻量级数据库

## 📁 项目结构

```
dogfooding/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── api/           # API 封装
│   │   └── styles/        # 全局样式
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                 # 后端项目
│   ├── src/
│   │   ├── entities/      # TypeORM 实体
│   │   ├── element/       # 元素模块
│   │   ├── favorite/      # 收藏模块
│   │   ├── note/          # 笔记模块
│   │   └── knowledge-category/  # 知识点分类
│   └── package.json
├── package.json            # 根配置 (concurrently)
└── .gitignore
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server && npm install

# 安装前端依赖
cd ../client && npm install
```

### 启动开发服务

```bash
# 在根目录执行，同时启动前后端
npm run dev
```

- 前端地址：http://localhost:3000
- 后端地址：http://localhost:8765

### 单独启动

```bash
# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

## 🔧 配置说明

### 端口配置
- 前端默认端口：3000 (可在 `client/package.json` 的 scripts 中修改)
- 后端默认端口：8765 (可在 `server/src/main.ts` 修改)
- CORS 已配置允许：http://localhost:3000, http://127.0.0.1:3000

### 数据库配置
- 数据库类型：SQLite
- 数据库文件：`server/database.sqlite`
- 自动同步：启动时自动创建表结构

## 📝 API 接口

### 元素 (Elements)
- `GET /elements` - 获取所有元素
- `GET /elements/:id` - 获取单个元素
- `POST /elements` - 创建元素
- `POST /elements/bulk` - 批量创建元素
- `PATCH /elements/:id` - 更新元素
- `DELETE /elements/:id` - 删除元素

### 收藏 (Favorites)
- `GET /favorites/user/:userId` - 获取用户收藏
- `GET /favorites/user/:userId/element/:elementId` - 检查是否收藏
- `POST /favorites` - 添加收藏
- `DELETE /favorites/user/:userId/element/:elementId` - 取消收藏

### 笔记 (Notes)
- `GET /notes/user/:userId` - 获取用户所有笔记
- `GET /notes/:id` - 获取单条笔记
- `POST /notes` - 创建笔记
- `PATCH /notes/:id` - 更新笔记
- `DELETE /notes/:id` - 删除笔记

### 知识点分类 (Knowledge Categories)
- `GET /knowledge-categories` - 获取所有分类
- `POST /knowledge-categories` - 创建分类
- `PATCH /knowledge-categories/:id` - 更新分类
- `DELETE /knowledge-categories/:id` - 删除分类

## ✅ 代码检查

```bash
# 检查全部代码
npm run lint

# 仅检查后端
npm run lint:server

# 仅检查前端
npm run lint:client
```

## 🎯 使用说明

1. **浏览元素**：启动应用后，可以在3D视图中看到元素周期表
2. **查看详情**：点击任意元素立方体，弹出详细信息面板
3. **收藏元素**：在详情面板中点击"收藏"按钮
4. **添加笔记**：在详情面板中可以为当前元素添加学习笔记
5. **查看收藏**：点击顶部"⭐ 收藏"按钮，查看所有收藏的元素
6. **管理笔记**：点击顶部"📝 笔记"按钮，查看和管理所有笔记
7. **视角控制**：按住鼠标左键拖拽旋转视角，滚轮缩放

## 🔒 安全与规范

- TypeScript 严格模式启用
- ESLint 严格代码检查
- 请求参数验证
- CORS 跨域配置

## 📄 License

MIT
