const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { getDataFile, saveDataFile } = require('../data')

const router = express.Router()

router.get('/', (req, res) => {
  const users = getDataFile('users')
  res.json(users)
})

router.get('/:id', (req, res) => {
  const users = getDataFile('users')
  const user = users.find(u => u.id === req.params.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json(user)
})

router.post('/', (req, res) => {
  const { name, email, role, organizationId } = req.body
  const users = getDataFile('users')
  
  const newUser = {
    id: uuidv4(),
    name,
    email,
    role,
    organizationId,
    permissions: {
      canCreateTopic: true,
      canComment: true,
      canResolve: role === 'manager' || role === 'admin',
      canManageOrg: role === 'admin'
    },
    createdAt: new Date().toISOString()
  }
  
  users.push(newUser)
  saveDataFile('users', users)
  res.status(201).json(newUser)
})

router.put('/:id', (req, res) => {
  const users = getDataFile('users')
  const index = users.findIndex(u => u.id === req.params.id)
  
  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' })
  }
  
  users[index] = {
    ...users[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  saveDataFile('users', users)
  res.json(users[index])
})

router.delete('/:id', (req, res) => {
  let users = getDataFile('users')
  users = users.filter(u => u.id !== req.params.id)
  saveDataFile('users', users)
  res.status(204).send()
})

module.exports = router
