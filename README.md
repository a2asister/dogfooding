# 账单管理应用

基于 Astro + NestJs 构建的个人账单管理应用，拥有丰富的动态交互动画效果。

## 技术栈

### 前端
- **Astro** - 静态站点生成
- **React** - UI 组件
- **TypeScript** - 类型安全

### 后端
- **NestJS** - 后端框架
- **TypeORM** - ORM
- **SQLite** - 数据库

## 功能特性

### 🎨 动画效果
- **时间线布局** - 账单按时间顺序展示在时间轴上
- **脉冲发光动画** - 新添加的账单节点带有脉冲发光效果
- **滑入弹性动画** - 新卡片从右侧滑入，带有弹性回弹效果
- **碎纸片飘落** - 删除时卡片折叠消失并产生碎纸片动画
- **迷你饼图动画** - 分类占比饼图展开时的动画效果

### 💰 账单管理
- **收入/支出分类** - 不同图标和颜色区分（绿色向上箭头/橙色向下箭头）
- **左滑删除** - 鼠标或触摸左滑显示删除按钮
- **按月份筛选** - 查看不同月份的账单
- **月度汇总** - 固定在顶部的汇总卡片，展开显示分类占比

### 📱 响应式设计
- 支持鼠标和触摸操作
- 移动端友好

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖（用于 concurrently）
npm install

# 安装前后端依赖
cd backend && npm install
cd ../frontend && npm install
```

或者使用项目提供的脚本：
```bash
npm run install:all
```

### 启动开发环境

```bash
# 同时启动前后端
npm run dev

# 或者单独启动
npm run dev:backend  # 后端在 http://localhost:3987
npm run dev:frontend # 前端在 http://localhost:4321
```

### 端口说明
- 前端: `4321`
- 后端: `3987`

## 后端 API

### 账单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/bills` | 获取所有账单，支持 `month` 和 `category` 查询参数 |
| GET | `/bills/summary` | 获取月度汇总，支持 `month` 查询参数 |
| GET | `/bills/:id` | 获取单个账单 |
| POST | `/bills` | 创建新账单 |
| PATCH | `/bills/:id` | 更新账单 |
| DELETE | `/bills/:id` | 删除账单 |

### 创建账单请求体

```json
{
  "title": "午餐",
  "amount": 25.5,
  "type": "expense",
  "category": "food",
  "date": "2024-01-15T12:30:00",
  "description": "麦当劳"
}
```

### 分类说明

#### 收入分类 (income)
- `salary` - 工资
- `bonus` - 奖金
- `other` - 其他收入

#### 支出分类 (expense)
- `food` - 餐饮
- `transport` - 交通
- `shopping` - 购物
- `entertainment` - 娱乐
- `other` - 其他支出

## 项目结构

```
.
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── bill/           # 账单模块
│   │   │   ├── dto/        # 数据传输对象
│   │   │   ├── bill.entity.ts    # 账单实体
│   │   │   ├── bill.service.ts   # 业务逻辑
│   │   │   ├── bill.controller.ts # 控制器
│   │   │   └── bill.module.ts     # 模块定义
│   │   ├── app.module.ts   # 应用主模块
│   │   └── main.ts          # 入口文件
│   └── package.json
├── frontend/               # Astro 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── BillApp.tsx        # 主应用
│   │   │   ├── BillCard.tsx       # 账单卡片
│   │   │   ├── MonthlySummary.tsx # 月度汇总
│   │   │   ├── AddBillModal.tsx   # 添加弹窗
│   │   │   └── Confetti.tsx       # 碎纸片动画
│   │   ├── layouts/        # Astro 布局
│   │   └── pages/          # Astro 页面
│   └── package.json
├── package.json            # 根目录（concurrently）
└── README.md
```

## 构建生产版本

```bash
# 构建前端
cd frontend && npm run build

# 构建后端
cd ../backend && npm run build
```

## 开发说明

- 后端使用 SQLite 数据库，会在启动时自动创建 `bills.db` 文件
- 前端使用 Astro 的客户端组件功能，通过 `client:load` 指令启用 React
- 前后端通过 CORS 配置支持跨域请求

## License

MIT
