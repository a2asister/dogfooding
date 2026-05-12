# 心率监测系统

一个基于 Astro + NestJS + SQLite 的实时心率监测系统，包含精美的动画界面和数据持久化功能。

## 功能特性

### 前端界面
- **心脏动画**：使用 CSS transform: scale() 配合 cubic-bezier 缓动函数模拟真实心脏收缩舒张的节律感
- **背景波纹**：多层径向渐变动画，以心跳频率向外扩散形成涟漪效果
- **心电图**：SVG 动画实时绘制连续滚动的监测画面
- **数字显示**：翻牌动画切换数值，营造专业医疗设备质感
- **实时状态**：连接状态指示器和心率统计信息

### 后端服务
- **WebSocket 实时数据推送**：使用 Socket.io 实现实时心率数据传输
- **SQLite 时序数据存储**：TypeORM 持久化心率数据
- **REST API**：提供历史数据查询和统计接口
- **数据模拟**：内置心率模拟器方便测试

## 技术栈

- **前端**：Astro 4.x + React 18.x + TypeScript
- **后端**：NestJS 10.x + TypeScript
- **数据库**：SQLite (better-sqlite3)
- **实时通信**：Socket.io
- **并发启动**：concurrently

## 项目结构

```
.
├── frontend/                 # Astro 前端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   │   └── index.astro
│   │   └── components/     # React 组件
│   │       └── HeartRateMonitor.tsx
│   ├── astro.config.mjs
│   └── package.json
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── heart-rate.entity.ts
│   │   ├── heart-rate.gateway.ts
│   │   └── heart-rate.controller.ts
│   └── package.json
├── package.json             # 根目录配置
└── .gitignore
```

## 快速开始

### 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或者分别安装
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 启动项目

```bash
# 同时启动前后端
npm run dev
```

- 前端地址: http://localhost:4321
- 后端地址: http://localhost:3000

### 单独启动

```bash
# 仅启动前端
npm run dev:frontend

# 仅启动后端
npm run dev:backend
```

## API 接口

### 获取历史数据
```
GET /heart-rate/history
```

查询参数：
- `start`: 开始时间 (ISO 格式)
- `end`: 结束时间 (ISO 格式)

### 获取最新数据
```
GET /heart-rate/latest
```

### 获取统计数据
```
GET /heart-rate/stats
```

返回：
```json
{
  "avg": 75,
  "min": 65,
  "max": 85,
  "count": 100
}
```

## 动画实现细节

### 心脏跳动
```typescript
animation: heartbeat ${60 / heartRate}s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
```
- 频率根据实时心率动态调整
- 使用 cubic-bezier 模拟真实的心肌收缩

### 波纹扩散
```css
animation: ripple-expand 2s ease-out infinite;
```
- 4 层波纹依次延迟 0.5s 启动
- 从中心向外径向扩散

### 心电图滚动
```css
animation: ecg-scroll 2s linear infinite;
```
- SVG path 连续滚动
- 200% 宽度实现无缝循环

### 数字翻牌
```css
animation: flip-in 0.6s ease-out;
```
- 3D 翻转效果
- 每个数字独立动画

## 数据库

心率数据自动存储在 `backend/heart-rate.db` SQLite 数据库中，包含字段：
- `id`: 自增主键
- `rate`: 心率值 (BPM)
- `timestamp`: 记录时间戳

## 构建

```bash
# 构建前后端
npm run build

# 分别构建
npm run build:frontend
npm run build:backend
```

## 注意事项

- 项目使用非标准端口：前端 4321，后端 3000
- 数据库文件 `heart-rate.db` 已加入 .gitignore
- 后端内置心率模拟器，方便前端测试
- CORS 已配置为允许所有来源（开发环境）
