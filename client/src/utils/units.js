export const CATEGORIES = [
  { id: 'currency', name: '汇率', icon: '💰' },
  { id: 'length', name: '长度', icon: '📏' },
  { id: 'weight', name: '重量', icon: '⚖️' },
  { id: 'time', name: '时间', icon: '⏱️' },
  { id: 'temperature', name: '温度', icon: '🌡️' },
  { id: 'data', name: '数据存储', icon: '💾' },
  { id: 'area', name: '面积', icon: '📐' },
  { id: 'volume', name: '体积', icon: '🧊' },
  { id: 'speed', name: '速度', icon: '🚀' },
  { id: 'pressure', name: '压力', icon: '🎈' },
  { id: 'energy', name: '能量', icon: '⚡' },
  { id: 'angle', name: '角度', icon: '📐' }
]

const BASE_UNIT = {
  length: 'm',
  weight: 'kg',
  time: 's',
  data: 'byte',
  area: 'sqm',
  volume: 'l',
  speed: 'mps',
  pressure: 'pa',
  energy: 'j'
}

export const UNITS = {
  currency: [
    { id: 'USD', name: '美元', symbol: '$' },
    { id: 'CNY', name: '人民币', symbol: '¥' },
    { id: 'EUR', name: '欧元', symbol: '€' },
    { id: 'GBP', name: '英镑', symbol: '£' },
    { id: 'JPY', name: '日元', symbol: '¥' },
    { id: 'AUD', name: '澳元', symbol: 'A$' },
    { id: 'CAD', name: '加元', symbol: 'C$' },
    { id: 'HKD', name: '港币', symbol: 'HK$' },
    { id: 'SGD', name: '新加坡元', symbol: 'S$' },
    { id: 'KRW', name: '韩元', symbol: '₩' }
  ],
  length: [
    { id: 'km', name: '千米', factor: 1000 },
    { id: 'm', name: '米', factor: 1 },
    { id: 'dm', name: '分米', factor: 0.1 },
    { id: 'cm', name: '厘米', factor: 0.01 },
    { id: 'mm', name: '毫米', factor: 0.001 },
    { id: 'um', name: '微米', factor: 0.000001 },
    { id: 'nm', name: '纳米', factor: 0.000000001 },
    { id: 'mi', name: '英里', factor: 1609.344 },
    { id: 'yd', name: '码', factor: 0.9144 },
    { id: 'ft', name: '英尺', factor: 0.3048 },
    { id: 'in', name: '英寸', factor: 0.0254 },
    { id: 'nmile', name: '海里', factor: 1852 },
    { id: 'li', name: '里', factor: 500 },
    { id: 'zhang', name: '丈', factor: 3.333 },
    { id: 'chi', name: '尺', factor: 0.333 },
    { id: 'cun', name: '寸', factor: 0.0333 }
  ],
  weight: [
    { id: 't', name: '吨', factor: 1000 },
    { id: 'kg', name: '千克', factor: 1 },
    { id: 'g', name: '克', factor: 0.001 },
    { id: 'mg', name: '毫克', factor: 0.000001 },
    { id: 'ug', name: '微克', factor: 0.000000001 },
    { id: 'lb', name: '磅', factor: 0.45359237 },
    { id: 'oz', name: '盎司', factor: 0.02834952 },
    { id: 'jin', name: '斤', factor: 0.5 },
    { id: 'liang', name: '两', factor: 0.05 },
    { id: 'qian', name: '钱', factor: 0.005 },
    { id: 'ct', name: '克拉', factor: 0.0002 }
  ],
  time: [
    { id: 'y', name: '年', factor: 31536000 },
    { id: 'mo', name: '月', factor: 2592000 },
    { id: 'w', name: '周', factor: 604800 },
    { id: 'd', name: '天', factor: 86400 },
    { id: 'h', name: '小时', factor: 3600 },
    { id: 'min', name: '分钟', factor: 60 },
    { id: 's', name: '秒', factor: 1 },
    { id: 'ms', name: '毫秒', factor: 0.001 },
    { id: 'us', name: '微秒', factor: 0.000001 },
    { id: 'ns', name: '纳秒', factor: 0.000000001 }
  ],
  temperature: [
    { id: 'c', name: '摄氏度', symbol: '°C' },
    { id: 'f', name: '华氏度', symbol: '°F' },
    { id: 'k', name: '开尔文', symbol: 'K' },
    { id: 'r', name: '兰氏度', symbol: '°R' }
  ],
  data: [
    { id: 'bit', name: 'bit', factor: 0.125 },
    { id: 'byte', name: 'Byte', factor: 1 },
    { id: 'kb', name: 'KB', factor: 1024 },
    { id: 'mb', name: 'MB', factor: 1048576 },
    { id: 'gb', name: 'GB', factor: 1073741824 },
    { id: 'tb', name: 'TB', factor: 1099511627776 },
    { id: 'pb', name: 'PB', factor: 1125899906842624 }
  ],
  area: [
    { id: 'sqkm', name: '平方千米', factor: 1000000 },
    { id: 'sqm', name: '平方米', factor: 1 },
    { id: 'sqcm', name: '平方厘米', factor: 0.0001 },
    { id: 'sqmm', name: '平方毫米', factor: 0.000001 },
    { id: 'sqmi', name: '平方英里', factor: 2589988.11 },
    { id: 'sqyd', name: '平方码', factor: 0.836127 },
    { id: 'sqft', name: '平方英尺', factor: 0.092903 },
    { id: 'sqin', name: '平方英寸', factor: 0.00064516 },
    { id: 'ha', name: '公顷', factor: 10000 },
    { id: 'are', name: '公亩', factor: 100 },
    { id: 'mu', name: '亩', factor: 666.6667 },
    { id: 'sqzhang', name: '平方丈', factor: 11.1111 }
  ],
  volume: [
    { id: 'cbm', name: '立方米', factor: 1000 },
    { id: 'l', name: '升', factor: 1 },
    { id: 'ml', name: '毫升', factor: 0.001 },
    { id: 'gal', name: '加仑(美)', factor: 3.78541 },
    { id: 'galuk', name: '加仑(英)', factor: 4.54609 },
    { id: 'qt', name: '夸脱', factor: 0.946353 },
    { id: 'pt', name: '品脱', factor: 0.473176 },
    { id: 'floz', name: '液盎司', factor: 0.0295735 },
    { id: 'c', name: '杯', factor: 0.236588 },
    { id: 'tbsp', name: '汤匙', factor: 0.0147868 },
    { id: 'tsp', name: '茶匙', factor: 0.00492892 },
    { id: 'cbf', name: '立方英尺', factor: 28.3168 },
    { id: 'cbi', name: '立方英寸', factor: 0.0163871 },
    { id: 'cbyd', name: '立方码', factor: 764.555 }
  ],
  speed: [
    { id: 'mps', name: '米/秒', factor: 1 },
    { id: 'kmph', name: '千米/小时', factor: 0.277778 },
    { id: 'knot', name: '节', factor: 0.514444 },
    { id: 'mach', name: '马赫', factor: 343 },
    { id: 'mph', name: '英里/小时', factor: 0.44704 },
    { id: 'ftps', name: '英尺/秒', factor: 0.3048 }
  ],
  pressure: [
    { id: 'pa', name: '帕斯卡', factor: 1 },
    { id: 'kpa', name: '千帕', factor: 1000 },
    { id: 'mpa', name: '兆帕', factor: 1000000 },
    { id: 'bar', name: '巴', factor: 100000 },
    { id: 'atm', name: '标准大气压', factor: 101325 },
    { id: 'psi', name: '磅/平方英寸', factor: 6894.76 },
    { id: 'mmhg', name: '毫米汞柱', factor: 133.322 },
    { id: 'cmhg', name: '厘米汞柱', factor: 1333.22 },
    { id: 'mbar', name: '毫巴', factor: 100 }
  ],
  energy: [
    { id: 'j', name: '焦耳', factor: 1 },
    { id: 'kj', name: '千焦', factor: 1000 },
    { id: 'mj', name: '兆焦', factor: 1000000 },
    { id: 'cal', name: '卡路里', factor: 4.1868 },
    { id: 'kcal', name: '千卡', factor: 4186.8 },
    { id: 'wh', name: '瓦时', factor: 3600 },
    { id: 'kwh', name: '千瓦时', factor: 3600000 },
    { id: 'ev', name: '电子伏', factor: 1.602176634e-19 },
    { id: 'btu', name: '英热单位', factor: 1055.06 }
  ],
  angle: [
    { id: 'deg', name: '度', factor: 1 },
    { id: 'rad', name: '弧度', factor: 57.2958 },
    { id: 'gon', name: '百分度', factor: 0.9 },
    { id: 'arcmin', name: '弧分', factor: 0.0166667 },
    { id: 'arcsec', name: '弧秒', factor: 0.000277778 },
    { id: 'turn', name: '圈', factor: 360 }
  ]
}

