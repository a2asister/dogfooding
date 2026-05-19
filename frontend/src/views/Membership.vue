<template>
  <Layout>
    <div class="membership-page">
      <div class="membership-hero">
        <div class="hero-content">
          <h1>会员中心</h1>
          <p>开通会员，尊享专属权益</p>
          <div v-if="userMembership" class="membership-status">
            <el-tag type="success" size="large" effect="dark">
              {{ userMembership.plan?.name || '会员' }}
            </el-tag>
            <span class="expire-info">
              有效期至 {{ formatTime(userMembership.expiresAt) }}
            </span>
            <el-button type="primary" size="small" @click="showPurchase = true">
              续费
            </el-button>
          </div>
          <el-button v-else type="primary" size="large" @click="showPurchase = true">
            <el-icon><Medal /></el-icon>
            立即开通
          </el-button>
        </div>
        <div class="hero-decoration">
          <el-icon size="120" color="rgba(255,255,255,0.3)"><Medal /></el-icon>
        </div>
      </div>

      <div class="membership-benefits">
        <h2>会员特权</h2>
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><Star /></el-icon>
            </div>
            <h3>专属标识</h3>
            <p>会员专属标识，彰显尊贵身份</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <h3>私密内容</h3>
            <p>解锁付费私密笔记，获取独家内容</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <h3>流量加持</h3>
            <p>作品获得更多曝光机会</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <h3>数据分析</h3>
            <p>深度数据分析报告，助力内容创作</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><Service /></el-icon>
            </div>
            <h3>优先客服</h3>
            <p>专属客服通道，问题快速响应</p>
          </div>
          <div class="benefit-card">
            <div class="benefit-icon">
              <el-icon><Medal /></el-icon>
            </div>
            <h3>活动优先</h3>
            <p>优先参与官方活动，获取更多奖励</p>
          </div>
        </div>
      </div>

      <div class="membership-plans">
        <h2>选择您的套餐</h2>
        <div class="plans-grid">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ recommended: plan.tier === 2 }"
          >
            <div v-if="plan.tier === 2" class="recommend-tag">推荐</div>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-desc">{{ plan.description }}</p>
            <div class="plan-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ plan.price }}</span>
              <span class="price-unit">/{{ plan.duration }}{{ getDurationUnit(plan.durationUnit) }}</span>
            </div>
            <div v-if="plan.originalPrice" class="original-price">
              原价 ¥{{ plan.originalPrice }}
            </div>
            <ul class="plan-features">
              <li v-for="feature in plan.features" :key="feature">
                <el-icon><Check /></el-icon>
                {{ feature }}
              </li>
            </ul>
            <el-button
              type="primary"
              size="large"
              :class="{ recommended: plan.tier === 2 }"
              @click="handlePurchase(plan.id)"
            >
              {{ userMembership ? '续费' : '立即开通' }}
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="userMembership" class="membership-details">
        <h2>我的会员</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会员套餐">
            {{ userMembership.plan?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="会员等级">
            LV.{{ userMembership.plan?.tier || 1 }}
          </el-descriptions-item>
          <el-descriptions-item label="开通时间">
            {{ formatTime(userMembership.startDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ formatTime(userMembership.expiresAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="会员状态">
            <el-tag :type="userMembership.status === 'active' ? 'success' : 'info'">
              {{ userMembership.status === 'active' ? '有效' : '已过期' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="自动续费">
            <el-switch v-model="autoRenew" disabled />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-dialog v-model="showPurchase" title="确认购买" width="400px">
        <div v-if="selectedPlan" class="purchase-dialog">
          <div class="selected-plan">
            <h3>{{ selectedPlan.name }}</h3>
            <div class="plan-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ selectedPlan.price }}</span>
            </div>
          </div>
          <el-divider />
          <div class="payment-method">
            <h4>选择支付方式</h4>
            <el-radio-group v-model="paymentMethod">
              <el-radio value="alipay">
                <el-icon><Wallet /></el-icon>
                支付宝
              </el-radio>
              <el-radio value="wechat">
                <el-icon><ChatDotRound /></el-icon>
                微信支付
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <template #footer>
          <el-button @click="showPurchase = false">取消</el-button>
          <el-button type="primary" @click="confirmPurchase">确认支付</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Star,
  Lock,
  TrendCharts,
  DataLine,
  Service,
  Medal,
  Check,
  Wallet,
  ChatDotRound,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getMembershipPlans, getUserMembership, purchaseMembership } from '@/api/membership';
import type { MembershipPlan, UserMembership } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const plans = ref<MembershipPlan[]>([]);
const userMembership = ref<UserMembership | null>(null);
const showPurchase = ref(false);
const selectedPlan = ref<MembershipPlan | null>(null);
const paymentMethod = ref('alipay');
const autoRenew = ref(false);

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const getDurationUnit = (unit: string) => {
  const map: Record<string, string> = {
    day: '天',
    month: '个月',
    year: '年',
  };
  return map[unit] || unit;
};

const fetchPlans = async () => {
  try {
    const res = await getMembershipPlans();
    plans.value = res.plans;
  } catch (error) {
    console.error('获取会员套餐失败:', error);
  }
};

const fetchUserMembership = async () => {
  try {
    const res = await getUserMembership();
    userMembership.value = res.membership;
  } catch (error) {
    console.error('获取用户会员信息失败:', error);
  }
};

const handlePurchase = (planId: string) => {
  selectedPlan.value = plans.value.find(p => p.id === planId) || null;
  showPurchase.value = true;
};

const confirmPurchase = async () => {
  if (!selectedPlan.value) return;
  try {
    await purchaseMembership(selectedPlan.value.id);
    ElMessage.success('购买成功');
    showPurchase.value = false;
    fetchUserMembership();
  } catch (error) {
    console.error('购买失败:', error);
    ElMessage.error('购买失败');
  }
};

onMounted(() => {
  fetchPlans();
  fetchUserMembership();
});
</script>

<style lang="scss" scoped>
.membership-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.membership-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  h1 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 20px;
  }

  .membership-status {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .expire-info {
    font-size: 14px;
    opacity: 0.9;
  }

  .hero-decoration {
    opacity: 0.3;
  }
}

.membership-benefits,
.membership-plans,
.membership-details {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #333;
    margin-bottom: 24px;
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  .benefit-card {
    text-align: center;
    padding: 24px;
    background: #f9f9f9;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .benefit-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
      color: #999;
      margin: 0;
    }
  }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  .plan-card {
    border: 2px solid #f0f0f0;
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    position: relative;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    }

    &.recommended {
      border-color: #667eea;
      background: linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.02) 100%);

      .recommend-tag {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        padding: 4px 16px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
    }

    .plan-name {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }

    .plan-desc {
      font-size: 13px;
      color: #999;
      margin-bottom: 20px;
    }

    .plan-price {
      margin-bottom: 8px;

      .price-symbol {
        font-size: 18px;
        color: #f56c6c;
        font-weight: 600;
        vertical-align: top;
      }

      .price-value {
        font-size: 48px;
        font-weight: 700;
        color: #f56c6c;
        line-height: 1;
      }

      .price-unit {
        font-size: 14px;
        color: #999;
      }
    }

    .original-price {
      font-size: 13px;
      color: #999;
      text-decoration: line-through;
      margin-bottom: 20px;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
      text-align: left;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        font-size: 14px;
        color: #666;

        .el-icon {
          color: #67c23a;
        }
      }
    }

    .el-button {
      width: 100%;

      &.recommended {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
      }
    }
  }
}

.purchase-dialog {
  .selected-plan {
    text-align: center;
    padding: 20px 0;

    h3 {
      font-size: 20px;
      color: #333;
      margin-bottom: 12px;
    }

    .plan-price {
      .price-symbol {
        font-size: 16px;
        color: #f56c6c;
      }

      .price-value {
        font-size: 36px;
        font-weight: 700;
        color: #f56c6c;
      }
    }
  }

  .payment-method {
    h4 {
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
    }
  }
}
</style>
