import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import type { UserRole } from '../types';

class User extends Model {
  public id!: string;
  public username!: string;
  public password!: string;
  public name!: string;
  public role!: UserRole;
  public email!: string;
  public phone!: string;
  public avatar!: string;
  public studentNo!: string;
  public teacherNo!: string;
  public gradeId!: string | null;
  public classId!: string | null;
  public isActive!: boolean;
  public lastLoginAt!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名（学号/工号）',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码（加密）',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '姓名',
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
      defaultValue: 'student',
      comment: '角色：管理员/教师/学生',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL',
    },
    studentNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: '学号（学生专用）',
    },
    teacherNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: '工号（教师专用）',
    },
    gradeId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '年级ID',
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '班级ID',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['studentNo'] },
      { unique: true, fields: ['teacherNo'] },
      { fields: ['role'] },
      { fields: ['gradeId'] },
      { fields: ['classId'] },
    ],
  }
);

export default User;
