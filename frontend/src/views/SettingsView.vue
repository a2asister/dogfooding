<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storageService } from '@/services/storage'
import { babyService } from '@/services/babyService'
import type { AppSettings } from '@/types'

const settings = ref<AppSettings>(storageService.getSettings())
const showExportConfirm = ref(false)
const showImportConfirm = ref(false)
const showResetConfirm = ref(false)
const importFile = ref<File | null>(null)

const storageInfo = computed(() => {
  return storageService.getStorageInfo()
})

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const saveSettings = () => {
  storageService.updateSettings(settings.value)
}

const exportData = () => {
  storageService.downloadJSON(`baby_management_data_${new Date().toISOString().split('T')[0]}.json`)
  showExportConfirm.value = false
}

const handleImportFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0]
  }
}

const importData = async () => {
  if (!importFile.value) {
    alert('请选择要导入的文件')
    return
  }

  try {
    const text = await importFile.value.text()
    const success = storageService.importFromJSON(text)
    if (success) {
      alert('导入成功！页面将刷新以加载新数据。')
      location.reload()
    } else {
      alert('导入失败，请检查文件格式是否正确。')
    }
  } catch (error) {
    alert('导入失败：' + (error as Error).message)
  }

  showImportConfirm.value = false
  importFile.value = null
}

const resetData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    storageService.clearAllData()
    alert('数据已清空！页面将刷新。')
    location.reload()
  }
  showResetConfirm.value = false
}

