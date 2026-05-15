# Windows 桌面模拟器 MVP

这是一个基于 React + Nest.js + TypeScript + SQLite 的 Web 端 Windows 桌面模拟器 MVP 项目。

## 功能特性

### 用户基础体系
- 用户注册/登录
- JWT 身份鉴权
- 单用户数据隔离

### 桌面配置体系
- 默认桌面布局
- 默认图标配置
- 默认壁纸配置
- 配置持久化保存
- 图标拖拽功能
- 刷新不丢失配置

### 基础虚拟文件系统
- 用户根目录创建
- 新建文件夹
- 新建文本文档
- 文件重命名
- 文件删除

### 基础任务栏
- 系统时间显示
- 开始菜单
- 任务栏状态

## 技术栈

**前端：**
- React 18
- TypeScript
- Vite
- Axios
- React Router DOM

**后端：**
- Nest.js
- TypeScript
- SQLite (TypeORM)
- JWT 认证
- bcryptjs 密码加密

## 项目结构

```
dogfooding4/
├── backend/          # Nest.js 后端
│   ├── src/
│   │   ├── entities/     # 数据库实体
│   │   ├── auth/         # 认证模块
│   │   ├── desktop/      # 桌面配置模块
│   │   ├── files/        # 文件系统模块
│   │   └── main.ts       # 入口文件
│   └── package.json
├── frontend/         # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── contexts/     # 上下文
│   │   ├── services/     # API 服务
│   │   ├── types/        # 类型定义
│   │   └── main.tsx      # 入口文件
│   └── package.json
└── package.json        # 根目录配置
```

## 安装与运行

### 1. 安装所有依赖

```bash
npm run install:all
```

### 2. 启动开发服务

```bash
npm run dev
```

- 前端运行在: http://localhost:3456
- 后端运行在: http://localhost:7890

### 3. 单独启动后端

```bash
cd backend
npm run start:dev
```

### 4. 单独启动前端

```bash
cd frontend
npm run dev
```

## 使用说明

1. 打开浏览器访问 http://localhost:3456
2. 首次使用请先注册账号
3. 登录后进入桌面
4. 可以：
   - 拖动桌面图标
   - 双击"此电脑"打开文件资源管理器
   - 在文件管理器中创建文件夹和文本文档
   - 双击打开文件进行编辑
   - 重命名和删除文件
   - 点击开始按钮打开开始菜单
   - 查看任务栏的时间和日期

## 端口配置

- 前端: 3456
- 后端: 7890
