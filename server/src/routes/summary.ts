import Router from 'koa-router';
import { dataStore } from '../utils/dataStore';

const router = new Router({ prefix: '/api/summary' });

router.get('/', async (ctx) => {
  try {
    const stores = dataStore.getStores();
    const customerFlows = dataStore.getCustomerFlows();
    const inventories = dataStore.getInventories();
    const members = dataStore.getMembers();
    const promotions = dataStore.getPromotions();
    const attendances = dataStore.getAttendances();
    const employees = dataStore.getEmployees();

    const totalStores = stores.length;
    const activeStores = stores.filter(s => s.status === 'active').length;
    const totalInFlow = customerFlows.reduce((sum, flow) => sum + flow.inCount, 0);
    const totalOutFlow = customerFlows.reduce((sum, flow) => sum + flow.outCount, 0);
    const totalInventoryValue = inventories.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalInventoryItems = inventories.reduce((sum, item) => sum + item.quantity, 0);
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalMemberPoints = members.reduce((sum, member) => sum + member.points, 0);
    const totalMemberSpent = members.reduce((sum, member) => sum + member.totalSpent, 0);
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(p => p.status === 'active').length;
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;

    const storeSummaries = stores.map(store => {
      const storeFlows = customerFlows.filter(f => f.storeId === store.id);
      const storeInventories = inventories.filter(i => i.storeId === store.id);
      const storeMembers = members.filter(m => m.storeId === store.id);
      const storeAttendances = attendances.filter(a => a.storeId === store.id);

      return {
        storeId: store.id,
        storeName: store.name,
        totalInFlow: storeFlows.reduce((sum, flow) => sum + flow.inCount, 0),
        totalOutFlow: storeFlows.reduce((sum, flow) => sum + flow.outCount, 0),
        inventoryValue: storeInventories.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        inventoryItems: storeInventories.reduce((sum, item) => sum + item.quantity, 0),
        memberCount: storeMembers.length,
        attendanceCount: storeAttendances.length
      };
    });

    ctx.body = {
      success: true,
      data: {
        overview: {
          totalStores,
          activeStores,
          totalInFlow,
          totalOutFlow,
          totalInventoryValue,
          totalInventoryItems,
          totalMembers,
          activeMembers,
          totalMemberPoints,
          totalMemberSpent,
          totalPromotions,
          activePromotions,
          totalEmployees,
          activeEmployees
        },
        storeSummaries
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: '获取数据汇总失败' };
  }
});

export default router;
