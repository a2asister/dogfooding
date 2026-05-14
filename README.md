# 尘埃氛围动态特效生成器

一个基于 Vue3 + NestJS + TypeScript + SQLite 的尘埃粒子动态特效生成器，模拟真实尘埃漂浮效果。

## 功能特性

- 🎨 **实时尘埃效果**: Canvas 驱动的粒子动态效果
- ✨ **光影穿透**: 模拟光束穿透尘埃的视觉效果
- 💫 **明暗交替**: 粒子自然明暗变化
- 🖱️ **鼠标扰动**: 鼠标移动产生尘埃飘散效果
- 🌫️ **朦胧氛围**: 可调节的画面朦胧度
- 🎚️ **自定义参数**: 密度、速度、光影强度等实时调节
- 💾 **配置保存**: 特效参数配置持久化存储
- 📸 **截图保存**: 一键保存当前特效画面
- 🏷️ **分类管理**: 模板分类存储和管理

## 技术栈

**前端**:
- Vue 3 (Composition API)
- TypeScript (严格模式)
- Vite
- ESLint

**后端**:
- NestJS
- TypeScript
- SQLite (TypeORM)
- CORS 支持

## 项目结构

```
dogfooding/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── composables/   # 组合式函数
│   │   └── types/         # TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
├── server/                 # 后端项目
│   ├── src/
│   │   ├── config/        # 配置模块
│   │   ├── entity/        # 数据库实体
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（根目录 + 前端 + 后端）
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 前端
cd client && npm install

# 后端
cd server && npm install
```

### 2. 启动项目

#### 方式一：并发启动（推荐）

```bash
npm run dev
```

#### 方式二：分别启动

```bash
# 启动前端（端口 48732）
npm run dev:client

# 启动后端（端口 39571）
npm run dev:server
```

### 3. 访问应用

- 前端: http://localhost:48732
- 后端 API: http://localhost:39571/api

## 可调节参数

| 参数 | 范围 | 说明 |
|------|------|------|
| 尘埃密度 | 1-20 | 屏幕上的粒子数量 |
| 漂浮速度 | 0.1-5 | 粒子移动的速度 |
| 光影强度 | 0-3 | 中心光束的亮度 |
| 朦胧强度 | 0-5 | 画面的模糊程度 |
| 颗粒大小 | 0.5-5 | 单个粒子的尺寸 |
| 鼠标扰动 | 0-10 | 鼠标对粒子的影响力度 |

## API 接口

### 配置管理

- `POST /api/configs` - 保存新的特效配置
- `GET /api/configs` - 获取所有配置
- `GET /api/configs?category=xxx` - 按分类获取配置
- `GET /api/configs/:id` - 获取单个配置
- `DELETE /api/configs/:id` - 删除配置

## 开发说明

### 前端

- 使用 Vue 3 Composition API
- TypeScript 严格模式 (`strict: true`)
- Canvas 2D 渲染粒子效果
- Vite 作为构建工具

### 后端

- NestJS 框架
- TypeORM + SQLite 数据库
- RESTful API 设计
- 自动 CORS 处理

## 端口说明

为了避免与常用端口冲突，项目使用了不常用的端口：
- 前端: 48732
- 后端: 39571

如需修改端口，请在以下文件中调整：
- 前端: `client/vite.config.ts` 和 `client/package.json`
- 后端: `server/package.json` 和 `server/src/main.ts`

## 许可证

MIT
