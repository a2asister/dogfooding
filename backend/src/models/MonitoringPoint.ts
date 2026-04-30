import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface MonitoringPointAttributes {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'normal' | 'warning' | 'danger';
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

class MonitoringPoint extends Model<MonitoringPointAttributes> implements MonitoringPointAttributes {
  public id!: number;
  public name!: string;
  public latitude!: number;
  public longitude!: number;
  public status!: 'normal' | 'warning' | 'danger';
  public location?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MonitoringPoint.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '监测点名称',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '纬度',
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      comment: '经度',
    },
    status: {
      type: DataTypes.ENUM('normal', 'warning', 'danger'),
      defaultValue: 'normal',
      comment: '状态',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '位置描述',
    },
  },
  {
    sequelize,
    tableName: 'monitoring_points',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MonitoringPoint;
