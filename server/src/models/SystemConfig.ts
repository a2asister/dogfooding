import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SystemConfig extends Model {
  public id!: string;
  public key!: string;
  public value!: string;
  public description!: string;
  public group!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SystemConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '配置键',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '配置值',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '配置说明',
    },
    group: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'general',
      comment: '配置分组',
    },
  },
  {
    sequelize,
    tableName: 'system_configs',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['key'] },
      { fields: ['group'] },
    ],
  }
);

export default SystemConfig;
