# 衣物穿搭配色智能预览工具

一个基于 React + NestJS + TypeScript + SQLite 的全栈穿搭管理应用，支持衣物上传、穿搭组合、色彩匹配和智能预览。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Styled Components + Framer Motion
- **后端**: NestJS + TypeScript + SQLite
- **数据库**: SQLite
- **并发启动**: concurrently

## 特性

- ✅ 衣物图片上传和分类管理
- ✅ 穿搭组合卡片滑动切换
- ✅ 色彩匹配光晕高亮效果
- ✅ 穿搭布局弹性排布
- ✅ 预览画面渐变过渡动画
- ✅ 搭配标签动态弹出
- ✅ 收藏穿搭记录
- ✅ 配色偏好保存

## 端口配置

- 前端: **5875**
- 后端: **5876**

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前后端依赖
cd backend && npm install
cd ../frontend && npm install
```

或者使用一键安装：
```bash
npm run install:all
```

### 2. 启动开发服务器

```bash
# 同时启动前后端（推荐
npm run dev

# 或者分别启动
npm run dev:server  # 仅后端
npm run dev:client  # 仅前端
```

### 3. 访问应用

打开浏览器访问: http://localhost:5875

## 项目结构

```
dogfooding/
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── entities/       # 数据库实体
│   │   ├── clothing/      # 衣物模块
│   │   ├── outfit/        # 穿搭模块
│   │   ├── preference/   # 偏好模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/         # 图片上传目录
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── services/    # API 服务
│   │   ├── styles/      # 样式
│   │   ├── types/       # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── package.json
└── README.md
```

## 核心功能说明

### 衣物上传
- 支持上传衣物图片
- 选择衣物分类（上衣、裤子、裙子、外套、鞋子、配饰）
- 选择衣物颜色标签
- 自动保存到数据库

### 穿搭创建
- 从已上传衣物中选择搭配
- 添加自定义标签
- 保存穿搭方案

### 穿搭预览
- 卡片式布局展示
- 左右滑动切换穿搭
- 色彩匹配的光晕效果
- 收藏/取消收藏功能
- 动态标签动画效果

## API 接口

### 衣物 (Clothing)
- `GET /api/clothing` - 获取所有衣物
- `POST /api/clothing` - 上传新衣物（multipart/form-data）
- `PUT /api/clothing/:id` - 更新衣物信息
- `DELETE /api/clothing/:id` - 删除衣物

### 穿搭 (Outfit)
- `GET /api/outfits` - 获取所有穿搭
- `POST /api/outfits` - 创建新穿搭
- `PUT /api/outfits/:id` - 更新穿搭信息
- `DELETE /api/outfits/:id` - 删除穿搭

### 偏好 (Preference)
- `GET /api/preferences` - 获取用户偏好
- `PUT /api/preferences/:id` - 更新用户偏好

## 开发说明

### TypeScript 配置
- 前端开启严格模式 (`strict: true`)
- ESLint 代码规范校验
- 类型安全的 API 调用

### 动画效果
- 使用 Framer Motion 实现流畅动画
- 色彩匹配的动态光晕效果
- 卡片拖拽滑动切换
- 标签弹出动画

### 样式
- Styled Components 主题化
- 响应式布局设计
- 渐变背景和卡片效果
