import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash)
}

export const generateToken = (payload: { id: number; username: string; role: string }): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

export const generateOrderNo = (): string => {
  const dateStr = dayjs().format('YYYYMMDD')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${dateStr}${random}`
}

export const paginate = (page: number = 1, pageSize: number = 10) => {
  const offset = (page - 1) * pageSize
  return {
    limit: pageSize,
    offset,
  }
}
