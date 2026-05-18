# 老照片修复上色工具

基于 Vue3 + Express + TypeScript + SQLite 的在线老照片修复上色工具，利用 WASM 实现轻量化图像去噪、纹理修复卷积算子、色彩映射矩阵计算。

## 功能特性

- 🖼️ **图片预处理** - 自动调整尺寸、格式转换
- 🎛️ **模型参数透传** - 可调节去噪强度、纹理增强、色彩强度等参数
- ⚡ **进度帧渲染** - WebSocket 实时推送处理进度和中间帧
- 🔄 **对比预览** - 滑块拖拽对比原图与修复效果
- 📋 **结果列表展示** - 历史记录管理，支持删除和下载
- 🚀 **WASM 加速** - Rust 编译的高性能图像处理算子

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Pinia (状态管理)
- Element Plus (UI组件库)
- WebSocket (实时通信)

### 后端
- Express + TypeScript
- SQLite (better-sqlite3)
- Sharp (图像处理)
- Multer (文件上传)
- WebSocket (实时推送)

### WASM
- Rust + wasm-bindgen
- 图像去噪 (均值滤波)
- 纹理修复 (Sobel 边缘检测增强)
- 色彩映射 (灰度到彩色映射)

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── api.ts          # API 接口
│   │   ├── websocket.ts    # WebSocket 管理
│   │   ├── types.ts        # 类型定义
│   │   └── main.ts         # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # 后端项目
│   ├── src/
│   │   ├── index.ts        # 服务入口
│   │   ├── database.ts     # SQLite 数据库
│   │   ├── processor.ts    # 图像处理引擎
│   │   ├── websocket.ts    # WebSocket 服务
│   │   └── types.ts        # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── wasm/                   # WASM 模块
│   ├── src/
│   │   └── lib.rs          # Rust 图像处理代码
│   ├── Cargo.toml
│   └── README.md
├── uploads/                # 上传文件目录
├── data/                   # 数据库目录
├── package.json            # 根目录配置 (concurrently)
└── .gitignore
```

## 端口配置

- 前端开发服务器: **33529** (不常用端口)
- 后端 API 服务: **14587** (不常用端口)

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install          # 根目录 (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. 编译 WASM (可选)

后端已内置纯 JavaScript 实现的备选方案，如果需要使用 WASM 加速：

```bash
# 安装 Rust 和 wasm-pack
curl https://sh.rustup.rs -sSf | sh
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 编译 WASM
cd wasm
wasm-pack build --target web --out-dir pkg
```

### 3. 启动开发服务

```bash
# 同时启动前后端 (推荐)
npm run dev

# 或分别启动
npm run dev:server    # 后端: http://localhost:14587
npm run dev:client    # 前端: http://localhost:33529
```

### 4. 构建生产版本

```bash
npm run build
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/photos/upload` | 上传照片并开始处理 |
| GET | `/api/photos` | 获取照片列表 |
| GET | `/api/photos/:id` | 获取单张照片详情 |
| DELETE | `/api/photos/:id` | 删除照片 |
| GET | `/api/health` | 健康检查 |

## WebSocket 协议

连接地址: `ws://localhost:33529/ws` (通过前端代理)

### 消息格式

```json
{
  "type": "progress",
  "data": {
    "taskId": "uuid",
    "stage": "preprocess",
    "progress": 50,
    "message": "正在处理...",
    "frameData": "data:image/jpeg;base64,..."
  }
}
```

### 处理阶段

- `preprocess` - 图片预处理
- `denoise` - 图像去噪
- `texture` - 纹理修复
- `colorize` - 智能上色
- `postprocess` - 后期处理

## 模型参数说明

| 参数 | 范围 | 默认值 | 说明 |
|------|------|--------|------|
| denoiseStrength | 0-1 | 0.5 | 去噪强度 |
| textureEnhance | 0-1 | 0.6 | 纹理增强程度 |
| colorIntensity | 0-1 | 0.7 | 色彩饱和度 |
| sharpenLevel | 0-1 | 0.4 | 锐化程度 |
| brightness | -1-1 | 0 | 亮度调整 |
| contrast | -1-1 | 0 | 对比度调整 |

## 代码规范

项目启用了严格的 TypeScript 检查和 ESLint 代码规范：

- TypeScript `strict: true`
- 禁止 `any` 类型
- 严格空值检查
- ESLint 推荐规则 + TypeScript 专项规则

```bash
# 代码检查
cd server && npm run lint
cd ../client && npm run lint
```

## 许可证

MIT
