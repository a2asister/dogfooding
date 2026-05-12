# 配置管理工具

一个具有动态变形动画的配置管理工具，使用 Vue 2 + TypeScript + NestJS + SQLite 技术栈构建。

## 功能特性

### 前端动画效果
- **动态表单变形**: 切换不同配置类型时，表单字段使用 CSS transform 实现平滑的折叠、展开和位移效果
- **弹性缓动函数**: 字段间的过渡采用弹性缓动函数（cubic-bezier(0.68, -0.55, 0.265, 1.55)）营造物理质感
- **3D 翻转开关**: 开关控件使用 3D 翻转动画，backface-visibility 实现正反面效果
- **滑块涟漪光晕**: 滑块拖动时产生涟漪扩散效果和跟随的光晕
- **手风琴分组**: 配置分组采用手风琴式展开，配合阴影深度变化暗示层级关系
- **保存按钮动画**: 表单验证通过后触发渐变填充动画和打勾确认效果

### 后端功能
- **CRUD 接口**: 完整的配置项增删改查 GraphQL API
- **SQLite 数据库**: 使用 SQLite 本地存储配置数据
- **导入导出**: 支持将配置导出为 JSON 文件，也可从 JSON 文件导入配置

## 技术栈

### 前端
- Vue 2.7 + TypeScript
- Vue Apollo (GraphQL 客户端)
- SCSS (样式)
- 运行端口: 45678

### 后端
- NestJS + TypeScript
- Apollo GraphQL
- TypeORM + SQLite
- 运行端口: 38765

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
npm install

# 安装后端依赖
cd server && npm install

# 安装前端依赖
cd ../client && npm install
```

### 启动项目

```bash
# 方式1：根目录并发启动前后端
npm run dev

# 方式2：单独启动后端
cd server && npm run start:dev

# 方式3：单独启动前端
cd client && npm run serve
```

### 访问地址
- 前端界面: http://localhost:45678
- GraphQL Playground: http://localhost:38765/graphql

## 项目结构

```
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # 表单组件
│   │   │   ├── FormInput.vue
│   │   │   ├── FormTextarea.vue
│   │   │   ├── FormToggle.vue
│   │   │   └── FormSlider.vue
│   │   ├── styles/        # 样式文件
│   │   │   └── main.scss
│   │   ├── App.vue        # 主应用组件
│   │   └── main.ts        # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── server/                 # 后端项目
│   ├── src/
│   │   ├── config/        # 配置模块
│   │   │   ├── config.entity.ts
│   │   │   ├── config.resolver.ts
│   │   │   ├── config.service.ts
│   │   │   └── config.dto.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json            # 根目录配置（并发启动）
└── README.md
```

## GraphQL API

### 查询

```graphql
# 获取所有配置
query {
  configs {
    id
    name
    type
    value
    enabled
  }
}

# 导出配置
query {
  exportConfigs
}
```

### 变更

```graphql
# 创建配置
mutation {
  createConfig(input: {
    name: "配置名称",
    type: "basic",
    description: "描述",
    value: "{}",
    enabled: true,
    group: "basic"
  }) {
    id
    name
  }
}

# 导入配置
mutation {
  importConfigs(jsonString: "[{...}]") {
    id
    name
  }
}
```

## 配置类型

- **基础配置**: 名称、描述、启用状态
- **高级配置**: 名称、超时时间、重试次数、调试模式
- **网络配置**: 名称、主机地址、端口、协议
- **安全配置**: 名称、加密开关、认证开关、Token 过期时间

## 开发说明

### 自定义动画参数
在 `client/src/styles/main.scss` 中可以调整：
- `$ease-elastic`: 弹性缓动函数
- `$ease-smooth`: 平滑过渡函数
- 各动画的 transition 时间和延迟

### 添加新的配置类型
1. 在 `App.vue` 的 `allFields` 中添加新类型
2. 在 `configTypes` 数组中添加类型按钮
3. 后端会自动适配新类型

## License

MIT
