const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { getDataFile, saveDataFile } = require('../data')

const router = express.Router()

router.get('/', (req, res) => {
  const orgs = getDataFile('organizations')
  res.json(orgs)
})

router.get('/:id', (req, res) => {
  const orgs = getDataFile('organizations')
  const org = orgs.find(o => o.id === req.params.id)
  if (!org) {
    return res.status(404).json({ error: '组织不存在' })
  }
  res.json(org)
})

router.post('/', (req, res) => {
  const { name, parentId } = req.body
  const orgs = getDataFile('organizations')
  
  const newOrg = {
    id: uuidv4(),
    name,
    parentId,
    members: [],
    hierarchy: [],
    createdAt: new Date().toISOString()
  }
  
  if (parentId) {
    const parentOrg = orgs.find(o => o.id === parentId)
    if (parentOrg) {
      newOrg.hierarchy = [...parentOrg.hierarchy, parentId]
    }
  }
  
  orgs.push(newOrg)
  saveDataFile('organizations', orgs)
  res.status(201).json(newOrg)
})

router.put('/:id', (req, res) => {
  const orgs = getDataFile('organizations')
  const index = orgs.findIndex(o => o.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '组织不存在' })
  }
  
  orgs[index] = {
    ...orgs[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  saveDataFile('organizations', orgs)
  res.json(orgs[index])
})

router.delete('/:id', (req, res) => {
  let orgs = getDataFile('organizations')
  orgs = orgs.filter(o => o.id !== req.params.id)
  saveDataFile('organizations', orgs)
  res.status(204).send()
})

router.post('/:id/members', (req, res) => {
  const orgs = getDataFile('organizations')
  const index = orgs.findIndex(o => o.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '组织不存在' })
  }
  
  const { userId, role } = req.body
  const member = {
    userId,
    role,
    joinedAt: new Date().toISOString()
  }
  
  if (!orgs[index].members) {
    orgs[index].members = []
  }
  
  orgs[index].members.push(member)
  saveDataFile('organizations', orgs)
  res.status(201).json(member)
})

module.exports = router
