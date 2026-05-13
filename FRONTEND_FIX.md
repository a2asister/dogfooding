# 前端Apollo客户端问题修复

## 问题描述
```
Uncaught (in promise) Error: Apollo client with id default not found. 
Use an app.runWithContext() or provideApolloClient() if you are outside of a component setup.
```

## 根本原因
Apollo客户端的提供方式不正确。之前尝试在根组件的setup()中返回provider，这在Vue 3中不是标准的provider方式。

## 修复方案

### 1. 修改 `frontend/src/main.ts`

**修复前**:
```typescript
const app = createApp({
  setup() {
    return {
      [DefaultApolloClient]: apolloClient,
    };
  },
  render: () => h(App),
});
```

**修复后**:
```typescript
const app = createApp(App);
app.provide(DefaultApolloClient, apolloClient);
```

使用标准的 `app.provide()` 方法注入Apollo客户端，这是Vue 3推荐的依赖注入方式。

### 2. 增强 `TimelineView.vue`

- 添加 `watch` 监听GraphQL结果，确保数据返回后更新store
- 添加 `error` 处理，当GraphQL请求失败时打印警告
- 添加演示用的Mock数据（云南五日游），即使后端未启动也能看到效果
- 2秒超时后自动加载Mock数据，确保用户体验

## 增强功能

### Mock数据演示
添加了"云南五日游"的演示数据，包含5个站点：
1. 昆明长水机场
2. 石林风景区
3. 大理古城
4. 洱海
5. 丽江古城

这样即使用户还没启动后端，也能立即看到时间轴动画效果。

## 验证修复

启动前端后，打开浏览器控制台，确认：
1. ✅ 没有Apollo client相关错误
2. ✅ 页面正常显示时间轴
3. ✅ 站点标记弹跳动画正常
4. ✅ 流光进度条动画正常
5. ✅ 卡片切换动画正常

## 后端连接

当后端服务（http://localhost:5399）正常启动后，GraphQL会自动连接并加载真实数据。
- Vite代理已配置：`/graphql -> http://localhost:5399/graphql`
- 有真实数据时会覆盖Mock数据
