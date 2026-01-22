# 从 Clerk 迁移到 JWT Token 认证指南

## 概述

项目已从 Clerk 认证服务迁移到基于 JWT token 的自定义认证系统。

## 主要变更

### 1. 数据库变更

**新增 User 表**：
- 用户信息现在存储在数据库中
- 密码使用 bcrypt 加密存储

**运行数据库迁移**：
```bash
npm run db:generate
npm run db:push
```

### 2. 环境变量变更

**移除的变量**：
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**新增的变量**：
- `JWT_SECRET` - JWT token 签名密钥（必需）

**更新 .env 文件**：
```env
# 移除这些
# CLERK_SECRET_KEY=...
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# 添加这个
JWT_SECRET="your-very-secure-secret-key-change-in-production"
```

### 3. 依赖变更

**移除的包**：
- `@clerk/nextjs`

**新增的包**：
- `jsonwebtoken` - JWT token 生成和验证
- `bcryptjs` - 密码加密
- `@types/jsonwebtoken` - TypeScript 类型
- `@types/bcryptjs` - TypeScript 类型

**安装新依赖**：
```bash
npm install
```

### 4. 认证流程变更

#### 注册
- 端点：`api.auth.register`
- 输入：`email`, `username`, `password`
- 返回：`token` 和 `user` 信息

#### 登录
- 端点：`api.auth.login`
- 输入：`email`, `password`
- 返回：`token` 和 `user` 信息

#### Token 存储
- Token 存储在 `localStorage` 中，键名为 `auth_token`
- Token 自动添加到所有 tRPC 请求的 `Authorization` header 中

### 5. 组件变更

所有使用 `useUser()` 的组件已更新为使用 `useAuth()` hook：

**之前**：
```tsx
import { useUser } from "@clerk/nextjs";
const { user } = useUser();
```

**现在**：
```tsx
import { useAuth } from "~/contexts/auth-context";
const { user, isAuthenticated, login, logout } = useAuth();
```

### 6. API 变更

**新增认证 router**：
- `api.auth.register` - 用户注册
- `api.auth.login` - 用户登录
- `api.auth.getCurrentUser` - 获取当前用户（需要认证）

**用户数据来源**：
- 之前：从 Clerk API 获取
- 现在：从数据库获取

## 使用说明

### 1. 设置环境变量

创建或更新 `.env` 文件：
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
JWT_SECRET="your-secure-secret-key-min-32-characters"
NODE_ENV="development"
```

### 2. 运行数据库迁移

```bash
npm run db:generate
npm run db:push
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试认证

1. 访问 http://localhost:3000
2. 点击"注册"按钮
3. 填写邮箱、用户名和密码
4. 注册成功后自动登录
5. 可以开始发帖

## 安全注意事项

1. **JWT_SECRET**：
   - 在生产环境中使用强随机密钥
   - 至少 32 个字符
   - 不要提交到版本控制

2. **密码安全**：
   - 密码使用 bcrypt 加密存储
   - 默认 salt rounds: 10

3. **Token 过期**：
   - Token 默认有效期：7 天
   - 可在 `src/server/auth/jwt.ts` 中修改

4. **HTTPS**：
   - 生产环境必须使用 HTTPS
   - Token 通过 HTTP header 传输

## 故障排除

### Token 无效错误
- 检查 `JWT_SECRET` 是否正确设置
- 检查 token 是否过期（默认 7 天）
- 清除 localStorage 中的 token 并重新登录

### 数据库连接错误
- 检查 `DATABASE_URL` 是否正确
- 确保数据库已创建
- 运行 `npm run db:push` 确保 schema 已同步

### 用户不存在错误
- 确保已运行数据库迁移
- 检查 User 表是否已创建
- 尝试重新注册用户

## 下一步

- [ ] 添加密码重置功能
- [ ] 添加邮箱验证
- [ ] 添加社交登录（可选）
- [ ] 实现 refresh token 机制
- [ ] 添加账户设置页面
