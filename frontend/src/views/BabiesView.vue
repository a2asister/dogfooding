<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { babyService } from '@/services/babyService'
import type { BabyProfile } from '@/types'

const router = useRouter()
const route = useRoute()

const babies = ref<BabyProfile[]>([])
const showAddForm = ref(false)
const editingBaby = ref<BabyProfile | null>(null)
const defaultBabyId = ref<string | undefined>()

const formData = ref({
  name: '',
  nickname: '',
  gender: 'unknown' as const,
  birthDate: '',
  birthTime: '',
  birthWeight: '',
  birthHeight: '',
  bloodType: 'unknown' as const,
  notes: ''
})

const loadBabies = () => {
  babies.value = babyService.getAllBabies()
  const data = babyService.getAllBabies()
  if (data.length > 0) {
    defaultBabyId.value = babyService.getDefaultBaby()?.id
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    nickname: '',
    gender: 'unknown',
    birthDate: '',
    birthTime: '',
    birthWeight: '',
    birthHeight: '',
    bloodType: 'unknown',
    notes: ''
  }
  editingBaby.value = null
  showAddForm.value = false
}

const openAddForm = () => {
  resetForm()
  showAddForm.value = true
}

const openEditForm = (baby: BabyProfile) => {
  editingBaby.value = baby
  formData.value = {
    name: baby.name,
    nickname: baby.nickname || '',
    gender: baby.gender,
    birthDate: baby.birthDate.split('T')[0],
    birthTime: baby.birthTime || '',
    birthWeight: baby.birthWeight?.toString() || '',
    birthHeight: baby.birthHeight?.toString() || '',
    bloodType: baby.bloodType || 'unknown',
    notes: baby.notes || ''
  }
  showAddForm.value = true
}

const saveBaby = () => {
  if (!formData.value.name.trim() || !formData.value.birthDate) {
    alert('请填写宝宝姓名和出生日期')
    return
  }

  const babyData = {
    name: formData.value.name.trim(),
    nickname: formData.value.nickname.trim() || undefined,
    gender: formData.value.gender,
    birthDate: formData.value.birthDate,
    birthTime: formData.value.birthTime || undefined,
    birthWeight: formData.value.birthWeight ? parseFloat(formData.value.birthWeight) : undefined,
    birthHeight: formData.value.birthHeight ? parseFloat(formData.value.birthHeight) : undefined,
    bloodType: formData.value.bloodType,
    notes: formData.value.notes || undefined
  }

  if (editingBaby.value) {
    babyService.updateBaby(editingBaby.value.id, babyData)
  } else {
    const newBaby = babyService.createBaby(babyData as any)
    if (babies.value.length === 0) {
      babyService.setDefaultBaby(newBaby.id)
    }
  }

  loadBabies()
  resetForm()
}

const deleteBaby = (baby: BabyProfile) => {
  if (confirm(`确定要删除宝宝 ${baby.name} 的所有数据吗？此操作不可恢复。`)) {
    babyService.deleteBaby(baby.id)
    loadBabies()
  }
}

const setDefaultBaby = (babyId: string) => {
  babyService.setDefaultBaby(babyId)
  defaultBabyId.value = babyId
}

const formatAge = (birthDate: string) => {
  return babyService.formatAge(birthDate)
}

const getGenderIcon = (gender: string) => {
  switch (gender) {
    case 'male': return '👦'
    case 'female': return '👧'
    default: return '👶'
  }
}

const getGenderText = (gender: string) => {
  switch (gender) {
    case 'male': return '男宝'
    case 'female': return '女宝'
    default: return '未知'
  }
}

