import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Course extends Model {
  public id!: string;
  public name!: string;
  public code!: string;
  public categoryId!: string;
  public teacherId!: string;
  public credit!: number;
  public totalHours!: number;
  public maxStudents!: number;
  public currentStudents!: number;
  public description!: string;
  public syllabus!: string;
  public prerequisites!: string;
  public assessmentMethod!: string;
  public status!: 'draft' | 'published' | 'archived';
  public isHot!: boolean;
  public sortOrder!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '课程名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '课程编码',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '课程分类ID',
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '授课教师ID',
    },
    credit: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 2.0,
      comment: '学分',
    },
    totalHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 36,
      comment: '总学时',
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: '最大选课人数',
    },
    currentStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '当前选课人数',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '课程简介',
    },
    syllabus: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '教学大纲',
    },
    prerequisites: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '先修课程要求',
    },
    assessmentMethod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '考核方式',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
      comment: '状态：草稿/已发布/已归档',
    },
    isHot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否热门课程',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序顺序',
    },
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['code'] },
      { fields: ['categoryId'] },
      { fields: ['teacherId'] },
      { fields: ['status'] },
      { fields: ['isHot'] },
    ],
  }
);

export default Course;
