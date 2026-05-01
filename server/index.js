const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const topicsRouter = require('./routes/topics')
const tasksRouter = require('./routes/tasks')
const usersRouter = require('./routes/users')
const organizationsRouter = require('./routes/organizations')
const whitelistRouter = require('./routes/whitelist')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(bodyParser.json())

app.use('/api/topics', topicsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/users', usersRouter)
app.use('/api/organizations', organizationsRouter)
app.use('/api/whitelist', whitelistRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`异步协作中台后端服务已启动: http://localhost:${PORT}`)
})
