import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Class extends Model {
  public id!: string;
  public name!: string;
  public gradeId!: string;
  public description!: string;
  public studentCount!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Class.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '班级名称，如：计算机1班',
    },
    gradeId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '年级ID',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述',
    },
    studentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '学生人数',
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
    tableName: 'classes',
    timestamps: true,
    indexes: [
      { fields: ['gradeId'] },
      { fields: ['isActive'] },
    ],
  }
);

export default Class;
