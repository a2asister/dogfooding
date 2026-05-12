# 预算管理系统

基于 Vue2 + NestJS 实现的创意预算管理应用，核心特色是水槽造型的进度条动画。

## ✨ 功能特性

- **水槽进度条动画**：内部填充像液体一样波动，使用 CSS 动画模拟水面起伏效果
- **智能颜色变化**：
  - 50% 以下：绿色水波
  - 50% - 80%：黄色水波
  - 超过 80%：红色水波 + 警示脉冲动画
  - 达到 100%：水槽溢出，水滴粒子滴落效果
- **消费明细列表**：点击进度条显示，卡片从底部滑入，错落入场延迟
- **完整的数据管理**：
  - SQLite 数据库存储
  - 预算设置编辑
  - 添加消费记录
  - 实时计算预算使用比例

## 🚀 快速开始

### 安装依赖

```bash
npm run install:all
```

### 并发启动项目

```bash
npm run dev
```

### 分别启动

```bash
# 启动后端 (端口: 3876)
npm run dev:backend

# 启动前端 (端口: 4567)
npm run dev:frontend
```

## 📁 项目结构

```
.
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── budget/         # 预算模块
│   │   ├── expense/        # 消费记录模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Vue2 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── WaterTankProgress.vue  # 水槽进度条组件
│   │   │   └── ExpenseList.vue        # 消费明细列表
│   │   ├── styles/
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vue.config.js
├── package.json
└── README.md
```

## 🔌 API 接口

### 预算管理
- `GET /api/budgets` - 获取预算列表
- `POST /api/budgets` - 创建预算
- `PUT /api/budgets/:id` - 更新预算
- `DELETE /api/budgets/:id` - 删除预算

### 消费记录
- `GET /api/expenses` - 获取消费记录列表
- `GET /api/expenses/total` - 获取消费总额
- `POST /api/expenses` - 添加消费记录
- `DELETE /api/expenses/:id` - 删除消费记录

## 🎨 技术栈

**后端**
- NestJS 10
- TypeORM
- SQLite3

**前端**
- Vue 2.7
- Axios
- CSS3 动画

**工具**
- Concurrently (并发启动)

## 🌐 访问地址

- 前端应用：http://localhost:4567
- 后端 API：http://localhost:3876