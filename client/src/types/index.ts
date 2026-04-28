export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  branchId?: number;
  avatar?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

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

export interface Branch {
  id: number;
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
  createdAt?: string;
}

export enum BranchType {
  HUB = 'hub',
  STATION = 'station',
  AGENCY = 'agency'
}

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

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

export interface Vehicle {
  id: number;
  plateNumber: string;
  type: VehicleType;
  brand: string;
  model: string;
  capacity: number;
  currentLoad?: number;
  status: VehicleStatus;
  branchId?: number;
  driverId?: number;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNo: string;
  customerId?: number;
  senderName: string;
  senderPhone: string;
  senderProvince: string;
  senderCity: string;
  senderDistrict: string;
  senderAddress: string;
  senderLongitude?: number;
  senderLatitude?: number;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  receiverLongitude?: number;
  receiverLatitude?: number;
  packageName: string;
  packageType: PackageType;
  packageCount: number;
  packageWeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  volume?: number;
  declaredValue?: number;
  isInsured: boolean;
  insuranceFee?: number;
  serviceType: string;
  pickupTime?: string;
  deliveryTime?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount?: number;
  paidAmount?: number;
  paidAt?: string;
  courierId?: number;
  pickupBranchId?: number;
  deliveryBranchId?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  waybill?: Waybill;
  courier?: User;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKUP_ASSIGNED = 'pickup_assigned',
  PICKED_UP = 'picked_up',
  TRANSFERRING = 'transferring',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PackageType {
  DOCUMENT = 'document',
  PARCEL = 'parcel',
  FRAGILE = 'fragile',
  LIQUID = 'liquid',
  OTHER = 'other'
}

export enum PaymentMethod {
  ONLINE = 'online',
  COD = 'cod',
  PREPAID = 'prepaid',
  MONTHLY = 'monthly'
}

export interface Waybill {
  id: number;
  waybillNo: string;
  orderId: number;
  status: WaybillStatus;
  currentBranchId?: number;
  nextBranchId?: number;
  courierId?: number;
  vehicleId?: number;
  estimateDeliveryTime?: string;
  actualDeliveryTime?: string;
  signedBy?: string;
  signedTime?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  trackingRecords?: TrackingRecord[];
  currentBranch?: Branch;
  courier?: User;
  vehicle?: Vehicle;
}

export enum WaybillStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  RETURNED = 'returned',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

export interface TrackingRecord {
  id: number;
  waybillId: number;
  event: TrackingEvent;
  eventTime: string;
  operatorId?: number;
  operatorName?: string;
  branchId?: number;
  branchName?: string;
  longitude?: number;
  latitude?: number;
  description: string;
  remark?: string;
  createdAt: string;
  operator?: User;
  branch?: Branch;
}

export enum TrackingEvent {
  ORDER_CREATED = 'order_created',
  WAYBILL_CREATED = 'waybill_created',
  PICKUP_ASSIGNED = 'pickup_assigned',
  PICKED_UP = 'picked_up',
  ARRIVED_AT_BRANCH = 'arrived_at_branch',
  SORTED = 'sorted',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  ARRIVED_AT_TRANSIT_HUB = 'arrived_at_transit_hub',
  ARRIVED_AT_DELIVERY_BRANCH = 'arrived_at_delivery_branch',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  RETURN_REQUESTED = 'return_requested',
  RETURNED = 'returned',
  EXCEPTION = 'exception',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
}

export interface CreateOrderRequest {
  senderName: string;
  senderPhone: string;
  senderProvince: string;
  senderCity: string;
  senderDistrict: string;
  senderAddress: string;
  senderLongitude?: number;
  senderLatitude?: number;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  receiverLongitude?: number;
  receiverLatitude?: number;
  packageName: string;
  packageType?: PackageType;
  packageCount: number;
  packageWeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  declaredValue?: number;
  isInsured?: boolean;
  serviceType?: string;
  paymentMethod?: PaymentMethod;
  remark?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  todayRevenue: number;
  pendingExceptions: number;
  activeCouriers: number;
}

export enum ExceptionType {
  LOST = 'lost',
  DAMAGED = 'damaged',
  DELAYED = 'delayed',
  RETURNED = 'returned',
  REJECTED = 'rejected',
  ADDRESS_ERROR = 'address_error',
  CONTACT_FAILED = 'contact_failed',
  PACKAGE_ABNORMAL = 'package_abnormal',
  OTHER = 'other'
}

export enum ExceptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed'
}

