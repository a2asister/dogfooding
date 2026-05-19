<template>
  <Layout>
    <div class="community-page">
      <div class="page-header">
        <div>
          <h1>社群中心</h1>
          <p>加入感兴趣的社群，与志同道合的人交流</p>
        </div>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建社群
        </el-button>
      </div>

      <div class="filter-bar">
        <el-tabs v-model="activeTab" @tab-change="fetchCommunities">
          <el-tab-pane label="推荐社群" name="recommend" />
          <el-tab-pane label="我的社群" name="my" />
        </el-tabs>
        <div class="filter-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索社群"
            clearable
            style="width: 200px"
            @keyup.enter="fetchCommunities"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filterCategory" placeholder="分类" clearable style="width: 140px">
            <el-option label="美妆时尚" value="beauty" />
            <el-option label="美食探店" value="food" />
            <el-option label="旅行攻略" value="travel" />
            <el-option label="数码科技" value="tech" />
            <el-option label="家居生活" value="home" />
            <el-option label="健身运动" value="fitness" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>
      </div>

      <div v-loading="loading" class="community-grid">
        <div v-if="communities.length === 0 && !loading" class="empty">
          <el-empty description="暂无社群" />
        </div>

        <div
          v-for="community in communities"
          :key="community.id"
          class="community-card"
          @click="handleViewDetail(community)"
        >
          <div class="community-cover" v-if="community.cover">
            <img :src="community.cover" :alt="community.name" />
          </div>
          <div class="community-info">
            <div class="community-header">
              <el-avatar :size="48" :src="community.avatar">
                {{ community.name?.charAt(0) }}
              </el-avatar>
              <div class="community-basic">
                <h3 class="community-name">
                  {{ community.name }}
                  <el-tag v-if="community.isOfficial" type="warning" size="small" effect="light">
                    官方
                  </el-tag>
                </h3>
                <p class="community-desc">{{ community.description }}</p>
              </div>
            </div>
            <div class="community-stats">
              <span class="stat-item">
                <el-icon><User /></el-icon>
                {{ community.memberCount }} 成员
              </span>
              <span class="stat-item">
                <el-icon><Document /></el-icon>
                {{ community.postCount }} 帖子
              </span>
            </div>
            <div class="community-footer">
              <span class="category-tag">{{ getCategoryName(community.category) }}</span>
              <div class="action-buttons">
                <el-button
                  v-if="!myCommunities.includes(community.id)"
                  type="primary"
                  size="small"
                  @click.stop="handleJoin(community)"
                >
                  加入
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  plain
                  disabled
                >
                  已加入
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchCommunities"
          @current-change="fetchCommunities"
        />
      </div>

      <el-dialog v-model="showCreateDialog" title="创建社群" width="500px" @close="resetForm">
        <el-form :model="communityForm" :rules="formRules" label-width="100px">
          <el-form-item label="社群名称" prop="name">
            <el-input v-model="communityForm.name" placeholder="请输入社群名称" />
          </el-form-item>
          <el-form-item label="社群描述" prop="description">
            <el-input
              v-model="communityForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入社群描述"
            />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="communityForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="美妆时尚" value="beauty" />
              <el-option label="美食探店" value="food" />
              <el-option label="旅行攻略" value="travel" />
              <el-option label="数码科技" value="tech" />
              <el-option label="家居生活" value="home" />
              <el-option label="健身运动" value="fitness" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="公开性">
            <el-radio-group v-model="communityForm.isPublic">
              <el-radio :value="true">公开</el-radio>
              <el-radio :value="false">私密</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="showDetailDialog" title="社群详情" width="700px">
        <div v-if="selectedCommunity" class="community-detail">
          <div class="detail-header">
            <el-avatar :size="64" :src="selectedCommunity.avatar">
              {{ selectedCommunity.name?.charAt(0) }}
            </el-avatar>
            <div class="detail-info">
              <h2>{{ selectedCommunity.name }}</h2>
              <p>{{ selectedCommunity.description }}</p>
              <div class="detail-stats">
                <span>{{ selectedCommunity.memberCount }} 成员</span>
                <span>{{ selectedCommunity.postCount }} 帖子</span>
                <el-tag v-if="selectedCommunity.isOfficial" type="warning" size="small">官方社群</el-tag>
              </div>
            </div>
            <div class="detail-actions">
              <el-button
                v-if="!myCommunities.includes(selectedCommunity.id)"
                type="primary"
                size="large"
                @click="handleJoin(selectedCommunity)"
              >
                加入社群
              </el-button>
              <el-button
                v-else
                type="danger"
                size="large"
                @click="handleLeave(selectedCommunity)"
              >
                退出社群
              </el-button>
            </div>
          </div>
          <el-divider />
          <div class="members-section">
            <h3>成员列表</h3>
            <div class="members-grid">
              <div
                v-for="member in communityMembers.slice(0, 12)"
                :key="member.id"
                class="member-item"
              >
                <el-avatar :size="40" :src="member.user?.avatar">
                  {{ member.user?.nickname?.charAt(0) }}
                </el-avatar>
                <div class="member-info">
                  <span class="member-name">{{ member.user?.nickname }}</span>
                  <span class="member-role">{{ getRoleText(member.roles) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  User,
  Document,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import {
  getCommunityList,
  getMyCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
} from '@/api/community';
import type { Community, CommunityMember } from '@/types';

const loading = ref(false);
const communities = ref<Community[]>([]);
const myCommunities = ref<string[]>([]);
const communityMembers = ref<CommunityMember[]>([]);
const activeTab = ref('recommend');
const searchKeyword = ref('');
const filterCategory = ref('');
const showCreateDialog = ref(false);
const showDetailDialog = ref(false);
const selectedCommunity = ref<Community | null>(null);

const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
});

