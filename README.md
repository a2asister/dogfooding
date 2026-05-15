# 层级化任务进度可视化看板

一个全栈任务管理应用，支持多级任务层级管理、实时进度计算、逾期提醒、数据可视化统计。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + GSAP + Lucide React
- **后端**: Nest.js + TypeScript + TypeORM + SQLite
- **特性**: 并发启动、ESLint代码规范、TypeScript强类型校验

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── types/         # TypeScript类型定义
│   │   ├── services/      # API服务封装
│   │   ├── App.tsx        # 主应用组件
│   │   ├── App.css        # 样式文件
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # 后端项目
│   ├── src/
│   │   ├── entities/      # 数据库实体
│   │   ├── services/      # 业务逻辑服务
│   │   ├── controllers/   # API控制器
│   │   ├── dto/           # 数据传输对象
│   │   └── main.ts        # 应用入口
│   ├── package.json
│   └── tsconfig.json
├── package.json            # 根package（支持workspaces）
└── .gitignore
```

## 功能特性

### 后端功能
- ✅ **任务CRUD**: 创建、读取、更新、删除任务
- ✅ **层级管理**: 支持无限级子任务
- ✅ **进度实时计算**: 根据子任务权重自动计算父任务进度
- ✅ **逾期标记**: 自动检测并标记逾期任务
- ✅ **数据聚合统计**: 总任务数、完成数、进行中、逾期数、整体进度
- ✅ **权重计算**: 支持任务权重分配
- ✅ **布局参数存储**: 支持保存自定义布局配置
- ✅ **SQLite数据库**: 轻量级本地存储

### 前端功能
- ✅ **层级任务看板**: 树形结构展示任务
- ✅ **任务卡片升降位动画**: GSAP实现流畅的滑动动画
- ✅ **进度流体填充效果**: 进度条带流体流光动画
- ✅ **完成态弹跳动画**: 完成任务时的视觉反馈
- ✅ **层级展开收起序列动画**: 平滑的展开/收起效果
- ✅ **任务录入**: 创建、编辑任务表单
- ✅ **进度更新**: 手动更新任务进度
- ✅ **数据可视化面板**: 统计卡片展示
- ✅ **子任务管理**: 在任意层级添加子任务
- ✅ **TypeScript强类型校验**: 完整的类型系统
- ✅ **ESLint代码规范**: 代码质量保证

## 端口配置

- **前端**: `http://localhost:4321`（不常用端口）
- **后端**: `http://localhost:8765`（不常用端口）

## 安装与运行

### 方式一：一键安装所有依赖

```bash
# 在根目录执行
npm run install:all
```

### 方式二：分别安装

```bash
# 根目录（并发工具）
npm install

# 后端依赖
cd server && npm install

# 前端依赖
cd ../client && npm install
```

### 启动项目

```bash
# 并发启动前后端（推荐）
npm run dev

# 或单独启动
npm run dev:server    # 仅启动后端
npm run dev:client    # 仅启动前端
```

### 构建项目

```bash
npm run build
```

## API接口

### 任务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取所有任务（树形结构） |
| GET | /api/tasks/:id | 获取单个任务 |
| GET | /api/tasks/statistics | 获取统计数据 |
| POST | /api/tasks | 创建新任务 |
| PATCH | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |

### 布局接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/layouts | 获取所有布局 |
| GET | /api/layouts/:name | 获取指定布局 |
| POST | /api/layouts/:name | 保存布局配置 |

## 使用说明

1. **创建任务**: 点击右上角"新建任务"按钮
2. **添加子任务**: 点击任务卡片上的"子任务"按钮
3. **更新进度**: 编辑任务时修改进度百分比
4. **标记完成**: 点击任务左侧的复选框
5. **展开/收起**: 有子任务的任务左侧有箭头按钮
6. **编辑任务**: 点击任务上的编辑图标
7. **删除任务**: 点击任务上的删除图标

## 核心业务逻辑

### 进度计算公式

```
父任务进度 = Σ(子任务进度 × 子任务权重) / Σ(所有子任务权重)
```

### 逾期检测

系统自动定期检测任务截止日期，超过当前日期的任务自动标记为"已逾期"。

### 动画实现

使用GSAP (GreenSock Animation Platform) 实现：
- 页面入场动画
- 任务卡片滑入动画
- 进度条流体流光效果
- 模态框缩放动画
- 悬停交互反馈

## 开发说明

- 后端使用Nest.js的依赖注入和TypeORM的实体装饰器
- 前端使用React Hooks管理状态，Axios处理HTTP请求
- CORS已配置，允许前端端口访问后端API
- 数据库文件自动创建在 `server/task-kanban.db`

## License

MIT
