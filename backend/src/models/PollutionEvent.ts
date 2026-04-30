import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import MonitoringPoint from './MonitoringPoint';

interface PollutionEventAttributes {
  id?: number;
  monitoring_point_id: number;
  event_type: 'floating_trash' | 'chemical_pollution' | 'suspended_matter' | 'algae_bloom' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  detected_at: Date;
  resolved_at?: Date;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  created_at?: Date;
  updated_at?: Date;
}

class PollutionEvent extends Model<PollutionEventAttributes> implements PollutionEventAttributes {
  public id!: number;
  public monitoring_point_id!: number;
  public event_type!: 'floating_trash' | 'chemical_pollution' | 'suspended_matter' | 'algae_bloom' | 'other';
  public severity!: 'low' | 'medium' | 'high' | 'critical';
  public description?: string;
  public detected_at!: Date;
  public resolved_at?: Date;
  public status!: 'pending' | 'processing' | 'resolved' | 'closed';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PollutionEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    monitoring_point_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '监测点ID',
      references: {
        model: MonitoringPoint,
        key: 'id',
      },
    },
    event_type: {
      type: DataTypes.ENUM('floating_trash', 'chemical_pollution', 'suspended_matter', 'algae_bloom', 'other'),
      allowNull: false,
      comment: '污染类型',
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      comment: '严重程度',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述',
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '检测时间',
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '解决时间',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'resolved', 'closed'),
      defaultValue: 'pending',
      comment: '状态',
    },
  },
  {
    sequelize,
    tableName: 'pollution_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

PollutionEvent.belongsTo(MonitoringPoint, {
  foreignKey: 'monitoring_point_id',
  as: 'monitoringPoint',
});

MonitoringPoint.hasMany(PollutionEvent, {
  foreignKey: 'monitoring_point_id',
  as: 'pollutionEvents',
});

export default PollutionEvent;
