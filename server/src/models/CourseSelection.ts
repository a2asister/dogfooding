import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CourseSelection extends Model {
  public id!: string;
  public studentId!: string;
  public courseId!: string;
  public batchId!: string;
  public status!: 'selected' | 'dropped' | 'completed';
  public score!: number | null;
  public grade!: 'A' | 'B' | 'C' | 'D' | 'F' | null;
  public isPassed!: boolean | null;
  public comment!: string | null;
  public gradedAt!: Date | null;
  public isGraded!: boolean;
  public selectedAt!: Date;
  public droppedAt!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

CourseSelection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '学生ID',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '课程ID',
    },
    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '选课批次ID',
    },
    status: {
      type: DataTypes.ENUM('selected', 'dropped', 'completed'),
      allowNull: false,
      defaultValue: 'selected',
      comment: '状态：已选/已退课/已完成',
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '成绩',
    },
    grade: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'F'),
      allowNull: true,
      comment: '等级：A/B/C/D/F',
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: '是否通过',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '评语',
    },
    gradedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '成绩录入时间',
    },
    isGraded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已录入成绩',
    },
    selectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '选课时间',
    },
    droppedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '退课时间',
    },
  },
  {
    sequelize,
    tableName: 'course_selections',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['studentId', 'courseId', 'batchId'] },
      { fields: ['studentId'] },
      { fields: ['courseId'] },
      { fields: ['batchId'] },
      { fields: ['status'] },
    ],
  }
);

export default CourseSelection;
