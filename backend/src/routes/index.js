import Router from 'koa-router'
import logger from '../middleware/logger.js'
import dataService from '../services/dataService.js'

const router = new Router()

router.get('/api/health', async (ctx) => {
  logger.info('Health check requested')
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'baby-management-backend'
  }
})

router.get('/api/data', async (ctx) => {
  try {
    const data = await dataService.getAll()
    logger.info('Data retrieved successfully')
    ctx.body = {
      success: true,
      data
    }
  } catch (error) {
    logger.error('Failed to retrieve data', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to retrieve data'
    }
  }
})

router.post('/api/data', async (ctx) => {
  try {
    const newData = ctx.request.body
    await dataService.saveAll(newData)
    logger.info('Data saved successfully')
    ctx.body = {
      success: true,
      message: 'Data saved successfully'
    }
  } catch (error) {
    logger.error('Failed to save data', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to save data'
    }
  }
})

router.get('/api/settings', async (ctx) => {
  try {
    const settings = await dataService.getSettings()
    logger.info('Settings retrieved successfully')
    ctx.body = {
      success: true,
      data: settings
    }
  } catch (error) {
    logger.error('Failed to retrieve settings', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to retrieve settings'
    }
  }
})

router.put('/api/settings', async (ctx) => {
  try {
    const updates = ctx.request.body
    const updatedSettings = await dataService.updateSettings(updates)
    logger.info('Settings updated successfully')
    ctx.body = {
      success: true,
      data: updatedSettings
    }
  } catch (error) {
    logger.error('Failed to update settings', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to update settings'
    }
  }
})

router.get('/api/export', async (ctx) => {
  try {
    const jsonData = await dataService.exportToJSON()
    logger.info('Data exported successfully')
    ctx.set('Content-Type', 'application/json')
    ctx.set('Content-Disposition', `attachment; filename=baby_management_data_${new Date().toISOString().split('T')[0]}.json`)
    ctx.body = jsonData
  } catch (error) {
    logger.error('Failed to export data', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to export data'
    }
  }
})

router.post('/api/import', async (ctx) => {
  try {
    const { jsonString } = ctx.request.body
    if (!jsonString) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'No data provided'
      }
      return
    }

    const success = await dataService.importFromJSON(jsonString)
    if (success) {
      ctx.body = {
        success: true,
        message: 'Data imported successfully'
      }
    } else {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Invalid data format'
      }
    }
  } catch (error) {
    logger.error('Failed to import data', { error: error.message })
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'Failed to import data'
    }
  }
})

export default router
