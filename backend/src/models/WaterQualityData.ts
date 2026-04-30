import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import MonitoringPoint from './MonitoringPoint';

interface WaterQualityDataAttributes {
  id?: number;
  monitoring_point_id: number;
  ph?: number;
  temperature?: number;
  turbidity?: number;
  dissolved_oxygen?: number;
  conductivity?: number;
  ammonia_nitrogen?: number;
  total_phosphorus?: number;
  collected_at: Date;
  created_at?: Date;
}

class WaterQualityData extends Model<WaterQualityDataAttributes> implements WaterQualityDataAttributes {
  public id!: number;
  public monitoring_point_id!: number;
  public ph?: number;
  public temperature?: number;
  public turbidity?: number;
  public dissolved_oxygen?: number;
  public conductivity?: number;
  public ammonia_nitrogen?: number;
  public total_phosphorus?: number;
  public collected_at!: Date;
  public readonly created_at!: Date;
}

WaterQualityData.init(
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
    ph: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'pH值',
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '温度(°C)',
    },
    turbidity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '浊度(NTU)',
    },
    dissolved_oxygen: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: '溶解氧(mg/L)',
    },
    conductivity: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: '电导率(μS/cm)',
    },
    ammonia_nitrogen: {
      type: DataTypes.DECIMAL(6, 4),
      allowNull: true,
      comment: '氨氮(mg/L)',
    },
    total_phosphorus: {
      type: DataTypes.DECIMAL(6, 4),
      allowNull: true,
      comment: '总磷(mg/L)',
    },
    collected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '采集时间',
    },
  },
  {
    sequelize,
    tableName: 'water_quality_data',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

WaterQualityData.belongsTo(MonitoringPoint, {
  foreignKey: 'monitoring_point_id',
  as: 'monitoringPoint',
});

MonitoringPoint.hasMany(WaterQualityData, {
  foreignKey: 'monitoring_point_id',
  as: 'waterQualityData',
});

export default WaterQualityData;
