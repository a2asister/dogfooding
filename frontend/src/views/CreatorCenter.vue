<template>
  <Layout>
    <div class="creator-center">
      <div class="page-header">
        <h1>创作者中心</h1>
        <p>查看您的创作数据和粉丝画像</p>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="8" animated />
      </div>

      <template v-else>
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon views">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview?.totalViews || 0 }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon likes">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview?.totalLikes || 0 }}</div>
              <div class="stat-label">总点赞</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon comments">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview?.totalComments || 0 }}</div>
              <div class="stat-label">总评论</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon followers">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview?.totalFollowers || 0 }}</div>
              <div class="stat-label">粉丝数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon notes">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview?.totalNotes || 0 }}</div>
              <div class="stat-label">作品数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon engagement">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ (overview?.engagementRate || 0).toFixed(2) }}%</div>
              <div class="stat-label">互动率</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>数据趋势</h2>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="fetchDataRange"
            />
          </div>
          <div class="trend-chart">
            <div class="chart-placeholder">
              <el-icon size="48" color="#ddd"><DataLine /></el-icon>
              <p>浏览量趋势 (近7天)</p>
              <div class="trend-bars">
                <div
                  v-for="(value, index) in viewsTrend"
                  :key="index"
                  class="bar"
                  :style="{ height: getBarHeight(value) }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>热门作品</h2>
          </div>
          <div class="top-notes">
            <div v-if="!overview?.topNotes?.length" class="empty">
              <el-empty description="暂无作品数据" />
            </div>
            <div v-for="note in overview?.topNotes" :key="note.id" class="note-item" @click="$router.push(`/note/${note.id}`)">
              <div v-if="note.images?.length" class="note-cover">
                <img :src="note.images[0]" />
              </div>
              <div class="note-info">
                <h3>{{ note.title }}</h3>
                <div class="note-meta">
                  <span><el-icon><View /></el-icon> {{ note.viewCount }}</span>
                  <span><el-icon><Star /></el-icon> {{ note.likeCount }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ note.commentCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>粉丝画像</h2>
          </div>
          <div class="fan-demographics">
            <div class="demo-card">
              <h3>性别分布</h3>
              <div class="demo-content">
                <div v-if="latestData?.fanDemographics?.gender" class="gender-chart">
                  <div
                    v-for="(count, gender) in latestData.fanDemographics.gender"
                    :key="gender"
                    class="gender-item"
                  >
                    <span class="gender-label">{{ gender === 'male' ? '男' : gender === 'female' ? '女' : '未知' }}</span>
                    <div class="gender-bar">
                      <div
                        class="bar-fill"
                        :style="{ width: `${(count / Object.values(latestData.fanDemographics.gender).reduce((a, b) => a + b, 0)) * 100}%` }"
                      />
                    </div>
                    <span class="gender-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="demo-card">
              <h3>兴趣标签</h3>
              <div class="demo-content">
                <div v-if="latestData?.fanDemographics?.interests" class="interest-tags">
                  <el-tag
                    v-for="(count, interest) in latestData.fanDemographics.interests"
                    :key="interest"
                    type="primary"
                    effect="light"
                    size="large"
                  >
                    {{ interest }} ({{ count }})
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>达人认证</h2>
            <el-button type="primary" @click="$router.push('/creator/verification')">
              {{ myVerification ? '查看认证状态' : '申请认证' }}
            </el-button>
          </div>
          <div v-if="myVerification" class="verification-status">
            <el-result
              :icon="myVerification.status === 'approved' ? 'success' : myVerification.status === 'rejected' ? 'error' : 'info'"
              :title="getStatusTitle(myVerification.status)"
              :sub-title="myVerification.reviewNote || ''"
            />
          </div>
          <div v-else class="verification-prompt">
            <el-empty description="还未申请达人认证，认证后可获得更多权益" />
          </div>
        </div>
      </template>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { getCreatorOverview, getCreatorDataRange, getMyVerification } from '@/api/creator';
import Layout from '@/components/Layout.vue';
import type { CreatorOverview, CreatorData, CreatorVerification } from '@/types';
import {
  View,
  Star,
  ChatDotRound,
  User,
  Document,
  TrendCharts,
  DataLine,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const userStore = useUserStore();

const loading = ref(false);
const overview = ref<CreatorOverview | null>(null);
const dataList = ref<CreatorData[]>([]);
const myVerification = ref<CreatorVerification | null>(null);
const dateRange = ref<[Date, Date]>([
  dayjs().subtract(7, 'day').toDate(),
  dayjs().toDate(),
]);

const latestData = ref<CreatorData | null>(null);

const viewsTrend = computed(() => {
  return overview.value?.viewsTrend || [];
});

const maxViewsTrend = computed(() => {
  const trend = viewsTrend.value;
  return trend.length > 0 ? Math.max(...trend) : 1;
});

const getBarHeight = (value: number) => {
  const height = Math.max((value / maxViewsTrend.value) * 100, 10);
  return `${height}%`;
};

const getStatusTitle = (status: string) => {
  const map: Record<string, string> = {
    pending: '认证审核中',
    approved: '认证已通过',
    rejected: '认证已驳回',
    expired: '认证已过期',
    cancelled: '认证已取消',
  };
  return map[status] || status;
};

const fetchOverview = async () => {
  loading.value = true;
  try {
    const res = await getCreatorOverview();
    overview.value = res;
  } catch (error) {
    console.error('获取创作者概览失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchDataRange = async () => {
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) return;
  try {
    const res = await getCreatorDataRange({
      startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
      endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD'),
    });
    dataList.value = res.list;
    if (res.list.length > 0) {
      latestData.value = res.list[0];
    }
  } catch (error) {
    console.error('获取数据范围失败:', error);
  }
};

const fetchMyVerification = async () => {
  try {
    const res = await getMyVerification();
    myVerification.value = res.verification;
  } catch (error) {
    console.error('获取认证状态失败:', error);
  }
};

onMounted(() => {
  fetchOverview();
  fetchDataRange();
  fetchMyVerification();
});
</script>

<style lang="scss" scoped>
.creator-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;

    &.views {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    &.likes {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    &.comments {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    &.followers {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    &.notes {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    &.engagement {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }
}

.trend-chart {
  height: 200px;

  .chart-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #999;

    .trend-bars {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      height: 100px;
      margin-top: 16px;

      .bar {
        width: 24px;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px 4px 0 0;
        transition: height 0.3s;
      }
    }
  }
}

.top-notes {
  display: grid;
  gap: 12px;

  .note-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    }

    .note-cover {
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

    .note-info {
      flex: 1;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .note-meta {
        display: flex;
        gap: 16px;
        color: #999;
        font-size: 13px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.fan-demographics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .demo-card {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .demo-content {
      .gender-chart {
        .gender-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .gender-label {
            width: 40px;
            font-size: 14px;
            color: #666;
          }

          .gender-bar {
            flex: 1;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;

            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              border-radius: 4px;
            }
          }

          .gender-count {
            width: 40px;
            text-align: right;
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
        }
      }

      .interest-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}

.verification-status,
.verification-prompt {
  margin-top: 20px;
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.empty {
  text-align: center;
  padding: 40px;
}
</style>
