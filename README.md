# 在线问卷系统

一个完整的在线问卷系统，支持问卷创建、作答、数据统计可视化等功能。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Framer Motion + TailwindCSS + Recharts
- **后端**: NestJS + TypeScript + SQLite + TypeORM
- **并发启动**: Concurrently

## 功能特性

### 前端功能
- 自定义题型（单选题、多选题、文本题、评分题、量表题）
- 问卷编辑（创建、修改、发布、删除）
- 问卷作答（带进度条、平滑切换动画）
- 数据统计可视化（柱状图、饼图、趋势图）
- Framer Motion 动画效果

### 后端功能
- 题型逻辑校验
- 作答数据批量统计
- 无效数据过滤
- RESTful API 接口
- 数据持久化（SQLite）

## 快速开始

### 安装依赖
```bash
npm run install:all
```

### 启动开发服务器
```bash
npm run dev
```
- 前端服务: http://localhost:3789
- 后端服务: http://localhost:4789

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
.
├── backend/              # NestJS 后端
│   ├── src/
│   │   ├── survey/      # 问卷模块
│   │   ├── response/    # 回答模块
│   │   ├── analytics/   # 统计模块
│   │   └── main.ts      # 入口文件
│   └── package.json
├── frontend/             # React 前端
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── types/       # 类型定义
│   │   ├── api/         # API 封装
│   │   └── main.tsx     # 入口文件
│   └── package.json
└── package.json          # 根配置
```

## 端口配置

- 前端: 3789
- 后端: 4789

## 代码规范

- TypeScript 严格模式
- ESLint 代码检查
- 前后端统一代码风格
