import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum VehicleType {
  VAN = 'van',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
  OTHER = 'other'
}

export interface VehicleAttributes {
  id?: number;
  plateNumber: string;
  type: VehicleType;
  brand: string;
  model: string;
  capacity: number;
  currentLoad?: number;
  status: VehicleStatus;
  branchId?: number;
  driverId?: number;
  purchaseDate?: Date;
  lastMaintenanceDate?: Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Vehicle extends Model<VehicleAttributes> implements VehicleAttributes {
  public id!: number;
  public plateNumber!: string;
  public type!: VehicleType;
  public brand!: string;
  public model!: string;
  public capacity!: number;
  public currentLoad?: number;
  public status!: VehicleStatus;
  public branchId?: number;
  public driverId?: number;
  public purchaseDate?: Date;
  public lastMaintenanceDate?: Date;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    plateNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'plate_number'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
      defaultValue: VehicleType.VAN
    },
    brand: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '载重容量，单位：吨'
    },
    currentLoad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'current_load',
      comment: '当前载重，单位：吨'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(VehicleStatus)),
      allowNull: false,
      defaultValue: VehicleStatus.AVAILABLE
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'branch_id'
    },
    driverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'driver_id'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'purchase_date'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_maintenance_date'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'vehicles',
    modelName: 'Vehicle',
    paranoid: true,
    timestamps: true,
    underscored: true
  }
);
