import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  COURIER = 'courier',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  branchId?: number;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public name!: string;
  public phone!: string;
  public email?: string;
  public role!: UserRole;
  public status!: UserStatus;
  public branchId?: number;
  public avatar?: string;
  public lastLoginAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.OPERATOR
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'branch_id'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
