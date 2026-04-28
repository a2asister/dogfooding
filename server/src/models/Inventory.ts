import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum InventoryType {
  PACKAGE_MATERIAL = 'package_material',
  TOOL = 'tool',
  OFFICE_SUPPLY = 'office_supply',
  OTHER = 'other'
}

export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface InventoryItemAttributes {
  id?: number;
  sku: string;
  name: string;
  type: InventoryType;
  description?: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice?: number;
  totalValue?: number;
  branchId?: number;
  location?: string;
  status: InventoryStatus;
  lastStocktakingAt?: Date;
  lastStocktakingBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class InventoryItem extends Model<InventoryItemAttributes> implements InventoryItemAttributes {
  public id!: number;
  public sku!: string;
  public name!: string;
  public type!: InventoryType;
  public description?: string;
  public unit!: string;
  public currentStock!: number;
  public minStock!: number;
  public maxStock?: number;
  public unitPrice?: number;
  public totalValue?: number;
  public branchId?: number;
  public location?: string;
  public status!: InventoryStatus;
  public lastStocktakingAt?: Date;
  public lastStocktakingBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

InventoryItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(InventoryType)),
      allowNull: false,
      defaultValue: InventoryType.OTHER
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '个'
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'current_stock'
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'min_stock'
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_stock'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'unit_price'
    },
    totalValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_value'
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'branch_id'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(InventoryStatus)),
      allowNull: false,
      defaultValue: InventoryStatus.IN_STOCK
    },
    lastStocktakingAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_stocktaking_at'
    },
    lastStocktakingBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'last_stocktaking_by'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'inventory_items',
    modelName: 'InventoryItem',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);

export enum FeedbackType {
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
  CONSULT = 'consult',
  PRAISE = 'praise',
  OTHER = 'other'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface FeedbackAttributes {
  id?: number;
  orderId?: number;
  waybillId?: number;
  type: FeedbackType;
  status: FeedbackStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subject: string;
  content: string;
  attachmentUrls?: string;
  submittedAt: Date;
  assignedTo?: number;
  assignedAt?: Date;
  responseContent?: string;
  responseAt?: Date;
  responseBy?: number;
  satisfaction?: number;
  closedAt?: Date;
  closedBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Feedback extends Model<FeedbackAttributes> implements FeedbackAttributes {
  public id!: number;
  public orderId?: number;
  public waybillId?: number;
  public type!: FeedbackType;
  public status!: FeedbackStatus;
  public customerName!: string;
  public customerPhone!: string;
  public customerEmail?: string;
  public subject!: string;
  public content!: string;
  public attachmentUrls?: string;
  public submittedAt!: Date;
  public assignedTo?: number;
  public assignedAt?: Date;
  public responseContent?: string;
  public responseAt?: Date;
  public responseBy?: number;
  public satisfaction?: number;
  public closedAt?: Date;
  public closedBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'order_id'
    },
    waybillId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'waybill_id'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(FeedbackType)),
      allowNull: false,
      defaultValue: FeedbackType.OTHER
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FeedbackStatus)),
      allowNull: false,
      defaultValue: FeedbackStatus.PENDING
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'customer_name'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'customer_phone'
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'customer_email'
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentUrls: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'attachment_urls',
      comment: 'JSON格式存储多个附件URL'
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at'
    },
    assignedTo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'assigned_to'
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'assigned_at'
    },
    responseContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'response_content'
    },
    responseAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'response_at'
    },
    responseBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'response_by'
    },
    satisfaction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '满意度评分 1-5'
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'closed_at'
    },
    closedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'closed_by'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'feedbacks',
    modelName: 'Feedback',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
