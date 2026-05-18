<template>
  <div class="note-card">
    <div class="note-header">
      <div class="author" @click="$router.push(`/user/${note.author.id}`)">
        <el-avatar :size="40" :src="note.author.avatar">
          {{ note.author.nickname?.charAt(0) }}
        </el-avatar>
        <div class="info">
          <div class="name">{{ note.author.nickname }}</div>
          <div class="time">
            {{ formatTime(note.createdAt) }}
            <span v-if="note.location" class="location">
              <el-icon><Location /></el-icon>
              {{ note.location }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="showHot && note.hotScore" class="hot-badge">
        <el-icon><HotWater /></el-icon>
        {{ note.hotScore.toFixed(1) }}
      </div>
    </div>

    <div v-if="note.topics && note.topics.length > 0" class="topics">
      <el-tag
        v-for="topic in note.topics"
        :key="topic"
        size="small"
        type="info"
        class="topic-tag"
        @click.stop="$router.push(`/topic?name=${topic}`)"
      >
        #{{ topic }}
      </el-tag>
    </div>

    <div class="note-content" @click="$router.push(`/note/${note.id}`)">
      <h3 class="title">{{ note.title }}</h3>
      <p class="desc">{{ note.content.substring(0, 150) }}{{ note.content.length > 150 ? '...' : '' }}</p>
      <div v-if="note.images && note.images.length > 0" class="images">
        <img
          v-for="(img, idx) in note.images.slice(0, 3)"
          :key="idx"
          :src="img"
          :class="{ single: note.images.length === 1 }"
        />
      </div>
    </div>

    <div class="note-footer">
      <div class="action" :class="{ active: note.isLiked }" @click.stop="$emit('like', note)">
        <el-icon><Star /></el-icon>
        <span>{{ note.likeCount }}</span>
      </div>
      <div class="action" :class="{ active: note.isFavorited }" @click.stop="$emit('favorite', note)">
        <el-icon><Collection /></el-icon>
        <span>{{ note.favoriteCount }}</span>
      </div>
      <div class="action" @click.stop="$router.push(`/note/${note.id}`)">
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ (note as any).commentCount || 0 }}</span>
      </div>
      <div class="action">
        <el-icon><View /></el-icon>
        <span>{{ note.viewCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Location, HotWater, Star, Collection, ChatDotRound, View } from '@element-plus/icons-vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

defineProps<{
  note: Note;
  showHot?: boolean;
}>();

defineEmits<{
  (e: 'like', note: Note): void;
  (e: 'favorite', note: Note): void;
  (e: 'update'): void;
}>();

const formatTime = (time: string) => {
  const now = dayjs();
  const target = dayjs(time);
  const diffDays = now.diff(target, 'day');
  if (diffDays < 1) {
    return target.fromNow();
  }
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  return target.format('YYYY-MM-DD');
};
</script>

<style lang="scss" scoped>
.note-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;

  .note-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .author {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      .info {
        .name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .time {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;

          .location {
            display: flex;
            align-items: center;
            gap: 2px;
          }
        }
      }
    }

    .hot-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #ff6b6b, #ffa500);
      color: #fff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
  }

  .topics {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .topic-tag {
      cursor: pointer;
    }
  }

  .note-content {
    cursor: pointer;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
      line-height: 1.4;
    }

    .desc {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;

        &.single {
          grid-column: span 3;
          height: 240px;
        }
      }
    }
  }

  .note-footer {
    display: flex;
    gap: 24px;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #f5f5f5;

    .action {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #999;
      cursor: pointer;
      transition: color 0.3s;

      &:hover,
      &.active {
        color: #409eff;
      }
    }
  }
}
</style>