export enum ExceptionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ExceptionItem {
  id: number;
  waybillId: number;
  type: ExceptionType;
  status: ExceptionStatus;
  priority: ExceptionPriority;
  detectedAt: string;
  detectedBy?: number;
  location?: string;
  description: string;
  damageDescription?: string;
  estimatedLoss?: number;
  responsiblePersonId?: number;
  responsiblePersonName?: string;
  resolutionSteps?: string;
  resolutionCost?: number;
  resolvedAt?: string;
  resolvedBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  waybill?: Waybill;
  detector?: User;
  responsiblePerson?: User;
  resolver?: User;
}

export enum ReturnType {
  EXCHANGE = 'exchange',
  REFUND = 'refund',
  REJECT = 'reject'
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ClaimType {
  DAMAGE = 'damage',
  LOST = 'lost',
  DELAY = 'delay',
  SERVICE = 'service',
  OTHER = 'other'
}

export enum ClaimStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CLOSED = 'closed'
}

export interface Return {
  id: number;
  orderId: number;
  waybillId?: number;
  type: ReturnType;
  status: ReturnStatus;
  returnWaybillNo?: string;
  requestReason: string;
  requestDescription?: string;
  requestedAt: string;
  requestedBy?: number;
  approvedAt?: string;
  approvedBy?: number;
  approvalComment?: string;
  receivedAt?: string;
  receivedBy?: number;
  inspectionResult?: string;
  inspectionStatus?: string;
  refundAmount?: number;
  processedAt?: string;
  processedBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  waybill?: Waybill;
  requester?: User;
  approver?: User;
  processor?: User;
}

export interface Claim {
  id: number;
  orderId?: number;
  waybillId?: number;
  exceptionItemId?: number;
  type: ClaimType;
  status: ClaimStatus;
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  claimAmount: number;
  claimReason: string;
  claimDescription?: string;
  evidenceUrls?: string;
  submittedAt: string;
  submittedBy?: number;
  assignedTo?: number;
  assignedAt?: string;
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  approvedAmount?: number;
  payoutAmount?: number;
  paidAt?: string;
  paidBy?: number;
  closedAt?: string;
  closedBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  waybill?: Waybill;
  submitter?: User;
  assignee?: User;
  reviewer?: User;
}

export enum FeedbackType {
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
  CONSULT = 'consult',
  PRAISE = 'praise',
  OTHER = 'other'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Feedback {
  id: number;
  orderId?: number;
  waybillId?: number;
  type: FeedbackType;
  status: FeedbackStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subject: string;
  content: string;
  attachmentUrls?: string;
  submittedAt: string;
  assignedTo?: number;
  assignedAt?: string;
  responseContent?: string;
  responseAt?: string;
  responseBy?: number;
  satisfaction?: number;
  closedAt?: string;
  closedBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  waybill?: Waybill;
  assignee?: User;
  responder?: User;
}

export enum InventoryType {
  PACKAGE_MATERIAL = 'package_material',
  TOOL = 'tool',
  OFFICE_SUPPLY = 'office_supply',
  OTHER = 'other'
}

export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  type: InventoryType;
  description?: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitPrice?: number;
  totalValue?: number;
  branchId?: number;
  location?: string;
  status: InventoryStatus;
  lastStocktakingAt?: string;
  lastStocktakingBy?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  branch?: Branch;
}