onMounted(() => {
  loadBabies()
  if (route.query.action === 'add') {
    openAddForm()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">宝宝档案</h1>
        <p class="text-secondary mt-1">管理您的宝宝信息</p>
      </div>
      <button
        @click="openAddForm"
        class="flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
      >
        <span class="text-xl">➕</span>
        <span class="font-medium">添加宝宝</span>
      </button>
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
                {{ editingBaby ? '编辑宝宝' : '添加新宝宝' }}
              </h2>
              <button
                @click="resetForm"
                class="p-2 hover:bg-bg-hover rounded-xl transition-colors"
              >
                <span class="text-xl">✕</span>
              </button>
            </div>
          </div>

          <div class="p-6 max-h-[60vh] overflow-y-auto">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  宝宝姓名 <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="请输入宝宝姓名"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  昵称
                </label>
                <input
                  v-model="formData.nickname"
                  type="text"
                  placeholder="请输入昵称（可选）"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  性别
                </label>
                <div class="flex gap-3">
                  <button
                    @click="formData.gender = 'male'"
                    class="flex-1 py-3 px-4 rounded-2xl border-2 transition-all"
                    :class="{
                      'border-accent-cool bg-accent-cool/20': formData.gender === 'male',
                      'border-border-light hover:border-accent-cool/50': formData.gender !== 'male'
                    }"
                  >
                    <span class="text-2xl">👦</span>
                    <div class="text-sm font-medium mt-1">男宝</div>
                  </button>
                  <button
                    @click="formData.gender = 'female'"
                    class="flex-1 py-3 px-4 rounded-2xl border-2 transition-all"
                    :class="{
                      'border-accent-soft bg-accent-soft/20': formData.gender === 'female',
                      'border-border-light hover:border-accent-soft/50': formData.gender !== 'female'
                    }"
                  >
                    <span class="text-2xl">👧</span>
                    <div class="text-sm font-medium mt-1">女宝</div>
                  </button>
                  <button
                    @click="formData.gender = 'unknown'"
                    class="flex-1 py-3 px-4 rounded-2xl border-2 transition-all"
                    :class="{
                      'border-accent-warm bg-accent-warm/20': formData.gender === 'unknown',
                      'border-border-light hover:border-accent-warm/50': formData.gender !== 'unknown'
                    }"
                  >
                    <span class="text-2xl">👶</span>
                    <div class="text-sm font-medium mt-1">保密</div>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    出生日期 <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.birthDate"
                    type="date"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    出生时间
                  </label>
                  <input
                    v-model="formData.birthTime"
                    type="time"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    出生体重 (kg)
                  </label>
                  <input
                    v-model="formData.birthWeight"
                    type="number"
                    step="0.01"
                    placeholder="如 3.25"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary mb-2">
                    出生身高 (cm)
                  </label>
                  <input
                    v-model="formData.birthHeight"
                    type="number"
                    step="0.1"
                    placeholder="如 50"
                    class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  血型
                </label>
                <select
                  v-model="formData.bloodType"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors"
                >
                  <option value="unknown">未知</option>
                  <option value="A">A 型</option>
                  <option value="B">B 型</option>
                  <option value="AB">AB 型</option>
                  <option value="O">O 型</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-2">
                  备注
                </label>
                <textarea
                  v-model="formData.notes"
                  placeholder="添加一些备注信息..."
                  rows="3"
                  class="w-full px-4 py-3 rounded-2xl border border-border-light focus:border-accent-soft focus:outline-none transition-colors resize-none"
                ></textarea>
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
              @click="saveBaby"
              class="flex-1 py-3 px-4 rounded-2xl bg-accent-soft text-white hover:opacity-90 transition-all shadow-soft"
            >
              {{ editingBaby ? '保存修改' : '添加宝宝' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div
      v-if="babies.length === 0"
      class="text-center py-16"
    >
      <div class="text-6xl mb-4">👶</div>
      <h3 class="text-lg font-medium text-primary mb-2">还没有添加宝宝</h3>
      <p class="text-secondary mb-6">点击上方按钮添加您的第一个宝宝</p>
      <button
        @click="openAddForm"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-white rounded-2xl hover:opacity-90 transition-all shadow-soft"
      >
        <span class="text-xl">➕</span>
        <span class="font-medium">添加第一个宝宝</span>
      </button>
    </div>

    <div
      v-else
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <TransitionGroup name="slide-up">
        <div
          v-for="baby in babies"
          :key="baby.id"
          class="bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-medium transition-all"
        >
          <div
            class="p-6 cursor-pointer"
            @click="$router.push(`/babies/${baby.id}`)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-accent-soft/30 to-accent-cool/30 flex items-center justify-center text-3xl">
                  {{ getGenderIcon(baby.gender) }}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-primary">{{ baby.name }}</h3>
                  <p class="text-sm text-secondary">
                    {{ baby.nickname ? `${baby.nickname} · ` : '' }}
                    {{ getGenderText(baby.gender) }}
                  </p>
                </div>
              </div>
              <div
                v-if="defaultBabyId === baby.id"
                class="px-3 py-1 rounded-full bg-accent-soft/20 text-accent-soft text-xs font-medium"
              >
                默认
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-secondary">年龄</span>
                <span class="font-medium text-primary">{{ formatAge(baby.birthDate) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-secondary">出生日期</span>
                <span class="font-medium text-primary">{{ baby.birthDate.split('T')[0] }}</span>
              </div>
              <div
                v-if="baby.birthWeight || baby.birthHeight"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-secondary">出生信息</span>
                <span class="font-medium text-primary">
                  {{ baby.birthWeight ? `${baby.birthWeight}kg` : '' }}
                  {{ baby.birthWeight && baby.birthHeight ? ' / ' : '' }}
                  {{ baby.birthHeight ? `${baby.birthHeight}cm` : '' }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-6 pb-6 flex gap-2">
            <button
              v-if="defaultBabyId !== baby.id"
              @click.stop="setDefaultBaby(baby.id)"
              class="flex-1 py-2 px-3 rounded-xl text-sm text-secondary hover:bg-bg-hover hover:text-primary transition-colors"
            >
              设为默认
            </button>
            <button
              @click.stop="openEditForm(baby)"
              class="flex-1 py-2 px-3 rounded-xl text-sm text-secondary hover:bg-bg-hover hover:text-primary transition-colors"
            >
              编辑
            </button>
            <button
              @click.stop="deleteBaby(baby)"
              class="flex-1 py-2 px-3 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
