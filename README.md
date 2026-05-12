# 审批流程系统

基于 React + TypeScript + NestJS + SQLite + GraphQL 的可视化审批流程系统，支持 SVG 动画效果和 3D 卡片展示。

## 技术栈

**前端:**
- React 18
- TypeScript (强校验)
- Vite
- Apollo Client
- SVG 动画

**后端:**
- NestJS
- GraphQL (Apollo Server)
- TypeORM
- SQLite

## 项目结构

```
dogfooding2/
├── backend/                 # 后端 NestJS 项目
│   ├── src/
│   │   ├── approval/       # 审批模块
│   │   │   ├── dto/        # 数据传输对象
│   │   │   ├── entities/   # 数据库实体
│   │   │   ├── approval.service.ts
│   │   │   ├── approval.resolver.ts
│   │   │   └── approval.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 前端 React 项目
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── graphql/        # GraphQL 查询
│   │   ├── types.ts        # 类型定义
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json             # 根目录配置 (concurrently)
└── .gitignore
```

## 端口配置

- **后端:** http://localhost:3456/graphql
- **前端:** http://localhost:4567

## 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install

# 或者一键安装所有
cd .. && npm run install:all
```

## 启动项目

```bash
# 同时启动前后端 (推荐)
npm run dev

# 或者分别启动
npm run dev:backend  # 启动后端
npm run dev:frontend # 启动前端
```

## 功能特性

### 1. 横向流程图展示
- 节点使用圆形图标表示
- 节点间连线采用 SVG 路径动画
- 连线逐步绘制，模拟流程推进过程

### 2. 节点状态动画
- **当前节点:** 脉冲发光动画 + 轻微缩放呼吸效果
- **已完成节点:** 显示对勾并呈现勾选动画
- **审批通过:** 节点变为绿色并触发涟漪扩散动画
- **审批驳回:** 节点抖动并显示红色警告图标

### 3. 3D 卡片交互
- 悬停节点弹出详细审批信息卡片
- 卡片以 3D 翻转方式展示正反面内容
- 正面显示节点名称、角色、状态
- 背面显示审批人、审批意见、审批时间

### 4. 后端功能
- 审批流程定义和实例数据管理
- GraphQL API 接口
- 简单的权限校验逻辑（角色层级）
- SQLite 数据库持久化存储

### 5. 审批操作
- 支持通过/驳回操作
- 可输入审批意见
- 实时更新流程状态

## 使用说明

1. 启动项目后，访问前端页面 http://localhost:4567
2. 点击"创建示例审批流程"按钮创建一个采购审批流程
3. 流程包含 5 个节点:
   - 提交申请
   - 部门主管审批
   - 财务审核
   - 总经理审批
   - 完成
4. 悬停在节点上查看详细信息（3D卡片翻转效果）
5. 在输入框中填写审批意见，点击"通过"或"驳回"进行审批
6. 观察节点状态变化和动画效果

## GraphQL Playground

后端启动后，可以在浏览器中访问 http://localhost:3456/graphql 查看 GraphQL Playground，测试 API。

### 常用查询/变更

```graphql
# 创建示例流程
mutation {
  createSampleApprovalProcess {
    id
    name
    nodes {
      id
      name
      status
    }
  }
}

# 查询所有流程
query {
  approvalProcesses {
    id
    name
    description
  }
}

# 更新审批状态
mutation {
  updateApproval(
    input: {
      nodeId: 1,
      action: "approve",
      approver: "测试用户",
      comment: "同意"
    }
  ) {
    id
    status
  }
}
```

## 开发说明

- 前端 TypeScript 已开启严格模式（strict: true）
- 后端使用 TypeORM 自动同步数据库结构
- GraphQL schema 自动生成
- 前后端并发启动，支持热重载
