# CRT Terminal

复古CRT终端模拟器，使用Vue2 + TypeScript + NestJS + SQLite构建。

## 特性

- 🖥️ 经典CRT显示器效果：扫描线、屏幕弯曲、色彩溢出
- ⌨️ 逐字打字动画
- 💫 光标闪烁动画 + 发光效果
- 🔄 命令执行时的屏幕刷新波纹
- ❌ 错误输出红色闪烁警告
- 🎲 背景随机噪点动画
- 📦 SQLite数据库存储预设命令

## 项目结构

```
crt-terminal/
├── client/          # Vue2前端
│   ├── src/
│   │   ├── components/
│   │   │   └── CrtTerminal.vue   # 终端主组件
│   │   ├── assets/
│   │   │   └── crt.css           # CRT效果样式
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vue.config.js
├── server/          # NestJS后端
│   ├── src/
│   │   ├── command/               # 命令模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── data/
│   │   └── preset-commands.json   # 预设命令
│   ├── package.json
│   └── tsconfig.json
├── package.json     # 根package.json
└── README.md
```

## 安装

### 1. 安装根依赖

```bash
npm install
```

### 2. 安装前端和后端依赖

```bash
cd client
npm install
cd ../server
npm install
cd ..
```

或者使用根目录脚本：

```bash
npm run install:all
```

## 运行

### 开发模式（同时启动前后端）

```bash
npm run dev
```

- 前端: http://localhost:4567
- 后端: http://localhost:3789

### 分别启动

```bash
# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

## 可用命令

在终端中输入以下命令：

- `help` - 显示帮助信息
- `clear` - 清空终端
- `whoami` - 显示当前用户
- `date` - 显示当前日期时间
- `ls` - 列出文件
- `about` - 关于终端
- `echo xxx` - 显示文本
- `neofetch` - 系统信息

## 技术栈

### 前端
- Vue 2.7.x + TypeScript
- vue-class-component + vue-property-decorator
- Axios

### 后端
- NestJS 9.x
- TypeORM + SQLite3
- TypeScript

## 端口配置

- 前端端口: 4567
- 后端端口: 3789

## 开发说明

### 添加新命令

在 `server/data/preset-commands.json` 中添加新的命令定义：

```json
{
  "command": "your-command",
  "response": "Your response text",
  "isError": false
}
```

### 修改样式

编辑 `client/src/assets/crt.css` 来自定义CRT效果样式。

## License

MIT
