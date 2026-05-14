# NestJS 后端错误修复总结

## 已修复的错误

### 1. TS2395: Individual declarations in merged declaration 'Course' must be all exported or all local
**问题**: 后端的 `Course` 实体类与前端的 `Course` 接口产生了声明合并冲突，TypeScript 严格模式下报错。

**根本原因**: 
- 前后端都有名为 `Course` 的类型定义
- 在 monorepo 或共享类型定义环境中产生声明合并冲突
- 部分导出部分本地声明导致不一致

**修复方案**: 重命名所有后端实体类，添加 `Entity` 后缀，与前端接口明确区分：
- `Course` → `CourseEntity`
- `Checkin` → `CheckinEntity`
- `Favorite` → `FavoriteEntity`

同时添加显式的数据库表名映射：
```typescript
@Entity({ name: 'course' })  // 指定表名
export class CourseEntity { ... }
```

---

### 2. TS2305: Module has no exported member 'FavoriteEntity'
**问题**: `app.module.ts` 尝试导入 `FavoriteEntity`，但实体文件导出的仍是 `Favorite`。

**修复**: 同步更新所有实体类的导出名称和引用。

---

## 实体命名规范

### 后端实体命名 (NestJS + TypeORM)
| 原类名 | 新类名 | 数据库表名 |
|--------|--------|-----------|
| `Course` | `CourseEntity` | `course` |
| `Checkin` | `CheckinEntity` | `checkin` |
| `Favorite` | `FavoriteEntity` | `favorite` |

### 前端接口命名 (Angular)
- `Course` - 课程数据接口
- `CheckinRecord` - 打卡记录接口
- `UserStats` - 用户统计接口
- `Favorite` - 收藏接口

---

## 修改的文件列表

### 实体文件
1. `backend/src/entities/course.entity.ts`
   - `Course` → `CourseEntity`
   - 添加 `@Entity({ name: 'course' })`

2. `backend/src/entities/checkin.entity.ts`
   - `Checkin` → `CheckinEntity`
   - 添加 `@Entity({ name: 'checkin' })`

3. `backend/src/entities/favorite.entity.ts`
   - `Favorite` → `FavoriteEntity`
   - 添加 `@Entity({ name: 'favorite' })`

### 课程模块
4. `backend/src/course/course.service.ts`
   - 更新所有 `Course` → `CourseEntity` 引用

5. `backend/src/course/course.controller.ts`
   - 更新所有 `Course` → `CourseEntity` 引用

6. `backend/src/course/course.module.ts`
   - 更新 `TypeOrmModule.forFeature([CourseEntity])`

### 打卡模块
7. `backend/src/checkin/checkin.service.ts`
   - 更新所有 `Checkin` → `CheckinEntity` 引用

8. `backend/src/checkin/checkin.controller.ts`
   - 更新所有 `Checkin` → `CheckinEntity` 引用

9. `backend/src/checkin/checkin.module.ts`
   - 更新 `TypeOrmModule.forFeature([CheckinEntity])`

### 收藏模块
10. `backend/src/favorite/favorite.service.ts`
    - 更新所有 `Favorite` → `FavoriteEntity` 引用

11. `backend/src/favorite/favorite.controller.ts`
    - 更新所有 `Favorite` → `FavoriteEntity` 引用

12. `backend/src/favorite/favorite.module.ts`
    - 更新 `TypeOrmModule.forFeature([FavoriteEntity])`

### 统计模块
13. `backend/src/stats/stats.service.ts`
    - 更新所有 `Checkin` → `CheckinEntity` 引用

14. `backend/src/stats/stats.module.ts`
    - 更新 `TypeOrmModule.forFeature([CheckinEntity])`

### 主应用模块
15. `backend/src/app.module.ts`
    - 更新所有实体导入和 `entities` 数组配置

---

## 类型安全改进

1. ✅ 消除前后端类型命名冲突
2. ✅ 显式指定数据库表名，避免自动命名问题
3. ✅ 所有实体引用已同步更新
4. ✅ TypeScript 严格模式完全通过
5. ✅ 无声明合并错误

---

## 启动验证

```bash
# 安装依赖
cd backend && npm install

# 启动后端
npm start
```

后端服务运行在: http://localhost:3080

### API 端点验证
- `GET /api/courses` - 获取课程列表
- `GET /api/checkins` - 获取打卡记录
- `POST /api/checkins` - 创建打卡记录
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:courseId` - 取消收藏
- `GET /api/stats` - 获取用户统计
