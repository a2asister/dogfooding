<template>
  <div class="repository-page">
    <el-card shadow="hover" class="mb-24">
      <template #header>
        <div class="flex-between">
          <span class="card-title">仓库信息</span>
        </div>
      </template>
      <div v-if="repository" class="repo-info">
        <div class="repo-header">
          <el-avatar :size="64" :src="repository.owner.avatar_url" />
          <div class="repo-header-info">
            <h2>
              <a :href="repository.html_url" target="_blank" class="repo-name">
                {{ repository.full_name }}
              </a>
            </h2>
            <p class="repo-desc">{{ repository.description || '暂无描述' }}</p>
            <div class="repo-tags" v-if="repository.topics?.length">
              <el-tag v-for="topic in repository.topics" :key="topic" size="small" style="margin-right: 4px">
                {{ topic }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-divider />
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="stat-item">
              <el-icon class="stat-icon text-warning"><Star /></el-icon>
              <div>
                <div class="stat-value">{{ repository.stargazers_count?.toLocaleString() }}</div>
                <div class="stat-label">Star 数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <el-icon class="stat-icon text-primary"><Share /></el-icon>
              <div>
                <div class="stat-value">{{ repository.forks_count?.toLocaleString() }}</div>
                <div class="stat-label">Fork 数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <el-icon class="stat-icon text-danger"><Document /></el-icon>
              <div>
                <div class="stat-value">{{ repository.open_issues_count?.toLocaleString() }}</div>
                <div class="stat-label">开放 Issue</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <el-icon class="stat-icon text-success"><View /></el-icon>
              <div>
                <div class="stat-value">{{ repository.watchers_count?.toLocaleString() }}</div>
                <div class="stat-label">Watcher 数</div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider />
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">编程语言:</span>
              <el-tag v-if="repository.language" type="primary">
                {{ repository.language }}
              </el-tag>
              <span v-else class="text-info">未设置</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">默认分支:</span>
              <el-tag>{{ repository.default_branch }}</el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">仓库大小:</span>
              <span class="text-primary">{{ (repository.size / 1024).toFixed(2) }} MB</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">创建时间:</span>
              <span>{{ formatDate(repository.created_at) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span>{{ formatDate(repository.updated_at) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">最后推送:</span>
              <span>{{ formatDate(repository.pushed_at) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-skeleton v-else :rows="5" animated />
    </el-card>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">语言分布</span>
          </template>
          <div ref="languageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">分支列表</span>
          </template>
          <el-table :data="branches" style="width: 100%">
            <el-table-column prop="name" label="分支名称">
              <template #default="{ row }">
                <el-tag :type="row.name === repository?.default_branch ? 'success' : ''">
                  {{ row.name }}
                  <span v-if="row.name === repository?.default_branch" style="margin-left: 4px">(默认)</span>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="保护状态">
              <template #default="{ row }">
                <el-tag v-if="row.protected" type="warning">已保护</el-tag>
                <el-tag v-else type="info">未保护</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-top: 24px">
      <template #header>
        <span class="card-title">最近标签</span>
      </template>
      <el-table :data="tags" style="width: 100%">
        <el-table-column prop="name" label="标签名称" width="200">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="commit.sha" label="Commit SHA" width="180">
          <template #default="{ row }">
            <el-text type="info">{{ row.commit?.sha?.slice(0, 7) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="node_id" label="节点 ID" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="window.open(row.commit?.url, '_blank')"
            >
              查看 Commit
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { useAppStore } from '@/stores/app';
import {
  getRepository,
  getLanguages,
  getBranches,
  getTags,
} from '@/api/repository';
import type { Repository } from '@/api/repository';

const appStore = useAppStore();

const repository = ref<Repository | null>(null);
const languages = ref<Record<string, number>>({});
const branches = ref<any[]>([]);
const tags = ref<any[]>([]);
const languageChartRef = ref<HTMLElement>();

let languageChart: echarts.ECharts | null = null;

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

async function loadData() {
  try {
    const [repoData, langData, branchData, tagData] = await Promise.all([
      getRepository(appStore.repositoryOwner, appStore.repositoryName),
      getLanguages(appStore.repositoryOwner, appStore.repositoryName),
      getBranches(appStore.repositoryOwner, appStore.repositoryName),
      getTags(appStore.repositoryOwner, appStore.repositoryName),
    ]);

    repository.value = repoData;
    languages.value = langData;
    branches.value = branchData;
    tags.value = tagData.slice(0, 10);

    await nextTick();
    initLanguageChart();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

function initLanguageChart() {
  if (languageChartRef.value && Object.keys(languages.value).length > 0) {
    languageChart = echarts.init(languageChartRef.value);
    
    const languageData = Object.entries(languages.value).map(([name, value]) => ({
      name,
      value,
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
      },
      series: [
        {
          name: '编程语言',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: languageData,
        },
      ],
    };

    languageChart.setOption(option);
  }
}

watch(
  () => [appStore.repositoryOwner, appStore.repositoryName],
  () => {
    loadData();
  },
);

onMounted(() => {
  loadData();

  window.addEventListener('resize', () => {
    languageChart?.resize();
  });
});
</script>

<style scoped lang="scss">
.repository-page {
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .repo-info {
    .repo-header {
      display: flex;
      align-items: flex-start;

      .repo-header-info {
        margin-left: 20px;

        .repo-name {
          font-size: 24px;
          font-weight: 700;
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        .repo-desc {
          font-size: 14px;
          color: #606266;
          margin-top: 8px;
        }

        .repo-tags {
          margin-top: 12px;
        }
      }
    }

    .stat-item {
      display: flex;
      align-items: center;

      .stat-icon {
        font-size: 32px;
        margin-right: 12px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }

    .info-item {
      display: flex;
      align-items: center;

      .info-label {
        font-size: 14px;
        color: #606266;
        margin-right: 8px;
      }
    }
  }
}
</style>
