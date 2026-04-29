import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Grade extends Model {
  public id!: string;
  public name!: string;
  public year!: number;
  public description!: string;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Grade.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '年级名称，如：2024级',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '入学年份',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
    },
  },
  {
    sequelize,
    tableName: 'grades',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['year'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Grade;
