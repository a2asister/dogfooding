import mysql from 'mysql2/promise'
import { config } from '../config'
import logger from '../utils/logger'

const pool = mysql.createPool(config.db)

pool.getConnection()
  .then((connection) => {
    logger.info('数据库连接成功')
    connection.release()
  })
  .catch((err) => {
    logger.error('数据库连接失败:', err)
  })

export const query = async (sql: string, params?: any[]): Promise<any> => {
  const [results] = await pool.execute(sql, params)
  return results
}

export const queryOne = async (sql: string, params?: any[]): Promise<any> => {
  const results = await query(sql, params)
  return results[0] || null
}

export default pool
