import { Context } from 'koa';
import { Op } from 'sequelize';
import { 
  InventoryItem, 
  InventoryType, 
  InventoryStatus,
  Branch
} from '../models';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: string;
    };
  };
}

export const getInventoryItems = async (ctx: AuthContext) => {
  const { page = 1, pageSize = 10, status, type, keyword, branchId } = ctx.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (branchId) {
    where.branchId = branchId;
  }

  if (keyword) {
    where[Op.or] = [
      { sku: { [Op.like]: `%${keyword}%` } },
      { name: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await InventoryItem.findAndCountAll({
    where,
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

export const getInventoryItemById = async (ctx: Context) => {
  const { id } = ctx.params;

  const item = await InventoryItem.findByPk(id, {
    include: [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'code', 'name'],
        required: false
      }
    ]
  });

  if (!item) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '物料不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: item
  };
};

export const createInventoryItem = async (ctx: AuthContext) => {
  const itemData = ctx.request.body as Partial<InventoryItem>;

  const requiredFields = ['sku', 'name', 'type', 'unit', 'currentStock', 'minStock'];

  const missingFields = requiredFields.filter((field) => !itemData[field as keyof typeof itemData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const existing = await InventoryItem.findOne({ where: { sku: itemData.sku } });
  if (existing) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'SKU已存在'
    };
    return;
  }

  let status = InventoryStatus.IN_STOCK;
  const currentStock = Number(itemData.currentStock) || 0;
  const minStock = Number(itemData.minStock) || 0;
  
  if (currentStock === 0) {
    status = InventoryStatus.OUT_OF_STOCK;
  } else if (currentStock <= minStock) {
    status = InventoryStatus.LOW_STOCK;
  }

  const item = await InventoryItem.create({
    sku: itemData.sku as string,
    name: itemData.name as string,
    type: (itemData.type as InventoryType) || InventoryType.OTHER,
    description: itemData.description,
    unit: itemData.unit as string,
    currentStock: currentStock,
    minStock: minStock,
    maxStock: itemData.maxStock,
    unitPrice: itemData.unitPrice,
    totalValue: itemData.totalValue,
    branchId: itemData.branchId,
    location: itemData.location,
    status: status,
    remark: itemData.remark
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '物料创建成功',
    data: item
  };
};

export const updateInventoryItem = async (ctx: Context) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<InventoryItem>;

  const item = await InventoryItem.findByPk(id);

  if (!item) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '物料不存在'
    };
    return;
  }

  const { sku, ...allowedFields } = updateData;

  let status = item.status;
  if (allowedFields.currentStock !== undefined || allowedFields.minStock !== undefined) {
    const currentStock = allowedFields.currentStock !== undefined ? Number(allowedFields.currentStock) : item.currentStock;
    const minStock = allowedFields.minStock !== undefined ? Number(allowedFields.minStock) : item.minStock;
    
    if (currentStock === 0) {
      status = InventoryStatus.OUT_OF_STOCK;
    } else if (currentStock <= minStock) {
      status = InventoryStatus.LOW_STOCK;
    } else {
      status = InventoryStatus.IN_STOCK;
    }
  }

  await item.update({ ...allowedFields, status });

  ctx.body = {
    success: true,
    message: '物料更新成功',
    data: item
  };
};

export const updateStock = async (ctx: AuthContext) => {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { quantity, type, remark } = ctx.request.body as { 
    quantity: number; 
    type: 'in' | 'out';
    remark?: string;
  };

  if (quantity === undefined || !type) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '请提供数量和操作类型'
    };
    return;
  }

  const item = await InventoryItem.findByPk(id);

  if (!item) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '物料不存在'
    };
    return;
  }

  let newStock = item.currentStock;
  if (type === 'in') {
    newStock += quantity;
  } else if (type === 'out') {
    if (item.currentStock < quantity) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '库存不足'
      };
      return;
    }
    newStock -= quantity;
  }

  let status = item.status;
  if (newStock === 0) {
    status = InventoryStatus.OUT_OF_STOCK;
  } else if (newStock <= item.minStock) {
    status = InventoryStatus.LOW_STOCK;
  } else {
    status = InventoryStatus.IN_STOCK;
  }

  await item.update({
    currentStock: newStock,
    status,
    lastStocktakingAt: new Date(),
    lastStocktakingBy: userId
  });

  ctx.body = {
    success: true,
    message: type === 'in' ? '入库成功' : '出库成功',
    data: item
  };
};

export const deleteInventoryItem = async (ctx: Context) => {
  const { id } = ctx.params;

  const item = await InventoryItem.findByPk(id);

  if (!item) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '物料不存在'
    };
    return;
  }

  await item.destroy();

  ctx.body = {
    success: true,
    message: '物料删除成功'
  };
};
