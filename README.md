# ✨ 代码展示工具

一个带有炫酷动画效果的代码展示工具，使用 SolidJS + NestJS + SQLite 构建。

## 🚀 功能特性

- **逐字符打字机效果**: 代码逐个字符显示，伴随发光闪烁动画
- **语法高亮**: 关键字、字符串、注释等各有独特颜色和过渡动画
- **行号视差效果**: 行号区域与代码区域形成微妙的深度差异
- **流光边框**: 选中代码行时触发左侧边框的流光动画
- **涟漪扩散**: 复制按钮悬停时产生涟漪扩散效果
- **3D 翻转切换**: 代码块支持 3D 翻转切换不同编程语言版本
- **静态代码库**: 后端提供预设代码片段，支持关键词搜索

## 🛠️ 技术栈

- **前端**: SolidJS + TypeScript + Vite
- **后端**: NestJS + TypeScript
- **数据库**: SQLite + TypeORM
- **并发启动**: concurrently

## 📦 安装

```bash
# 安装根目录依赖（concurrently）
npm install

# 安装所有依赖（前端 + 后端）
npm run install:all
```

或者分别安装：

```bash
# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

## 🏃 运行

### 并发启动（推荐）

```bash
# 同时启动前端和后端
npm run dev
```

### 分别启动

```bash
# 启动后端 (端口 5876)
npm run dev:backend

# 启动前端 (端口 9823)
npm run dev:frontend
```

## 📍 访问地址

- **前端应用**: http://localhost:9823
- **后端 API**: http://localhost:5876

## 🔌 API 接口

### 获取所有代码片段
```
GET /api/code-snippets
```

### 搜索代码片段
```
GET /api/code-snippets/search?q={keyword}
```

### 获取单个代码片段
```
GET /api/code-snippets/{id}
```

### 创建代码片段
```
POST /api/code-snippets
Content-Type: application/json

{
  "title": "标题",
  "code": "代码内容",
  "language": "javascript",
  "description": "描述",
  "tags": ["tag1", "tag2"]
}
```

## 📁 项目结构

```
.
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── entity/         # 数据库实体
│   │   ├── code-snippet.controller.ts
│   │   ├── code-snippet.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # SolidJS 前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── TypewriterCode.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   └── CodeFlipCard.tsx
│   │   ├── utils/
│   │   │   └── tokenizer.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── package.json
├── .gitignore
└── README.md
```

## 🎨 动画效果说明

### 打字机效果
- 每个字符延迟 30ms 显示
- 当前显示字符触发发光动画
- 使用 CSS `@keyframes glow` 实现发光效果

### 语法高亮
- 关键字: 紫色 (#c678dd)
- 字符串: 绿色 (#98c379)
- 注释: 灰色 (#5c6370)
- 函数名: 蓝色 (#61afef)
- 数字: 橙色 (#d19a66)

### 3D 翻转
- 使用 CSS `perspective` 和 `transform: rotateY()`
- 翻转持续时间 800ms，使用 cubic-bezier 缓动函数
- 翻转过程中代码格式保持完整

### 行号视差
- 使用 `Math.sin()` 函数生成微妙的垂直位移
- 每行根据索引有不同的偏移量，形成深度感

## 📝 预设代码片段

数据库初始化时会自动创建以下代码片段：
1. Hello World (JavaScript)
2. React Component (JSX)
3. TypeScript Interface (TypeScript)
4. Python Loop (Python)
5. CSS Flexbox (CSS)
6. SQL Query (SQL)

## 🔧 配置说明

### 端口配置
- 后端端口: `5876` (在 `backend/src/main.ts` 修改)
- 前端端口: `9823` (在 `frontend/vite.config.ts` 修改)

### 打字机速度
- 在 `TypewriterCode.tsx` 组件中通过 `speed` prop 配置
- 默认值: 30ms

## 📄 License

MIT
