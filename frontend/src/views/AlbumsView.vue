<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { babyService } from '@/services/babyService'
import { recordService } from '@/services/recordService'
import type { BabyProfile, PhotoAlbum } from '@/types'

const currentBaby = ref<BabyProfile | undefined>()
const babies = ref<BabyProfile[]>([])
const selectedBabyId = ref<string>('')
const albums = ref<PhotoAlbum[]>([])
const showAddForm = ref(false)
const editingAlbum = ref<PhotoAlbum | null>(null)
const selectedAlbum = ref<PhotoAlbum | null>(null)

const formData = ref({
  name: '',
  description: '',
  tags: ''
})

const loadData = () => {
  babies.value = babyService.getAllBabies()
  currentBaby.value = babyService.getDefaultBaby()
  
  if (currentBaby.value) {
    selectedBabyId.value = currentBaby.value.id
  }

  if (selectedBabyId.value) {
    albums.value = recordService.getPhotoAlbums(selectedBabyId.value)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    tags: ''
  }
  editingAlbum.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  showAddForm.value = true
}

const openEditForm = (album: PhotoAlbum) => {
  editingAlbum.value = album
  formData.value = {
    name: album.name,
    description: album.description || '',
    tags: album.tags?.join(', ') || ''
  }
  showAddForm.value = true
}

const openAlbum = (album: PhotoAlbum) => {
  selectedAlbum.value = album
}

const saveAlbum = () => {
  if (!selectedBabyId.value) {
    alert('请先选择宝宝')
    return
  }

  if (!formData.value.name.trim()) {
    alert('请填写相册名称')
    return
  }

  const albumData = {
    babyId: selectedBabyId.value,
    name: formData.value.name.trim(),
    description: formData.value.description.trim() || undefined,
    coverPhoto: undefined,
    photos: [],
    tags: formData.value.tags.trim() ? formData.value.tags.split(',').map(t => t.trim()).filter(t => t) : undefined
  }

  if (editingAlbum.value) {
    recordService.updatePhotoAlbum(editingAlbum.value.id, albumData as any)
  } else {
    recordService.createPhotoAlbum(albumData as any)
  }

  loadData()
  resetForm()
}

const deleteAlbum = (album: PhotoAlbum) => {
  if (confirm(`确定要删除相册 "${album.name}" 吗？`)) {
    recordService.deletePhotoAlbum(album.id)
    loadData()
  }
}

