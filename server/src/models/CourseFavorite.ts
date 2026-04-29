import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CourseFavorite extends Model {
  public id!: string;
  public studentId!: string;
  public courseId!: string;
  public createdAt!: Date;
}

CourseFavorite.init(
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
  },
  {
    sequelize,
    tableName: 'course_favorites',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['studentId', 'courseId'] },
      { fields: ['studentId'] },
      { fields: ['courseId'] },
    ],
  }
);

export default CourseFavorite;
