# 用药提醒应用

一个具有 3D 翻转卡片动画的用药提醒应用，采用 Vue2 + TypeScript + NestJS + SQLite 技术栈。

## 功能特性

- 🎴 **3D 卡片翻转动画** - 点击卡片翻转查看详细信息
- 💫 **呼吸脉冲发光效果** - 提醒时间卡片闪烁发光
- ✨ **粒子飘散动画** - 提醒时卡片边缘粒子效果
- ✅ **SVG 打勾动画** - 服药完成的确认动画
- 📉 **缩小淡出效果** - 完成服药后卡片动画
- ⏰ **定时任务提醒** - 后端每分钟检查用药时间
- 💾 **服药状态记录** - SQLite 数据库持久化存储

## 技术栈

### 前端
- Vue 2.7 + TypeScript
- Vue Class Component + Vue Property Decorator
- SCSS
- Axios

### 后端
- NestJS
- TypeORM + SQLite
- Schedule (定时任务)

## 端口配置

- 前端: **9876**
- 后端: **8765**

## 安装与运行

### 1. 安装所有依赖

```bash
npm run install:all
```

### 2. 并发启动前后端

```bash
npm run dev
```

### 3. 分别启动

只启动后端:
```bash
npm run dev:backend
```

只启动前端:
```bash
npm run dev:frontend
```

## API 接口

### 药品管理
- `GET /api/medicines` - 获取所有药品
- `GET /api/medicines/:id` - 获取单个药品
- `POST /api/medicines` - 创建药品
- `PUT /api/medicines/:id` - 更新药品
- `DELETE /api/medicines/:id` - 删除药品

### 服药记录
- `GET /api/medicines/records/today` - 获取今日记录
- `POST /api/medicines/records` - 创建服药记录
- `PUT /api/medicines/records/:id/take` - 标记为已服药

## 项目结构

```
.
├── backend/
│   ├── src/
│   │   ├── entities/       # 数据库实体
│   │   ├── medicine/       # 药品模块
│   │   ├── reminder/       # 定时提醒模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── styles/         # 全局样式
│   │   ├── types/          # TypeScript 类型
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── package.json             # 根目录（并发启动）
└── README.md
```

## 动画效果说明

### 3D 翻转
- 使用 CSS `perspective: 1000px` 创建透视感
- `transform-style: preserve-3d` 保持 3D 空间
- 0.8s 贝塞尔曲线平滑翻转

### 呼吸脉冲
- 2s 循环 box-shadow 动画
- 金色光晕扩散效果
- 仅在提醒时间触发

### 粒子动画
- 12 个粒子围绕卡片圆周分布
- 不同延迟的上浮飘散效果
- 透明度过渡营造消失感

### 打勾动画
- SVG `stroke-dasharray` 路径绘制
- 0.6s 正向动画
- stroke-linecap 圆角端点
