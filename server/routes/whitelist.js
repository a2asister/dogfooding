const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { getDataFile, saveDataFile } = require('../data')

const router = express.Router()

router.get('/', (req, res) => {
  const whitelist = getDataFile('whitelist')
  res.json(whitelist)
})

router.get('/:id', (req, res) => {
  const whitelist = getDataFile('whitelist')
  const entry = whitelist.find(w => w.id === req.params.id)
  if (!entry) {
    return res.status(404).json({ error: '白名单条目不存在' })
  }
  res.json(entry)
})

router.post('/', (req, res) => {
  const { organizationId, externalOrgId, externalOrgName, permissions } = req.body
  const whitelist = getDataFile('whitelist')
  
  const newEntry = {
    id: uuidv4(),
    organizationId,
    externalOrgId,
    externalOrgName,
    permissions: permissions || ['view_topics', 'comment'],
    active: true,
    createdAt: new Date().toISOString(),
    expiresAt: null
  }
  
  whitelist.push(newEntry)
  saveDataFile('whitelist', whitelist)
  res.status(201).json(newEntry)
})

router.put('/:id', (req, res) => {
  const whitelist = getDataFile('whitelist')
  const index = whitelist.findIndex(w => w.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '白名单条目不存在' })
  }
  
  whitelist[index] = {
    ...whitelist[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  saveDataFile('whitelist', whitelist)
  res.json(whitelist[index])
})

router.delete('/:id', (req, res) => {
  let whitelist = getDataFile('whitelist')
  whitelist = whitelist.filter(w => w.id !== req.params.id)
  saveDataFile('whitelist', whitelist)
  res.status(204).send()
})

router.post('/:id/revoke', (req, res) => {
  const whitelist = getDataFile('whitelist')
  const index = whitelist.findIndex(w => w.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '白名单条目不存在' })
  }
  
  whitelist[index].active = false
  whitelist[index].revokedAt = new Date().toISOString()
  
  saveDataFile('whitelist', whitelist)
  res.json(whitelist[index])
})

router.post('/:id/verify', (req, res) => {
  const whitelist = getDataFile('whitelist')
  const entry = whitelist.find(w => w.id === req.params.id)
  
  if (!entry) {
    return res.status(404).json({ error: '白名单条目不存在' })
  }
  
  const isValid = entry.active && 
    (!entry.expiresAt || new Date(entry.expiresAt) > new Date())
  
  res.json({
    id: entry.id,
    isValid,
    permissions: isValid ? entry.permissions : []
  })
})

module.exports = router
