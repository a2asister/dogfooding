<template>
  <div
    class="comment-item"
    :class="itemClasses"
  >
    <div
      class="bubble-wrapper"
      :class="wrapperClasses"
    >
      <div
        class="bubble"
        :class="bubbleClasses"
        :style="bubbleStyle"
      >
        <div class="bubble-header">
          <span class="author">{{ comment.author }}</span>
          <span class="time">{{ formattedTime }}</span>
        </div>
        
        <div class="bubble-content">
          <span v-if="isTyping" class="typing-text">
            <span
              v-for="(char, index) in displayedContent"
              :key="index"
              class="char"
              :class="{ 'char-appear': true }"
            >
              {{ char }}
            </span>
            <span v-if="showCursor" class="cursor"></span>
          </span>
          <span v-else>{{ comment.content }}</span>
        </div>
        
        <div class="bubble-actions">
          <button
            class="action-btn like-btn"
            :class="{ 'liked': comment.isLiked, 'popping': isLikePopping }"
            @click="handleLike"
          >
            <span class="heart">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
            <span class="like-count">{{ comment.likes }}</span>
          </button>
          <button class="action-btn reply-btn" @click="toggleReplyForm">
            <span>💬</span>
            <span>回复</span>
          </button>
          <button class="action-btn delete-btn" @click="handleDelete">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReplyForm" class="reply-form" :class="{ 'form-visible': showReplyForm }">
      <input
        v-model="replyAuthor"
        type="text"
        placeholder="你的昵称"
        class="input-field"
      />
      <textarea
        v-model="replyContent"
        placeholder="写下你的回复..."
        class="textarea-field"
        rows="2"
      ></textarea>
      <div class="form-actions">
        <button class="btn-cancel" @click="toggleReplyForm">取消</button>
        <button class="btn-submit" @click="submitReply" :disabled="!canSubmitReply">
          发送回复
        </button>
      </div>
    </div>

    <div v-if="comment.children && comment.children.length > 0" class="children-container">
      <div class="connection-line"></div>
      <CommentBubble
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :is-reply="true"
        :is-new="isChildNew(child.id)"
        @like="$emit('like', $event)"
        @delete="$emit('delete', $event)"
        @submit-reply="handleChildReply"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Comment } from '../api/comment';

interface Props {
  comment: Comment;
  isReply?: boolean;
  isNew?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false,
  isNew: false,
});

const emit = defineEmits<{
  like: [id: string];
  delete: [id: string];
  submitReply: [parentId: string, author: string, content: string];
}>();

const displayedContent = ref('');
const isTyping = ref(false);
const showCursor = ref(false);
const isShaking = ref(false);
const isLikePopping = ref(false);
const showReplyForm = ref(false);
const replyAuthor = ref('');
const replyContent = ref('');
const newChildIds = ref<string[]>([]);
const animationPhase = ref<'idle' | 'entering' | 'typing' | 'done'>('idle');

const canSubmitReply = computed(() => 
  replyAuthor.value.trim() && replyContent.value.trim()
);

const formattedTime = computed(() => {
  const date = new Date(props.comment.createdAt);
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const itemClasses = computed(() => {
  const classes: string[] = [];
  if (props.isReply) {
    classes.push('is-reply');
  }
  if (isShaking.value) {
    classes.push('shaking');
  }
  return classes;
});

const wrapperClasses = computed(() => {
  const classes: string[] = [];
  if (props.isNew && animationPhase.value === 'entering') {
    if (props.isReply) {
      classes.push('animate-slide-in');
    } else {
      classes.push('animate-fly-in');
    }
  }
  return classes;
});

const bubbleClasses = computed(() => {
  const classes: string[] = [];
  if (props.isNew && animationPhase.value === 'entering') {
    if (props.isReply) {
      classes.push('reply-inflat');
    } else {
      classes.push('bubble-inflat');
    }
  }
  if (props.comment.isLiked) {
    classes.push('bubble-liked');
  }
  return classes;
});

const bubbleStyle = computed(() => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];
  const colorIndex = Math.abs(props.comment.author.charCodeAt(0) + props.comment.id.charCodeAt(0)) % colors.length;
  return {
    background: colors[colorIndex],
  };
});

function isChildNew(childId: string): boolean {
  return newChildIds.value.includes(childId);
}

function handleChildReply(parentId: string, author: string, content: string) {
  emit('submitReply', parentId, author, content);
}

