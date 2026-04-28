import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKUP_ASSIGNED = 'pickup_assigned',
  PICKED_UP = 'picked_up',
  TRANSFERRING = 'transferring',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PackageType {
  DOCUMENT = 'document',
  PARCEL = 'parcel',
  FRAGILE = 'fragile',
  LIQUID = 'liquid',
  OTHER = 'other'
}

export enum PaymentMethod {
  ONLINE = 'online',
  COD = 'cod',
  PREPAID = 'prepaid',
  MONTHLY = 'monthly'
}

export interface OrderAttributes {
  id?: number;
  orderNo: string;
  customerId?: number;
  senderName: string;
  senderPhone: string;
  senderProvince: string;
  senderCity: string;
  senderDistrict: string;
  senderAddress: string;
  senderLongitude?: number;
  senderLatitude?: number;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  receiverLongitude?: number;
  receiverLatitude?: number;
  packageName: string;
  packageType: PackageType;
  packageCount: number;
  packageWeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  volume?: number;
  declaredValue?: number;
  isInsured: boolean;
  insuranceFee?: number;
  serviceType: string;
  pickupTime?: Date;
  deliveryTime?: Date;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount?: number;
  paidAmount?: number;
  paidAt?: Date;
  courierId?: number;
  pickupBranchId?: number;
  deliveryBranchId?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public customerId?: number;
  public senderName!: string;
  public senderPhone!: string;
  public senderProvince!: string;
  public senderCity!: string;
  public senderDistrict!: string;
  public senderAddress!: string;
  public senderLongitude?: number;
  public senderLatitude?: number;
  public receiverName!: string;
  public receiverPhone!: string;
  public receiverProvince!: string;
  public receiverCity!: string;
  public receiverDistrict!: string;
  public receiverAddress!: string;
  public receiverLongitude?: number;
  public receiverLatitude?: number;
  public packageName!: string;
  public packageType!: PackageType;
  public packageCount!: number;
  public packageWeight?: number;
  public packageLength?: number;
  public packageWidth?: number;
  public packageHeight?: number;
  public volume?: number;
  public declaredValue?: number;
  public isInsured!: boolean;
  public insuranceFee?: number;
  public serviceType!: string;
  public pickupTime?: Date;
  public deliveryTime?: Date;
  public status!: OrderStatus;
  public paymentMethod!: PaymentMethod;
  public totalAmount?: number;
  public paidAmount?: number;
  public paidAt?: Date;
  public courierId?: number;
  public pickupBranchId?: number;
  public deliveryBranchId?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'order_no'
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'customer_id'
    },
    senderName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sender_name'
    },
    senderPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'sender_phone'
    },
    senderProvince: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sender_province'
    },
    senderCity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sender_city'
    },
    senderDistrict: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sender_district'
    },
    senderAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'sender_address'
    },
    senderLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'sender_longitude'
    },
    senderLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'sender_latitude'
    },
    receiverName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'receiver_name'
    },
    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'receiver_phone'
    },
    receiverProvince: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'receiver_province'
    },
    receiverCity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'receiver_city'
    },
    receiverDistrict: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'receiver_district'
    },
    receiverAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'receiver_address'
    },
    receiverLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'receiver_longitude'
    },
    receiverLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'receiver_latitude'
    },
    packageName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'package_name'
    },
    packageType: {
      type: DataTypes.ENUM(...Object.values(PackageType)),
      allowNull: false,
      defaultValue: PackageType.PARCEL,
      field: 'package_type'
    },
    packageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'package_count'
    },
    packageWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field: 'package_weight',
      comment: '重量，单位：kg'
    },
    packageLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'package_length',
      comment: '长度，单位：cm'
    },
    packageWidth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'package_width',
      comment: '宽度，单位：cm'
    },
    packageHeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'package_height',
      comment: '高度，单位：cm'
    },
    volume: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: '体积，单位：m³'
    },
    declaredValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'declared_value'
    },
    isInsured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_insured'
    },
    insuranceFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'insurance_fee'
    },
    serviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'standard',
      field: 'service_type'
    },
    pickupTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'pickup_time'
    },
    deliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivery_time'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
      defaultValue: PaymentMethod.ONLINE,
      field: 'payment_method'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_amount'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'paid_amount'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    courierId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'courier_id'
    },
    pickupBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'pickup_branch_id'
    },
    deliveryBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'delivery_branch_id'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
