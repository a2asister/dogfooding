import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

export const generateId = (): string => {
  return uuidv4()
}

export const now = (): Date => {
  return new Date()
}

export const formatDate = (date: Date | string | number, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format)
}

export const parseDate = (date: string): Date => {
  return dayjs(date).toDate()
}

export const isToday = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

export const addDays = (date: Date | string, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate()
}

export const subtractDays = (date: Date | string, days: number): Date => {
  return dayjs(date).subtract(days, 'day').toDate()
}

export const startOfDay = (date: Date | string): Date => {
  return dayjs(date).startOf('day').toDate()
}

export const endOfDay = (date: Date | string): Date => {
  return dayjs(date).endOf('day').toDate()
}

export const startOfWeek = (date: Date | string): Date => {
  return dayjs(date).startOf('week').toDate()
}

export const endOfWeek = (date: Date | string): Date => {
  return dayjs(date).endOf('week').toDate()
}

export const startOfMonth = (date: Date | string): Date => {
  return dayjs(date).startOf('month').toDate()
}

export const endOfMonth = (date: Date | string): Date => {
  return dayjs(date).endOf('month').toDate()
}

export const getDaysBetween = (start: Date | string, end: Date | string): number => {
  return dayjs(end).diff(dayjs(start), 'day')
}

export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0m'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0) parts.push(`${mins}m`)
  
  return parts.join(' ')
}

export const parseDuration = (duration: string): number => {
  if (!duration) return 0
  
  const hoursMatch = duration.match(/(\d+)\s*h/i)
  const minsMatch = duration.match(/(\d+)\s*m/i)
  
  let total = 0
  if (hoursMatch) total += parseInt(hoursMatch[1]) * 60
  if (minsMatch) total += parseInt(minsMatch[1])
  
  return total
}

export const generateKey = (prefix: string, number: number): string => {
  return `${prefix}-${number}`
}

export const truncate = (text: string, maxLength: number, ellipsis = '...'): string => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const unescapeHtml = (text: string): string => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T, wait: number): (...args: Parameters<T>) => void => {
  let timeoutId: number | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: unknown[]) => void>(
  func: T, limit: number): (...args: Parameters<T>) => void => {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

export const isEqual = (obj1: unknown, obj2: unknown): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export const groupBy = <T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T | ((item: T) => number | string), ascending = true): T[] => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key]
    const bVal = typeof key === 'function' ? key(b) : b[key]
    
    if (aVal < bVal) return ascending ? -1 : 1
    if (aVal > bVal) return ascending ? 1 : -1
    return 0
  })
}

export const uniqueBy = <T>(array: T[], key: keyof T | ((item: T) => unknown)): T[] => {
  const seen = new Set()
  return array.filter(item => {
    const keyVal = typeof key === 'function' ? key(item) : item[key]
    const keyStr = JSON.stringify(keyVal)
    if (seen.has(keyStr)) return false
    seen.add(keyStr)
    return true
  })
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {} as Pick<T, K>)
}

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key as keyof typeof result])
  return result as Omit<T, K>
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}
