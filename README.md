# 拟真物理翻页电子画册系统

基于 Vue3 + TypeScript + NestJS + GraphQL + SQLite 的拟真物理翻页电子画册系统。

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **GSAP** - 高性能动画库
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Apollo Client** - GraphQL 客户端
- **SASS** - CSS 预处理器

### 后端
- **NestJS** - 渐进式 Node.js 框架
- **GraphQL** - API 查询语言
- **TypeORM** - ORM 框架
- **SQLite** - 轻量级数据库

## 特性

### 物理翻页引擎
- 真实书页弯曲效果
- 惯性回弹动画
- 光影阴影动态变化
- 鼠标/触摸拖拽交互

### 用户功能
- 画册库浏览
- 阅读进度自动保存
- 书签管理（悬浮微动动画）
- 画册分享功能

## 项目结构

```
.
├── client/              # 前端项目
│   ├── src/
│   │   ├── components/ # 组件
│   │   ├── composables/ # 组合式函数
│   │   ├── views/      # 页面视图
│   │   ├── types/      # 类型定义
│   │   └── styles/     # 全局样式
│   ├── package.json
│   └── vite.config.ts
├── server/              # 后端项目
│   ├── src/
│   │   ├── book/       # 画册模块
│   │   ├── user/       # 用户模块
│   │   ├── reading-progress/ # 阅读进度模块
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json         # 根目录配置
└── README.md
```

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖（并发启动工具）
npm install

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 启动开发服务器

```bash
# 根目录启动前后端并发
npm run dev

# 或者分别启动
# 后端端口: 4567
cd server && npm run dev

# 前端端口: 3456
cd client && npm run dev
```

### 访问地址
- 前端应用: http://localhost:3456
- GraphQL 控制台: http://localhost:4567/graphql

## 端口配置

- 前端: 3456（不常用端口）
- 后端: 4567（不常用端口）

## 开发规范

- TypeScript 严格模式
- ESLint 代码检查
- 统一的代码风格

## License

MIT
