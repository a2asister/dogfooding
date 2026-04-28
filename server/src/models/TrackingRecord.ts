import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum TrackingEvent {
  ORDER_CREATED = 'order_created',
  WAYBILL_CREATED = 'waybill_created',
  PICKUP_ASSIGNED = 'pickup_assigned',
  PICKED_UP = 'picked_up',
  ARRIVED_AT_BRANCH = 'arrived_at_branch',
  SORTED = 'sorted',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  ARRIVED_AT_TRANSIT_HUB = 'arrived_at_transit_hub',
  ARRIVED_AT_DELIVERY_BRANCH = 'arrived_at_delivery_branch',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  RETURN_REQUESTED = 'return_requested',
  RETURNED = 'returned',
  EXCEPTION = 'exception',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

export interface TrackingRecordAttributes {
  id?: number;
  waybillId: number;
  event: TrackingEvent;
  eventTime: Date;
  operatorId?: number;
  operatorName?: string;
  branchId?: number;
  branchName?: string;
  longitude?: number;
  latitude?: number;
  description: string;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TrackingRecord extends Model<TrackingRecordAttributes> implements TrackingRecordAttributes {
  public id!: number;
  public waybillId!: number;
  public event!: TrackingEvent;
  public eventTime!: Date;
  public operatorId?: number;
  public operatorName?: string;
  public branchId?: number;
  public branchName?: string;
  public longitude?: number;
  public latitude?: number;
  public description!: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TrackingRecord.init(
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
    event: {
      type: DataTypes.ENUM(...Object.values(TrackingEvent)),
      allowNull: false
    },
    eventTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'event_time'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'operator_id'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'operator_name'
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'branch_id'
    },
    branchName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'branch_name'
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'tracking_records',
    modelName: 'TrackingRecord',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_waybill_id',
        fields: ['waybill_id']
      },
      {
        name: 'idx_event_time',
        fields: ['event_time']
      }
    ]
  }
);
