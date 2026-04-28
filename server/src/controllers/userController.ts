import { Context } from 'koa';
import { Op } from 'sequelize';
import { User, UserRole, UserStatus, Branch } from '../models';
import { hashPassword } from '../utils/auth';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: UserRole;
    };
  };
}

export const getUsers = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, role, keyword, branchId } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  if (branchId) {
    where.branchId = branchId;
  }

  if (keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { name: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
      { email: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'deletedAt'] },
    include: [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'code', 'name'],
        required: false
      }
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']]
  });

  ctx.body = {
    success: true,
    data: {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / limit)
    }
  };
};

export const getUserById = async (ctx: Context) => {
  const { id } = ctx.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'deletedAt'] },
    include: [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'code', 'name'],
        required: false
      }
    ]
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

export const createUser = async (ctx: AuthContext) => {
  const currentUserRole = ctx.state.user.role;
  
  if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.MANAGER) {
    ctx.status = 403;
    ctx.body = {
      success: false,
      message: '没有权限创建用户'
    };
    return;
  }

  const userData = ctx.request.body as Partial<User> & { password: string };

  const requiredFields = ['username', 'password', 'name', 'phone', 'role'];

  const missingFields = requiredFields.filter((field) => !userData[field as keyof typeof userData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const existingUser = await User.findOne({ where: { username: userData.username } });
  if (existingUser) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '用户名已存在'
    };
    return;
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await User.create({
    username: userData.username as string,
    password: hashedPassword,
    name: userData.name as string,
    phone: userData.phone as string,
    email: userData.email,
    role: userData.role as UserRole,
    status: UserStatus.ACTIVE,
    branchId: userData.branchId,
    avatar: userData.avatar
  });

  const { password, deletedAt, ...userWithoutPassword } = user.toJSON();

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '用户创建成功',
    data: userWithoutPassword
  };
};

export const updateUser = async (ctx: AuthContext) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<User>;

  const user = await User.findByPk(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  const { username, password, ...allowedFields } = updateData;

  await user.update(allowedFields);

  const { password: _, deletedAt, ...userWithoutPassword } = user.toJSON();

  ctx.body = {
    success: true,
    message: '用户更新成功',
    data: userWithoutPassword
  };
};

export const updateUserStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body as { status: UserStatus };

  if (!Object.values(UserStatus).includes(status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无效的状态值'
    };
    return;
  }

  const user = await User.findByPk(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  await user.update({ status });

  const { password, deletedAt, ...userWithoutPassword } = user.toJSON();

  ctx.body = {
    success: true,
    message: '状态更新成功',
    data: userWithoutPassword
  };
};

export const resetPassword = async (ctx: AuthContext) => {
  const currentUserRole = ctx.state.user.role;
  
  if (currentUserRole !== UserRole.ADMIN && currentUserRole !== UserRole.MANAGER) {
    ctx.status = 403;
    ctx.body = {
      success: false,
      message: '没有权限重置密码'
    };
    return;
  }

  const { id } = ctx.params;
  const { newPassword } = ctx.request.body as { newPassword: string };

  if (!newPassword || newPassword.length < 6) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '新密码长度不能少于6位'
    };
    return;
  }

  const user = await User.findByPk(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await user.update({ password: hashedPassword });

  ctx.body = {
    success: true,
    message: '密码重置成功'
  };
};

export const deleteUser = async (ctx: AuthContext) => {
  const currentUserRole = ctx.state.user.role;
  
  if (currentUserRole !== UserRole.ADMIN) {
    ctx.status = 403;
    ctx.body = {
      success: false,
      message: '只有管理员可以删除用户'
    };
    return;
  }

  const { id } = ctx.params;

  const user = await User.findByPk(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在'
    };
    return;
  }

  if (user.role === UserRole.ADMIN) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无法删除管理员用户'
    };
    return;
  }

  await user.destroy();

  ctx.body = {
    success: true,
    message: '用户删除成功'
  };
};
