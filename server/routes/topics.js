const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { getDataFile, saveDataFile } = require('../data')

const router = express.Router()

router.get('/', (req, res) => {
  const topics = getDataFile('topics')
  res.json(topics)
})

router.get('/:id', (req, res) => {
  const topics = getDataFile('topics')
  const topic = topics.find(t => t.id === req.params.id)
  if (!topic) {
    return res.status(404).json({ error: '议题不存在' })
  }
  res.json(topic)
})

router.post('/', (req, res) => {
  const { title, description, creatorId, organizationId } = req.body
  const topics = getDataFile('topics')
  
  const newTopic = {
    id: uuidv4(),
    title,
    description,
    creatorId,
    organizationId,
    status: 'open',
    discussions: [],
    resolutions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  topics.push(newTopic)
  saveDataFile('topics', topics)
  res.status(201).json(newTopic)
})

router.put('/:id', (req, res) => {
  const topics = getDataFile('topics')
  const index = topics.findIndex(t => t.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '议题不存在' })
  }
  
  topics[index] = {
    ...topics[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  saveDataFile('topics', topics)
  res.json(topics[index])
})

router.delete('/:id', (req, res) => {
  let topics = getDataFile('topics')
  topics = topics.filter(t => t.id !== req.params.id)
  saveDataFile('topics', topics)
  res.status(204).send()
})

router.post('/:id/discussions', (req, res) => {
  const topics = getDataFile('topics')
  const index = topics.findIndex(t => t.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '议题不存在' })
  }
  
  const { userId, content } = req.body
  const discussion = {
    id: uuidv4(),
    userId,
    content,
    createdAt: new Date().toISOString()
  }
  
  topics[index].discussions.push(discussion)
  topics[index].updatedAt = new Date().toISOString()
  
  saveDataFile('topics', topics)
  res.status(201).json(discussion)
})

router.post('/:id/resolutions', (req, res) => {
  const topics = getDataFile('topics')
  const index = topics.findIndex(t => t.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '议题不存在' })
  }
  
  const { userId, content } = req.body
  const resolution = {
    id: uuidv4(),
    userId,
    content,
    createdAt: new Date().toISOString(),
    archived: true
  }
  
  topics[index].resolutions.push(resolution)
  topics[index].status = 'resolved'
  topics[index].updatedAt = new Date().toISOString()
  
  saveDataFile('topics', topics)
  res.status(201).json(resolution)
})

module.exports = router
