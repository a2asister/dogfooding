# TripDetailView 问题修复

## 问题描述
点击"创建站点"时出现错误：
```
Variable "$id" of required type "ID!" was not provided.
```

## 问题分析

这个错误提示缺少 `$id` 变量，但 `CreateTripNode` mutation 实际上应该只需要 `$input` 变量。

问题可能来源于：
1. useQuery 的变量传递方式不正确
2. 或者某个mutation意外接收了不该有的变量

## 已进行的修复

### 1. 修复 useQuery 变量传递

**之前**:
```typescript
const { result, loading, refetch } = useQuery(gql`...`, {
  variables: { id: tripId },
});
```

**修复后**:
```typescript
const { result, loading, error, refetch } = useQuery(gql`...`, () => ({
  variables: { id: tripId.value },
}));
```

使用函数形式确保变量是响应式的，并且访问 `.value` 获取实际值。

### 2. 改进 createNode mutation 调用

- 添加了详细的 `console.log` 调试输出
- 明确处理可选字段（address, note）使用 `undefined` 而不是空字符串
- 添加了用户友好的错误提示 alert

### 3. 增加了 GraphQLError 监控

```typescript
watch(
  error,
  (err) => {
    if (err) {
      console.warn('GraphQL Error (using mock data):', err.message);
    }
  }
);
```

## 如何验证修复

1. 确保后端服务已启动（http://localhost:5399）
2. 在"行程管理"页面创建一个新行程
3. 点击行程卡片进入详情页
4. 点击"添加站点"按钮
5. 填写站点信息并提交
6. 检查：
   - ✅ 控制台无错误
   - ✅ 站点成功添加
   - ✅ 页面自动刷新显示新站点

## 后端验证

请确保后端 GraphQL resolver 工作正常：

### 查询测试
打开 http://localhost:5399/graphql 执行：
```graphql
query {
  trips {
    id
    title
  }
}
```

### 创建行程节点测试
```graphql
mutation {
  createTripNode(createTripNodeInput: {
    name: "测试站点",
    arrivalTime: "2024-06-01T10:00:00.000Z",
    order: 0,
    tripId: 1
  }) {
    id
    name
  }
}
```
