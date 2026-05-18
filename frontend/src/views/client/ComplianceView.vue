<template>
  <div class="compliance-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>{{ doc?.title || '合规公示' }}</h1>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="doc-nav">
          <button
            v-for="docItem in docList"
            :key="docItem.type"
            :class="{ active: currentType === docItem.type }"
            @click="switchDoc(docItem.type)"
          >
            {{ docItem.label }}
          </button>
        </div>

        <div v-if="doc" class="doc-content card">
          <div class="doc-header">
            <h2>{{ doc.title }}</h2>
            <span class="doc-updated">最后更新：{{ formatDate(doc.updated_at) }}</span>
          </div>
          <div class="doc-body" v-html="doc.content"></div>
        </div>
        <div v-else class="loading">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { complianceApi } from '../../api'
import type { ComplianceDoc } from '../../types'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const docList = [
  { type: 'user_agreement', label: '用户协议' },
  { type: 'privacy_policy', label: '隐私政策' },
  { type: 'minor_protection', label: '未成年人保护' },
  { type: 'copyright', label: '版权声明' }
]

const currentType = ref(route.params.type as string)
const doc = ref<ComplianceDoc | null>(null)

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const switchDoc = (type: string): void => {
  router.push(`/compliance/${type}`)
}

const loadDoc = async (): Promise<void> => {
  const type = route.params.type as string
  currentType.value = type

  try {
    const result = await complianceApi.getByType(type)
    doc.value = result
  } catch {
    doc.value = null
  }
}

onMounted(() => {
  loadDoc()
})

watch(() => route.params.type, () => {
  loadDoc()
})
</script>

<style scoped lang="scss">
.compliance-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  padding: 60px 0;
  text-align: center;

  h1 {
    font-size: 36px;
    color: white;
  }
}

.section {
  padding: 40px 0 80px;
}

.doc-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;

  button {
    padding: 10px 28px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;

    &:hover, &.active {
      border-color: var(--secondary-color);
      color: var(--secondary-color);
    }

    &.active {
      background: var(--secondary-color);
      color: var(--bg-dark);
    }
  }
}

.doc-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;

  .doc-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    h2 {
      font-size: 28px;
      color: var(--text-primary);
      margin: 0;
    }

    .doc-updated {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .doc-body {
    color: var(--text-primary);
    line-height: 1.8;
    font-size: 15px;

    :deep(h1), :deep(h2), :deep(h3) {
      margin: 24px 0 16px;
      color: var(--secondary-color);
    }

    :deep(h1) {
      font-size: 24px;
    }

    :deep(h2) {
      font-size: 20px;
    }

    :deep(h3) {
      font-size: 18px;
    }

    :deep(p) {
      margin-bottom: 16px;
    }

    :deep(ul), :deep(ol) {
      margin: 16px 0;
      padding-left: 24px;
    }

    :deep(li) {
      margin-bottom: 8px;
    }

    :deep(strong) {
      color: var(--secondary-color);
    }
  }
}

.loading {
  text-align: center;
  padding: 80px 0;

  p {
    margin-top: 16px;
    color: var(--text-secondary);
  }

  .is-loading {
    color: var(--secondary-color);
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
