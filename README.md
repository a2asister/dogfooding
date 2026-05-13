# 3D魔方式技能卡片展示系统

一个具有3D立体翻转、空间自由旋转、磁吸归位、堆叠展开、弹性碰撞回弹、视角平滑切换等物理动画效果的技能卡片展示系统。

## 技术栈

- **前端**: Angular 18 + TypeScript (强校验) + Apollo Angular
- **后端**: NestJS + GraphQL + SQLite (TypeORM)
- **并发启动**: concurrently

## 端口配置

- 后端服务: http://localhost:4200/graphql
- 前端服务: http://localhost:4300

## 功能特性

### 前端特性
- ✅ 卡片3D立体翻转动画
- ✅ 鼠标拖拽自由旋转
- ✅ 磁吸归位效果
- ✅ 三种视图模式: 网格视图/堆叠视图/3D旋转视图
- ✅ 物理引擎模拟（摩擦、惯性、弹性回弹）
- ✅ 视角平滑切换动画
- ✅ 卡片悬停光影效果
- ✅ TypeScript严格模式校验

### 后端特性
- ✅ GraphQL API接口
- ✅ 用户技能信息录入
- ✅ 卡片样式配置保存
- ✅ 访客浏览记录统计
- ✅ 隐私展示开关配置
- ✅ TypeORM + SQLite 数据持久化

## 项目结构

```
dogfooding/
├── backend/                 # NestJS 后端服务
│   ├── src/
│   │   ├── user/           # 用户模块
│   │   ├── skill/          # 技能模块
│   │   ├── card-style-config/  # 卡片样式配置模块
│   │   ├── visit-record/   # 访问记录模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/               # Angular 前端应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── skill-card/  # 3D技能卡片组件
│   │   │   ├── services/    # 数据服务
│   │   │   ├── models/      # 数据模型
│   │   │   └── graphql.module.ts
│   │   └── main.ts
│   └── package.json
└── package.json             # 根目录并发启动配置
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（根目录 + 后端 + 前端）
npm run install:all
```

或者分别安装：

```bash
# 根目录依赖
npm install

# 后端依赖
cd backend && npm install

# 前端依赖
cd ../frontend && npm install
```

### 2. 启动开发服务

```bash
# 同时启动后端和前端（推荐）
npm run dev
```

或者分别启动：

```bash
# 启动后端服务 (端口 4200)
npm run dev:backend

# 启动前端服务 (端口 4300)
npm run dev:frontend
```

### 3. 访问应用

- 前端页面: http://localhost:4300
- GraphQL Playground: http://localhost:4200/graphql

## GraphQL API 示例

### 查询用户技能

```graphql
query {
  skills(userId: 1) {
    id
    name
    description
    proficiency
    category
  }
}
```

### 创建技能卡片

```graphql
mutation {
  createSkill(
    name: "Angular"
    userId: 1
    description: "现代Web应用开发框架"
    proficiency: 85
    category: "前端框架"
    primaryColor: "#DD0031"
    secondaryColor: "#C3002F"
  ) {
    id
    name
  }
}
```

## 核心功能说明

### 卡片交互

- **点击翻转**: 点击卡片可以翻转显示背面详情
- **拖拽移动**: 按住鼠标可以自由拖拽卡片
- **物理回弹**: 释放后有惯性回弹和磁吸归位效果
- **3D旋转**: 鼠标悬停时卡片跟随鼠标产生3D倾斜效果

### 视图模式

1. **网格视图 (Grid Mode)**: 卡片整齐排列，适合概览所有技能
2. **堆叠视图 (Stack Mode)**: 卡片层叠排列，节省空间
3. **3D视图 (3D Mode)**: 环形3D布局，自动旋转展示

## 开发说明

### TypeScript 严格模式

前端已启用完整的 TypeScript 严格模式：

- strictNullChecks
- strictFunctionTypes
- strictBindCallApply
- strictPropertyInitialization
- noImplicitThis
- alwaysStrict
- noImplicitReturns
- noFallthroughCasesInSwitch

### 数据库

使用 SQLite 数据库，数据文件自动生成在 `backend/skills.db`

## 构建生产版本

```bash
# 构建所有
npm run build

# 分别构建
npm run build:backend
npm run build:frontend
```

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

需要支持 CSS 3D Transforms 和 Backdrop Filter

## 许可证

MIT