export function getUnitName(category, unitId) {
  if (!UNITS[category]) return unitId
  const unit = UNITS[category].find(u => u.id === unitId)
  return unit ? unit.name : unitId
}

export function convert(category, value, fromUnit, toUnit, exchangeRates = null) {
  if (!value || isNaN(value)) return ''
  
  const numValue = parseFloat(value)
  
  if (fromUnit === toUnit) {
    return formatNumber(numValue)
  }
  
  if (category === 'temperature') {
    return formatNumber(convertTemperature(numValue, fromUnit, toUnit))
  }
  
  if (category === 'currency') {
    if (!exchangeRates || !exchangeRates.rates) {
      return '—'
    }
    try {
      const rates = exchangeRates.rates
      if (rates[fromUnit] && rates[fromUnit][toUnit]) {
        return formatNumber(numValue * rates[fromUnit][toUnit])
      } else if (rates['USD']) {
        let inUSD = numValue
        if (fromUnit !== 'USD' && rates['USD'][fromUnit]) {
          inUSD = numValue / rates['USD'][fromUnit]
        }
        if (toUnit !== 'USD' && rates['USD'][toUnit]) {
          return formatNumber(inUSD * rates['USD'][toUnit])
        }
      }
    } catch (e) {
      console.error('汇率转换错误', e)
    }
    return '—'
  }
  
  if (category === 'angle') {
    return formatNumber(convertAngle(numValue, fromUnit, toUnit))
  }
  
  const from = UNITS[category]?.find(u => u.id === fromUnit)
  const to = UNITS[category]?.find(u => u.id === toUnit)
  
  if (!from || !to) return ''
  
  const baseValue = numValue * from.factor
  const result = baseValue / to.factor
  
  return formatNumber(result)
}

