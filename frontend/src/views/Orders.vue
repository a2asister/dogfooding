<template>
  <Layout>
    <div class="order-page">
      <div class="page-header">
        <h1>我的订单</h1>
        <p>查看您的所有订单记录</p>
      </div>

      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" @change="fetchOrders">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="pending">待付款</el-radio-button>
          <el-radio-button value="paid">待发货</el-radio-button>
          <el-radio-button value="shipped">待收货</el-radio-button>
          <el-radio-button value="completed">已完成</el-radio-button>
          <el-radio-button value="cancelled">已取消</el-radio-button>
        </el-radio-group>
      </div>

      <div v-loading="loading" class="order-list">
        <div v-if="orders.length === 0 && !loading" class="empty">
          <el-empty description="暂无订单" />
        </div>

        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号: {{ order.orderNo }}</span>
              <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)" effect="light">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div v-if="item.imageUrl" class="item-image">
                <img :src="item.imageUrl" :alt="item.title" />
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-meta">
                  <span class="item-type">{{ getItemTypeText(item.itemType) }}</span>
                  <span v-if="item.commissionRate" class="commission">
                    佣金: {{ item.commissionRate }}%
                  </span>
                </div>
              </div>
              <div class="item-price">
                <div class="price">¥{{ item.unitPrice }}</div>
                <div class="quantity">x{{ item.quantity }}</div>
              </div>
              <div class="item-amount">
                <span class="amount-label">小计</span>
                <span class="amount-value">¥{{ item.amount }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-actions">
              <el-button
                v-if="order.status === 'pending'"
                type="primary"
                size="small"
                @click="handlePay(order)"
              >
                立即付款
              </el-button>
              <el-button
                v-if="order.status === 'pending'"
                size="small"
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status === 'shipped'"
                type="primary"
                size="small"
                @click="handleConfirm(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === 'completed'"
                size="small"
                @click="handleRefund(order)"
              >
                申请退款
              </el-button>
              <el-button size="small" @click="handleViewDetail(order)">
                查看详情
              </el-button>
            </div>
            <div class="order-total">
              <span class="total-label">共{{ order.items?.length || 0 }}件商品，合计:</span>
              <span class="total-amount">¥{{ order.totalAmount }}</span>
            </div>
          </div>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchOrders"
            @current-change="fetchOrders"
          />
        </div>
      </div>

      <el-dialog v-model="showDetail" title="订单详情" width="700px">
        <div v-if="selectedOrder" class="order-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(selectedOrder.status)">
                {{ getStatusText(selectedOrder.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(selectedOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">
              {{ selectedOrder.paymentTime ? formatTime(selectedOrder.paymentTime) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ selectedOrder.paymentMethod || '-' }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ selectedOrder.totalAmount }}</el-descriptions-item>
          </el-descriptions>

          <h4 style="margin: 20px 0 10px">商品清单</h4>
          <el-table :data="selectedOrder.items || []" border size="small">
            <el-table-column prop="title" label="商品名称" />
            <el-table-column prop="itemType" label="类型" width="100">
              <template #default="{ row }">
                {{ getItemTypeText(row.itemType) }}
              </template>
            </el-table-column>
            <el-table-column prop="unitPrice" label="单价" width="100">
              <template #default="{ row }">¥{{ row.unitPrice }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="amount" label="小计" width="100">
              <template #default="{ row }">¥{{ row.amount }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Layout from '@/components/Layout.vue';
import { getOrderList, payOrder, cancelOrder, confirmOrder, applyRefund } from '@/api/order';
import type { Order } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const orders = ref<Order[]>([]);
const filterStatus = ref('');
const showDetail = ref(false);
const selectedOrder = ref<Order | null>(null);

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'info',
    refunded: 'danger',
  };
  return map[status] || '';
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };
  return map[status] || status;
};

const getItemTypeText = (type: string) => {
  const map: Record<string, string> = {
    product: '商品',
    membership: '会员',
    promotion: '推广',
    tip: '打赏',
  };
  return map[type] || type;
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrderList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      status: filterStatus.value,
    });
    orders.value = res?.list || [];
    pagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

const handlePay = async (order: Order) => {
  try {
    await payOrder(order.id, { paymentMethod: 'alipay' });
    ElMessage.success('支付成功');
    fetchOrders();
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败');
  }
};

const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '取消确认', {
      type: 'warning',
    });
    await cancelOrder(order.id);
    ElMessage.success('订单已取消');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
      ElMessage.error('取消失败');
    }
  }
};

const handleConfirm = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '收货确认', {
      type: 'warning',
    });
    await confirmOrder(order.id);
    ElMessage.success('已确认收货');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleRefund = async (order: Order) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入退款原因', '申请退款', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入退款原因',
    });
    await applyRefund(order.id, { reason: value });
    ElMessage.success('退款申请已提交');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('申请退款失败:', error);
      ElMessage.error('申请失败');
    }
  }
};

const handleViewDetail = (order: Order) => {
  selectedOrder.value = order;
  showDetail.value = true;
};

onMounted(() => {
  fetchOrders();
});
</script>

<style lang="scss" scoped>
.order-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;

  .order-info {
    display: flex;
    gap: 20px;
    align-items: center;

    .order-no {
      font-weight: 500;
      color: #333;
    }

    .order-time {
      color: #999;
      font-size: 13px;
    }
  }
}

.order-items {
  padding: 16px 20px;

  .order-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-info {
      flex: 1;

      .item-title {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .item-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #999;

        .commission {
          color: #67c23a;
        }
      }
    }

    .item-price {
      text-align: center;
      min-width: 80px;

      .price {
        font-weight: 500;
        color: #333;
      }

      .quantity {
        font-size: 12px;
        color: #999;
      }
    }

    .item-amount {
      text-align: right;
      min-width: 100px;

      .amount-label {
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 2px;
      }

      .amount-value {
        font-weight: 600;
        color: #f56c6c;
        font-size: 16px;
      }
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;

  .order-actions {
    display: flex;
    gap: 8px;
  }

  .order-total {
    display: flex;
    align-items: center;
    gap: 8px;

    .total-label {
      font-size: 14px;
      color: #666;
    }

    .total-amount {
      font-size: 20px;
      font-weight: 700;
      color: #f56c6c;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty {
  background: #fff;
  border-radius: 12px;
  padding: 60px 0;
}
</style>