async function startTypingAnimation() {
  animationPhase.value = 'typing';
  isTyping.value = true;
  showCursor.value = true;
  displayedContent.value = '';
  
  const text = props.comment.content;
  const baseSpeed = 40;
  const minSpeed = 20;
  
  for (let i = 0; i < text.length; i++) {
    displayedContent.value += text[i];
    const randomDelay = Math.random() * 30;
    const delay = text[i] === '，' || text[i] === '。' || text[i] === '、' 
      ? baseSpeed + 50 + randomDelay 
      : minSpeed + randomDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
  showCursor.value = false;
  isTyping.value = false;
  animationPhase.value = 'done';
}

async function handleLike() {
  isShaking.value = true;
  isLikePopping.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 500);
  setTimeout(() => {
    isLikePopping.value = false;
  }, 300);
  
  emit('like', props.comment.id);
}

function handleDelete() {
  emit('delete', props.comment.id);
}

function toggleReplyForm() {
  showReplyForm.value = !showReplyForm.value;
  if (!showReplyForm.value) {
    replyAuthor.value = '';
    replyContent.value = '';
  }
}

async function submitReply() {
  if (!canSubmitReply.value) return;
  
  const author = replyAuthor.value.trim();
  const content = replyContent.value.trim();
  
  emit('submitReply', props.comment.id, author, content);
  
  toggleReplyForm();
}

async function runEntranceAnimation() {
  animationPhase.value = 'entering';
  const enterDuration = props.isReply ? 500 : 700;
  await new Promise(resolve => setTimeout(resolve, enterDuration + 100));
  await startTypingAnimation();
}

onMounted(() => {
  if (props.isNew) {
    displayedContent.value = '';
    runEntranceAnimation();
  } else {
    displayedContent.value = props.comment.content;
    animationPhase.value = 'done';
  }
});

watch(() => props.comment.content, (newContent) => {
  if (animationPhase.value === 'done') {
    displayedContent.value = newContent;
  }
});

watch(() => props.isNew, (isNew) => {
  if (isNew) {
    runEntranceAnimation();
  }
});
</script>

<style scoped>
.comment-item {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.comment-item.is-reply {
  margin-left: 50px;
  position: relative;
}

.bubble-wrapper {
  display: inline-block;
  max-width: 100%;
}

.children-container {
  position: relative;
  margin-top: 10px;
  margin-left: 50px;
}

.connection-line {
  position: absolute;
  left: -35px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.2));
  border-radius: 2px;
}

.connection-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 28px;
  width: 25px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.5));
}

.bubble {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 20px 4px;
  padding: 18px 22px;
  color: white;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.25),
    0 2px 6px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  max-width: 650px;
  opacity: 1;
  transition: all 0.3s ease;
}

.bubble::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 18px;
  width: 18px;
  height: 18px;
  background: inherit;
  border-radius: 0 0 0 12px;
  transform: rotate(45deg);
  z-index: -1;
  box-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.1);
}

.bubble-liked {
  filter: brightness(1.15);
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.comment-item.is-reply .bubble {
  border-radius: 20px 20px 4px 20px;
}

.comment-item.is-reply .bubble::before {
  left: auto;
  right: 18px;
  border-radius: 0 0 12px 0;
}

.shaking .bubble {
  animation: shake 0.5s ease-in-out;
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.author {
  font-weight: 600;
  opacity: 0.98;
  text-shadow: 0 1px 3px rgba(0,0,0,0.25);
}

.time {
  opacity: 0.75;
  font-size: 12px;
}

.bubble-content {
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 14px;
  word-break: break-word;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.typing-text {
  display: inline;
}

.char {
  display: inline;
  opacity: 0;
  animation: charFadeIn 0.15s ease-out forwards;
}

@keyframes charFadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bubble-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 7px 14px;
  border-radius: 22px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

.like-btn.liked {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.4);
}

.like-btn.popping .heart {
  animation: likePop 0.35s ease-out;
}

.like-count {
  font-weight: 500;
}

.reply-form {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  padding: 18px;
  margin-top: 14px;
  max-width: 650px;
  opacity: 0;
  transform: translateY(-15px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  height: 0;
  overflow: hidden;
}

.form-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  height: auto;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 11px 16px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  font-size: 14px;
  margin-bottom: 12px;
  outline: none;
  transition: all 0.25s ease;
  font-family: inherit;
}

.input-field:focus,
.textarea-field:focus {
  border-color: rgba(255, 255, 255, 0.7);
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.textarea-field {
  resize: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel,
.btn-submit {
  padding: 9px 22px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.22);
  color: white;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.35);
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg) translateY(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotate(-4deg) translateY(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: rotate(4deg) translateY(-2px);
  }
}

@keyframes likePop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.5);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
</style>