function convertTemperature(value, from, to) {
  let celsius
  
  switch (from) {
    case 'c':
      celsius = value
      break
    case 'f':
      celsius = (value - 32) * 5 / 9
      break
    case 'k':
      celsius = value - 273.15
      break
    case 'r':
      celsius = (value - 491.67) * 5 / 9
      break
    default:
      celsius = value
  }
  
  switch (to) {
    case 'c':
      return celsius
    case 'f':
      return celsius * 9 / 5 + 32
    case 'k':
      return celsius + 273.15
    case 'r':
      return (celsius + 273.15) * 9 / 5
    default:
      return celsius
  }
}

function convertAngle(value, from, to) {
  const fromUnit = UNITS.angle.find(u => u.id === from)
  const toUnit = UNITS.angle.find(u => u.id === to)
  if (!fromUnit || !toUnit) return value
  
  const inDegrees = value * fromUnit.factor
  return inDegrees / toUnit.factor
}

function formatNumber(num) {
  if (!isFinite(num)) return '—'
  if (Math.abs(num) < 0.000001 && num !== 0) {
    return num.toExponential(6)
  }
  if (Math.abs(num) >= 1000000000) {
    return num.toExponential(6)
  }
  
  let formatted = num.toPrecision(12)
  formatted = parseFloat(formatted).toString()
  
  return formatted
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
