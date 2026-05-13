# 3D 课程选择器

基于 Astro + Egg.js 构建的 3D 课程选择界面，使用 Three.js 实现立方体交互效果。

## 功能特性

- 🎲 **3D 立方体交互**：课程以立方体面展示，支持左右滑动旋转
- ⚡ **惯性滑动**：带有自然的惯性滑动效果和弹性边界回弹
- 👆 **悬停凸起**：鼠标悬停时面向外凸起产生 3D 厚度感
- 💥 **分解动画**：点击课程时，立方体各面片向四周散开
- 🏷️ **标签云筛选**：点击分类标签筛选对应课程
- 📱 **响应式设计**：支持触摸设备

## 技术栈

- **前端**：Astro + Three.js
- **后端**：Egg.js + Sequelize + SQLite
- **并发启动**：concurrently

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 安装前端依赖
cd client && npm install && cd ..
```

### 启动项目

```bash
# 同时启动前后端服务
npm run dev
```

- 前端服务：http://localhost:3000
- 后端服务：http://localhost:7001

## API 接口

- `GET /api/courses` - 获取课程列表
- `GET /api/courses?categoryId=1` - 按分类筛选课程
- `GET /api/courses/:id` - 获取单个课程详情
- `GET /api/categories` - 获取分类列表

## 项目结构

```
.
├── client/                 # Astro 前端
│   ├── src/
│   │   ├── pages/         # 页面
│   │   ├── styles/        # 样式
│   │   └── js/            # 脚本
│   └── package.json
├── server/                 # Egg.js 后端
│   ├── app/
│   │   ├── controller/    # 控制器
│   │   ├── model/         # 模型
│   │   └── router.js      # 路由
│   ├── config/            # 配置
│   └── package.json
├── package.json
└── README.md
```

## 使用说明

1. **浏览课程**：在立方区域左右拖动鼠标旋转查看不同课程
2. **查看详情**：点击课程面进入课程详情页
3. **筛选课程**：点击顶部分类标签筛选对应类别的课程
4. **关闭详情**：点击关闭按钮或点击背景关闭详情页
