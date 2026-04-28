import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum ReturnType {
  EXCHANGE = 'exchange',
  REFUND = 'refund',
  REJECT = 'reject'
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ClaimStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CLOSED = 'closed'
}

export enum ClaimType {
  DAMAGE = 'damage',
  LOST = 'lost',
  DELAY = 'delay',
  SERVICE = 'service',
  OTHER = 'other'
}

export interface ReturnAttributes {
  id?: number;
  orderId: number;
  waybillId?: number;
  type: ReturnType;
  status: ReturnStatus;
  returnWaybillNo?: string;
  requestReason: string;
  requestDescription?: string;
  requestedAt: Date;
  requestedBy?: number;
  approvedAt?: Date;
  approvedBy?: number;
  approvalComment?: string;
  receivedAt?: Date;
  receivedBy?: number;
  inspectionResult?: string;
  inspectionStatus?: string;
  refundAmount?: number;
  processedAt?: Date;
  processedBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Return extends Model<ReturnAttributes> implements ReturnAttributes {
  public id!: number;
  public orderId!: number;
  public waybillId?: number;
  public type!: ReturnType;
  public status!: ReturnStatus;
  public returnWaybillNo?: string;
  public requestReason!: string;
  public requestDescription?: string;
  public requestedAt!: Date;
  public requestedBy?: number;
  public approvedAt?: Date;
  public approvedBy?: number;
  public approvalComment?: string;
  public receivedAt?: Date;
  public receivedBy?: number;
  public inspectionResult?: string;
  public inspectionStatus?: string;
  public refundAmount?: number;
  public processedAt?: Date;
  public processedBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Return.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id'
    },
    waybillId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'waybill_id'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ReturnType)),
      allowNull: false,
      defaultValue: ReturnType.REFUND
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReturnStatus)),
      allowNull: false,
      defaultValue: ReturnStatus.REQUESTED
    },
    returnWaybillNo: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'return_waybill_no'
    },
    requestReason: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'request_reason'
    },
    requestDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'request_description'
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'requested_at'
    },
    requestedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'requested_by'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
    },
    approvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'approved_by'
    },
    approvalComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'approval_comment'
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'received_at'
    },
    receivedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'received_by'
    },
    inspectionResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'inspection_result'
    },
    inspectionStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'inspection_status'
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'refund_amount'
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at'
    },
    processedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'processed_by'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'returns',
    modelName: 'Return',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);

export interface ClaimAttributes {
  id?: number;
  orderId?: number;
  waybillId?: number;
  exceptionItemId?: number;
  type: ClaimType;
  status: ClaimStatus;
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  claimAmount: number;
  claimReason: string;
  claimDescription?: string;
  evidenceUrls?: string;
  submittedAt: Date;
  submittedBy?: number;
  assignedTo?: number;
  assignedAt?: Date;
  reviewComment?: string;
  reviewedAt?: Date;
  reviewedBy?: number;
  approvedAmount?: number;
  payoutAmount?: number;
  paidAt?: Date;
  paidBy?: number;
  closedAt?: Date;
  closedBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Claim extends Model<ClaimAttributes> implements ClaimAttributes {
  public id!: number;
  public orderId?: number;
  public waybillId?: number;
  public exceptionItemId?: number;
  public type!: ClaimType;
  public status!: ClaimStatus;
  public claimantName!: string;
  public claimantPhone!: string;
  public claimantEmail?: string;
  public claimAmount!: number;
  public claimReason!: string;
  public claimDescription?: string;
  public evidenceUrls?: string;
  public submittedAt!: Date;
  public submittedBy?: number;
  public assignedTo?: number;
  public assignedAt?: Date;
  public reviewComment?: string;
  public reviewedAt?: Date;
  public reviewedBy?: number;
  public approvedAmount?: number;
  public payoutAmount?: number;
  public paidAt?: Date;
  public paidBy?: number;
  public closedAt?: Date;
  public closedBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Claim.init(
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
    exceptionItemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'exception_item_id'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ClaimType)),
      allowNull: false,
      defaultValue: ClaimType.OTHER
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ClaimStatus)),
      allowNull: false,
      defaultValue: ClaimStatus.PENDING
    },
    claimantName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'claimant_name'
    },
    claimantPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'claimant_phone'
    },
    claimantEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'claimant_email'
    },
    claimAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'claim_amount'
    },
    claimReason: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'claim_reason'
    },
    claimDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'claim_description'
    },
    evidenceUrls: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'evidence_urls',
      comment: 'JSON格式存储多个证据URL'
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at'
    },
    submittedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'submitted_by'
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
    reviewComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'review_comment'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    },
    reviewedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'reviewed_by'
    },
    approvedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'approved_amount'
    },
    payoutAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'payout_amount'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    paidBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'paid_by'
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
    tableName: 'claims',
    modelName: 'Claim',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
