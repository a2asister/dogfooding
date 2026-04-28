import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum WaybillStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  RETURNED = 'returned',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

export interface WaybillAttributes {
  id?: number;
  waybillNo: string;
  orderId: number;
  status: WaybillStatus;
  currentBranchId?: number;
  nextBranchId?: number;
  courierId?: number;
  vehicleId?: number;
  estimateDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  signedBy?: string;
  signedTime?: Date;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Waybill extends Model<WaybillAttributes> implements WaybillAttributes {
  public id!: number;
  public waybillNo!: string;
  public orderId!: number;
  public status!: WaybillStatus;
  public currentBranchId?: number;
  public nextBranchId?: number;
  public courierId?: number;
  public vehicleId?: number;
  public estimateDeliveryTime?: Date;
  public actualDeliveryTime?: Date;
  public signedBy?: string;
  public signedTime?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Waybill.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    waybillNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'waybill_no'
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WaybillStatus)),
      allowNull: false,
      defaultValue: WaybillStatus.CREATED
    },
    currentBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'current_branch_id'
    },
    nextBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'next_branch_id'
    },
    courierId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'courier_id'
    },
    vehicleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'vehicle_id'
    },
    estimateDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'estimate_delivery_time'
    },
    actualDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_delivery_time'
    },
    signedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'signed_by'
    },
    signedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'signed_time'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'waybills',
    modelName: 'Waybill',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
