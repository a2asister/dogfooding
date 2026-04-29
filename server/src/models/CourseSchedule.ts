import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CourseSchedule extends Model {
  public id!: string;
  public courseId!: string;
  public dayOfWeek!: number;
  public startPeriod!: number;
  public endPeriod!: number;
  public location!: string;
  public startWeek!: number;
  public endWeek!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CourseSchedule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '课程ID',
    },
    dayOfWeek: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '星期几：1-7 代表周一到周日',
    },
    startPeriod: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '开始节次',
    },
    endPeriod: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '结束节次',
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '上课地点',
    },
    startWeek: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '开始周',
    },
    endWeek: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 16,
      comment: '结束周',
    },
  },
  {
    sequelize,
    tableName: 'course_schedules',
    timestamps: true,
    indexes: [
      { fields: ['courseId'] },
      { fields: ['dayOfWeek'] },
      { fields: ['startPeriod', 'endPeriod'] },
    ],
  }
);

export default CourseSchedule;
