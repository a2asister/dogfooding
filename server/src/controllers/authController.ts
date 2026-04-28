import { Context } from 'koa';
import Joi from 'joi';
import { User, UserRole, UserStatus } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: UserRole;
    };
  };
}

const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6).max(100)
});

const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6).max(100),
  name: Joi.string().required().max(50),
  phone: Joi.string().required().pattern(/^1[3-9]\d{9}$/),
  email: Joi.string().email().allow('').optional()
});

export const login = async (ctx: Context) => {
  const { error, value } = loginSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: error.details.map((e) => e.message)
    };
    return;
  }

  const { username, password } = value;

  const user = await User.findOne({
    where: { username }
  });

  if (!user) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '用户名或密码错误'
    };
    return;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '用户名或密码错误'
    };
    return;
  }

  if (user.status !== UserStatus.ACTIVE) {
    ctx.status = 403;
    ctx.body = {
      success: false,
      message: '账户已被禁用，请联系管理员'
    };
    return;
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  });

  await user.update({ lastLoginAt: new Date() });

  ctx.body = {
    success: true,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        avatar: user.avatar
      }
    }
  };
};

export const register = async (ctx: Context) => {
  const { error, value } = registerSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数验证失败',
      errors: error.details.map((e) => e.message)
    };
    return;
  }

  const { username, password, name, phone, email } = value;

  const existingUser = await User.findOne({
    where: { username }
  });

  if (existingUser) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '用户名已存在'
    };
    return;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    phone,
    email,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE
  });

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '注册成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    }
  };
};

export const getCurrentUser = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'deletedAt'] }
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: user
  };
};

export const changePassword = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { oldPassword, newPassword } = ctx.request.body as { oldPassword: string; newPassword: string };

  if (!oldPassword || !newPassword) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '请提供旧密码和新密码'
    };
    return;
  }

  if (newPassword.length < 6) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '新密码长度不能少于6位'
    };
    return;
  }

  const user = await User.findByPk(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  const isOldPasswordValid = await comparePassword(oldPassword, user.password);

  if (!isOldPasswordValid) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '旧密码错误'
    };
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await user.update({ password: hashedPassword });

  ctx.body = {
    success: true,
    message: '密码修改成功'
  };
};