const totalPhotos = computed(() => {
  return albums.value.reduce((sum, album) => sum + album.photos.length, 0)
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary">相册存档</h1>
        <p class="text-secondary mt-1">保存宝宝的珍贵照片和美好回忆</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-if="babies.length > 1"
          v-model="selectedBabyId"
          @change="loadData"
          class="px-4 py-2 rounded-xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
        >
          <option v-for="baby in babies" :key="baby.id" :value="baby.id">
            {{ baby.name }}
          </option>
        </select>
        <button
          @click="openAddForm"
          class="flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">📁</span>
          <span class="font-medium">创建相册</span>
        </button>
      </div>
    </div>

    <div
      v-if="babies.length === 0"
      class="text-center py-16"
    >
      <div class="text-6xl mb-4">👶</div>
      <h3 class="text-lg font-medium text-primary mb-2">还没有添加宝宝</h3>
      <p class="text-secondary mb-6">请先添加宝宝信息</p>
      <button
        @click="$router.push('/babies?action=add')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
      >
        <span class="text-xl">➕</span>
        <span class="font-medium">添加宝宝</span>
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-4 md:grid-cols-4">
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📁</span>
            <span class="text-sm text-secondary">相册数量</span>
          </div>
          <p class="text-2xl font-bold text-primary">{{ albums.length }}</p>
          <p class="text-sm text-secondary mt-1">个相册</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📷</span>
            <span class="text-sm text-secondary">照片总数</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">{{ totalPhotos }}</p>
          <p class="text-sm text-secondary mt-1">张照片</p>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📅</span>
            <span class="text-sm text-secondary">本月相册</span>
          </div>
          <p class="text-2xl font-bold text-green-600">
            {{ albums.filter(a => {
              const now = new Date()
              const created = new Date(a.createdAt)
              return now.getMonth() === created.getMonth() && now.getFullYear() === created.getFullYear()
            }).length }}
          </p>
          <p class="text-sm text-secondary mt-1">个相册</p>
        </div>
        <div class="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-soft p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">💝</span>
            <span class="text-sm text-pink-700">最新相册</span>
          </div>
          <p v-if="albums.length > 0" class="text-lg font-bold text-pink-800 truncate">
            {{ albums[0].name }}
          </p>
          <p v-else class="text-lg font-bold text-pink-800">暂无</p>
          <p v-if="albums.length > 0" class="text-sm text-pink-700 mt-1">
            {{ albums[0].photos.length }} 张照片
          </p>
        </div>
      </div>

      <Transition name="scale">
        <div
          v-if="showAddForm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/30"
            @click="resetForm"
          ></div>
          <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-floating overflow-hidden">
            <div class="p-6 border-b border-border-light">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-primary">
                  {{ editingAlbum ? '编辑相册' : '创建相册' }}
                </h2>
                <button
                  @click="resetForm"
                  class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
                >
                  <span class="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    相册名称 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="如：满月留念、第一次走路"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    描述
                  </label>
                  <textarea
                    v-model="formData.description"
                    placeholder="添加相册描述..."
                    rows="3"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    标签
                  </label>
                  <input
                    v-model="formData.tags"
                    type="text"
                    placeholder="用逗号分隔，如：生日,外出,节日"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-border-light flex gap-3">
              <button
                @click="resetForm"
                class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
              >
                取消
              </button>
              <button
                @click="saveAlbum"
                class="flex-1 py-3 px-4 rounded-2xl bg-accent-soft text-white hover:opacity-90 transition-all shadow-soft"
              >
                {{ editingAlbum ? '保存修改' : '创建相册' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="scale">
        <div
          v-if="selectedAlbum"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/30"
            @click="selectedAlbum = null"
          ></div>
          <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-floating overflow-hidden max-h-[90vh] flex flex-col">
            <div class="p-6 border-b border-border-light flex-shrink-0">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-xl font-bold text-primary">{{ selectedAlbum.name }}</h2>
                  <p v-if="selectedAlbum.description" class="text-secondary mt-1">
                    {{ selectedAlbum.description }}
                  </p>
                  <p class="text-sm text-secondary mt-1">
                    {{ selectedAlbum.photos.length }} 张照片 · 
                    创建于 {{ new Date(selectedAlbum.createdAt).toLocaleDateString('zh-CN') }}
                  </p>
                </div>
                <button
                  @click="selectedAlbum = null"
                  class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
                >
                  <span class="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div class="p-6 overflow-y-auto flex-1">
              <div
                v-if="selectedAlbum.photos.length === 0"
                class="text-center py-16"
              >
                <div class="text-6xl mb-4">📷</div>
                <h3 class="text-lg font-medium text-primary mb-2">相册为空</h3>
                <p class="text-secondary">上传照片来记录美好时刻</p>
              </div>

              <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div
                  v-for="(photo, index) in selectedAlbum.photos"
                  :key="index"
                  class="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center"
                >
                  <span class="text-4xl">📷</span>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-border-light flex gap-3 flex-shrink-0">
              <button
                @click="openEditForm(selectedAlbum!); selectedAlbum = null"
                class="flex-1 py-3 px-4 rounded-2xl border border-border-light text-secondary hover:bg-bg-hover transition-colors"
              >
                编辑相册
              </button>
              <button
                @click="deleteAlbum(selectedAlbum!); selectedAlbum = null"
                class="py-3 px-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
              >
                删除相册
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div
        v-if="albums.length === 0"
        class="text-center py-16 bg-white rounded-3xl shadow-soft"
      >
        <div class="text-6xl mb-4">📷</div>
        <h3 class="text-lg font-medium text-primary mb-2">暂无相册</h3>
        <p class="text-secondary mb-6">创建相册来保存宝宝的珍贵照片</p>
        <button
          @click="openAddForm"
          class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
        >
          <span class="text-xl">📁</span>
          <span class="font-medium">创建第一个相册</span>
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TransitionGroup name="slide-up">
          <div
            v-for="album in albums"
            :key="album.id"
            class="bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-medium transition-all cursor-pointer"
            @click="openAlbum(album)"
          >
            <div class="aspect-video bg-gradient-to-br from-accent-soft/20 to-accent-cool/20 flex items-center justify-center relative">
              <div
                v-if="album.photos.length > 0"
                class="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1"
              >
                <div
                  v-for="i in Math.min(4, album.photos.length)"
                  :key="i"
                  class="bg-white/50 rounded-lg flex items-center justify-center"
                >
                  <span class="text-2xl">📷</span>
                </div>
              </div>
              <span
                v-else
                class="text-5xl"
              >
                📁
              </span>
              <div class="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/80 text-sm font-medium">
                {{ album.photos.length }} 张
              </div>
            </div>

            <div class="p-5">
              <h3 class="font-bold text-primary mb-1">{{ album.name }}</h3>
              <p v-if="album.description" class="text-sm text-secondary line-clamp-2 mb-2">
                {{ album.description }}
              </p>
              <div class="flex items-center justify-between">
                <p class="text-xs text-secondary">
                  创建于 {{ new Date(album.createdAt).toLocaleDateString('zh-CN') }}
                </p>
                <div v-if="album.tags && album.tags.length > 0" class="flex gap-1">
                  <span
                    v-for="tag in album.tags.slice(0, 2)"
                    :key="tag"
                    class="px-2 py-0.5 rounded-full bg-accent-soft/10 text-accent-soft text-xs"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
