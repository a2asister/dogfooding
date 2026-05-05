const { logsStore } = require('./store')
const { timeSeriesStore } = require('./timeSeriesStore')

class LogBuffer {
  constructor(options = {}) {
    this.bufferSize = options.bufferSize || 1000
    this.flushInterval = options.flushInterval || 5000
    this.maxRetries = options.maxRetries || 3
    this.batchSize = options.batchSize || 100
    this.useTimeSeries = options.useTimeSeries !== false
    
    this.buffer = []
    this.isFlushing = false
    this.flushTimer = null
    this.statistics = {
      totalReceived: 0,
      totalDropped: 0,
      totalFlushed: 0,
      peakBufferSize: 0
    }
    
    this.startFlushTimer()
  }
  
  startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }
  
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }
  
  add(logs) {
    const logsArray = Array.isArray(logs) ? logs : [logs]
    
    this.statistics.totalReceived += logsArray.length
    
    if (this.buffer.length + logsArray.length > this.bufferSize) {
      const dropCount = this.buffer.length + logsArray.length - this.bufferSize
      this.statistics.totalDropped += dropCount
      console.warn(`Log buffer overflow, dropping ${dropCount} logs`)
    }
    
    const availableSpace = this.bufferSize - this.buffer.length
    const logsToAdd = logsArray.slice(0, availableSpace)
    
    this.buffer.push(...logsToAdd)
    
    if (this.buffer.length > this.statistics.peakBufferSize) {
      this.statistics.peakBufferSize = this.buffer.length
    }
    
    if (this.buffer.length >= this.batchSize) {
      setImmediate(() => this.flush())
    }
  }
  
  async flush() {
    if (this.isFlushing || this.buffer.length === 0) {
      return
    }
    
    this.isFlushing = true
    
    const batch = this.buffer.splice(0, this.batchSize)
    let retries = 0
    
    while (retries < this.maxRetries) {
      try {
        if (this.useTimeSeries) {
          timeSeriesStore.insertBatch(batch)
        }
        
        batch.forEach(log => logsStore.append(log))
        
        this.statistics.totalFlushed += batch.length
        
        if (this.buffer.length > 0) {
          setImmediate(() => this.flush())
        }
        
        break
      } catch (error) {
        retries++
        console.error(`Flush failed (attempt ${retries}/${this.maxRetries}):`, error)
        
        if (retries >= this.maxRetries) {
          this.buffer.unshift(...batch)
          console.error('Max retries reached, restoring to buffer')
        }
      }
    }
    
    this.isFlushing = false
  }
  
  getStatistics() {
    return {
      ...this.statistics,
      currentBufferSize: this.buffer.length,
      bufferSize: this.bufferSize,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      isFlushing: this.isFlushing,
      useTimeSeries: this.useTimeSeries
    }
  }
  
  clear() {
    this.buffer = []
    this.statistics = {
      totalReceived: 0,
      totalDropped: 0,
      totalFlushed: 0,
      peakBufferSize: 0
    }
  }
  
  shutdown() {
    this.stopFlushTimer()
    this.flush()
  }
}

const logBuffer = new LogBuffer({
  bufferSize: 5000,
  flushInterval: 3000,
  batchSize: 100,
  useTimeSeries: true
})

module.exports = {
  LogBuffer,
  logBuffer
}
