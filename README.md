# 滚动叙事动画在线创作平台

一个基于 React + NestJS + TypeScript 的滚动叙事动画在线创作平台，支持可视化编排页面元素和设置滚动触发动画。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- GSAP + ScrollTrigger (滚动动画)
- Zustand (状态管理)
- React DnD (拖拽功能)
- Tailwind CSS (样式)
- ESLint (代码规范)

### 后端
- NestJS + TypeScript
- TypeORM + SQLite (数据持久化)
- class-validator (数据校验)

## 核心功能

### 编辑器功能
- ✅ 可视化元素拖拽编排
- ✅ 多种元素类型：文本、形状、图片、容器
- ✅ 属性面板：位置、尺寸、颜色、透明度、旋转
- ✅ 多设备预览：桌面端、平板端、移动端

### 动画功能
- ✅ GSAP + ScrollTrigger 精确滚动触发
- ✅ 预设动画类型：淡入、滑入、缩放、旋转、视差
- ✅ 滚动进度实时显示
- ✅ 动画参数可配置

### 后端功能
- ✅ 项目数据持久化（SQLite）
- ✅ 页面结构解析与存储
- ✅ 滚动比例校准
- ✅ 多设备适配参数计算
- ✅ RESTful API 接口

### 其他功能
- ✅ 自动保存与手动保存
- ✅ 草稿留存
- ✅ 并发启动前后端
- ✅ TypeScript 强类型校验
- ✅ ESLint 代码规范

## 端口配置

- 前端端口：39472（不常用端口）
- 后端端口：61537（不常用端口）

## 安装与运行

### 1. 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2. 开发模式（推荐）

```bash
# 在项目根目录执行，将同时启动前后端
npm run dev
```

### 3. 单独启动

```bash
# 仅启动前端
npm run dev:frontend

# 仅启动后端
npm run dev:backend
```

### 4. 构建生产版本

```bash
# 构建前后端
npm run build
```

## 项目结构

```
.
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── Canvas.tsx          # 画布组件
│   │   │   ├── CanvasElement.tsx   # 画布元素
│   │   │   ├── Header.tsx          # 顶部工具栏
│   │   │   ├── PropertiesPanel.tsx # 属性面板
│   │   │   └── Toolbar.tsx         # 左侧工具栏
│   │   ├── store/           # 状态管理
│   │   │   └── useEditorStore.ts
│   │   ├── services/        # API 服务
│   │   │   └── api.ts
│   │   ├── types/           # 类型定义
│   │   │   └── index.ts
│   │   ├── utils/           # 工具函数
│   │   │   └── cn.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── project/        # 项目模块
│   │   │   ├── project.entity.ts
│   │   │   ├── project.service.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── project.module.ts
│   │   │   └── dto/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json             # 根目录配置（并发启动）
└── README.md
```

## API 接口

### 项目管理
- `POST /projects` - 创建新项目
- `GET /projects` - 获取所有项目
- `GET /projects/:id` - 获取单个项目
- `PATCH /projects/:id` - 更新项目
- `DELETE /projects/:id` - 删除项目

### 辅助功能
- `POST /projects/:id/calculate-responsive` - 计算响应式参数
- `POST /projects/:id/calibrate-scroll` - 校准滚动参数

## 使用说明

1. **添加元素**：点击左侧工具栏中的元素类型添加到画布
2. **编辑元素**：选中元素后在右侧属性面板修改位置、尺寸、颜色等
3. **添加动画**：选中元素后在属性面板底部点击动画类型添加滚动动画
4. **预览效果**：滚动画布查看动画效果，切换设备按钮预览不同设备
5. **保存项目**：点击顶部保存按钮保存项目，开启自动保存后会自动保存

## 动画类型说明

- **fadeIn**：淡入效果
- **slideIn**：从左侧滑入
- **scale**：缩放效果
- **rotate**：旋转效果
- **parallax**：视差滚动效果

## 开发说明

### 前端开发规范
- 启用 TypeScript 严格模式
- ESLint 代码检查
- 使用 Tailwind CSS 进行样式开发
- Zustand 管理全局状态

### 后端开发规范
- NestJS 模块化架构
- TypeORM 进行数据库操作
- class-validator 进行 DTO 校验
- SQLite 本地数据库

## 注意事项

- 确保端口 4173 和 38765 未被占用
- 数据库文件 `database.sqlite` 会自动创建在后端根目录
- 自动保存功能需项目已保存过一次后生效
