# 会议倒计时系统

一个功能完整的会议倒计时系统，采用 React + TypeScript + NestJS + SQLite + GraphQL 技术栈开发。

## 功能特性

- **翻页式3D动画倒计时**: 数字切换时带有优雅的3D翻页动画效果
- **紧急状态提示**: 最后60秒数字变为红色并脉冲闪烁，最后10秒触发全屏边框紧急闪烁
- **动态背景渐变**: 背景颜色随时间流逝从冷静的蓝色过渡到紧迫的橙红色
- **环形进度条**: 会议进行中显示进度条填充动画
- **完成音效与动画**: 会议结束时播放简洁的完成音效并显示打勾动画
- **会议日程管理**: 支持新增、编辑、删除会议日程
- **定时任务**: 后端自动检测并更新会议状态（进行中/已结束）

## 技术栈

### 前端
- React 18 + TypeScript (严格模式)
- Vite (构建工具)
- Apollo Client (GraphQL客户端)
- CSS3 动画与3D变换

### 后端
- NestJS
- GraphQL (Apollo Server)
- SQLite + TypeORM
- 定时任务 (Schedule)

## 端口配置

- 后端服务: http://localhost:4873
- GraphQL playground: http://localhost:4873/graphql
- 前端应用: http://localhost:4874

## 安装与运行

### 方式一：根目录并发启动（推荐）

```bash
# 安装根目录依赖
npm install

# 安装前后端依赖
npm run install:all

# 并发启动前后端
npm run dev
```

### 方式二：分别启动

#### 启动后端
```bash
cd backend
npm install
npm run start:dev
```

#### 启动前端（新终端）
```bash
cd frontend
npm install
npm run dev
```

## 使用说明

1. 访问 http://localhost:4874 打开前端应用
2. 点击"添加会议"按钮创建新的会议日程
3. 填写会议标题、开始时间和结束时间
4. 在会议列表中点击"查看倒计时"进入倒计时界面
5. 系统会自动：
   - 显示距离会议开始的倒计时
   - 会议开始后显示进行中的进度
   - 最后60秒显示红色紧急提示
   - 最后10秒触发全屏边框闪烁
   - 会议结束时播放音效并显示完成动画

## 项目结构

```
dogfooding/
├── backend/
│   ├── src/
│   │   ├── meeting/
│   │   │   ├── meeting.entity.ts      # 会议实体
│   │   │   ├── meeting.service.ts     # 会议服务（含定时任务）
│   │   │   ├── meeting.resolver.ts    # GraphQL解析器
│   │   │   └── dto/                   # 数据传输对象
│   │   ├── app.module.ts               # 应用模块
│   │   └── main.ts                     # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlipNumber.tsx          # 翻页数字组件
│   │   │   ├── CountdownTimer.tsx      # 倒计时主组件
│   │   │   ├── ProgressRing.tsx        # 环形进度条
│   │   │   └── MeetingManager.tsx      # 会议日程管理
│   │   ├── graphql/
│   │   │   └── queries.ts              # GraphQL查询与变更
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── package.json                         # 根目录（含concurrently配置）
└── README.md
```

## GraphQL接口

### 查询
- `meetings`: 获取所有会议列表
- `meeting(id: Float!)`: 获取单个会议详情
- `activeMeeting`: 获取当前进行中的会议

### 变更
- `createMeeting(input: CreateMeetingInput!)`: 创建新会议
- `updateMeeting(input: UpdateMeetingInput!)`: 更新会议信息
- `deleteMeeting(id: Float!)`: 删除会议

### 订阅
- `meetingCreated`: 会议创建事件
- `meetingUpdated`: 会议更新事件
