import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ElectiveBatch extends Model {
  public id!: string;
  public name!: string;
  public academicYear!: string;
  public semester!: string;
  public startDate!: Date;
  public endDate!: Date;
  public gradeIds!: string;
  public maxCredits!: number;
  public minCredits!: number;
  public status!: 'pending' | 'active' | 'ended' | 'cancelled';
  public description!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ElectiveBatch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '批次名称，如：2024-2025学年第一学期',
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '学年，如：2024-2025',
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '学期，如：第一学期、第二学期',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '选课开始时间',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '选课结束时间',
    },
    gradeIds: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '可选年级ID列表',
    },
    maxCredits: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 10.0,
      comment: '最大可选学分',
    },
    minCredits: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 2.0,
      comment: '最小可选学分',
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'ended', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态：待开始/进行中/已结束/已取消',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述',
    },
  },
  {
    sequelize,
    tableName: 'elective_batches',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['startDate', 'endDate'] },
    ],
  }
);

export default ElectiveBatch;
