import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum ExceptionType {
  LOST = 'lost',
  DAMAGED = 'damaged',
  DELAYED = 'delayed',
  RETURNED = 'returned',
  REJECTED = 'rejected',
  ADDRESS_ERROR = 'address_error',
  CONTACT_FAILED = 'contact_failed',
  PACKAGE_ABNORMAL = 'package_abnormal',
  OTHER = 'other'
}

export enum ExceptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed'
}

export enum ExceptionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ExceptionItemAttributes {
  id?: number;
  waybillId: number;
  type: ExceptionType;
  status: ExceptionStatus;
  priority: ExceptionPriority;
  detectedAt: Date;
  detectedBy?: number;
  location?: string;
  description: string;
  damageDescription?: string;
  estimatedLoss?: number;
  responsiblePersonId?: number;
  responsiblePersonName?: string;
  resolutionSteps?: string;
  resolutionCost?: number;
  resolvedAt?: Date;
  resolvedBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ExceptionItem extends Model<ExceptionItemAttributes> implements ExceptionItemAttributes {
  public id!: number;
  public waybillId!: number;
  public type!: ExceptionType;
  public status!: ExceptionStatus;
  public priority!: ExceptionPriority;
  public detectedAt!: Date;
  public detectedBy?: number;
  public location?: string;
  public description!: string;
  public damageDescription?: string;
  public estimatedLoss?: number;
  public responsiblePersonId?: number;
  public responsiblePersonName?: string;
  public resolutionSteps?: string;
  public resolutionCost?: number;
  public resolvedAt?: Date;
  public resolvedBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

ExceptionItem.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(ExceptionType)),
      allowNull: false,
      defaultValue: ExceptionType.OTHER
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ExceptionStatus)),
      allowNull: false,
      defaultValue: ExceptionStatus.PENDING
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(ExceptionPriority)),
      allowNull: false,
      defaultValue: ExceptionPriority.MEDIUM
    },
    detectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'detected_at'
    },
    detectedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'detected_by'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    damageDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'damage_description'
    },
    estimatedLoss: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'estimated_loss'
    },
    responsiblePersonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'responsible_person_id'
    },
    responsiblePersonName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'responsible_person_name'
    },
    resolutionSteps: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'resolution_steps'
    },
    resolutionCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'resolution_cost'
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resolved_at'
    },
    resolvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'resolved_by'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'exception_items',
    modelName: 'ExceptionItem',
    paranoid: true,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_waybill_id',
        fields: ['waybill_id']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_type',
        fields: ['type']
      }
    ]
  }
);
