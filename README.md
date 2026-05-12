# 3D节点式流程图动态编辑器

基于Vue3 + TypeScript + NestJS + GraphQL + SQLite的3D流程图编辑工具

## ✨ 功能特性

### 前端功能
- **3D空间节点自由拖拽** - 使用Three.js实现流畅的3D交互
- **连线弹性物理摆动** - 连线带有物理动画效果
- **节点层级折叠展开** - 支持双击折叠/展开节点
- **悬浮光影流光** - 节点带有发光效果和粒子系统背景
- **画布无限缩放平移** - 支持鼠标滚轮缩放和拖拽平移
- **连线智能避障动态渲染** - 贝塞尔曲线平滑连线

### 后端功能
- **GraphQL API接口** - 基于Apollo的GraphQL服务
- **流程图结构化数据保存** - SQLite持久化存储
- **用户工程文件存储** - 完整的工程文件管理
- **基础模板分类管理** - 内置模板系统
- **图片格式导出** - 支持导出PNG格式
- **个人创作记录留存** - 创作历史记录

## 🛠️ 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript 5.1+
- Three.js (3D渲染)
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router
- Apollo Client (GraphQL)
- ESLint

### 后端
- NestJS 10
- GraphQL (Apollo Server)
- TypeORM + SQLite
- TypeScript
- ESLint

## 📦 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

## 🚀 启动项目

### 并发启动（推荐）
```bash
# 在项目根目录执行
npm run dev
```

### 单独启动
```bash
# 启动前端 (端口: 8765)
cd client
npm run dev

# 启动后端 (端口: 9876)
cd server
npm run start:dev
```

## 🌐 访问地址

- **前端编辑器**: http://localhost:8765
- **GraphQL Playground**: http://localhost:9876/graphql

## 📁 项目结构

```
dogfooding3/
├── client/                      # 前端Vue项目
│   ├── src/
│   │   ├── engine/             # 3D渲染引擎
│   │   │   └── FlowchartEngine.ts
│   │   ├── stores/             # Pinia状态管理
│   │   ├── views/              # 页面组件
│   │   ├── router/             # 路由配置
│   │   ├── main.ts             # 入口文件
│   │   └── App.vue
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                      # 后端NestJS项目
│   ├── src/
│   │   ├── flowchart/          # 流程图模块
│   │   │   ├── flowchart.entity.ts
│   │   │   ├── flowchart.resolver.ts
│   │   │   ├── flowchart.service.ts
│   │   │   └── dto/
│   │   ├── template/           # 模板模块
│   │   ├── record/             # 创作记录模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json                 # 根目录配置
└── README.md
```

## 🎮 使用说明

### 基本操作
1. **添加节点**: 点击工具栏"添加节点"按钮
2. **拖拽节点**: 鼠标左键按住节点拖动
3. **选择节点**: 点击节点，右侧属性面板显示详情
4. **修改属性**: 在右侧面板修改节点名称和类型
5. **删除节点**: 点击属性面板"删除节点"按钮
6. **折叠节点**: 双击节点切换折叠状态
7. **缩放画布**: 鼠标滚轮缩放
8. **平移画布**: 鼠标右键或中键拖动

### 节点类型
- **流程节点**: 标准立方体节点
- **决策节点**: 八面体节点
- **开始节点**: 绿色球体
- **结束节点**: 红色球体

### 保存与导出
- **保存流程图**: 点击"保存"按钮保存到后端
- **导出图片**: 点击"导出图片"按钮下载PNG

## 🔧 开发说明

### 端口配置
- 前端端口: `8765` (client/vite.config.ts)
- 后端端口: `9876` (server/src/main.ts)

### TypeScript配置
- 前后端均启用严格模式 (`strict: true`)
- 包含完整的类型定义

### ESLint配置
- 前后端均配置ESLint
- 支持TypeScript语法检查
- 运行 `npm run lint` 检查代码

### GraphQL API
- **Query**:
  - `flowcharts`: 获取所有流程图
  - `flowchart(id: String)`: 获取单个流程图
- **Mutation**:
  - `saveFlowchart(data: FlowchartInput)`: 保存流程图
  - `deleteFlowchart(id: String)`: 删除流程图

## 📄 License

MIT
