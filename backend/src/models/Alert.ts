import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import MonitoringPoint from './MonitoringPoint';
import PollutionEvent from './PollutionEvent';

interface AlertAttributes {
  id?: number;
  monitoring_point_id: number;
  pollution_event_id?: number;
  alert_type: 'info' | 'warning' | 'danger';
  message: string;
  level: 'low' | 'medium' | 'high';
  is_read?: boolean;
  is_handled?: boolean;
  triggered_at?: Date;
  handled_at?: Date;
  created_at?: Date;
}

class Alert extends Model<AlertAttributes> implements AlertAttributes {
  public id!: number;
  public monitoring_point_id!: number;
  public pollution_event_id?: number;
  public alert_type!: 'info' | 'warning' | 'danger';
  public message!: string;
  public level!: 'low' | 'medium' | 'high';
  public is_read!: boolean;
  public is_handled!: boolean;
  public triggered_at!: Date;
  public handled_at?: Date;
  public readonly created_at!: Date;
}

Alert.init(
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
    pollution_event_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '污染事件ID',
      references: {
        model: PollutionEvent,
        key: 'id',
      },
    },
    alert_type: {
      type: DataTypes.ENUM('info', 'warning', 'danger'),
      allowNull: false,
      comment: '预警类型',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '预警消息',
    },
    level: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      comment: '优先级',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已读',
    },
    is_handled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已处理',
    },
    triggered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '触发时间',
    },
    handled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '处理时间',
    },
  },
  {
    sequelize,
    tableName: 'alerts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

Alert.belongsTo(MonitoringPoint, {
  foreignKey: 'monitoring_point_id',
  as: 'monitoringPoint',
});

Alert.belongsTo(PollutionEvent, {
  foreignKey: 'pollution_event_id',
  as: 'pollutionEvent',
});

MonitoringPoint.hasMany(Alert, {
  foreignKey: 'monitoring_point_id',
  as: 'alerts',
});

PollutionEvent.hasMany(Alert, {
  foreignKey: 'pollution_event_id',
  as: 'alerts',
});

export default Alert;
