# 简历动态排版预览工具

一个功能完整的简历创建和管理平台，支持拖拽排版、动画效果和多页预览。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: NestJS + GraphQL + Prisma
- **数据库**: SQLite
- **动画**: Framer Motion
- **拖拽**: dnd-kit

## 功能特性

### 前端功能
- ✅ 简历模块拖拽排序
- ✅ 模块入场渐变动画
- ✅ Hover时抬升微动效果
- ✅ 多页简历翻页预览
- ✅ 实时内容编辑
- ✅ 多种简历模块支持（个人信息、简介、工作经历、教育背景、技能等）

### 后端功能
- ✅ GraphQL API 接口
- ✅ 用户简历内容存储
- ✅ 排版模板保存
- ✅ 简历导出功能
- ✅ 个人简历档案管理
- ✅ Prisma ORM + SQLite

## 快速开始

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 启动开发服务

```bash
# 同时启动前后端（端口3000和4000）
npm run dev

# 或者分别启动
npm run dev:backend  # 后端: http://localhost:4000
npm run dev:frontend # 前端: http://localhost:3000
```

### 数据库初始化

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## 项目结构

```
.
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   └── main.tsx
│   └── package.json
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── resume/         # 简历模块
│   │   ├── template/       # 模板模块
│   │   ├── user/           # 用户模块
│   │   └── prisma/         # 数据库模块
│   ├── prisma/             # Prisma配置
│   └── package.json
├── package.json             # 根配置
└── README.md
```

## GraphQL Playground

启动后端后访问: http://localhost:4000/graphql

### 示例查询

```graphql
# 获取用户简历
query GetUserResumes($userId: String!) {
  resumes(userId: $userId) {
    id
    title
    content
    layout
  }
}

# 创建简历
mutation CreateResume($input: CreateResumeInput!) {
  createResume(input: $input) {
    id
    title
  }
}
```

## 端口说明

- **前端**: 3000
- **后端**: 4000
- **GraphQL Playground**: 4000/graphql

## 开发说明

### 添加新的简历模块

1. 在 `frontend/src/pages/Editor.tsx` 中添加模块类型
2. 在 `SectionEditor.tsx` 中添加编辑字段
3. 在 `SortableSection.tsx` 中添加预览渲染

### 添加后端API

1. 在对应模块的 `resolver.ts` 中添加GraphQL字段
2. 在 `service.ts` 中实现业务逻辑
3. 在 `model.ts` 中定义类型

## License

MIT
