<template>
  <Layout>
    <div class="settings-page">
      <div class="page-header">
        <h1 class="title">设置</h1>
      </div>

      <div class="settings-content">
        <el-menu
          :default-active="activeMenu"
          class="settings-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="privacy">
            <el-icon><Lock /></el-icon>
            <span>隐私设置</span>
          </el-menu-item>
          <el-menu-item index="notification">
            <el-icon><Bell /></el-icon>
            <span>消息通知</span>
          </el-menu-item>
          <el-menu-item index="blacklist">
            <el-icon><CircleClose /></el-icon>
            <span>黑名单</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon><Key /></el-icon>
            <span>账号安全</span>
          </el-menu-item>
        </el-menu>

        <div class="settings-panel">
          <div v-if="activeMenu === 'profile'" class="profile-panel">
            <h2>个人资料</h2>
            <el-form :model="profileForm" label-width="100px">
              <el-form-item label="头像">
                <el-avatar :size="80" :src="profileForm.avatar">
                  {{ profileForm.nickname?.charAt(0) }}
                </el-avatar>
                <el-button type="text" size="small">更换头像</el-button>
              </el-form-item>
              <el-form-item label="背景墙">
                <div class="bg-preview" :style="{ backgroundImage: `url(${profileForm.background})` }">
                  <el-button type="text" size="small">更换背景</el-button>
                </div>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="secret">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="所在地">
                <el-input v-model="profileForm.location" placeholder="请输入所在地" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="介绍一下自己吧"
                />
              </el-form-item>
              <el-form-item label="个人网站">
                <el-input v-model="profileForm.website" placeholder="https://" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingProfile" @click="saveProfile">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'privacy'" class="privacy-panel">
            <h2>隐私设置</h2>
            <el-form :model="privacyForm" label-width="150px">
              <el-form-item label="谁可以查看我的笔记">
                <el-radio-group v-model="privacyForm.noteVisibility">
                  <el-radio label="public">所有人</el-radio>
                  <el-radio label="followers">仅关注者</el-radio>
                  <el-radio label="private">仅自己</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="谁可以关注我">
                <el-radio-group v-model="privacyForm.followPermission">
                  <el-radio label="all">所有人</el-radio>
                  <el-radio label="approved">需要审核</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="谁可以给我发私信">
                <el-radio-group v-model="privacyForm.messagePermission">
                  <el-radio label="all">所有人</el-radio>
                  <el-radio label="followers">仅关注者</el-radio>
                  <el-radio label="none">不接收</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="显示在线状态">
                <el-switch v-model="privacyForm.showOnlineStatus" />
              </el-form-item>
              <el-form-item label="允许被搜索到">
                <el-switch v-model="privacyForm.searchable" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingPrivacy" @click="savePrivacy">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'notification'" class="notification-panel">
            <h2>消息通知</h2>
            <el-form :model="notificationForm" label-width="150px">
              <el-form-item label="点赞通知">
                <el-switch v-model="notificationForm.likeEnabled" />
              </el-form-item>
              <el-form-item label="评论通知">
                <el-switch v-model="notificationForm.commentEnabled" />
              </el-form-item>
              <el-form-item label="回复通知">
                <el-switch v-model="notificationForm.replyEnabled" />
              </el-form-item>
              <el-form-item label="关注通知">
                <el-switch v-model="notificationForm.followEnabled" />
              </el-form-item>
              <el-form-item label="收藏通知">
                <el-switch v-model="notificationForm.favoriteEnabled" />
              </el-form-item>
              <el-form-item label="系统通知">
                <el-switch v-model="notificationForm.systemEnabled" />
              </el-form-item>
              <el-form-item label="推送通知">
                <el-switch v-model="notificationForm.pushEnabled" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingNotification" @click="saveNotification">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="activeMenu === 'blacklist'" class="blacklist-panel">
            <h2>黑名单</h2>
            <div v-if="blacklistLoading" class="loading">
              <el-skeleton :rows="5" animated />
            </div>
            <div v-else-if="blacklist.length > 0" class="blacklist-list">
              <div
                v-for="item in blacklist"
                :key="item.id"
                class="blacklist-item"
              >
                <el-avatar :size="44" :src="item.blockedUser.avatar">
                  {{ item.blockedUser.nickname?.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="username">{{ item.blockedUser.nickname }}</div>
                  <div class="block-time">屏蔽时间：{{ formatTime(item.createdAt) }}</div>
                </div>
                <el-button type="danger" size="small" @click="removeFromBlacklist(item.id)">
                  解除屏蔽
                </el-button>
              </div>
            </div>
            <div v-else class="no-blacklist">
              <el-empty description="暂无黑名单记录" />
            </div>
          </div>

          <div v-if="activeMenu === 'security'" class="security-panel">
            <h2>账号安全</h2>
            <div class="security-list">
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">
                    <el-icon><Lock /></el-icon>
                    修改密码
                  </div>
                  <div class="security-desc">定期修改密码保护账号安全</div>
                </div>
                <el-button type="primary" size="small">修改</el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">
                    <el-icon><Phone /></el-icon>
                    绑定手机
                  </div>
                  <div class="security-desc">已绑定：138****8888</div>
                </div>
                <el-button size="small">更换</el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">
                    <el-icon><Avatar /></el-icon>
                    实名认证
                  </div>
                  <div class="security-desc">享受更多功能权限</div>
                </div>
                <el-button type="primary" size="small">去认证</el-button>
              </div>
              <div class="security-item danger">
                <div class="security-info">
                  <div class="security-title">
                    <el-icon><Warning /></el-icon>
                    注销账号
                  </div>
                  <div class="security-desc">注销后所有数据将无法恢复</div>
                </div>
                <el-button type="danger" size="small">注销</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { updateProfileExtended, getPrivacySettings, updatePrivacySettings, getNotificationSettings, updateNotificationSettings } from '@/api/user';
import { getBlacklist, removeFromBlacklist as removeBlacklist } from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  User,
  Lock,
  Bell,
  CircleClose,
  Key,
  Phone,
  Avatar,
  Warning,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { PrivacySettings, NotificationSettings, BlacklistItem } from '@/types';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();

const activeMenu = ref('profile');
const savingProfile = ref(false);
const savingPrivacy = ref(false);
const savingNotification = ref(false);
const blacklistLoading = ref(false);
const blacklist = ref<BlacklistItem[]>([]);

const profileForm = reactive({
  avatar: '',
  background: '',
  nickname: '',
  gender: 'secret' as 'male' | 'female' | 'secret',
  birthday: '',
  location: '',
  bio: '',
  website: '',
});

const privacyForm = reactive<PrivacySettings>({
  noteVisibility: 'public',
  followPermission: 'all',
  messagePermission: 'all',
  showOnlineStatus: true,
  searchable: true,
});

const notificationForm = reactive<NotificationSettings>({
  likeEnabled: true,
  commentEnabled: true,
  replyEnabled: true,
  followEnabled: true,
  favoriteEnabled: true,
  systemEnabled: true,
  pushEnabled: true,
});

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
  if (key === 'blacklist') {
    fetchBlacklist();
  }
};

const loadProfile = () => {
  if (userStore.user) {
    profileForm.avatar = userStore.user.avatar || '';
    profileForm.background = (userStore.user as any).background || '';
    profileForm.nickname = userStore.user.nickname || '';
    profileForm.gender = (userStore.user as any).gender || 'secret';
    profileForm.birthday = (userStore.user as any).birthday || '';
    profileForm.location = (userStore.user as any).location || '';
    profileForm.bio = userStore.user.bio || '';
    profileForm.website = (userStore.user as any).website || '';
  }
};

const saveProfile = async () => {
  if (!profileForm.nickname.trim()) {
    ElMessage.warning('请输入昵称');
    return;
  }
  savingProfile.value = true;
  try {
    await updateProfileExtended(profileForm);
    ElMessage.success('保存成功');
    userStore.fetchCurrentUser();
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    savingProfile.value = false;
  }
};

const fetchPrivacySettings = async () => {
  try {
    const res = await getPrivacySettings();
    Object.assign(privacyForm, res.settings);
  } catch (error) {
    console.error('获取隐私设置失败:', error);
  }
};

const savePrivacy = async () => {
  savingPrivacy.value = true;
  try {
    await updatePrivacySettings(privacyForm);
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    savingPrivacy.value = false;
  }
};

const fetchNotificationSettings = async () => {
  try {
    const res = await getNotificationSettings();
    Object.assign(notificationForm, res.settings);
  } catch (error) {
    console.error('获取通知设置失败:', error);
  }
};

const saveNotification = async () => {
  savingNotification.value = true;
  try {
    await updateNotificationSettings(notificationForm);
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    savingNotification.value = false;
  }
};

const fetchBlacklist = async () => {
  blacklistLoading.value = true;
  try {
    const res = await getBlacklist({ page: 1, pageSize: 100 });
    blacklist.value = res.list;
  } catch (error) {
    console.error('获取黑名单失败:', error);
  } finally {
    blacklistLoading.value = false;
  }
};

const removeFromBlacklist = async (id: string) => {
  await ElMessageBox.confirm('确定要解除对该用户的屏蔽吗？', '提示', {
    confirmButtonText: '解除',
    cancelButtonText: '取消',
    type: 'warning',
  });
  try {
    await removeBlacklist(id);
    blacklist.value = blacklist.value.filter(item => item.id !== id);
    ElMessage.success('已解除屏蔽');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解除屏蔽失败:', error);
    }
  }
};

onMounted(() => {
  loadProfile();
  fetchPrivacySettings();
  fetchNotificationSettings();
});
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
}

.settings-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.settings-menu {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 12px 0;

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px 12px;
    border-radius: 8px;

    &.is-active {
      background: #409eff;
      color: #fff;
    }
  }
}

.settings-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 30px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px;
  }
}

.bg-preview {
  width: 300px;
  height: 100px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.blacklist-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .blacklist-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;

    .user-info {
      flex: 1;

      .username {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .block-time {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.no-blacklist {
  padding: 40px 0;
}

.loading {
  padding: 20px 0;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .security-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;

    .security-info {
      flex: 1;

      .security-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .security-desc {
        font-size: 12px;
        color: #999;
      }
    }

    &.danger {
      background: #fff0f0;

      .security-title {
        color: #f56c6c;
      }
    }
  }
}
</style>
