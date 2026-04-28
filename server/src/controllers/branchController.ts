import { Context } from 'koa';
import { Op } from 'sequelize';
import { Branch, BranchType, BranchStatus, User } from '../models';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: string;
    };
  };
}

const generateBranchCode = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BR${year}${month}${random}`;
};

export const getBranches = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, type, keyword } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (keyword) {
    where[Op.or] = [
      { code: { [Op.like]: `%${keyword}%` } },
      { name: { [Op.like]: `%${keyword}%` } },
      { contactPerson: { [Op.like]: `%${keyword}%` } },
      { contactPhone: { [Op.like]: `%${keyword}%` } },
      { address: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Branch.findAndCountAll({
    where,
    include: [
      {
        model: Branch,
        as: 'parent',
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

export const getBranchById = async (ctx: Context) => {
  const { id } = ctx.params;

  const branch = await Branch.findByPk(id, {
    include: [
      {
        model: Branch,
        as: 'parent',
        attributes: ['id', 'code', 'name'],
        required: false
      },
      {
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'name', 'phone', 'role', 'status'],
        required: false
      }
    ]
  });

  if (!branch) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '网点不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: branch
  };
};

export const createBranch = async (ctx: AuthContext) => {
  const branchData = ctx.request.body as Partial<Branch>;

  const requiredFields = [
    'name', 'type', 'province', 'city', 'district', 'address',
    'contactPerson', 'contactPhone'
  ];

  const missingFields = requiredFields.filter((field) => !branchData[field as keyof typeof branchData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const code = generateBranchCode();

  const branch = await Branch.create({
    code,
    name: branchData.name as string,
    type: (branchData.type as BranchType) || BranchType.STATION,
    province: branchData.province as string,
    city: branchData.city as string,
    district: branchData.district as string,
    address: branchData.address as string,
    longitude: branchData.longitude,
    latitude: branchData.latitude,
    contactPerson: branchData.contactPerson as string,
    contactPhone: branchData.contactPhone as string,
    parentId: branchData.parentId,
    status: BranchStatus.ACTIVE,
    description: branchData.description
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '网点创建成功',
    data: branch
  };
};

export const updateBranch = async (ctx: Context) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<Branch>;

  const branch = await Branch.findByPk(id);

  if (!branch) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '网点不存在'
    };
    return;
  }

  const { code, ...allowedFields } = updateData;

  await branch.update(allowedFields);

  ctx.body = {
    success: true,
    message: '网点更新成功',
    data: branch
  };
};

export const updateBranchStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body as { status: BranchStatus };

  if (!Object.values(BranchStatus).includes(status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无效的状态值'
    };
    return;
  }

  const branch = await Branch.findByPk(id);

  if (!branch) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '网点不存在'
    };
    return;
  }

  await branch.update({ status });

  ctx.body = {
    success: true,
    message: '状态更新成功',
    data: branch
  };
};

export const deleteBranch = async (ctx: Context) => {
  const { id } = ctx.params;

  const branch = await Branch.findByPk(id);

  if (!branch) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '网点不存在'
    };
    return;
  }

  const childCount = await Branch.count({ where: { parentId: id } });
  if (childCount > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该网点存在下级网点，无法删除'
    };
    return;
  }

  const userCount = await User.count({ where: { branchId: id } });
  if (userCount > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该网点存在关联人员，无法删除'
    };
    return;
  }

  await branch.destroy();

  ctx.body = {
    success: true,
    message: '网点删除成功'
  };
};
