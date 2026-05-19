<template>
  <div class="hot-ranks">
    <div class="page-header">
      <h2>热门榜单</h2>
      <div class="filter-bar">
        <el-select v-model="filterType" placeholder="榜单类型" style="width: 140px" @change="fetchRanks">
          <el-option label="全部" value="" />
          <el-option label="日榜" value="daily" />
          <el-option label="周榜" value="weekly" />
          <el-option label="月榜" value="monthly" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
          @change="fetchRanks"
        />
        <el-button type="primary" @click="fetchRanks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="rank-list">
      <el-table :data="ranks" border stripe>
        <el-table-column prop="rank" label="排名" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.rank <= 3" class="top-rank">
              <el-tag :type="getRankTagType(row.rank)">{{ row.rank }}</el-tag>
            </span>
            <span v-else>{{ row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column label="笔记标题" min-width="200">
          <template #default="{ row }">
            <span v-if="row.note">{{ row.note.title }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="热度分" width="120" align="center" />
        <el-table-column prop="createdAt" label="上榜时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="isPinned" label="是否置顶" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isPinned ? 'danger' : 'info'">{{ row.isPinned ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleBoost(row)">
              调整热度
            </el-button>
            <el-button :type="row.isPinned ? 'info' : 'warning'" size="small" @click="handlePin(row)">
              {{ row.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="fetchRanks"
          @current-change="fetchRanks"
        />
      </div>
    </div>

    <el-dialog v-model="boostDialogVisible" title="调整热度" width="400px">
      <el-form :model="boostForm" label-width="80px">
        <el-form-item label="热度值">
          <el-input-number v-model="boostForm.boostValue" :min="1" :max="10000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="boostDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBoost">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getHotRanks, manualBoostRank, pinRank } from '@/api/operation';
import type { HotRank } from '@/types';
import { Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const ranks = ref<HotRank[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterType = ref('');
const dateRange = ref<[string, string] | null>(null);

const boostDialogVisible = ref(false);
const currentRank = ref<HotRank | null>(null);
const boostForm = reactive({
  boostValue: 100,
});

const getRankTagType = (rank: number) => {
  const map: Record<number, string> = {
    1: 'danger',
    2: 'warning',
    3: 'primary',
  };
  return map[rank] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchRanks = async () => {
  loading.value = true;
  try {
    const res = await getHotRanks({
      type: filterType.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    ranks.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取热门榜单失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleBoost = (rank: HotRank) => {
  currentRank.value = rank;
  boostForm.boostValue = rank.boostValue || 100;
  boostDialogVisible.value = true;
};

const confirmBoost = async () => {
  if (!currentRank.value) return;
  try {
    await manualBoostRank(currentRank.value.id, boostForm.boostValue);
    ElMessage.success('热度调整成功');
    boostDialogVisible.value = false;
    fetchRanks();
  } catch (error) {
    console.error('调整热度失败:', error);
  }
};

const handlePin = async (rank: HotRank) => {
  try {
    const action = rank.isPinned ? '取消置顶' : '置顶';
    await ElMessageBox.confirm(`确定要${action}该笔记吗？`, '确认', {
      type: 'warning',
    });
    await pinRank(rank.id, !rank.isPinned);
    ElMessage.success(`${action}成功`);
    fetchRanks();
  } catch (error) {
    console.error(`${action}失败:`, error);
  }
};

onMounted(() => {
  fetchRanks();
});
</script>

<style lang="scss" scoped>
.hot-ranks {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
    }
  }

  .rank-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .top-rank {
    .el-tag {
      font-weight: 600;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