onMounted(() => {
  settings.value = storageService.getSettings()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-primary">设置</h1>
      <p class="text-secondary mt-1">管理应用设置和数据</p>
    </div>

    <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div class="p-6 border-b border-border-light">
        <h2 class="text-lg font-bold text-primary flex items-center gap-2">
          <span class="text-xl">🎨</span>
          外观设置
        </h2>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">主题模式</p>
            <p class="text-sm text-secondary">选择应用的显示主题</p>
          </div>
          <select
            v-model="settings.theme"
            @change="saveSettings"
            class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">语言</p>
            <p class="text-sm text-secondary">选择应用语言</p>
          </div>
          <select
            v-model="settings.language"
            @change="saveSettings"
            class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div class="p-6 border-b border-border-light">
        <h2 class="text-lg font-bold text-primary flex items-center gap-2">
          <span class="text-xl">🔔</span>
          通知设置
        </h2>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">启用通知</p>
            <p class="text-sm text-secondary">开启或关闭所有通知</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="settings.notifications.enabled"
              @change="saveSettings"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-soft"></div>
          </label>
        </div>

        <div
          v-if="settings.notifications.enabled"
          class="pl-6 space-y-4 border-l-2 border-border-light"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-primary">疫苗提醒</p>
              <p class="text-sm text-secondary">疫苗接种前发送提醒</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.vaccineReminders"
                @change="saveSettings"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-soft"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-primary">体检提醒</p>
              <p class="text-sm text-secondary">体检前发送提醒</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.checkupReminders"
                @change="saveSettings"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-soft"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-primary">每日汇总</p>
              <p class="text-sm text-secondary">每天发送喂养和睡眠汇总</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.notifications.dailySummary"
                @change="saveSettings"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-soft"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div class="p-6 border-b border-border-light">
        <h2 class="text-lg font-bold text-primary flex items-center gap-2">
          <span class="text-xl">📏</span>
          计量单位
        </h2>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">体重单位</p>
            <p class="text-sm text-secondary">选择体重的显示单位</p>
          </div>
          <select
            v-model="settings.measurementUnits.weight"
            @change="saveSettings"
            class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
          >
            <option value="kg">千克 (kg)</option>
            <option value="lb">磅 (lb)</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">身高单位</p>
            <p class="text-sm text-secondary">选择身高的显示单位</p>
          </div>
          <select
            v-model="settings.measurementUnits.height"
            @change="saveSettings"
            class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
          >
            <option value="cm">厘米 (cm)</option>
            <option value="in">英寸 (in)</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-primary">温度单位</p>
            <p class="text-sm text-secondary">选择温度的显示单位</p>
          </div>
          <select
            v-model="settings.measurementUnits.temperature"
            @change="saveSettings"
            class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
          >
            <option value="celsius">摄氏度 (°C)</option>
            <option value="fahrenheit">华氏度 (°F)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div class="p-6 border-b border-border-light">
        <h2 class="text-lg font-bold text-primary flex items-center gap-2">
          <span class="text-xl">💾</span>
          数据管理
        </h2>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between p-4 rounded-2xl bg-bg-hover">
          <div>
            <p class="font-medium text-primary">存储使用情况</p>
            <p class="text-sm text-secondary mt-1">
              已使用: {{ formatSize(storageInfo.used) }} / {{ formatSize(storageInfo.total) }}
            </p>
          </div>
          <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-accent-soft rounded-full transition-all"
              :style="{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <button
            @click="showExportConfirm = true"
            class="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-accent-soft text-accent-soft hover:bg-accent-soft/5 transition-colors"
          >
            <span class="text-2xl">📤</span>
            <div class="text-left">
              <p class="font-medium">导出数据</p>
              <p class="text-sm opacity-80">将所有数据导出为 JSON 文件</p>
            </div>
          </button>

          <button
            @click="showImportConfirm = true"
            class="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-accent-cool text-accent-cool hover:bg-accent-cool/5 transition-colors"
          >
            <span class="text-2xl">📥</span>
            <div class="text-left">
              <p class="font-medium">导入数据</p>
              <p class="text-sm opacity-80">从 JSON 文件导入数据</p>
            </div>
          </button>
        </div>

        <button
          @click="showResetConfirm = true"
          class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-300 text-red-500 hover:bg-red-50 transition-colors"
        >
          <span class="text-2xl">🗑️</span>
          <div class="text-left">
            <p class="font-medium">清空所有数据</p>
            <p class="text-sm opacity-80">此操作不可恢复，请谨慎操作</p>
          </div>
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div class="p-6 border-b border-border-light">
        <h2 class="text-lg font-bold text-primary flex items-center gap-2">
          <span class="text-xl">ℹ️</span>
          关于
        </h2>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-secondary">应用名称</span>
          <span class="font-medium text-primary">婴幼儿管理系统</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-secondary">版本</span>
          <span class="font-medium text-primary">1.0.0</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-secondary">前端框架</span>
          <span class="font-medium text-primary">Vue 3 + UnoCSS</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-secondary">后端框架</span>
          <span class="font-medium text-primary">Koa</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-secondary">数据存储</span>
          <span class="font-medium text-primary">LocalStorage + JSON</span>
        </div>
      </div>
    </div>

    <Transition name="scale">
      <div
        v-if="showExportConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="showExportConfirm = false"
        ></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-floating p-6">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">📤</div>
            <h3 class="text-xl font-bold text-primary">导出数据</h3>
            <p class="text-secondary mt-2">
              您的所有宝宝数据将被导出为一个 JSON 文件，方便备份和迁移。
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showExportConfirm = false"
              class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
            >
              取消
            </button>
            <button
              @click="exportData"
              class="flex-1 py-3 px-4 rounded-2xl bg-accent-soft text-white hover:opacity-90 transition-all"
            >
              确认导出
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="scale">
      <div
        v-if="showImportConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="showImportConfirm = false"
        ></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-floating p-6">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">📥</div>
            <h3 class="text-xl font-bold text-primary">导入数据</h3>
            <p class="text-secondary mt-2">
              请选择要导入的 JSON 数据文件。导入后将覆盖现有数据。
            </p>
          </div>
          <div class="mb-6">
            <label class="block w-full p-8 border-2 border-dashed border-border-light rounded-2xl text-center cursor-pointer hover:border-accent-soft transition-colors">
              <span
                v-if="!importFile"
                class="text-secondary"
              >
                点击选择文件或拖拽文件到此处
              </span>
              <span
                v-else
                class="text-primary font-medium"
              >
                📄 {{ importFile.name }}
              </span>
              <input
                type="file"
                accept=".json"
                class="hidden"
                @change="handleImportFile"
              />
            </label>
          </div>
          <div class="flex gap-3">
            <button
              @click="showImportConfirm = false"
              class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
            >
              取消
            </button>
            <button
              @click="importData"
              class="flex-1 py-3 px-4 rounded-2xl bg-accent-soft text-white hover:opacity-90 transition-all"
            >
              确认导入
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="scale">
      <div
        v-if="showResetConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="showResetConfirm = false"
        ></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-floating p-6">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">⚠️</div>
            <h3 class="text-xl font-bold text-red-600">清空所有数据</h3>
            <p class="text-secondary mt-2">
              此操作将删除所有宝宝档案、记录、提醒等数据，且无法恢复！
              确定要继续吗？
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showResetConfirm = false"
              class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
            >
              取消
            </button>
            <button
              @click="resetData"
              class="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-white hover:opacity-90 transition-all"
            >
              确认清空
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
