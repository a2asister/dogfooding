import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import SparkMD5 from 'spark-md5'
import uploadService from '../services/uploadService'

export const useUploadStore = defineStore('upload', () => {
  const tasks = ref([])
  const settings = ref({
    concurrency: 3,
    chunkSize: 4
  })

  const taskMap = computed(() => {
    const map = new Map()
    tasks.value.forEach(task => map.set(task.id, task))
    return map
  })

  const generateTaskId = () => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const addTask = (file) => {
    const task = {
      id: generateTaskId(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      speed: 0,
      chunks: [],
      uploadedChunks: [],
      fileHash: null,
      totalChunks: 0,
      startTime: null,
      lastUpdateTime: null,
      error: null,
      controller: null
    }
    tasks.value.push(task)
    return task
  }

  const removeTask = (taskId) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index > -1) {
      const task = tasks.value[index]
      if (task.controller) {
        task.controller.abort()
      }
      tasks.value.splice(index, 1)
    }
  }

  const updateTask = (taskId, updates) => {
    const task = taskMap.value.get(taskId)
    if (task) {
      Object.assign(task, updates)
    }
  }

  const calculateFileHash = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      const chunkSize = 2 * 1024 * 1024
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      const spark = new SparkMD5.ArrayBuffer()

      reader.onload = (e) => {
        spark.append(e.target.result)
        currentChunk++
        if (currentChunk < chunks) {
          loadNext()
        } else {
          resolve(spark.end())
        }
      }

      reader.onerror = () => {
        resolve(null)
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize
        reader.readAsArrayBuffer(file.slice(start, end))
      }

      loadNext()
    })
  }

  const prepareChunks = async (task) => {
    const chunkSize = settings.value.chunkSize * 1024 * 1024
    const totalChunks = Math.ceil(task.size / chunkSize)
    const chunks = []

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, task.size)
      chunks.push({
        index: i,
        start,
        end,
        size: end - start,
        uploaded: false,
        progress: 0
      })
    }

    updateTask(task.id, {
      chunks,
      totalChunks,
      status: 'pending'
    })

    return chunks
  }

  const checkUploadProgress = async (task) => {
    try {
      const response = await uploadService.checkUploadStatus({
        fileName: task.name,
        fileSize: task.size,
        lastModified: task.file.lastModified
      })

      if (response.data.uploaded) {
        updateTask(task.id, {
          status: 'completed',
          progress: 100
        })
        return { shouldUpload: false, uploadedChunks: [] }
      }

      return {
        shouldUpload: true,
        uploadedChunks: response.data.uploadedChunks || []
      }
    } catch (error) {
      console.error('检查上传状态失败:', error)
      return { shouldUpload: true, uploadedChunks: [] }
    }
  }

  const uploadChunk = async (task, chunk, controller) => {
    const blob = task.file.slice(chunk.start, chunk.end)
    const formData = new FormData()
    formData.append('chunkIndex', chunk.index)
    formData.append('totalChunks', task.totalChunks)
    formData.append('fileName', task.name)
    formData.append('fileSize', task.size)
    formData.append('lastModified', task.file.lastModified)
    formData.append('chunk', blob)

    const startTime = Date.now()

    try {
      const response = await uploadService.uploadChunk(formData, {
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          updateChunkProgress(task.id, chunk.index, progress)
        }
      })

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      const speed = chunk.size / duration

      return { success: true, chunk, speed }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, chunk, cancelled: true }
      }
      console.error('分片上传失败:', error)
      return { success: false, chunk, error }
    }
  }

  const updateChunkProgress = (taskId, chunkIndex, progress) => {
    const task = taskMap.value.get(taskId)
    if (!task) return

    const chunk = task.chunks.find(c => c.index === chunkIndex)
    if (chunk) {
      chunk.progress = progress
    }

    const uploadedProgress = task.chunks.reduce((sum, c) => {
      return sum + (c.progress / 100) * c.size
    }, 0)

    const totalProgress = (uploadedProgress / task.size) * 100
    updateTask(taskId, { progress: totalProgress })
  }

  const mergeFile = async (task) => {
    updateTask(task.id, { status: 'merging' })

    try {
      const response = await uploadService.mergeChunks({
        fileName: task.name,
        fileSize: task.size,
        lastModified: task.file.lastModified,
        totalChunks: task.totalChunks
      })

      if (response.data.success) {
        updateTask(task.id, {
          status: 'completed',
          progress: 100
        })
        ElMessage.success(`${task.name} 上传成功`)
        return true
      } else {
        throw new Error(response.data.message || '合并失败')
      }
    } catch (error) {
      console.error('合并文件失败:', error)
      updateTask(task.id, {
        status: 'error',
        error: error.message
      })
      ElMessage.error(`${task.name} 合并失败: ${error.message}`)
      return false
    }
  }

  const startTask = async (taskId) => {
    const task = taskMap.value.get(taskId)
    if (!task) return

    if (task.status === 'uploading' || task.status === 'completed' || task.status === 'merging') {
      return
    }

    updateTask(taskId, { status: 'uploading', error: null })

    const controller = new AbortController()
    updateTask(taskId, { controller })

    try {
      if (task.chunks.length === 0) {
        await prepareChunks(task)
      }

      const progressCheck = await checkUploadProgress(task)

      if (!progressCheck.shouldUpload) {
        return
      }

      const uploadedChunks = progressCheck.uploadedChunks
      task.chunks.forEach(chunk => {
        if (uploadedChunks.includes(chunk.index)) {
          chunk.uploaded = true
          chunk.progress = 100
        }
      })

      const pendingChunks = task.chunks.filter(c => !c.uploaded)
      const concurrency = settings.value.concurrency
      let activeUploads = 0
      let currentIndex = 0
      let completedChunks = 0
      const totalPending = pendingChunks.length

      const uploadNext = async () => {
        while (currentIndex < totalPending && activeUploads < concurrency) {
          if (controller.signal.aborted) break

          const chunk = pendingChunks[currentIndex]
          currentIndex++
          activeUploads++

          try {
            const result = await uploadChunk(task, chunk, controller)
            if (result.success) {
              chunk.uploaded = true
              completedChunks++
              updateTask(taskId, { speed: result.speed })
            } else if (!result.cancelled) {
              throw result.error
            }
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('分片上传失败:', error)
              updateTask(taskId, {
                status: 'error',
                error: error.message
              })
              ElMessage.error(`${task.name} 上传失败: ${error.message}`)
              controller.abort()
              return
            }
          }

          activeUploads--

          if (!controller.signal.aborted) {
            await uploadNext()
          }
        }
      }

      const uploadPromises = []
      for (let i = 0; i < concurrency; i++) {
        uploadPromises.push(uploadNext())
      }

      await Promise.all(uploadPromises)

      if (controller.signal.aborted) {
        return
      }

      const allUploaded = task.chunks.every(c => c.uploaded)
      if (allUploaded) {
        await mergeFile(task)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('上传任务失败:', error)
        updateTask(taskId, {
          status: 'error',
          error: error.message
        })
      }
    }
  }

  const pauseTask = (taskId) => {
    const task = taskMap.value.get(taskId)
    if (!task) return

    if (task.status === 'uploading' && task.controller) {
      task.controller.abort()
      updateTask(taskId, {
        status: 'paused'
      })
      ElMessage.info(`${task.name} 已暂停`)
    }
  }

  const retryTask = (taskId) => {
    const task = taskMap.value.get(taskId)
    if (!task) return

    task.chunks.forEach(chunk => {
      if (!chunk.uploaded) {
        chunk.progress = 0
      }
    })

    startTask(taskId)
  }

  const startAllTasks = () => {
    tasks.value.forEach(task => {
      if (task.status === 'pending' || task.status === 'paused') {
        startTask(task.id)
      }
    })
  }

  const pauseAllTasks = () => {
    tasks.value.forEach(task => {
      if (task.status === 'uploading') {
        pauseTask(task.id)
      }
    })
  }

  const clearCompletedTasks = () => {
    tasks.value = tasks.value.filter(task => task.status !== 'completed')
  }

  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  return {
    tasks,
    settings,
    addTask,
    removeTask,
    startTask,
    pauseTask,
    retryTask,
    startAllTasks,
    pauseAllTasks,
    clearCompletedTasks,
    updateSettings
  }
})
