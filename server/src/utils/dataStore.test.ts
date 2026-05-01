import { dataStore, Store, Inventory, Member, Employee } from './dataStore';

describe('DataStore', () => {
  describe('Stores', () => {
    it('should add a new store', () => {
      const storeData = {
        name: '测试门店',
        address: '测试地址',
        manager: '张三',
        phone: '13800138000',
        status: 'active' as const
      };
      
      const store = dataStore.addStore(storeData);
      
      expect(store).toBeDefined();
      expect(store.id).toBeDefined();
      expect(store.name).toBe('测试门店');
      expect(store.createdAt).toBeDefined();
    });

    it('should get all stores', () => {
      const initialStores = dataStore.getStores();
      const initialCount = initialStores.length;
      
      dataStore.addStore({
        name: '另一个测试门店',
        address: '另一个地址',
        manager: '李四',
        phone: '13900139000',
        status: 'active'
      });
      
      const stores = dataStore.getStores();
      expect(stores.length).toBeGreaterThan(initialCount);
    });

    it('should get store by id', () => {
      const store = dataStore.addStore({
        name: '查找测试门店',
        address: '查找地址',
        manager: '王五',
        phone: '13700137000',
        status: 'active'
      });
      
      const foundStore = dataStore.getStoreById(store.id);
      expect(foundStore).toBeDefined();
      expect(foundStore?.name).toBe('查找测试门店');
    });

    it('should update a store', () => {
      const store = dataStore.addStore({
        name: '更新前门店',
        address: '更新前地址',
        manager: '赵六',
        phone: '13600136000',
        status: 'active'
      });
      
      const updatedStore = dataStore.updateStore(store.id, {
        name: '更新后门店',
        status: 'inactive'
      });
      
      expect(updatedStore).not.toBeNull();
      expect(updatedStore?.name).toBe('更新后门店');
      expect(updatedStore?.status).toBe('inactive');
    });

    it('should delete a store', () => {
      const store = dataStore.addStore({
        name: '待删除门店',
        address: '待删除地址',
        manager: '孙七',
        phone: '13500135000',
        status: 'active'
      });
      
      const deleted = dataStore.deleteStore(store.id);
      expect(deleted).toBe(true);
      
      const foundStore = dataStore.getStoreById(store.id);
      expect(foundStore).toBeUndefined();
    });
  });

  describe('Inventory', () => {
    let testStore: Store;

    beforeEach(() => {
      testStore = dataStore.addStore({
        name: '库存测试门店',
        address: '库存测试地址',
        manager: '库存经理',
        phone: '13400134000',
        status: 'active'
      });
    });

    it('should add inventory item', () => {
      const inventory = dataStore.addInventory({
        storeId: testStore.id,
        productName: '测试商品',
        sku: 'SKU001',
        quantity: 100,
        price: 50,
        unit: '个'
      });

      expect(inventory).toBeDefined();
      expect(inventory.id).toBeDefined();
      expect(inventory.productName).toBe('测试商品');
      expect(inventory.updatedAt).toBeDefined();
    });

    it('should get inventory by store', () => {
      dataStore.addInventory({
        storeId: testStore.id,
        productName: '商品A',
        sku: 'SKU002',
        quantity: 50,
        price: 100,
        unit: '件'
      });

      const inventories = dataStore.getInventories(testStore.id);
      expect(inventories.length).toBeGreaterThan(0);
      expect(inventories[0].storeId).toBe(testStore.id);
    });

    it('should update inventory', () => {
      const inventory = dataStore.addInventory({
        storeId: testStore.id,
        productName: '待更新商品',
        sku: 'SKU003',
        quantity: 10,
        price: 20,
        unit: '盒'
      });

      const updated = dataStore.updateInventory(inventory.id, {
        quantity: 100,
        price: 25
      });

      expect(updated).not.toBeNull();
      expect(updated?.quantity).toBe(100);
      expect(updated?.price).toBe(25);
    });
  });

  describe('Members', () => {
    let testStore: Store;

    beforeEach(() => {
      testStore = dataStore.addStore({
        name: '会员测试门店',
        address: '会员测试地址',
        manager: '会员经理',
        phone: '13300133000',
        status: 'active'
      });
    });

    it('should add a member', () => {
      const member = dataStore.addMember({
        storeId: testStore.id,
        name: '测试会员',
        phone: '18800188000',
        level: 'gold',
        status: 'active'
      });

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.points).toBe(0);
      expect(member.totalSpent).toBe(0);
    });

    it('should update member info', () => {
      const member = dataStore.addMember({
        storeId: testStore.id,
        name: '待更新会员',
        phone: '18900189000',
        level: 'bronze',
        status: 'active'
      });

      const updated = dataStore.updateMember(member.id, {
        level: 'platinum',
        points: 1000,
        totalSpent: 5000
      });

      expect(updated).not.toBeNull();
      expect(updated?.level).toBe('platinum');
      expect(updated?.points).toBe(1000);
    });
  });

  describe('Employees', () => {
    let testStore: Store;

    beforeEach(() => {
      testStore = dataStore.addStore({
        name: '员工测试门店',
        address: '员工测试地址',
        manager: '员工经理',
        phone: '13200132000',
        status: 'active'
      });
    });

    it('should add an employee', () => {
      const employee = dataStore.addEmployee({
        storeId: testStore.id,
        name: '测试员工',
        position: '店长',
        phone: '15800158000',
        email: 'test@example.com',
        status: 'active'
      });

      expect(employee).toBeDefined();
      expect(employee.id).toBeDefined();
      expect(employee.createdAt).toBeDefined();
    });

    it('should get employees by store', () => {
      dataStore.addEmployee({
        storeId: testStore.id,
        name: '员工A',
        position: '导购',
        phone: '15900159000',
        email: 'a@example.com',
        status: 'active'
      });

      const employees = dataStore.getEmployees(testStore.id);
      expect(employees.length).toBeGreaterThan(0);
      expect(employees[0].storeId).toBe(testStore.id);
    });
  });
});
