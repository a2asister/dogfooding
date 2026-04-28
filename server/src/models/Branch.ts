import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum BranchType {
  HUB = 'hub',
  STATION = 'station',
  AGENCY = 'agency'
}

export interface BranchAttributes {
  id?: number;
  code: string;
  name: string;
  type: BranchType;
  province: string;
  city: string;
  district: string;
  address: string;
  longitude?: number;
  latitude?: number;
  contactPerson: string;
  contactPhone: string;
  parentId?: number;
  status: BranchStatus;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Branch extends Model<BranchAttributes> implements BranchAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public type!: BranchType;
  public province!: string;
  public city!: string;
  public district!: string;
  public address!: string;
  public longitude?: number;
  public latitude?: number;
  public contactPerson!: string;
  public contactPhone!: string;
  public parentId?: number;
  public status!: BranchStatus;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Branch.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(BranchType)),
      allowNull: false,
      defaultValue: BranchType.STATION
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'contact_person'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'contact_phone'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'parent_id'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BranchStatus)),
      allowNull: false,
      defaultValue: BranchStatus.ACTIVE
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'branches',
    modelName: 'Branch',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
