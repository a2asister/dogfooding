const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { getDataFile, saveDataFile } = require('../data')

const router = express.Router()

function autoSplitTask(task) {
  const subtasks = []
  const keywords = {
    '设计': ['需求分析', '原型设计', 'UI设计', '设计评审'],
    '开发': ['技术方案', '编码实现', '单元测试', '代码审查'],
    '测试': ['测试计划', '功能测试', '集成测试', '性能测试'],
    '部署': ['环境准备', '部署实施', '验证测试', '上线监控']
  }
  
  for (const [key, steps] of Object.entries(keywords)) {
    if (task.title.includes(key) || (task.description && task.description.includes(key))) {
      steps.forEach(step => {
        subtasks.push({
          id: uuidv4(),
          title: step,
          status: 'pending',
          parentTaskId: task.id,
          createdAt: new Date().toISOString()
        })
      })
    }
  }
  
  if (subtasks.length === 0) {
    subtasks.push({
      id: uuidv4(),
      title: '任务准备',
      status: 'pending',
      parentTaskId: task.id,
      createdAt: new Date().toISOString()
    })
    subtasks.push({
      id: uuidv4(),
      title: '任务执行',
      status: 'pending',
      parentTaskId: task.id,
      createdAt: new Date().toISOString()
    })
    subtasks.push({
      id: uuidv4(),
      title: '任务验证',
      status: 'pending',
      parentTaskId: task.id,
      createdAt: new Date().toISOString()
    })
  }
  
  return subtasks
}

router.get('/', (req, res) => {
  const tasks = getDataFile('tasks')
  res.json(tasks)
})

router.get('/:id', (req, res) => {
  const tasks = getDataFile('tasks')
  const task = tasks.find(t => t.id === req.params.id)
  if (!task) {
    return res.status(404).json({ error: '任务不存在' })
  }
  res.json(task)
})

router.post('/', (req, res) => {
  const { title, description, assigneeId, topicId, autoSplit } = req.body
  const tasks = getDataFile('tasks')
  
  const newTask = {
    id: uuidv4(),
    title,
    description,
    assigneeId,
    topicId,
    status: 'pending',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  if (autoSplit) {
    newTask.subtasks = autoSplitTask(newTask)
  }
  
  tasks.push(newTask)
  saveDataFile('tasks', tasks)
  res.status(201).json(newTask)
})

router.put('/:id', (req, res) => {
  const tasks = getDataFile('tasks')
  const index = tasks.findIndex(t => t.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '任务不存在' })
  }
  
  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  saveDataFile('tasks', tasks)
  res.json(tasks[index])
})

router.delete('/:id', (req, res) => {
  let tasks = getDataFile('tasks')
  tasks = tasks.filter(t => t.id !== req.params.id)
  saveDataFile('tasks', tasks)
  res.status(204).send()
})

router.put('/:id/subtasks/:subtaskId', (req, res) => {
  const tasks = getDataFile('tasks')
  const taskIndex = tasks.findIndex(t => t.id === req.params.id)
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: '任务不存在' })
  }
  
  const subtaskIndex = tasks[taskIndex].subtasks.findIndex(s => s.id === req.params.subtaskId)
  
  if (subtaskIndex === -1) {
    return res.status(404).json({ error: '子任务不存在' })
  }
  
  tasks[taskIndex].subtasks[subtaskIndex] = {
    ...tasks[taskIndex].subtasks[subtaskIndex],
    ...req.body
  }
  tasks[taskIndex].updatedAt = new Date().toISOString()
  
  saveDataFile('tasks', tasks)
  res.json(tasks[taskIndex].subtasks[subtaskIndex])
})

module.exports = router
