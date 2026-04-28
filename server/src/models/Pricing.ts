import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum ServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  OVERNIGHT = 'overnight',
  ECONOMY = 'economy'
}

export enum PricingRuleType {
  WEIGHT_BASED = 'weight_based',
  VOLUME_BASED = 'volume_based',
  DISTANCE_BASED = 'distance_based',
  FLAT_RATE = 'flat_rate'
}

export interface PricingRuleAttributes {
  id?: number;
  name: string;
  code: string;
  serviceType: ServiceType;
  type: PricingRuleType;
  fromProvince?: string;
  fromCity?: string;
  toProvince?: string;
  toCity?: string;
  fromZone?: number;
  toZone?: number;
  minWeight?: number;
  maxWeight?: number;
  minVolume?: number;
  maxVolume?: number;
  baseFee?: number;
  perKgFee?: number;
  perCbmFee?: number;
  perKmFee?: number;
  minFee?: number;
  maxFee?: number;
  isInsured: boolean;
  insuranceRate?: number;
  priority: number;
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class PricingRule extends Model<PricingRuleAttributes> implements PricingRuleAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public serviceType!: ServiceType;
  public type!: PricingRuleType;
  public fromProvince?: string;
  public fromCity?: string;
  public toProvince?: string;
  public toCity?: string;
  public fromZone?: number;
  public toZone?: number;
  public minWeight?: number;
  public maxWeight?: number;
  public minVolume?: number;
  public maxVolume?: number;
  public baseFee?: number;
  public perKgFee?: number;
  public perCbmFee?: number;
  public perKmFee?: number;
  public minFee?: number;
  public maxFee?: number;
  public isInsured!: boolean;
  public insuranceRate?: number;
  public priority!: number;
  public isActive!: boolean;
  public validFrom?: Date;
  public validTo?: Date;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

PricingRule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    serviceType: {
      type: DataTypes.ENUM(...Object.values(ServiceType)),
      allowNull: false,
      defaultValue: ServiceType.STANDARD,
      field: 'service_type'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PricingRuleType)),
      allowNull: false,
      defaultValue: PricingRuleType.WEIGHT_BASED
    },
    fromProvince: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'from_province'
    },
    fromCity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'from_city'
    },
    toProvince: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'to_province'
    },
    toCity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'to_city'
    },
    fromZone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'from_zone'
    },
    toZone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'to_zone'
    },
    minWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field: 'min_weight',
      comment: '最小重量，单位：kg'
    },
    maxWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      field: 'max_weight',
      comment: '最大重量，单位：kg'
    },
    minVolume: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field: 'min_volume',
      comment: '最小体积，单位：m³'
    },
    maxVolume: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field: 'max_volume',
      comment: '最大体积，单位：m³'
    },
    baseFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'base_fee'
    },
    perKgFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'per_kg_fee'
    },
    perCbmFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'per_cbm_fee'
    },
    perKmFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'per_km_fee'
    },
    minFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'min_fee'
    },
    maxFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'max_fee'
    },
    isInsured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_insured'
    },
    insuranceRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      field: 'insurance_rate',
      comment: '保费率，如0.005表示0.5%'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '优先级，数值越大优先级越高'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'valid_from'
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'valid_to'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'pricing_rules',
    modelName: 'PricingRule',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);

export interface WeightBillingAttributes {
  id?: number;
  waybillId: number;
  orderId: number;
  packageCount: number;
  totalWeight: number;
  totalVolume?: number;
  chargeableWeight: number;
  weightUnit: string;
  weighingTime: Date;
  operatorId?: number;
  deviceId?: string;
  isManual: boolean;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class WeightBilling extends Model<WeightBillingAttributes> implements WeightBillingAttributes {
  public id!: number;
  public waybillId!: number;
  public orderId!: number;
  public packageCount!: number;
  public totalWeight!: number;
  public totalVolume?: number;
  public chargeableWeight!: number;
  public weightUnit!: string;
  public weighingTime!: Date;
  public operatorId?: number;
  public deviceId?: string;
  public isManual!: boolean;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

WeightBilling.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    waybillId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'waybill_id'
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id'
    },
    packageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'package_count'
    },
    totalWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field: 'total_weight',
      comment: '实际总重量，单位：kg'
    },
    totalVolume: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field: 'total_volume',
      comment: '总体积，单位：m³'
    },
    chargeableWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      field: 'chargeable_weight',
      comment: '计费重量'
    },
    weightUnit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'kg',
      field: 'weight_unit'
    },
    weighingTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'weighing_time'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'operator_id'
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'device_id'
    },
    isManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_manual'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'weight_billings',
    modelName: 'WeightBilling',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
