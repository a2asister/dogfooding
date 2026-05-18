<template>
  <Layout>
    <div class="search-page">
      <div class="search-header">
        <div class="search-box">
          <el-input
            v-model="keyword"
            placeholder="搜索笔记、用户、话题"
            size="large"
            clearable
            @input="handleInput"
            @keyup.enter="handleSearch"
            @clear="handleClear"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div v-if="suggestions.length > 0 && keyword && !hasSearched" class="suggestions">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <el-icon><Search /></el-icon>
            <span>{{ suggestion }}</span>
          </div>
        </div>
      </div>

      <div v-if="!hasSearched" class="search-content">
        <div v-if="userStore.isLoggedIn && searchHistory.length > 0" class="section">
          <div class="section-header">
            <span class="title">搜索历史</span>
            <el-button type="text" size="small" @click="clearHistory">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
          <div class="tag-list">
            <el-tag
              v-for="item in searchHistory"
              :key="item.id"
              class="history-tag"
              closable
              @click="selectSuggestion(item.keyword)"
              @close="deleteHistory(item.id)"
            >
              {{ item.keyword }}
            </el-tag>
          </div>
        </div>

        <div v-if="hotSearches.length > 0" class="section">
          <div class="section-header">
            <span class="title">
              <el-icon><HotWater /></el-icon>
              热门搜索
            </span>
          </div>
          <div class="hot-list">
            <div
              v-for="(item, index) in hotSearches"
              :key="item.id"
              class="hot-item"
              @click="selectSuggestion(item.keyword)"
            >
              <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="keyword">{{ item.keyword }}</span>
              <span class="count">{{ item.searchCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="search-results">
        <el-tabs v-model="resultType" class="result-tabs">
          <el-tab-pane label="综合" name="all" />
          <el-tab-pane label="笔记" name="note" />
          <el-tab-pane label="用户" name="user" />
          <el-tab-pane label="话题" name="topic" />
        </el-tabs>

        <div v-loading="loading" class="results-container">
          <div v-if="resultType === 'all' || resultType === 'note'">
            <div v-if="searchResult.notes && searchResult.notes.list.length > 0" class="result-section">
              <h4 v-if="resultType === 'all'" class="section-title">
                笔记
                <span class="count">{{ searchResult.notes.total }}</span>
              </h4>
              <div class="note-results">
                <div
                  v-for="note in searchResult.notes.list"
                  :key="note.id"
                  class="note-result-item"
                  @click="$router.push(`/note/${note.id}`)"
                >
                  <div class="note-info">
                    <h4 class="title">{{ highlightKeyword(note.title) }}</h4>
                    <p class="desc">{{ highlightKeyword(note.content.substring(0, 100)) }}</p>
                    <div class="meta">
                      <el-avatar :size="20" :src="note.author.avatar">
                        {{ note.author.nickname?.charAt(0) }}
                      </el-avatar>
                      <span class="author">{{ note.author.nickname }}</span>
                      <span class="stats">
                        <el-icon><Star /></el-icon>
                        {{ note.likeCount }}
                        <el-icon><ChatDotRound /></el-icon>
                        {{ (note as any).commentCount || 0 }}
                      </span>
                    </div>
                  </div>
                  <img v-if="note.images && note.images.length > 0" :src="note.images[0]" class="note-cover" />
                </div>
              </div>
            </div>
            <el-empty v-else-if="resultType === 'note'" description="暂无相关笔记" />
          </div>

          <div v-if="resultType === 'all' || resultType === 'user'">
            <div v-if="searchResult.users && searchResult.users.list.length > 0" class="result-section">
              <h4 v-if="resultType === 'all'" class="section-title">
                用户
                <span class="count">{{ searchResult.users.total }}</span>
              </h4>
              <div class="user-results">
                <div
                  v-for="user in searchResult.users.list"
                  :key="user.id"
                  class="user-result-item"
                  @click="$router.push(`/user/${user.id}`)"
                >
                  <el-avatar :size="50" :src="user.avatar">
                    {{ user.nickname?.charAt(0) }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="name">{{ highlightKeyword(user.nickname) }}</div>
                    <div class="bio">{{ user.bio || '暂无简介' }}</div>
                    <div class="stats">
                      <span>{{ user.followerCount }} 粉丝</span>
                      <span>{{ user.noteCount }} 笔记</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else-if="resultType === 'user'" description="暂无相关用户" />
          </div>

          <div v-if="resultType === 'all' || resultType === 'topic'">
            <div v-if="searchResult.topics && searchResult.topics.list.length > 0" class="result-section">
              <h4 v-if="resultType === 'all'" class="section-title">
                话题
                <span class="count">{{ searchResult.topics.total }}</span>
              </h4>
              <div class="topic-results">
                <div
                  v-for="topic in searchResult.topics.list"
                  :key="topic.id"
                  class="topic-result-item"
                  @click="$router.push(`/topic/${topic.id}`)"
                >
                  <div class="topic-cover" v-if="topic.cover">
                    <img :src="topic.cover" />
                  </div>
                  <div class="topic-cover default" v-else>
                    <el-icon><Collection /></el-icon>
                  </div>
                  <div class="topic-info">
                    <div class="name">#{{ highlightKeyword(topic.name) }}</div>
                    <div class="desc">{{ topic.description || '暂无描述' }}</div>
                    <div class="stats">
                      <span>{{ topic.noteCount }} 笔记</span>
                      <span>{{ topic.followCount }} 关注</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else-if="resultType === 'topic'" description="暂无相关话题" />
          </div>

          <el-empty v-if="resultType === 'all' && !hasResults" description="暂无搜索结果" />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { search, getSearchSuggestions, getSearchHistory, clearSearchHistory, deleteSearchHistory, getHotSearches } from '@/api/search';
import { ElMessage } from 'element-plus';
import { Search, Delete, HotWater, Star, ChatDotRound, Collection } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { SearchHistory, HotSearch, SearchResult } from '@/types';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const keyword = ref('');
const suggestions = ref<string[]>([]);
const searchHistory = ref<SearchHistory[]>([]);
const hotSearches = ref<HotSearch[]>([]);
const hasSearched = ref(false);
const loading = ref(false);
const resultType = ref('all');
const searchResult = ref<SearchResult>({});
let searchTimer: any = null;

const hasResults = () => {
  const r = searchResult.value;
  return (r.notes?.list?.length || 0) + (r.users?.list?.length || 0) + (r.topics?.list?.length || 0) > 0;
};

const highlightKeyword = (text: string) => {
  if (!keyword.value || !text) return text;
  const regex = new RegExp(`(${keyword.value})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const handleInput = () => {
  clearTimeout(searchTimer);
  if (keyword.value) {
    searchTimer = setTimeout(async () => {
      try {
        const res = await getSearchSuggestions(keyword.value);
        suggestions.value = res.suggestions;
      } catch (error) {
        console.error('获取搜索建议失败:', error);
      }
    }, 300);
  } else {
    suggestions.value = [];
  }
};

const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  hasSearched.value = true;
  suggestions.value = [];
  loading.value = true;
  try {
    const res = await search({
      keyword: keyword.value,
      type: resultType.value as any,
      page: 1,
      pageSize: 20,
    });
    searchResult.value = res;
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
  }
};

const selectSuggestion = (text: string) => {
  keyword.value = text;
  handleSearch();
};

const handleClear = () => {
  hasSearched.value = false;
  searchResult.value = {};
  suggestions.value = [];
};

const fetchSearchHistory = async () => {
  if (!userStore.isLoggedIn) return;
  try {
    const res = await getSearchHistory();
    searchHistory.value = res.list;
  } catch (error) {
    console.error('获取搜索历史失败:', error);
  }
};

const clearHistory = async () => {
  try {
    await clearSearchHistory();
    searchHistory.value = [];
    ElMessage.success('已清空搜索历史');
  } catch (error) {
    console.error('清空搜索历史失败:', error);
  }
};

const deleteHistory = async (id: string) => {
  try {
    await deleteSearchHistory(id);
    searchHistory.value = searchHistory.value.filter(item => item.id !== id);
  } catch (error) {
    console.error('删除搜索历史失败:', error);
  }
};

const fetchHotSearches = async () => {
  try {
    const res = await getHotSearches();
    hotSearches.value = res.list;
  } catch (error) {
    console.error('获取热门搜索失败:', error);
  }
};

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q as string;
    handleSearch();
  }
  fetchSearchHistory();
  fetchHotSearches();
});
</script>

<style lang="scss" scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-box {
  :deep(.el-input__wrapper) {
    border-radius: 24px;
  }
}

.suggestions {
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  color: #666;

  &:hover {
    background: #f5f5f5;
  }
}

.search-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title {
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: #f5f5f5;
  }

  .rank {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #999;

    &.top {
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: #fff;
    }
  }

  .keyword {
    flex: 1;
    color: #333;
  }

  .count {
    font-size: 12px;
    color: #999;
  }
}

.search-results {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.result-tabs {
  margin-bottom: 20px;
}

.results-container {
  min-height: 200px;
}

.result-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .count {
      font-size: 14px;
      font-weight: normal;
      color: #999;
    }
  }
}

.note-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-result-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f5f5f5;
  }

  .note-info {
    flex: 1;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .desc {
      color: #666;
      font-size: 14px;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #999;

      .author {
        flex: 1;
      }

      .stats {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .note-cover {
    width: 100px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }
}

.user-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.user-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f5f5f5;
  }

  .user-info {
    flex: 1;

    .name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .bio {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      font-size: 12px;
      color: #999;
      display: flex;
      gap: 12px;
    }
  }
}

.topic-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.topic-result-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f5f5f5;
  }

  .topic-cover {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.default {
      background: #f0f0f0;
      color: #999;
    }
  }

  .topic-info {
    flex: 1;

    .name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .desc {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      font-size: 12px;
      color: #999;
      display: flex;
      gap: 12px;
    }
  }
}

.highlight {
  color: #409eff;
  font-weight: 600;
}
</style>
