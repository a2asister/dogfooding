import { User, UserRole, UserStatus } from './User';
import { Branch, BranchType, BranchStatus } from './Branch';
import { Vehicle, VehicleType, VehicleStatus } from './Vehicle';
import { Order, OrderStatus, PackageType, PaymentMethod } from './Order';
import { Waybill, WaybillStatus } from './Waybill';
import { TrackingRecord, TrackingEvent } from './TrackingRecord';
import { ExceptionItem, ExceptionType, ExceptionStatus, ExceptionPriority } from './ExceptionItem';
import { Return, Claim, ReturnType, ReturnStatus, ClaimStatus, ClaimType } from './Return';
import { InventoryItem, Feedback, InventoryType, InventoryStatus, FeedbackType, FeedbackStatus } from './Inventory';
import { PricingRule, WeightBilling, ServiceType, PricingRuleType } from './Pricing';

Branch.hasMany(User, { foreignKey: 'branchId', as: 'users' });
User.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

Branch.hasMany(Vehicle, { foreignKey: 'branchId', as: 'vehicles' });
Vehicle.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Vehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Branch.hasMany(Order, { foreignKey: 'pickupBranchId', as: 'pickupOrders' });
Branch.hasMany(Order, { foreignKey: 'deliveryBranchId', as: 'deliveryOrders' });
Order.belongsTo(Branch, { foreignKey: 'pickupBranchId', as: 'pickupBranch' });
Order.belongsTo(Branch, { foreignKey: 'deliveryBranchId', as: 'deliveryBranch' });
Order.belongsTo(User, { foreignKey: 'courierId', as: 'courier' });

Order.hasOne(Waybill, { foreignKey: 'orderId', as: 'waybill' });
Waybill.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Waybill.belongsTo(Branch, { foreignKey: 'currentBranchId', as: 'currentBranch' });
Waybill.belongsTo(Branch, { foreignKey: 'nextBranchId', as: 'nextBranch' });
Waybill.belongsTo(User, { foreignKey: 'courierId', as: 'courier' });
Waybill.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Waybill.hasMany(TrackingRecord, { foreignKey: 'waybillId', as: 'trackingRecords' });
TrackingRecord.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
TrackingRecord.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
TrackingRecord.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

Waybill.hasMany(ExceptionItem, { foreignKey: 'waybillId', as: 'exceptionItems' });
ExceptionItem.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
ExceptionItem.belongsTo(User, { foreignKey: 'detectedBy', as: 'detector' });
ExceptionItem.belongsTo(User, { foreignKey: 'responsiblePersonId', as: 'responsiblePerson' });
ExceptionItem.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

Order.hasMany(Return, { foreignKey: 'orderId', as: 'returns' });
Return.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Return.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
Return.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
Return.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Return.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

Order.hasMany(Claim, { foreignKey: 'orderId', as: 'claims' });
Waybill.hasMany(Claim, { foreignKey: 'waybillId', as: 'claims' });
ExceptionItem.hasMany(Claim, { foreignKey: 'exceptionItemId', as: 'claims' });
Claim.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Claim.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
Claim.belongsTo(ExceptionItem, { foreignKey: 'exceptionItemId', as: 'exceptionItem' });
Claim.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });
Claim.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Claim.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

Branch.hasMany(InventoryItem, { foreignKey: 'branchId', as: 'inventoryItems' });
InventoryItem.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

Order.hasMany(Feedback, { foreignKey: 'orderId', as: 'feedbacks' });
Waybill.hasMany(Feedback, { foreignKey: 'waybillId', as: 'feedbacks' });
Feedback.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Feedback.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
Feedback.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Feedback.belongsTo(User, { foreignKey: 'responseBy', as: 'responder' });

WeightBilling.belongsTo(Waybill, { foreignKey: 'waybillId', as: 'waybill' });
WeightBilling.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
WeightBilling.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export {
  User,
  UserRole,
  UserStatus,
  Branch,
  BranchType,
  BranchStatus,
  Vehicle,
  VehicleType,
  VehicleStatus,
  Order,
  OrderStatus,
  PackageType,
  PaymentMethod,
  Waybill,
  WaybillStatus,
  TrackingRecord,
  TrackingEvent,
  ExceptionItem,
  ExceptionType,
  ExceptionStatus,
  ExceptionPriority,
  Return,
  Claim,
  ReturnType,
  ReturnStatus,
  ClaimStatus,
  ClaimType,
  InventoryItem,
  Feedback,
  InventoryType,
  InventoryStatus,
  FeedbackType,
  FeedbackStatus,
  PricingRule,
  WeightBilling,
  ServiceType,
  PricingRuleType
};
