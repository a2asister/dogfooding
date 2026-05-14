# 便携动态尺子测量工具

一款功能强大的在线测量工具，支持刻度顺滑滚动、测量标线流光跟随、选中区域高亮放大、数值弹跳更新、拖拽吸附校准等动态效果，适配屏幕精准测量场景。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Framer Motion + SCSS
- **后端**: NestJS + TypeScript + SQLite
- **特性**: 并发启动、TypeScript强校验、ESLint代码规范、不常用端口

## 功能特性

### 测量功能
- ✅ 刻度顺滑滚动
- ✅ 测量标线流光跟随
- ✅ 选中区域高亮放大
- ✅ 测量数值弹跳更新动画
- ✅ 拖拽吸附校准
- ✅ 自定义刻度参数

### 数据管理
- ✅ 测量记录保存与管理
- ✅ 自定义刻度参数配置
- ✅ 常用尺寸模板存储
- ✅ SQLite数据库持久化

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
npm install

# 安装前后端依赖
npm run install:all
```

### 启动项目

```bash
# 并发启动前后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端: http://localhost:38765
npm run dev:backend   # 后端: http://localhost:39876
```

### 构建项目

```bash
npm run build
```

## 项目结构

```
dogfooding/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   │   ├── Ruler.tsx   # 尺子核心组件
│   │   │   └── Sidebar.tsx # 侧边栏组件
│   │   ├── services/        # API服务
│   │   ├── types.ts         # 类型定义
│   │   ├── App.tsx          # 主应用
│   │   └── main.tsx         # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── measurement/     # 测量记录模块
│   │   ├── scale-params/    # 刻度参数模块
│   │   ├── size-template/   # 尺寸模板模块
│   │   ├── app.module.ts    # 应用模块
│   │   └── main.ts          # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── package.json              # 根目录配置
├── .gitignore
└── README.md
```

## 端口配置

- **前端**: `38765`
- **后端**: `39876`

## API 接口

### 测量记录
- `GET /api/measurements` - 获取所有测量记录
- `POST /api/measurements` - 创建测量记录
- `DELETE /api/measurements/:id` - 删除测量记录

### 刻度参数
- `GET /api/scale-params` - 获取所有刻度参数
- `POST /api/scale-params` - 创建刻度参数
- `PATCH /api/scale-params/:id` - 更新刻度参数
- `DELETE /api/scale-params/:id` - 删除刻度参数

### 尺寸模板
- `GET /api/size-templates` - 获取所有尺寸模板
- `POST /api/size-templates` - 创建尺寸模板
- `DELETE /api/size-templates/:id` - 删除尺寸模板

## 使用说明

1. **滚动尺子**: 水平滚动测量区域查看更多刻度
2. **测量操作**: 按住鼠标拖拽进行测量，松开后显示结果
3. **保存记录**: 在侧边栏点击"添加"按钮，输入标签保存测量结果
4. **切换刻度**: 在"刻度参数"标签页选择或创建新的刻度配置
5. **管理模板**: 在"尺寸模板"标签页保存常用尺寸

## 开发规范

- TypeScript 严格模式 (`strict: true`)
- ESLint 代码规范检查
- Prettier 代码格式化

## License

MIT
