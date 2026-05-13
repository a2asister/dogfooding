# 3D小区房产沙盘可视化系统

## 技术栈

- **前端**: Angular 19 + TypeScript (严格模式) + Three.js
- **后端**: NestJS + GraphQL + SQLite
- **并发启动**: concurrently

## 功能特性

### 前端3D可视化
- 楼盘3D立体建模展示
- 楼栋逐层展开/收起动画
- 户型透视高亮效果
- 漫游路径流光跑动动画
- 楼层点位弹跳浮动效果
- 鼠标交互点击选中楼宇

### 后端功能
- 小区房源信息管理
- 户型基础信息录入存储
- 房源分类展示
- 用户预约信息保存
- 浏览记录简单统计
- GraphQL API接口

## 项目结构

```
.
├── backend/          # NestJS后端
│   ├── src/
│   │   ├── building/      # 楼栋模块
│   │   ├── floor/         # 楼层模块
│   │   ├── house/         # 房源模块
│   │   ├── house-type/    # 户型模块
│   │   ├── reservation/   # 预约模块
│   │   ├── browse-record/ # 浏览记录模块
│   │   ├── entities/      # 数据实体
│   │   ├── dto/           # 输入类型
│   │   └── main.ts
├── frontend/         # Angular前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── three-viewer/   # Three.js 3D查看器
│   │   │   ├── house-info/     # 房源信息组件
│   │   │   ├── control-panel/  # 控制面板组件
│   │   │   └── app.module.ts
│   │   ├── styles.scss
│   │   └── main.ts
├── package.json
└── .gitignore
```

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 并发启动项目

```bash
npm run dev
```

### 3. 单独启动

```bash
# 启动后端 (端口: 3001)
npm run dev:backend

# 启动前端 (端口: 4201)
npm run dev:frontend
```

## 访问地址

- **前端**: http://localhost:4201
- **后端GraphQL Playground**: http://localhost:3001/graphql

## GraphQL 接口示例

### 查询楼栋列表
```graphql
query {
  buildings {
    id
    name
    address
    totalFloors
  }
}
```

### 创建房源
```graphql
mutation {
  createHouse(input: {
    houseNumber: "101"
    floorId: 1
    houseTypeId: 1
    price: 2500000
    orientation: "南"
  }) {
    id
    houseNumber
    price
  }
}
```

### 创建预约
```graphql
mutation {
  createReservation(input: {
    userName: "张三"
    phone: "13800138000"
    houseId: 1
    reservationTime: "2024-01-15T10:00:00Z"
  }) {
    id
    status
  }
}
```
