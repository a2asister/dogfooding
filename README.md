# 💰 理财计算器 - Astro + NestJS 全栈项目

一个功能丰富的理财计算器，带有精美的动画效果。

## ✨ 特性

- 🎯 **数字滚动动画** - 输入金额时数字执行滚动计数动画，带有加速和减速的缓动效果
- 📈 **动态收益图表** - 使用 Chart.js 绘制收益增长曲线，从左向右平滑绘制
- 🪙 **金币堆叠动画** - 收益金额显示为金币堆叠效果，金额越大金币堆越高
- 🔄 **多方案对比** - 不同理财方案并排显示，切换时图表执行形变过渡动画
- 🎚️ **滑块调节** - 投资金额和期限使用滑块调节，实时更新计算结果
- 🔢 **平滑过渡** - 数值变化带有平滑过渡动画

## 🏗️ 技术栈

- **前端**: Astro 4.x + React 18 + Chart.js
- **后端**: NestJS 10.x
- **并发启动**: concurrently
- **端口**: 前端 4396，后端 7856

## 📁 项目结构

```
dogfooding2/
├── frontend/                 # Astro 前端项目
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── FinanceCalculator.tsx  # 主计算器组件
│   │   │   ├── AnimatedNumber.tsx     # 数字滚动动画
│   │   │   └── CoinStack.tsx          # 金币堆叠动画
│   │   ├── layouts/          # Astro 布局
│   │   └── pages/            # 页面
│   └── package.json
├── backend/                  # NestJS 后端项目
│   ├── src/
│   │   ├── finance/          # 理财计算模块
│   │   └── main.ts
│   └── package.json
├── package.json              # 根目录配置（并发启动）
└── .gitignore
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（根目录 + 前端 + 后端）
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 前端
cd frontend && npm install

# 后端
cd backend && npm install
```

### 2. 运行项目

```bash
# 并发启动前端和后端
npm run dev
```

启动后访问:
- 前端: http://localhost:4396
- 后端 API: http://localhost:7856

## 📊 API 接口

### 计算理财收益

```bash
POST /api/finance/calculate
Content-Type: application/json

{
  "principal": 100000,      # 本金
  "rate": 5.0,              # 年利率
  "years": 10,              # 投资年限
  "planType": "balanced"    # 方案类型: conservative/balanced/aggressive
}
```

响应:

```json
{
  "finalAmount": 162889.46,
  "totalInterest": 62889.46,
  "yearlyData": [
    { "year": 1, "amount": 105000, "interest": 5000 },
    ...
  ],
  "planType": "balanced"
}
```

### 获取方案列表

```bash
GET /api/finance/plans
```

## 🎨 动画效果说明

### 数字滚动动画 (AnimatedNumber)
- 使用 `requestAnimationFrame` 实现 60fps 流畅动画
- 采用 `easeInOutQuart` 缓动函数，先加速后减速
- 支持自定义前缀、后缀和小数位数
- 自动格式化中文数字显示

### 收益曲线图表
- 使用 Chart.js 绘制折线图
- 曲线带有平滑张力效果 (tension: 0.4)
- 多方案支持不同颜色区分
- 数值变化时执行 1.5秒的形变过渡动画

### 金币堆叠动画 (CoinStack)
- 根据收益金额比例动态计算金币数量
- 金币依次落下，带有弹性动画效果
- 使用 CSS 3D 变换和阴影营造立体感
- 每个金币依次延迟，形成堆叠效果

## 🔧 开发命令

```bash
# 仅启动前端
npm run dev:frontend

# 仅启动后端
npm run dev:backend

# 构建前端
cd frontend && npm run build

# 构建后端
cd backend && npm run build
```

## 📝 理财方案

| 方案 | 年利率 | 颜色 |
|------|--------|------|
| 保守型 | 2.5% | 绿色 |
| 平衡型 | 5.0% | 橙色 |
| 进取型 | 8.5% | 红色 |

## 🎯 使用说明

1. **调节投资本金**: 拖动第一个滑块，范围 1万 - 100万
2. **调节投资期限**: 拖动第二个滑块，范围 1年 - 30年
3. **选择理财方案**: 点击方案按钮切换不同收益率
4. **多方案对比**: 可以同时选择多个方案进行对比
5. **实时计算**: 所有参数变化时自动重新计算并更新动画

---

享受你的理财规划之旅！🎉