const communityForm = ref({
  name: '',
  description: '',
  category: '',
  isPublic: true,
});

const formRules = {
  name: [{ required: true, message: '请输入社群名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入社群描述', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    beauty: '美妆时尚',
    food: '美食探店',
    travel: '旅行攻略',
    tech: '数码科技',
    home: '家居生活',
    fitness: '健身运动',
    other: '其他',
  };
  return map[category] || category;
};

const getRoleText = (roles: string[]) => {
  if (roles?.includes('owner')) return '群主';
  if (roles?.includes('admin')) return '管理员';
  if (roles?.includes('moderator')) return '版主';
  return '成员';
};

const fetchCommunities = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'my') {
      const res = await getMyCommunities({ page: pagination.value.page, pageSize: pagination.value.pageSize });
      communities.value = res?.list || [];
      pagination.value.total = res?.total || 0;
    } else {
      const res = await getCommunityList({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        keyword: searchKeyword.value,
        category: filterCategory.value,
      });
      communities.value = res?.list || [];
      pagination.value.total = res?.total || 0;
    }
  } catch (error) {
    console.error('获取社群列表失败:', error);
    ElMessage.error('获取社群列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchMyCommunities = async () => {
  try {
    const res = await getMyCommunities({ page: 1, pageSize: 100 });
    myCommunities.value = res?.list?.map(c => c.id) || [];
  } catch (error) {
    console.error('获取我的社群失败:', error);
  }
};

const handleCreate = async () => {
  try {
    await createCommunity(communityForm.value);
    ElMessage.success('社群创建成功');
    showCreateDialog.value = false;
    fetchCommunities();
  } catch (error) {
    console.error('创建社群失败:', error);
    ElMessage.error('创建失败');
  }
};

const handleJoin = async (community: Community) => {
  try {
    await joinCommunity(community.id);
    ElMessage.success('加入成功');
    myCommunities.value.push(community.id);
  } catch (error) {
    console.error('加入社群失败:', error);
    ElMessage.error('加入失败');
  }
};

const handleLeave = async (community: Community) => {
  try {
    await ElMessageBox.confirm('确定要退出这个社群吗？', '退出确认', {
      type: 'warning',
    });
    await leaveCommunity(community.id);
    ElMessage.success('已退出社群');
    myCommunities.value = myCommunities.value.filter(id => id !== community.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出社群失败:', error);
      ElMessage.error('退出失败');
    }
  }
};

const handleViewDetail = async (community: Community) => {
  selectedCommunity.value = community;
  showDetailDialog.value = true;
  try {
    const res = await getCommunityMembers(community.id, { page: 1, pageSize: 50 });
    communityMembers.value = res?.list || [];
  } catch (error) {
    console.error('获取成员列表失败:', error);
  }
};

const resetForm = () => {
  communityForm.value = {
    name: '',
    description: '',
    category: '',
    isPublic: true,
  };
};

onMounted(() => {
  fetchCommunities();
  fetchMyCommunities();
});
</script>

<style lang="scss" scoped>
.community-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 0 16px;
  margin-bottom: 20px;

  .filter-actions {
    display: flex;
    gap: 12px;
  }
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.community-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .community-cover {
    height: 120px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .community-info {
    padding: 16px;
  }

  .community-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .community-basic {
      flex: 1;
      min-width: 0;

      .community-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .community-desc {
        font-size: 13px;
        color: #999;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .community-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
    }
  }

  .community-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .category-tag {
      font-size: 12px;
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.empty {
  grid-column: 1 / -1;
  padding: 60px 0;
  text-align: center;
}

.community-detail {
  .detail-header {
    display: flex;
    gap: 20px;
    align-items: center;

    .detail-info {
      flex: 1;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0 0 8px;
      }

      p {
        color: #666;
        margin: 0 0 12px;
      }

      .detail-stats {
        display: flex;
        gap: 16px;
        align-items: center;
        color: #999;
        font-size: 13px;
      }
    }
  }

  .members-section {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      .member-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: #f9f9f9;
        border-radius: 8px;

        .member-info {
          display: flex;
          flex-direction: column;

          .member-name {
            font-size: 14px;
            color: #333;
          }

          .member-role {
            font-size: 11px;
            color: #999;
          }
        }
      }
    }
  }
}
</style>
