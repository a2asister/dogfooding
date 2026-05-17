# 可视化大屏拖拽搭建系统

一个功能完整的可视化大屏拖拽搭建系统，支持多种图表组件、实时预览、导出等功能。

## 技术栈

**前端：**
- SolidJS - 响应式UI框架
- TypeScript - 类型安全
- Vite - 构建工具
- ECharts - 图表库
- TailwindCSS - 样式框架

**后端：**
- Express - Web框架
- TypeScript - 类型安全
- SQLite - 数据库
- JWT - 认证
- bcryptjs - 密码加密
- helmet - 安全防护

## 项目结构

```
dogfooding/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── db/             # 数据库
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # API路由
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── .env                # 环境变量
│   ├── .eslintrc.js        # ESLint配置
│   ├── tsconfig.json       # TypeScript配置
│   └── package.json        # 依赖配置
│
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── .eslintrc.js        # ESLint配置
│   ├── tsconfig.json       # TypeScript配置
│   ├── vite.config.ts      # Vite配置
│   └── package.json        # 依赖配置
│
├── package.json             # 根目录配置（并发启动）
└── README.md                # 项目说明
```

## 功能特性

### 🔐 用户认证系统
- 用户注册/登录
- JWT Token认证
- 密码强度校验（大小写字母、数字、特殊字符）
- bcrypt密码加密存储

### 📊 可视化编辑器
- **画布操作**：可缩放、网格对齐、网格显示切换
- **组件拖拽**：选中组件后可拖拽移动
- **尺寸调整**：拖拽右下角调整组件大小
- **撤销/重做**：Ctrl+Z 撤销，Ctrl+Shift+Z 重做
- **删除组件**：Delete键删除选中组件
- **复制组件**：一键复制选中组件

### 🎨 20+图表组件
**图表组件：**
- 折线图 (Line Chart)
- 柱状图 (Bar Chart)
- 饼图 (Pie Chart)
- 雷达图 (Radar Chart)
- 面积图 (Area Chart)
- 散点图 (Scatter Chart)
- 漏斗图 (Funnel Chart)
- 仪表盘 (Gauge Chart)

**基础组件：**
- 文本组件
- 标题组件
- 图片组件
- 矩形组件
- 边框组件
- 表格组件
- 进度条组件
- 数字翻牌组件

### ⚙️ 属性配置
- **配置面板**：组件名称、位置、尺寸、图表特有配置
- **数据面板**：支持模拟数据、静态JSON、API接口三种数据源
- **样式面板**：背景色、圆角、透明度、颜色预设
- **动画面板**：启用/禁用动画、动画时长、缓动函数
- **交互面板**：提示框、图例、悬浮等交互配置

### 📤 导出功能
- 导出PNG图片
- 导出JPG图片
- 导出HTML静态文件
- 实时预览大屏效果

## 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 5678 | http://localhost:5678 |
| 后端 | 8765 | http://localhost:8765 |

## 安装与运行

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置环境变量

后端 `.env` 已预置配置：

```env
PORT=8765
JWT_SECRET=visual-dashboard-builder-secret-key-2024
NODE_ENV=development
CORS_ORIGIN=http://localhost:5678
```

### 3. 并发启动（推荐）

```bash
# 在根目录执行，同时启动前端和后端
npm run dev
```

### 4. 单独启动

```bash
# 启动后端
cd backend
npm run dev

# 启动前端
cd frontend
npm run dev
```

## 使用指南

### 1. 注册账号
- 访问 http://localhost:5678
- 点击"立即注册"
- 输入用户名、邮箱、密码（密码需包含大小写字母、数字、特殊字符，至少8位）
- 完成注册自动登录

### 2. 创建大屏
- 登录后进入大屏列表页
- 点击"创建新大屏"
- 输入大屏名称和描述
- 点击创建进入编辑器

### 3. 添加组件
- 在左侧组件面板选择需要的组件
- 点击组件即可添加到画布
- 拖拽组件到目标位置
- 拖拽右下角调整大小

### 4. 配置属性
- 选中画布中的组件
- 在右侧属性面板进行配置
- 可修改样式、数据、动画等

### 5. 预览和导出
- 点击工具栏"预览"按钮查看大屏效果
- 点击"导出"按钮选择导出格式
- 随时点击"保存"保存大屏配置

## API接口

### 认证接口
```
POST /api/auth/register    # 注册
POST /api/auth/login       # 登录
GET  /api/auth/me          # 获取当前用户信息
```

### 大屏接口
```
GET    /api/dashboards     # 获取大屏列表
POST   /api/dashboards     # 创建大屏
GET    /api/dashboards/:id # 获取大屏详情
PUT    /api/dashboards/:id # 更新大屏
DELETE /api/dashboards/:id # 删除大屏
```

## 开发说明

### TypeScript强校验
- 前后端均启用严格的TypeScript类型检查
- `strict: true` 确保类型安全
- 所有API接口均有类型定义

### ESLint代码规范
- 前后端均配置了ESLint
- 遵循TypeScript最佳实践
- 运行 `npm run lint` 进行代码检查

### 快捷键
- `Ctrl + S` - 保存大屏
- `Ctrl + Z` - 撤销
- `Ctrl + Shift + Z` - 重做
- `Delete` - 删除选中组件

## 数据目录

SQLite数据库文件默认位置：
```
backend/data/dashboard.db
```

首次启动时会自动创建数据库和表结构。

## 安全特性

- ✅ 密码bcrypt加密存储
- ✅ JWT Token认证
- ✅ 密码强度校验
- ✅ Helmet安全头
- ✅ CORS配置
- ✅ 输入验证（Zod）
- ✅ 用户数据隔离（仅可访问自己的大屏）

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT
