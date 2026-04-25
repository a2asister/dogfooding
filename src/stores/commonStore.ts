import { create } from 'zustand';
import { StorageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { useAuthStore } from './authStore';
import type {
  LabTestOrder,
  ImagingOrder,
  Inventory,
  Order,
  OrderItem,
  Admission,
  NursingRecord,
  InfectionRisk,
  MaintenanceRecord,
  OperationLog,
} from '../types';

interface CommonState {
  labTestOrders: LabTestOrder[];
  imagingOrders: ImagingOrder[];
  inventory: Inventory[];
  orders: Order[];
  orderItems: OrderItem[];
  admissions: Admission[];
  nursingRecords: NursingRecord[];
  infectionRisks: InfectionRisk[];
  maintenanceRecords: MaintenanceRecord[];
  operationLogs: OperationLog[];

  loadLabTestOrders: () => void;
  loadImagingOrders: () => void;
  loadInventory: () => void;
  loadOrders: () => void;
  loadOrderItems: () => void;
  loadAdmissions: () => void;
  loadNursingRecords: () => void;
  loadInfectionRisks: () => void;
  loadMaintenanceRecords: () => void;
  loadOperationLogs: () => void;
  loadAll: () => void;

  addLabTestOrder: (order: Omit<LabTestOrder, 'id' | 'createdAt' | 'updatedAt'>) => LabTestOrder;
  updateLabTestOrder: (id: string, updates: Partial<LabTestOrder>) => LabTestOrder | null;

  addImagingOrder: (order: Omit<ImagingOrder, 'id' | 'createdAt' | 'updatedAt'>) => ImagingOrder;
  updateImagingOrder: (id: string, updates: Partial<ImagingOrder>) => ImagingOrder | null;

  addInventory: (item: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>) => Inventory;
  updateInventory: (id: string, updates: Partial<Inventory>) => Inventory | null;
  updateInventoryQuantity: (id: string, change: number) => Inventory | null;

  addOrder: (
    order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
    items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>[]
  ) => Order;
  updateOrderStatus: (id: string, status: Order['status'], paidAmount?: number) => Order | null;

  addAdmission: (admission: Omit<Admission, 'id' | 'createdAt' | 'updatedAt'>) => Admission;
  updateAdmission: (id: string, updates: Partial<Admission>) => Admission | null;
  dischargePatient: (id: string, dischargeDate: string, totalCost: number) => Admission | null;

  addNursingRecord: (record: Omit<NursingRecord, 'id' | 'createdAt'>) => NursingRecord;

  addInfectionRisk: (risk: Omit<InfectionRisk, 'id' | 'createdAt' | 'updatedAt'>) => InfectionRisk;
  updateInfectionRisk: (id: string, updates: Partial<InfectionRisk>) => InfectionRisk | null;

  addMaintenanceRecord: (
    record: Omit<MaintenanceRecord, 'id' | 'createdAt'>
  ) => MaintenanceRecord;
}

export const useCommonStore = create<CommonState>((set, get) => ({
  labTestOrders: [],
  imagingOrders: [],
  inventory: [],
  orders: [],
  orderItems: [],
  admissions: [],
  nursingRecords: [],
  infectionRisks: [],
  maintenanceRecords: [],
  operationLogs: [],

  loadLabTestOrders: () => {
    const data = StorageService.getAll<LabTestOrder>(STORAGE_KEYS.LAB_TEST_ORDERS);
    set({ labTestOrders: data });
  },

  loadImagingOrders: () => {
    const data = StorageService.getAll<ImagingOrder>(STORAGE_KEYS.IMAGING_ORDERS);
    set({ imagingOrders: data });
  },

  loadInventory: () => {
    const data = StorageService.getAll<Inventory>(STORAGE_KEYS.INVENTORY);
    set({ inventory: data });
  },

  loadOrders: () => {
    const data = StorageService.getAll<Order>(STORAGE_KEYS.ORDERS);
    set({ orders: data });
  },

  loadOrderItems: () => {
    const data = StorageService.getAll<OrderItem>(STORAGE_KEYS.ORDER_ITEMS);
    set({ orderItems: data });
  },

  loadAdmissions: () => {
    const data = StorageService.getAll<Admission>(STORAGE_KEYS.ADMISSIONS);
    set({ admissions: data });
  },

  loadNursingRecords: () => {
    const data = StorageService.getAll<NursingRecord>(STORAGE_KEYS.NURSING_RECORDS);
    set({ nursingRecords: data });
  },

  loadInfectionRisks: () => {
    const data = StorageService.getAll<InfectionRisk>(STORAGE_KEYS.INFECTION_RISKS);
    set({ infectionRisks: data });
  },

  loadMaintenanceRecords: () => {
    const data = StorageService.getAll<MaintenanceRecord>(STORAGE_KEYS.MAINTENANCE_RECORDS);
    set({ maintenanceRecords: data });
  },

  loadOperationLogs: () => {
    const data = StorageService.getAll<OperationLog>(STORAGE_KEYS.OPERATION_LOGS);
    set({ operationLogs: data });
  },

  loadAll: () => {
    get().loadLabTestOrders();
    get().loadImagingOrders();
    get().loadInventory();
    get().loadOrders();
    get().loadOrderItems();
    get().loadAdmissions();
    get().loadNursingRecords();
    get().loadInfectionRisks();
    get().loadMaintenanceRecords();
    get().loadOperationLogs();
  },

  addLabTestOrder: (order) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newOrder = StorageService.create<LabTestOrder>(STORAGE_KEYS.LAB_TEST_ORDERS, order);
    get().loadLabTestOrders();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '检验管理',
        '新增',
        '检验申请',
        newOrder.id,
        `新增检验申请: ${newOrder.testName}`
      );
    }

    return newOrder;
  },

  updateLabTestOrder: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<LabTestOrder>(STORAGE_KEYS.LAB_TEST_ORDERS, id, updates);
    get().loadLabTestOrders();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '检验管理',
        '修改',
        '检验申请',
        id,
        `修改检验申请: ${updated.testName}`
      );
    }

    return updated;
  },

  addImagingOrder: (order) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newOrder = StorageService.create<ImagingOrder>(STORAGE_KEYS.IMAGING_ORDERS, order);
    get().loadImagingOrders();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '检查管理',
        '新增',
        '检查申请',
        newOrder.id,
        `新增检查申请: ${newOrder.imagingType}`
      );
    }

    return newOrder;
  },

  updateImagingOrder: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<ImagingOrder>(STORAGE_KEYS.IMAGING_ORDERS, id, updates);
    get().loadImagingOrders();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '检查管理',
        '修改',
        '检查申请',
        id,
        `修改检查申请: ${updated.imagingType}`
      );
    }

    return updated;
  },

  addInventory: (item) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newItem = StorageService.create<Inventory>(STORAGE_KEYS.INVENTORY, item);
    get().loadInventory();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '库存管理',
        '入库',
        '库存',
        newItem.id,
        `药品入库，批次: ${newItem.batchNumber}`
      );
    }

    return newItem;
  },

  updateInventory: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Inventory>(STORAGE_KEYS.INVENTORY, id, updates);
    get().loadInventory();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '库存管理',
        '修改',
        '库存',
        id,
        `修改库存信息`
      );
    }

    return updated;
  },

  updateInventoryQuantity: (id, change) => {
    const currentUser = useAuthStore.getState().currentUser;
    const item = StorageService.findById<Inventory>(STORAGE_KEYS.INVENTORY, id);
    if (!item) return null;

    const newQuantity = item.quantity + change;
    const updated = StorageService.update<Inventory>(STORAGE_KEYS.INVENTORY, id, {
      quantity: newQuantity,
    });
    get().loadInventory();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '库存管理',
        change > 0 ? '增加' : '减少',
        '库存',
        id,
        `库存数量变更: ${item.quantity} -> ${newQuantity}`
      );
    }

    return updated;
  },

  addOrder: (order, items) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newOrder = StorageService.create<Order>(STORAGE_KEYS.ORDERS, order);

    items.forEach((item) => {
      StorageService.create<OrderItem>(STORAGE_KEYS.ORDER_ITEMS, {
        ...item,
        orderId: newOrder.id,
      });
    });

    get().loadOrders();
    get().loadOrderItems();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '收费管理',
        '新增',
        '订单',
        newOrder.id,
        `新增订单，金额: ¥${newOrder.totalAmount}`
      );
    }

    return newOrder;
  },

  updateOrderStatus: (id, status, paidAmount) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updates: Partial<Order> = { status };
    if (paidAmount !== undefined) {
      updates.paidAmount = paidAmount;
      updates.paymentTime = StorageService.getNow();
    }
    const updated = StorageService.update<Order>(STORAGE_KEYS.ORDERS, id, updates);
    get().loadOrders();

    if (currentUser && updated) {
      const statusMap: Record<string, string> = {
        pending: '待支付',
        paid: '已支付',
        cancelled: '已取消',
        refunded: '已退款',
      };
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '收费管理',
        '状态变更',
        '订单',
        id,
        `订单状态变更为: ${statusMap[status] || status}`
      );
    }

    return updated;
  },

  addAdmission: (admission) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newAdmission = StorageService.create<Admission>(STORAGE_KEYS.ADMISSIONS, admission);
    get().loadAdmissions();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '住院管理',
        '入院',
        '住院',
        newAdmission.id,
        `患者入院登记`
      );
    }

    return newAdmission;
  },

  updateAdmission: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Admission>(STORAGE_KEYS.ADMISSIONS, id, updates);
    get().loadAdmissions();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '住院管理',
        '修改',
        '住院',
        id,
        `修改住院信息`
      );
    }

    return updated;
  },

  dischargePatient: (id, dischargeDate, totalCost) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<Admission>(STORAGE_KEYS.ADMISSIONS, id, {
      status: 'discharged',
      dischargeDate,
      totalCost,
    });
    get().loadAdmissions();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '住院管理',
        '出院',
        '住院',
        id,
        `患者出院，费用: ¥${totalCost}`
      );
    }

    return updated;
  },

  addNursingRecord: (record) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newRecord = StorageService.create<NursingRecord>(
      STORAGE_KEYS.NURSING_RECORDS,
      record
    );
    get().loadNursingRecords();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '护理记录',
        '新增',
        '护理记录',
        newRecord.id,
        `新增护理记录`
      );
    }

    return newRecord;
  },

  addInfectionRisk: (risk) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newRisk = StorageService.create<InfectionRisk>(STORAGE_KEYS.INFECTION_RISKS, risk);
    get().loadInfectionRisks();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '院感管理',
        '上报',
        '院感风险',
        newRisk.id,
        `上报院感风险: ${newRisk.riskType}`
      );
    }

    return newRisk;
  },

  updateInfectionRisk: (id, updates) => {
    const currentUser = useAuthStore.getState().currentUser;
    const updated = StorageService.update<InfectionRisk>(STORAGE_KEYS.INFECTION_RISKS, id, updates);
    get().loadInfectionRisks();

    if (currentUser && updated) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '院感管理',
        '处理',
        '院感风险',
        id,
        `处理院感风险，状态: ${updated.status}`
      );
    }

    return updated;
  },

  addMaintenanceRecord: (record) => {
    const currentUser = useAuthStore.getState().currentUser;
    const newRecord = StorageService.create<MaintenanceRecord>(
      STORAGE_KEYS.MAINTENANCE_RECORDS,
      record
    );
    get().loadMaintenanceRecords();

    if (currentUser) {
      StorageService.logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        '设备维护',
        '记录',
        '维护记录',
        newRecord.id,
        `新增设备维护记录`
      );
    }

    return newRecord;
  },
}));
