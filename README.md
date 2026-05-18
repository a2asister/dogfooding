# 物理模拟实验平台

基于 WebAssembly 的高性能物理模拟实验网页工具，支持多种物理实验场景的实时模拟与可视化。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Express + TypeScript + SQLite (better-sqlite3)
- **物理引擎**: Rust + WebAssembly (wasm-bindgen)
- **代码规范**: ESLint + TypeScript 严格模式
- **并发启动**: concurrently

## 功能特性

### 实验场景
- 🍎 **自由落体运动** - 研究重力作用下物体的自由下落运动
- 🎯 **抛体运动** - 模拟平抛、斜抛运动，分析轨迹影响因素
- 💥 **弹性碰撞** - 研究动量守恒定律
- ⏱️ **单摆运动** - 分析简谐运动规律
- 🌍 **天体运动** - 模拟万有引力作用下的轨道运动

### 核心功能
- ⚡ **WASM 加速** - Rust 实现的高性能物理计算内核
- 🎨 **实时可视化** - Canvas 实时渲染粒子运动轨迹
- ⚙️ **参数调节** - 动态调整物理参数并实时观察效果
- 📊 **轨迹绘制** - 支持运动轨迹和速度向量显示
- 💾 **数据持久化** - SQLite 存储实验配置和记录
- 🔄 **并发启动** - 一键启动前后端服务

## 项目结构

```
.
├── client/                 # Vue 3 前端应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── composables/   # Vue 组合式函数
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── views/         # 页面组件
│   │   └── styles/        # 全局样式
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.js
├── server/                # Express 后端服务
│   ├── src/
│   │   ├── db/           # 数据库操作
│   │   ├── routes/       # API 路由
│   │   └── index.ts      # 服务入口
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.js
├── wasm/                  # Rust + WebAssembly 物理引擎
│   ├── src/
│   │   └── lib.rs        # 物理引擎实现
│   └── Cargo.toml
├── package.json           # 根配置 (concurrently)
├── tsconfig.base.json     # 共享 TypeScript 配置
└── .gitignore
```

## 端口配置

项目使用不常用端口避免冲突：
- **前端**: 41287
- **后端**: 38764

## 快速开始

### 前置要求

- Node.js >= 18
- Rust 工具链 (用于编译 WASM，可选，前端内置纯 JS 降级方案)
  - 安装: https://www.rust-lang.org/tools/install
  - wasm-pack: `cargo install wasm-pack`

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 编译 WASM (可选)

```bash
# 编译 Rust 为 WebAssembly
npm run build:wasm
```

> 注意: 如果不编译 WASM，前端会自动使用纯 JavaScript 降级方案

### 开发模式

```bash
# 并发启动前后端
npm run dev
```

### 单独启动

```bash
# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run typecheck
```

## API 接口

### 模拟管理
- `GET /api/simulations` - 获取所有模拟
- `GET /api/simulations/:id` - 获取单个模拟
- `POST /api/simulations` - 创建模拟
- `PUT /api/simulations/:id` - 更新模拟
- `DELETE /api/simulations/:id` - 删除模拟

### 实验记录
- `GET /api/simulations/:id/experiments` - 获取模拟的实验记录
- `POST /api/simulations/:id/experiments` - 创建实验记录

### 健康检查
- `GET /api/health` - 服务健康状态

## 物理引擎特性

WASM 内核实现以下功能：

### 力学计算
- 牛顿运动定律
- 重力模拟
- 空气阻力
- 弹性碰撞 (动量守恒)

### 数值方法
- Verlet 积分
- 子步迭代 (Sub-stepping)
- 碰撞响应与分离

### 专用公式
- 抛体运动轨迹计算
- 天体轨道力学
- 单摆简谐运动

## TypeScript 严格模式

项目启用最严格的 TypeScript 检查：

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`

## 开发说明

### 添加新的实验类型

1. 在 `client/src/types/index.ts` 中扩展 `ExperimentType`
2. 在 `client/src/views/Simulate.vue` 的 `experimentConfigs` 中添加配置
3. 在 `setupExperiment` 函数中实现初始化逻辑

### 扩展物理引擎

1. 在 `wasm/src/lib.rs` 中添加新的物理计算函数
2. 使用 `#[wasm_bindgen]` 导出函数
3. 编译 WASM 后在前端调用

## License

MIT
