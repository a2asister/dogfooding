# 节日动态贺卡制作平台

一个功能丰富的节日贺卡制作平台，支持3D翻页动画、烟花粒子特效、文字动画等炫酷效果。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **后端**: NestJS + TypeORM + SQLite
- **动画**: CSS3 Animation + Canvas粒子效果

## 特性

### 动画效果
- 🎴 贺卡3D翻页效果
- 🎆 烟花粒子爆炸飘散
- ✨ 文字飘入沉降动画
- 🎨 装饰元素微动效果
- 🎵 背景音乐可视化律动

### 功能特性
- 📝 贺卡模板存储
- 💾 用户自定义贺卡内容保存
- 📬 贺卡接收记录
- 📚 个人贺卡作品集管理
- 🔗 贺卡分享功能

## 项目结构

```
dogfooding2/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── views/       # 页面
│   │   └── router/      # 路由
│   └── package.json
├── backend/           # 后端项目
│   └── src/
│       ├── card/        # 贺卡模块
│       └── main.ts
└── package.json       # 根目录配置
```

## 端口配置

- 前端: `38765`
- 后端: `38766`

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前后端依赖
cd frontend && npm install
cd ../backend && npm install
```

### 开发模式

```bash
# 同时启动前后端（推荐）
npm run dev

# 或者单独启动
npm run dev:frontend  # 启动前端
npm run dev:backend   # 启动后端
```

### 构建生产版本

```bash
npm run build
```

## API 接口

### 贺卡管理

- `POST /api/cards` - 创建新贺卡
- `GET /api/cards` - 获取所有贺卡
- `GET /api/cards/:id` - 获取单个贺卡详情
- `DELETE /api/cards/:id` - 删除贺卡

## 使用说明

1. 访问首页浏览贺卡模板
2. 选择模板或点击"开始制作"创建新贺卡
3. 在编辑器中自定义贺卡内容：
   - 填写标题、祝福语、发送人和接收人
   - 选择背景样式
   - 添加装饰元素
   - 选择背景音乐
4. 点击预览按钮查看效果
5. 保存贺卡到作品集
6. 在作品集页面可以查看、分享或删除贺卡

## 开发说明

### 前端开发

前端使用 Vue 3 Composition API + TypeScript，组件位于 `frontend/src/components/` 目录：

- `Fireworks.vue` - 烟花粒子效果组件
- `Card3D.vue` - 3D翻页贺卡组件
- `AnimatedText.vue` - 文字动画组件
- `Decoration.vue` - 装饰元素组件
- `MusicVisualizer.vue` - 音乐可视化组件

### 后端开发

后端使用 NestJS + TypeORM + SQLite，主要代码位于 `backend/src/card/` 目录：

- `card.entity.ts` - 贺卡数据实体
- `card.service.ts` - 贺卡业务逻辑
- `card.controller.ts` - 贺卡API控制器
- `create-card.dto.ts` - 创建贺卡数据验证

## TypeScript 严格模式

项目启用了 TypeScript 严格模式，包括：
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

## License

MIT
