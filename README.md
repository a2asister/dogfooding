# 图文社区

一个基于 Vue3 + Express + TypeScript + SQLite 的全栈图文社区平台。

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript (严格模式)
- Vite
- Pinia (状态管理)
- Vue Router
- Element Plus (UI 组件库)
- ESLint (代码规范)
- Sass (样式预处理)

### 后端
- Express.js
- TypeScript
- SQLite (数据库)
- JWT (身份认证)
- Multer (文件上传)
- bcryptjs (密码加密)

## 项目结构

```
dogfooding4/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口
│   │   ├── components/      # 公共组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── router/          # 路由配置
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── views/           # 页面组件
│   │   ├── styles/          # 全局样式
│   │   └── main.ts          # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.cjs
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由
│   │   ├── database/        # 数据库
│   │   ├── types/           # 类型定义
│   │   └── app.ts           # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.cjs
├── package.json             # 根目录配置（并发启动）
└── README.md
```

## 功能特性

### 用户系统
- ✅ 手机号/密码登录注册
- ✅ JWT 身份认证
- ✅ 游客浏览
- ✅ 基础权限控制
- ✅ 个人资料编辑

### 笔记系统
- ✅ 图文笔记发布
- ✅ 多图上传
- ✅ 图片预览
- ✅ 笔记列表（推荐/关注）
- ✅ 笔记详情
- ✅ 点赞/收藏/转发
- ✅ 草稿箱功能
- ✅ 话题绑定
- ✅ 位置定位

### 社交功能
- ✅ 关注/粉丝系统
- ✅ 用户主页浏览
- ✅ 用户搜索

### 运营后台
- ✅ 笔记人工审核
- ✅ 违规作品下架
- ✅ 用户管理（启用/禁用）
- ✅ 系统配置管理

### 技术特性
- ✅ TypeScript 强类型校验
- ✅ ESLint 代码规范
- ✅ 前后端分离架构
- ✅ 并发启动（concurrently）
- ✅ RESTful API 设计
- ✅ 文件上传支持
- ✅ 权限中间件

## 端口配置

- 前端：`28765`
- 后端：`38765`

## 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
npm install

# 安装前后端依赖
npm run install:all
```

### 启动项目

```bash
# 前后端同时启动
npm run dev

# 或者分别启动
# 启动前端
npm run dev:frontend

# 启动后端
npm run dev:backend
```

### 构建项目

```bash
# 构建前后端
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

### 代码检查

```bash
# 检查前后端代码
npm run lint

# 分别检查
npm run lint:frontend
npm run lint:backend
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 密码登录
- `POST /api/auth/phone-login` - 手机号登录
- `GET /api/auth/me` - 获取当前用户信息

### 笔记接口
- `GET /api/notes` - 获取笔记列表
- `GET /api/notes/:id` - 获取笔记详情
- `POST /api/notes` - 创建笔记
- `POST /api/notes/:id/like` - 点赞/取消点赞
- `POST /api/notes/:id/favorite` - 收藏/取消收藏
- `POST /api/notes/:id/share` - 分享
- `GET /api/notes/drafts` - 获取草稿列表
- `POST /api/notes/drafts/:id/publish` - 发布草稿
- `DELETE /api/notes/drafts/:id` - 删除草稿

### 用户接口
- `GET /api/users/:id` - 获取用户信息
- `POST /api/users/:id/follow` - 关注/取消关注
- `PUT /api/users/profile` - 更新个人资料

### 文件接口
- `POST /api/files/image` - 上传单张图片
- `POST /api/files/images` - 上传多张图片

### 管理员接口
- `GET /api/admin/notes/pending` - 获取待审核笔记
- `POST /api/admin/notes/:id/approve` - 审核通过
- `POST /api/admin/notes/:id/reject` - 拒绝审核
- `POST /api/admin/notes/:id/take-down` - 下架笔记
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users/:id/toggle-status` - 切换用户状态
- `GET /api/admin/configs` - 获取系统配置
- `PUT /api/admin/configs` - 更新系统配置

## 数据库表结构

- `users` - 用户表
- `notes` - 笔记表
- `note_images` - 笔记图片表
- `note_topics` - 笔记话题表
- `likes` - 点赞表
- `favorites` - 收藏表
- `follows` - 关注表
- `system_configs` - 系统配置表

## 默认账号

系统会自动创建一个管理员账号（如果不存在）：

- 用户名：`admin`
- 密码：`admin123`
- 昵称：`管理员`

## 开发说明

### 前端开发
- 使用 Vue 3 Composition API
- 遵循 TypeScript 严格模式
- 使用 Element Plus 组件库
- 使用 Pinia 进行状态管理

### 后端开发
- 使用 Express 中间件模式
- 使用 TypeScript 类型定义
- 使用 SQLite 数据库（自动初始化）
- 使用 JWT 进行身份认证

## 许可证

MIT
