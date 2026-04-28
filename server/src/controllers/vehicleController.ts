import { Context } from 'koa';
import { Op } from 'sequelize';
import { Vehicle, VehicleType, VehicleStatus, Branch, User } from '../models';

interface AuthContext extends Context {
  state: {
    user: {
      userId: number;
      username: string;
      role: string;
    };
  };
}

export const getVehicles = async (ctx: AuthContext) => {
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
      { plateNumber: { [Op.like]: `%${keyword}%` } },
      { brand: { [Op.like]: `%${keyword}%` } },
      { model: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { count, rows } = await Vehicle.findAndCountAll({
    where,
    include: [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'code', 'name'],
        required: false
      },
      {
        model: User,
        as: 'driver',
        attributes: ['id', 'username', 'name', 'phone'],
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

export const getVehicleById = async (ctx: Context) => {
  const { id } = ctx.params;

  const vehicle = await Vehicle.findByPk(id, {
    include: [
      {
        model: Branch,
        as: 'branch',
        attributes: ['id', 'code', 'name'],
        required: false
      },
      {
        model: User,
        as: 'driver',
        attributes: ['id', 'username', 'name', 'phone'],
        required: false
      }
    ]
  });

  if (!vehicle) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '车辆不存在'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: vehicle
  };
};

export const createVehicle = async (ctx: AuthContext) => {
  const vehicleData = ctx.request.body as Partial<Vehicle>;

  const requiredFields = ['plateNumber', 'type', 'brand', 'model', 'capacity'];

  const missingFields = requiredFields.filter((field) => !vehicleData[field as keyof typeof vehicleData]);

  if (missingFields.length > 0) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: `缺少必填字段: ${missingFields.join(', ')}`
    };
    return;
  }

  const existing = await Vehicle.findOne({ where: { plateNumber: vehicleData.plateNumber } });
  if (existing) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '该车牌号已存在'
    };
    return;
  }

  const vehicle = await Vehicle.create({
    plateNumber: vehicleData.plateNumber as string,
    type: (vehicleData.type as VehicleType) || VehicleType.VAN,
    brand: vehicleData.brand as string,
    model: vehicleData.model as string,
    capacity: vehicleData.capacity as number,
    currentLoad: vehicleData.currentLoad || 0,
    status: VehicleStatus.AVAILABLE,
    branchId: vehicleData.branchId,
    driverId: vehicleData.driverId,
    purchaseDate: vehicleData.purchaseDate,
    lastMaintenanceDate: vehicleData.lastMaintenanceDate,
    description: vehicleData.description
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '车辆创建成功',
    data: vehicle
  };
};

export const updateVehicle = async (ctx: Context) => {
  const { id } = ctx.params;
  const updateData = ctx.request.body as Partial<Vehicle>;

  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '车辆不存在'
    };
    return;
  }

  const { plateNumber, ...allowedFields } = updateData;

  await vehicle.update(allowedFields);

  ctx.body = {
    success: true,
    message: '车辆更新成功',
    data: vehicle
  };
};

export const updateVehicleStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { status } = ctx.request.body as { status: VehicleStatus };

  if (!Object.values(VehicleStatus).includes(status)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '无效的状态值'
    };
    return;
  }

  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '车辆不存在'
    };
    return;
  }

  await vehicle.update({ status });

  ctx.body = {
    success: true,
    message: '状态更新成功',
    data: vehicle
  };
};

export const assignDriver = async (ctx: Context) => {
  const { id } = ctx.params;
  const { driverId } = ctx.request.body as { driverId: number };

  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '车辆不存在'
    };
    return;
  }

  if (driverId) {
    const driver = await User.findByPk(driverId);
    if (!driver) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '司机不存在'
      };
      return;
    }
  }

  await vehicle.update({ driverId });

  ctx.body = {
    success: true,
    message: driverId ? '司机分配成功' : '已移除司机',
    data: vehicle
  };
};

export const deleteVehicle = async (ctx: Context) => {
  const { id } = ctx.params;

  const vehicle = await Vehicle.findByPk(id);

  if (!vehicle) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '车辆不存在'
    };
    return;
  }

  if (vehicle.status === VehicleStatus.IN_USE) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '车辆正在使用中，无法删除'
    };
    return;
  }

  await vehicle.destroy();

  ctx.body = {
    success: true,
    message: '车辆删除成功'
  };
};
