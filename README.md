# 动态字幕律动视频生成工具

基于 Angular + NestJS + SQLite 的动态字幕视频生成工具。

## 功能特性

### 前端效果
- 字幕跟随音频律动缩放
- 文字弹跳震动效果
- 色彩随音波实时变换
- 字幕路径位移动画
- 画面转场特效联动

### 后端功能
- 音频文件上传
- 字幕文本存储
- 自定义字幕参数保存
- 短视频成品导出
- 用户创作记录留存

## 技术栈

- **前端**: Angular 17 + TypeScript + Canvas API
- **后端**: NestJS + GraphQL + SQLite
- **工具**: ESLint + Prettier + Concurrently

## 快速开始

```bash
# 安装所有依赖
npm run install:all

# 启动开发服务
npm run dev
```

## 服务端口

- 前端: http://localhost:4280
- 后端: http://localhost:3080
- GraphQL: http://localhost:3080/graphql
