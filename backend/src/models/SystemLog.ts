import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SystemLogAttributes {
  id?: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  module?: string;
  message: string;
  context?: object;
  created_at?: Date;
}

class SystemLog extends Model<SystemLogAttributes> implements SystemLogAttributes {
  public id!: number;
  public level!: 'error' | 'warn' | 'info' | 'debug';
  public module?: string;
  public message!: string;
  public context?: object;
  public readonly created_at!: Date;
}

SystemLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM('error', 'warn', 'info', 'debug'),
      allowNull: false,
      comment: '日志级别',
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '模块',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '日志消息',
    },
    context: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '上下文信息',
    },
  },
  {
    sequelize,
    tableName: 'system_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default SystemLog;
