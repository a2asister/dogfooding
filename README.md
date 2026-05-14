# 汉字部首拆解动态学习工具

一个基于 React + NestJS + TypeScript + SQLite 的汉字学习应用，支持部首拆解、笔画动画、学习记录等功能。

## 技术栈

- **前端**: React 18, TypeScript, Vite, Framer Motion, Axios
- **后端**: NestJS 10, TypeScript, TypeORM, SQLite
- **端口**: 前端 3978, 后端 3979

## 项目结构

```
dogfooding2/
├── frontend/          # React 前端应用
│   ├── src/
│   │   ├── types/    # TypeScript 类型定义
│   │   ├── App.tsx   # 主组件
│   │   ├── main.tsx  # 入口文件
│   │   └── index.css # 样式文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/           # NestJS 后端应用
│   ├── src/
│   │   ├── entities/ # 数据库实体
│   │   ├── character/ # 汉字模块
│   │   ├── practice/  # 练习模块
│   │   ├── note/      # 笔记模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── package.json       # 根 package.json (并发启动)
└── .gitignore
```

## 功能特性

1. **汉字部首拆解**: 点击"拆解部首"按钮，汉字会动态分解成各个组成部首
2. **弹性动画效果**: 使用 Framer Motion 实现流畅的动画过渡
3. **易错部首高亮**: 容易出错的部首会有红色闪烁边框提示
4. **汉字信息展示**: 显示拼音、含义、总笔画、结构类型等信息
5. **汉字选择器**: 快速切换不同的汉字进行学习
6. **数据持久化**: 后端使用 SQLite 存储汉字数据、练习记录和笔记

## 安装和运行

### 1. 安装所有依赖

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

### 2. 启动项目

#### 方式一：并发启动（推荐）

```bash
npm run dev
```

这将同时启动前端和后端服务。

#### 方式二：单独启动

```bash
# 启动前端（端口 3978）
cd frontend
npm run dev

# 启动后端（端口 3979）
cd ../backend
npm run start:dev
```

### 3. 访问应用

- 前端地址: http://localhost:3978
- 后端 API: http://localhost:3979

## API 接口

### 汉字相关

- `GET /api/characters` - 获取所有汉字
- `GET /api/characters/:id` - 获取单个汉字详情
- `POST /api/characters` - 创建新汉字

### 练习记录相关

- `POST /api/practice/record` - 创建练习记录
- `GET /api/practice/records` - 获取所有练习记录
- `GET /api/practice/errors` - 获取易错汉字列表

### 笔记相关

- `POST /api/notes` - 创建笔记
- `GET /api/notes` - 获取所有笔记
- `GET /api/notes/character/:characterId` - 获取指定汉字的笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

## 代码质量

项目配置了严格的 TypeScript 检查和 ESLint 代码规范：

```bash
# 检查前端代码
cd frontend
npm run lint

# 检查后端代码
cd ../backend
npm run lint
```

## 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd ../backend
npm run build
```

## 数据库

项目使用 SQLite 数据库，文件位于 `backend/database.sqlite`。首次启动时会自动创建数据库表并填入示例数据。

## 开发说明

- 前端使用 Vite 进行快速开发，支持热更新
- 后端使用 NestJS CLI，支持热重载
- 使用 TypeScript 严格模式，确保类型安全
- ESLint 确保代码风格一致
