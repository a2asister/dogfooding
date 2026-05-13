# 🎨 动态配色方案生成工具

一个现代化的配色方案生成和管理平台，基于 Angular + NestJS + SQLite 技术栈构建。

## ✨ 功能特性

### 🎭 前端动画效果
- **色彩流体融合** - 渐变背景流动动画
- **色卡悬浮微动** - 卡片悬停缩放与阴影变化
- **配色切换渐变** - 平滑过渡动画
- **色彩光影变化** - 光斑与光晕动态效果
- **色卡排布弹性动画** - 列表进入/离开交错动画

### 📦 后端功能
- **配色方案存储** - 创建、读取、更新、删除配色方案
- **用户收藏** - 收藏/取消收藏配色方案
- **自定义归档** - 归档管理配色方案
- **配色模板** - 模板分类管理

## 🛠 技术栈

### 前端
- Angular 18+
- TypeScript (强校验)
- Apollo Angular (GraphQL客户端)
- SCSS
- Angular Animations

### 后端
- NestJS 10+
- @nestjs/apollo (GraphQL服务端)
- TypeORM + SQLite
- class-validator (数据验证)

### 开发工具
- concurrently (并发启动)
- 非常用端口配置 (后端: 4000, 前端: 4201)

## 🚀 快速开始

### 1. 安装依赖
```bash
npm run install:all
```

### 2. 启动开发环境
```bash
npm run dev
```

### 3. 分别启动
```bash
# 仅启动后端
npm run backend

# 仅启动前端
npm run frontend
```

## 📍 访问地址
- 前端应用: http://localhost:4201
- GraphQL Playground: http://localhost:4000/graphql

## 📁 项目结构
```
.
├── frontend/                 # Angular前端
│   ├── src/app/
│   │   ├── components/       # 组件
│   │   ├── services/         # 服务
│   │   └── models/           # 类型定义
│   └── package.json
├── backend/                  # NestJS后端
│   ├── src/
│   │   ├── color-schemes/   # 配色方案模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
└── package.json              # 根配置（并发启动）
```

## 🎮 使用说明

1. **创建配色方案**
   - 在左侧表单输入方案名称和描述
   - 使用颜色选择器添加颜色（至少2个）
   - 点击「✨ 创建配色方案」保存

2. **管理配色方案**
   - 点击❤️收藏配色方案
   - 点击📁归档配色方案
   - 点击🗑️删除配色方案
   - 点击色卡中的颜色圆点复制颜色值

3. **筛选浏览**
   - 全部 - 查看所有未归档的配色方案
   - 收藏 - 只查看已收藏的配色方案
   - 归档 - 查看已归档的配色方案
   - 模板 - 查看标记为模板的配色方案

## 🔧 GraphQL API

### 查询
```graphql
# 获取所有配色方案
query { colorSchemes { id name colors isFavorite } }

# 获取收藏的配色方案
query { favoriteColorSchemes { id name colors } }

# 获取归档的配色方案
query { archivedColorSchemes { id name colors } }

# 获取配色模板
query { colorSchemeTemplates { id name colors } }
```

### 变更
```graphql
# 创建配色方案
mutation {
  createColorScheme(createColorSchemeInput: {
    name: "My Scheme"
    colors: ["#FF0000", "#00FF00"]
  }) { id name }
}

# 切换收藏状态
mutation { toggleFavorite(id: "uuid") { id isFavorite } }

# 切换归档状态
mutation { toggleArchive(id: "uuid") { id isArchived } }
```

## 📝 开发说明

- 前端 TypeScript 启用严格模式（strict: true）
- 后端端口固定为 4000
- 前端端口固定为 4201
- 数据库自动创建（SQLite: color-schemes.db）
- 支持热重载开发

## 🎨 动画效果预览

1. **流体渐变** - 标题背景使用 fluidGradient 关键帧动画
2. **色卡悬浮** - 使用 Angular Animations 的 state 状态管理
3. **颜色点闪烁** - shimmer 动画实现呼吸效果
4. **列表交错** - staggerAnimation 函数实现弹性排布
5. **收藏心跳** - pulse 动画模拟心跳效果

## 📄 许可证

MIT
