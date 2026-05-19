# 大学门户网站与学生后台系统 - 技术架构文档

## 1. 技术选型

### 1.1 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| React Router | 6.x | 路由管理 |
| Zustand | 4.x | 状态管理 |
| Ant Design | 5.x | UI 组件库 |
| Axios | 1.x | HTTP 请求 |
| ESLint | 8.x | 代码规范 |
| Prettier | 3.x | 代码格式化 |

### 1.2 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Koa | 2.x | Web 框架 |
| TypeScript | 5.x | 类型系统 |
| SQLite | 3.x | 关系型数据库 |
| better-sqlite3 | 11.x | SQLite 驱动 |
| jsonwebtoken | 9.x | JWT 认证 |
| bcrypt | 5.x | 密码加密 |
| koa-router | 12.x | 路由 |
| koa-cors | 2.x | 跨域处理 |
| koa-bodyparser | 4.x | 请求体解析 |

---

## 2. 项目结构

```
dogfooding2/
├── .trae/documents/          # 项目文档
├── client/                   # 前端项目 (React + TS)
│   ├── src/
│   │   ├── api/              # API 接口
│   │   ├── components/       # 通用组件
│   │   ├── layouts/          # 布局组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── portal/       # 门户网站页面
│   │   │   └── student/      # 学生后台页面
│   │   ├── router/           # 路由配置
│   │   ├── store/            # 状态管理
│   │   ├── types/            # 类型定义
│   │   └── utils/            # 工具函数
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                   # 后端项目 (Koa + TS)
│   ├── src/
│   │   ├── config/           # 配置
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── services/         # 业务逻辑
│   │   ├── types/            # 类型定义
│   │   └── utils/            # 工具函数
│   ├── data/                 # SQLite 数据库文件
│   └── package.json
├── package.json              # 根 package.json (并发启动)
├── .gitignore
├── .eslintrc.json
└── .prettierrc
```

---

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                         Client                          │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  Portal  │  │  Student   │  │  Auth / Storage    │   │
│  │  (静态页)│  │  (动态页)  │  │                    │   │
│  └────┬─────┘  └──────┬─────┘  └─────────┬──────────┘   │
│       │                │                  │              │
│       └────────────────┼──────────────────┘              │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │ HTTP/HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────┐
│                         Server                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Koa Middleware Stack                │   │
│  │  CORS → Logger → BodyParser → Auth → Router      │   │
│  └───────────────────────┬──────────────────────────┘   │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐   │
│  │              Controllers / Services              │   │
│  │  Auth / User / Course / Grade / News ...         │   │
│  └───────────────────────┬──────────────────────────┘   │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐   │
│  │                SQLite Database                   │   │
│  │  Users / Courses / Grades / Schedules / News     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 认证流程

1. 用户登录 → 后端验证 credentials → 生成 JWT Token (30分钟有效期)
2. 每次请求携带 Token → 中间件验证 Token 有效性
3. Token 过期 → 返回 401 → 前端跳转登录页
4. 会话超时检测 → 前端定时检查 + 后端 Token 过期双保险

---

## 4. 数据库设计

### 4.1 用户表 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  department VARCHAR(100),
  major VARCHAR(100),
  class VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  status INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 课程表 (courses)
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  teacher VARCHAR(50) NOT NULL,
  credit INTEGER NOT NULL,
  capacity INTEGER DEFAULT 60,
  enrolled INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 课表 (schedules)
```sql
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  week_day INTEGER NOT NULL,
  start_period INTEGER NOT NULL,
  end_period INTEGER NOT NULL,
  location VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

## 5. API 设计

### 5.1 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/info | 获取当前用户信息 |

### 5.2 门户网站接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/news/list | 获取新闻列表 |
| GET | /api/news/:id | 获取新闻详情 |
| GET | /api/portal/overview | 获取门户首页数据 |

### 5.3 学生后台接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/student/dashboard | 工作台数据 |
| GET | /api/student/schedule | 获取课表 |
| GET | /api/student/grades | 获取成绩 |
| GET | /api/student/courses | 获取可选课程 |
| POST | /api/student/courses/:id/select | 选课 |
| DELETE | /api/student/courses/:id/drop | 退课 |
| GET | /api/student/evaluations | 获取待评教课程 |
| POST | /api/student/evaluations | 提交评教 |
| GET | /api/student/messages | 获取消息列表 |
| GET | /api/student/profile | 获取学籍信息 |
| POST | /api/student/password | 修改密码 |

---

## 6. 前端路由设计

### 6.1 门户网站路由
```
/ → 首页
/about → 学校概况
/news → 新闻动态
/admission → 招生就业
/research → 教学科研
/services → 公共服务
```

### 6.2 学生后台路由
```
/login → 登录页
/student/dashboard → 工作台
/student/schedule → 课表查询
/student/grades → 成绩查询
/student/courses → 课程选择
/student/evaluations → 期末评教
/student/messages → 消息中心
/student/profile → 学籍信息
/student/settings → 账号安全
```

---

## 7. 部署与运行

### 7.1 开发环境
```bash
# 安装依赖
npm run install:all

# 并发启动前后端
npm run dev
```

### 7.2 访问地址
- 门户网站: http://localhost:5173
- 学生后台: http://localhost:5173/student
- 后端 API: http://localhost:8765
