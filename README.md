# ✨ 文字粒子重组艺术生成器

一个融合了高级粒子动画效果的全栈艺术创作平台，使用Vue3、TypeScript、NestJS和GraphQL构建。

## 🎨 功能特性

### 核心粒子动画
- **文字碎裂消散** - 一键将文字转化为纷飞的粒子
- **粒子聚合重组** - 散开的粒子重新组合成文字
- **色彩流光渐变** - 粒子色彩随时间动态变化
- **鼠标交互扰动** - 鼠标靠近粒子产生物理扰动效果
- **动态光影光晕** - 每个粒子带有发光效果

### 作品管理功能
- **创作参数记录** - 完整保存字体大小、粒子尺寸等参数
- **作品图片保存** - 将粒子艺术作品保存为图片
- **个人创作相册** - 查看所有保存的作品
- **点赞收藏系统** - 支持点赞和收藏作品
- **分类归档管理** - 按分类筛选浏览作品

## 🛠 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 强类型JavaScript超集
- **Vite** - 下一代前端构建工具
- **Apollo Client** - GraphQL客户端
- **Canvas API** - 粒子动画渲染

### 后端
- **NestJS** - 企业级Node.js框架
- **GraphQL** - API查询语言
- **Apollo Server** - GraphQL服务器
- **SQLite** - 轻量级关系型数据库
- **TypeORM** - ORM框架

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install && cd ..

# 安装后端依赖
cd server && npm install && cd ..
```

### 启动项目

#### 方式一：并发启动（推荐）

```bash
npm run dev
```

#### 方式二：分别启动

```bash
# 启动前端开发服务器 (端口: 4396)
npm run dev:client

# 启动后端开发服务器 (端口: 4397)
npm run dev:server
```

### 访问地址
- **前端应用**: http://localhost:4396
- **GraphQL Playground**: http://localhost:4397/graphql

## 📁 项目结构

```
particle-art-generator/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── utils/         # 工具类
│   │   ├── router/        # 路由配置
│   │   ├── App.vue        # 根组件
│   │   └── main.ts        # 入口文件
│   ├── vite.config.ts     # Vite配置
│   ├── tsconfig.json      # TS配置
│   └── package.json       # 依赖配置
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── artwork/       # 作品模块
│   │   ├── app.module.ts  # App模块
│   │   └── main.ts        # 入口文件
│   ├── nest-cli.json      # Nest配置
│   ├── tsconfig.json      # TS配置
│   └── package.json       # 依赖配置
│
├── package.json            # 根配置
└── README.md              # 项目说明
```

## 🎮 使用说明

### 创作页面
1. 在输入框中输入想要展示的文字
2. 调整字体大小、粒子大小等参数
3. 点击「碎裂/聚合」按钮切换粒子状态
4. 移动鼠标与粒子进行交互
5. 满意后点击「保存作品」

### 相册页面
1. 查看所有保存的作品
2. 使用分类过滤器筛选
3. 点击❤️按钮点赞作品
4. 点击⭐按钮收藏作品

## ⚙️ 配置说明

### 端口配置
- 前端默认端口: `4396` (client/vite.config.ts)
- 后端默认端口: `4397` (server/src/main.ts)

### 数据库
- 使用SQLite数据库
- 数据库文件位置: `server/particle-art.db`
- 自动同步实体结构

## 🔧 开发命令

```bash
# 前端
npm run dev          # 开发模式
npm run build        # 构建生产版本
npm run lint         # 代码检查

# 后端
npm run start:dev    # 开发模式
npm run build        # 构建生产版本
npm run start:prod   # 生产模式运行
```

## 📝 许可证

MIT License
