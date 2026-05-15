# 在线数据推演与曲线可视化平台

一个基于 React + NestJS + TypeScript + SQLite 的完整数据可视化平台，支持自定义公式、数据导入、实时推演和高级动画效果。

## ✨ 功能特性

### 后端 (NestJS)
- ✅ 自定义数学公式解析（支持 sin, cos, tan, exp, log, sqrt, pow 等）
- ✅ 批量数据点导入和处理
- ✅ 智能拐点检测与标记
- ✅ 峰值/谷值自动识别
- ✅ 异常数据（离群点）筛选
- ✅ 趋势线拟合与分析
- ✅ Excel 和 PDF 报表导出
- ✅ SQLite 数据库持久化
- ✅ RESTful API 接口

### 前端 (React + GSAP)
- ✅ 公式化数据系列创建
- ✅ 手动数据点录入
- ✅ GSAP 驱动的实时曲线绘制动画
- ✅ 拐点高亮与脉冲动画
- ✅ 峰值弹跳动画效果
- ✅ 多曲线同步递进渲染
- ✅ 渐变色趋势填充
- ✅ 历史数据对比可视化
- ✅ 图表数据统计面板
- ✅ 响应式布局设计
- ✅ Tailwind CSS 样式系统

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS 3 |
| 动画引擎 | GSAP 3 |
| 图表渲染 | D3.js 7 |
| 后端框架 | NestJS 10 |
| 数据库 | SQLite + TypeORM |
| 公式引擎 | Math.js |
| 并发启动 | Concurrently |

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
# 安装所有依赖（根目录 + 前端 + 后端）
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 启动开发环境

```bash
# 同时启动前后端（推荐）
npm run dev

# 或分别启动
npm run dev:backend   # 后端 http://localhost:3002
npm run dev:frontend  # 前端 http://localhost:3001
```

### 生产构建

```bash
# 构建前后端
npm run build

# 启动生产环境
npm run start:prod
```

## 📁 项目结构

```
dogfooding3/
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── entities/        # 数据库实体
│   │   │   ├── data-series.entity.ts
│   │   │   └── data-point.entity.ts
│   │   ├── services/        # 业务服务
│   │   │   ├── formula-parser.service.ts
│   │   │   ├── data-analysis.service.ts
│   │   │   ├── data-series.service.ts
│   │   │   └── report.service.ts
│   │   ├── controllers/     # API 控制器
│   │   │   └── data-series.controller.ts
│   │   ├── app.module.ts    # 应用模块
│   │   └── main.ts          # 入口文件
│   ├── data/                # SQLite 数据库文件
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── AnimatedChart.tsx
│   │   │   └── CreateSeriesForm.tsx
│   │   ├── services/        # API 服务
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── styles/          # 全局样式
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json             # 根目录配置（concurrently）
├── .gitignore
└── README.md
```

## 🎯 使用说明

### 创建数据系列

1. 点击 "New Series" 按钮
2. 选择创建方式：
   - **Use Formula（公式模式）**：
     - 输入数学公式如 `sin(x) + 0.5 * cos(2 * x)`
     - 设置 X 轴范围（起始、结束、步长）
     - 点击创建
   
   - **Manual Points（手动模式）**：
     - 每行输入一个数据点 `x,y` 格式
     - 例如：
       ```
       0,1
       1,2
       2,1
       3,3
       4,2
       ```

### 可视化控制

- **选择系列**：在左侧列表点击数据系列进行切换（可多选进行对比）
- **显示选项**：
  - Inflection Points：显示拐点（黄色标记 + 脉冲动画）
  - Peak/Valley Points：显示峰值/谷值（红色标记 + 弹跳动画）
  - Outliers：显示离群点（虚线圆圈）

### 导出报表

点击数据系列卡片下方的：
- **Excel**：导出为 Excel 表格
- **PDF**：导出为 PDF 报告

## 🔌 API 接口

### 数据系列

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/series` | 获取所有数据系列 |
| GET | `/api/series/:id` | 获取单个系列详情 |
| GET | `/api/series/:id/trend` | 获取趋势分析 |
| POST | `/api/series` | 创建新数据系列 |
| PUT | `/api/series/:id/recalculate` | 重新计算 |
| POST | `/api/series/compare` | 多系列对比分析 |
| DELETE | `/api/series/:id` | 删除数据系列 |
| GET | `/api/series/:id/export/excel` | 导出 Excel |
| GET | `/api/series/:id/export/pdf` | 导出 PDF |

### 请求示例

```javascript
// 创建公式驱动的数据系列
POST /api/series
{
  "name": "Sine Wave",
  "description": "A beautiful sine wave",
  "formula": "sin(x) + 0.5 * cos(2 * x)",
  "start": -10,
  "end": 10,
  "step": 0.1
}

// 创建手动数据点系列
POST /api/series
{
  "name": "Manual Data",
  "points": [
    { "x": 0, "y": 1 },
    { "x": 1, "y": 2 },
    { "x": 2, "y": 1 }
  ]
}
```

## 🎨 GSAP 动画特性

### 曲线绘制动画
- 路径描边动画（stroke-dashoffset）
- 渐进式渲染效果
- 多曲线同步动画

### 数据点动画
- **拐点**：弹性缩放动画（elastic ease）
- **峰值**：弹跳动画（bounce ease）
- **常规点**：交错出现动画（stagger）

### 视觉效果
- 渐变色填充区域
- 半透明网格背景
- 悬停交互反馈
- 图例自动生成

## 📊 数据分析能力

### 自动检测
1. **拐点检测**：基于二阶导数变化识别方向改变点
2. **峰值检测**：识别局部最大值和最小值
3. **离群点检测**：基于 IQR（四分位距）方法识别异常值

### 趋势分析
- 线性回归拟合
- 斜率、截距计算
- R² 决定系数

## 🔧 开发说明

### 端口配置
- 前端：`3001` （Vite dev server）
- 后端：`3002` （NestJS）

### ESLint 检查
```bash
cd backend
npm run lint

cd ../frontend
npm run lint
```

### TypeScript 类型检查
```bash
# 后端
cd backend
npx tsc --noEmit

# 前端
cd ../frontend
npx tsc --noEmit
```

## 📝 注意事项

1. 数据库文件位于 `backend/data/db.sqlite`，首次启动自动创建
2. 公式语法需符合 Math.js 规范
3. 建议步长不小于 0.1，点数过多可能影响渲染性能
4. 多系列对比时，建议选择 X 轴范围相近的数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
