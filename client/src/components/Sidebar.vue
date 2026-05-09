<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">⏰</span>
        <span class="logo-text">时光待办</span>
      </div>
    </div>
    
    <div class="sidebar-content">
      <div class="folder-section">
        <div class="section-header">
          <span class="section-title">文件夹</span>
          <button class="add-btn" @click="showAddFolder = true">
            <span class="add-icon">+</span>
          </button>
        </div>
        
        <div class="folder-list">
          <button 
            class="folder-item"
            :class="{ active: !selectedFolder && !selectedList }"
            @click="$emit('select-folder', null)"
          >
            <span class="folder-dot all-dot"></span>
            <span class="folder-name">全部任务</span>
          </button>
          
          <div 
            v-for="folder in folders" 
            :key="folder.id"
            class="folder-wrapper"
          >
            <button 
              class="folder-item"
              :class="{ active: selectedFolder?.id === folder.id && !selectedList }"
              @click="$emit('select-folder', folder)"
            >
              <span class="folder-dot" :style="{ background: folder.color }"></span>
              <span class="folder-name">{{ folder.name }}</span>
              <div class="folder-actions" v-if="selectedFolder?.id === folder.id">
                <button 
                  class="folder-action-btn"
                  @click.stop="$emit('add-list', { folderId: folder.id })"
                >
                  <span>+ 清单</span>
                </button>
                <button 
                  class="folder-action-btn delete"
                  @click.stop="confirmDeleteFolder(folder)"
                >
                  删除
                </button>
              </div>
            </button>
            
            <div class="list-nested" v-if="selectedFolder?.id === folder.id">
              <div
                v-for="list in listsByFolder(folder.id)"
                :key="list.id"
                class="list-item-wrapper"
              >
                <button
                  class="list-item"
                  :class="{ active: selectedList?.id === list.id }"
                  @click="$emit('select-list', list)"
                >
                  <span class="list-dot"></span>
                  <span class="list-name">{{ list.name }}</span>
                </button>
                <button 
                  class="list-delete-btn"
                  @click.stop="confirmDeleteList(list)"
                >
                  ×
                </button>
              </div>
              
              <div v-if="addingToList === folder.id" class="add-list-input">
                <input 
                  v-model="newListName"
                  type="text"
                  placeholder="清单名称"
                  class="list-input"
                  @keyup.enter="addListToFolder(folder.id)"
                  @blur="cancelAddList"
                  autofocus
                />
                <div class="list-input-actions">
                  <button class="cancel-btn" @click="cancelAddList">取消</button>
                  <button class="confirm-btn" @click="addListToFolder(folder.id)">确定</button>
                </div>
              </div>
              <button 
                v-else
                class="add-list-btn"
                @click="startAddList(folder.id)"
              >
                <span class="add-icon">+</span>
                <span>添加清单</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="add-folder-input" v-if="showAddFolder">
          <input 
            v-model="newFolderName"
            type="text"
            placeholder="文件夹名称"
            class="folder-input"
            @keyup.enter="addFolder"
            @blur="cancelAddFolder"
            autofocus
          />
          <div class="color-picker">
            <button 
              v-for="color in folderColors"
              :key="color"
              class="color-option"
              :class="{ selected: selectedColor === color }"
              :style="{ background: color }"
              @click="selectedColor = color"
            ></button>
          </div>
          <div class="folder-input-actions">
            <button class="cancel-btn" @click="cancelAddFolder">取消</button>
            <button class="confirm-btn" @click="addFolder">确定</button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Sidebar',
  props: {
    folders: {
      type: Array,
      default: () => []
    },
    selectedFolder: {
      type: Object,
      default: null
    },
    selectedList: {
      type: Object,
      default: null
    }
  },
  emits: ['select-folder', 'select-list', 'add-folder', 'add-list', 'delete-folder', 'delete-list'],
  setup(props, { emit }) {
    const store = useStore()
    
    const showAddFolder = ref(false)
    const newFolderName = ref('')
    const selectedColor = ref('#667eea')
    const addingToList = ref(null)
    const newListName = ref('')
    
    const folderColors = [
      '#667eea', '#764ba2', '#f093fb', 
      '#4facfe', '#00f2fe', '#43e97b',
      '#fa709a', '#fee140', '#ff9a9e'
    ]
    
    const listsByFolder = (folderId) => {
      return store.state.lists.filter(l => l.folderId === folderId)
    }
    
    const addFolder = () => {
      if (newFolderName.value.trim()) {
        emit('add-folder', {
          name: newFolderName.value.trim(),
          color: selectedColor.value
        })
        newFolderName.value = ''
        selectedColor.value = '#667eea'
        showAddFolder.value = false
      }
    }
    
    const cancelAddFolder = () => {
      showAddFolder.value = false
      newFolderName.value = ''
      selectedColor.value = '#667eea'
    }
    
    const startAddList = (folderId) => {
      addingToList.value = folderId
      newListName.value = ''
    }
    
    const addListToFolder = (folderId) => {
      if (newListName.value.trim()) {
        emit('add-list', {
          folderId: folderId,
          name: newListName.value.trim()
        })
        newListName.value = ''
        addingToList.value = null
      }
    }
    
    const cancelAddList = () => {
      addingToList.value = null
      newListName.value = ''
    }
    
    const confirmDeleteFolder = (folder) => {
      if (confirm(`确定要删除文件夹「${folder.name}」吗？所有清单和任务也将被删除。`)) {
        emit('delete-folder', folder.id)
      }
    }
    
    const confirmDeleteList = (list) => {
      if (confirm(`确定要删除清单「${list.name}」吗？所有任务也将被删除。`)) {
        emit('delete-list', list.id)
      }
    }
    
    return {
      showAddFolder,
      newFolderName,
      selectedColor,
      addingToList,
      newListName,
      folderColors,
      listsByFolder,
      addFolder,
      cancelAddFolder,
      startAddList,
      addListToFolder,
      cancelAddList,
      confirmDeleteFolder,
      confirmDeleteList
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-light);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.folder-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 8px 4px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.add-btn:hover {
  background: var(--primary-color);
  color: white;
}

.add-icon {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
  text-align: left;
  position: relative;
}

.folder-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.folder-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
}

.folder-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.all-dot {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-actions {
  display: flex;
  gap: 4px;
}

.folder-action-btn {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.folder-action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.folder-action-btn.delete:hover {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.list-nested {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 20px;
  margin-top: 2px;
}

.list-item-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.list-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 400;
  transition: all var(--transition-fast);
  text-align: left;
  min-width: 0;
}

.list-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.list-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
}

.list-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.list-item.active .list-dot {
  background: var(--primary-color);
}

.list-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-delete-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 16px;
  opacity: 0;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item-wrapper:hover .list-delete-btn {
  opacity: 1;
}

.list-delete-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.add-list-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.add-list-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.add-list-btn .add-icon {
  font-size: 14px;
}

.add-list-input {
  margin-top: 4px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 10px;
}

.list-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  margin-bottom: 10px;
}

.list-input::placeholder {
  color: var(--text-muted);
}

.list-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.list-input-actions .cancel-btn,
.list-input-actions .confirm-btn {
  padding: 4px 12px;
  font-size: 12px;
}

.add-folder-input {
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.folder-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 12px;
}

.folder-input::placeholder {
  color: var(--text-muted);
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.color-option.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.folder-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn {
  padding: 6px 14px;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.cancel-btn:hover {
  background: var(--bg-secondary);
}

.confirm-btn {
  padding: 6px 14px;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.confirm-btn:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
