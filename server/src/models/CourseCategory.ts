import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CourseCategory extends Model {
  public id!: string;
  public name!: string;
  public code!: string;
  public description!: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CourseCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称，如：人文社科、自然科学',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类编码',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类描述',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序',
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
    tableName: 'course_categories',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['code'] },
      { fields: ['isActive'] },
      { fields: ['sortOrder'] },
    ],
  }
);

export default CourseCategory;
