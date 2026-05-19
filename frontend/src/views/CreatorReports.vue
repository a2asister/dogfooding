<template>
  <Layout>
    <div class="report-page">
      <div class="page-header">
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document,
  Download,
  Refresh,
  TrendCharts,
  User,
  View,
  Star,
  ChatDotRound,
  DataLine,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getCreatorReportList, getLatestReport, generateReport, exportReport } from '@/api/creatorReport';
import type { CreatorReport } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const reports = ref<CreatorReport[]>([]);
const latestReport = ref<CreatorReport | null>(null);
const selectedReport = ref<CreatorReport | null>(null);
const activeTab = ref('list');
const filterType = ref('');

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD');

const fetchReports = async () => {
  loading.value = true;
  try {
    const res = await getCreatorReportList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      type: filterType.value,
    });
    reports.value = res?.list || [];
    pagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取报告列表失败:', error);
    ElMessage.error('获取报告列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchLatestReport = async () => {
  try {
    const res = await getLatestReport('weekly');
    latestReport.value = res.report;
  } catch (error) {
    console.error('获取最新报告失败:', error);
  }
};

const handleGenerate = async (type: 'daily' | 'weekly') => {
  ElMessage.success('报告生成中，请稍后查看');
};

const handleViewReport = (report: CreatorReport) => {
  selectedReport.value = report;
};

const handleExport = async (report: CreatorReport, format: 'pdf' | 'excel') => {
  try {
    await exportReport(report.id, format);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

onMounted(() => {
  fetchReports();
  fetchLatestReport();
});
</script>

<style lang="scss" scoped>
.report-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}
</style>
