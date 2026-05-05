const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const DATA_DIR = path.join(__dirname, '../../data');
const TS_DIR = path.join(DATA_DIR, 'timeseries');

if (!fs.existsSync(TS_DIR)) {
  fs.mkdirSync(TS_DIR, { recursive: true });
}

const INDEX_FILE = path.join(TS_DIR, 'index.json');
const AGGREGATION_FILE = path.join(TS_DIR, 'aggregation.json');

class TimeSeriesStore {
  constructor(options = {}) {
    this.shardType = options.shardType || 'hourly';
    this.index = this.loadIndex();
    this.aggregation = this.loadAggregation();
    this.cache = new Map();
    this.cacheMaxSize = options.cacheMaxSize || 1000;
    this.stats = {
      totalReads: 0,
      totalWrites: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  getShardKey(timestamp) {
    const date = dayjs(timestamp);
    switch (this.shardType) {
      case 'daily':
        return date.format('YYYY-MM-DD');
      case 'hourly':
      default:
        return date.format('YYYY-MM-DD-HH');
    }
  }

  getShardPath(shardKey) {
    return path.join(TS_DIR, `shard-${shardKey}.json`);
  }

  loadIndex() {
    try {
      if (fs.existsSync(INDEX_FILE)) {
        const content = fs.readFileSync(INDEX_FILE, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to load index:', error);
    }
    return {
      shards: {},
      totalLogs: 0,
      createdAt: Date.now()
    };
  }

  saveIndex() {
    try {
      fs.writeFileSync(INDEX_FILE, JSON.stringify(this.index, null, 2));
    } catch (error) {
      console.error('Failed to save index:', error);
    }
  }

  loadAggregation() {
    try {
      if (fs.existsSync(AGGREGATION_FILE)) {
        const content = fs.readFileSync(AGGREGATION_FILE, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to load aggregation:', error);
    }
    return {
      hourly: {},
      daily: {},
      services: {},
      levels: {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        FATAL: 0
      }
    };
  }

  saveAggregation() {
    try {
      fs.writeFileSync(AGGREGATION_FILE, JSON.stringify(this.aggregation, null, 2));
    } catch (error) {
      console.error('Failed to save aggregation:', error);
    }
  }

  loadShard(shardKey) {
    const shardPath = this.getShardPath(shardKey);
    try {
      if (fs.existsSync(shardPath)) {
        const content = fs.readFileSync(shardPath, 'utf8');
        const shard = JSON.parse(content);
        this.cache.set(shardKey, shard);
        
        if (this.cache.size > this.cacheMaxSize) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        
        return shard;
      }
    } catch (error) {
      console.error(`Failed to load shard ${shardKey}:`, error);
    }
    return [];
  }

  saveShard(shardKey, shardData) {
    const shardPath = this.getShardPath(shardKey);
    try {
      fs.writeFileSync(shardPath, JSON.stringify(shardData));
      this.cache.set(shardKey, shardData);
    } catch (error) {
      console.error(`Failed to save shard ${shardKey}:`, error);
    }
  }

  updateAggregation(log) {
    const timestamp = log.timestamp;
    const hourKey = dayjs(timestamp).format('YYYY-MM-DD-HH');
    const dayKey = dayjs(timestamp).format('YYYY-MM-DD');

    if (!this.aggregation.hourly[hourKey]) {
      this.aggregation.hourly[hourKey] = {
        count: 0,
        levels: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0 },
        services: {}
      };
    }

    if (!this.aggregation.daily[dayKey]) {
      this.aggregation.daily[dayKey] = {
        count: 0,
        levels: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0 },
        services: {}
      };
    }

    const service = log.service || 'unknown';

    this.aggregation.hourly[hourKey].count++;
    this.aggregation.hourly[hourKey].levels[log.level] = 
      (this.aggregation.hourly[hourKey].levels[log.level] || 0) + 1;
    this.aggregation.hourly[hourKey].services[service] = 
      (this.aggregation.hourly[hourKey].services[service] || 0) + 1;

    this.aggregation.daily[dayKey].count++;
    this.aggregation.daily[dayKey].levels[log.level] = 
      (this.aggregation.daily[dayKey].levels[log.level] || 0) + 1;
    this.aggregation.daily[dayKey].services[service] = 
      (this.aggregation.daily[dayKey].services[service] || 0) + 1;

    if (!this.aggregation.services[service]) {
      this.aggregation.services[service] = {
        count: 0,
        levels: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0 }
      };
    }
    this.aggregation.services[service].count++;
    this.aggregation.services[service].levels[log.level] = 
      (this.aggregation.services[service].levels[log.level] || 0) + 1;

    this.aggregation.levels[log.level] = (this.aggregation.levels[log.level] || 0) + 1;
  }

  insert(log) {
    const shardKey = this.getShardKey(log.timestamp);
    const shardData = this.cache.get(shardKey) || this.loadShard(shardKey);

    shardData.push(log);

    this.saveShard(shardKey, shardData);

    if (!this.index.shards[shardKey]) {
      this.index.shards[shardKey] = {
        count: 0,
        minTimestamp: log.timestamp,
        maxTimestamp: log.timestamp
      };
    }
    
    this.index.shards[shardKey].count++;
    this.index.shards[shardKey].minTimestamp = Math.min(
      this.index.shards[shardKey].minTimestamp,
      log.timestamp
    );
    this.index.shards[shardKey].maxTimestamp = Math.max(
      this.index.shards[shardKey].maxTimestamp,
      log.timestamp
    );
    this.index.totalLogs++;

    this.updateAggregation(log);
    this.stats.totalWrites++;

    this.saveIndex();
    this.saveAggregation();

    return true;
  }

  insertBatch(logs) {
    const shardGroups = {};

    logs.forEach(log => {
      const shardKey = this.getShardKey(log.timestamp);
      if (!shardGroups[shardKey]) {
        shardGroups[shardKey] = [];
      }
      shardGroups[shardKey].push(log);
    });

    for (const [shardKey, shardLogs] of Object.entries(shardGroups)) {
      const shardData = this.cache.get(shardKey) || this.loadShard(shardKey);
      
      shardData.push(...shardLogs);
      this.saveShard(shardKey, shardData);

      if (!this.index.shards[shardKey]) {
        this.index.shards[shardKey] = {
          count: 0,
          minTimestamp: Infinity,
          maxTimestamp: -Infinity
        };
      }

      shardLogs.forEach(log => {
        this.index.shards[shardKey].count++;
        this.index.shards[shardKey].minTimestamp = Math.min(
          this.index.shards[shardKey].minTimestamp,
          log.timestamp
        );
        this.index.shards[shardKey].maxTimestamp = Math.max(
          this.index.shards[shardKey].maxTimestamp,
          log.timestamp
        );
        this.index.totalLogs++;
        this.updateAggregation(log);
      });

      this.stats.totalWrites += shardLogs.length;
    }

    this.saveIndex();
    this.saveAggregation();

    return true;
  }

  query(options = {}) {
    const { 
      startTime, 
      endTime, 
      service, 
      level, 
      type,
      traceId,
      keyword,
      limit = 100,
      offset = 0
    } = options;

    this.stats.totalReads++;

    const relevantShards = this.getRelevantShards(startTime, endTime);
    
    let results = [];

    for (const shardKey of relevantShards) {
      let shardData = this.cache.get(shardKey);
      
      if (shardData) {
        this.stats.cacheHits++;
      } else {
        this.stats.cacheMisses++;
        shardData = this.loadShard(shardKey);
      }

      let filtered = shardData;

      if (startTime) {
        filtered = filtered.filter(log => log.timestamp >= startTime);
      }

      if (endTime) {
        filtered = filtered.filter(log => log.timestamp <= endTime);
      }

      if (service) {
        filtered = filtered.filter(log => log.service === service);
      }

      if (level) {
        const levels = Array.isArray(level) ? level : [level];
        filtered = filtered.filter(log => levels.includes(log.level));
      }

      if (type) {
        filtered = filtered.filter(log => log.type === type);
      }

      if (traceId) {
        filtered = filtered.filter(log => log.traceId === traceId);
      }

      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(log => 
          log.message.toLowerCase().includes(lowerKeyword) ||
          log.service.toLowerCase().includes(lowerKeyword)
        );
      }

      results.push(...filtered);
    }

    results.sort((a, b) => b.timestamp - a.timestamp);

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return {
      total,
      data: paginated,
      stats: this.getStats()
    };
  }

  getRelevantShards(startTime, endTime) {
    const shards = [];

    for (const [shardKey, shardInfo] of Object.entries(this.index.shards)) {
      if (startTime && shardInfo.maxTimestamp < startTime) continue;
      if (endTime && shardInfo.minTimestamp > endTime) continue;
      shards.push(shardKey);
    }

    return shards.sort();
  }

  getStats() {
    return {
      ...this.stats,
      totalLogs: this.index.totalLogs,
      shardCount: Object.keys(this.index.shards).length,
      cacheSize: this.cache.size
    };
  }

  getAggregation(aggType, key) {
    switch (aggType) {
      case 'hourly':
        return this.aggregation.hourly[key] || null;
      case 'daily':
        return this.aggregation.daily[key] || null;
      case 'service':
        return this.aggregation.services[key] || null;
      case 'levels':
        return this.aggregation.levels;
      case 'all':
        return this.aggregation;
      default:
        return null;
    }
  }

  getTimeRangeAggregation(startTime, endTime, aggType = 'hourly') {
    const results = {};
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const format = aggType === 'hourly' ? 'YYYY-MM-DD-HH' : 'YYYY-MM-DD';
    const step = aggType === 'hourly' ? 1 : 1;
    const unit = aggType === 'hourly' ? 'hour' : 'day';

    let current = start.startOf(unit);
    while (current.isBefore(end.endOf(unit)) || current.isSame(end.endOf(unit))) {
      const key = current.format(format);
      const data = this.getAggregation(aggType, key);
      if (data) {
        results[key] = data;
      }
      current = current.add(step, unit);
    }

    return results;
  }

  getTrendData(startTime, endTime, interval = 'hour') {
    const results = [];
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    const unitMap = {
      minute: 'minute',
      hour: 'hour',
      day: 'day'
    };
    const unit = unitMap[interval] || 'hour';

    const format = interval === 'minute' ? 'YYYY-MM-DD HH:mm' :
                     interval === 'hour' ? 'YYYY-MM-DD HH:00' : 'YYYY-MM-DD';

    let current = start.startOf(unit);
    while (current.isBefore(end.endOf(unit)) || current.isSame(end.endOf(unit))) {
      const timeKey = current.format(format);
      const tsKey = this.getShardKey(current.valueOf());
      const shardData = this.cache.get(tsKey) || this.loadShard(tsKey);
      
      const windowStart = current.valueOf();
      const windowEnd = current.add(1, unit).valueOf();
      
      const count = shardData.filter(log => 
        log.timestamp >= windowStart && log.timestamp < windowEnd
      ).length;

      results.push({
        timestamp: windowStart,
        time: timeKey,
        count
      });

      current = current.add(1, unit);
    }

    return results;
  }

  clearCache() {
    this.cache.clear();
  }

  compact() {
    console.log('Starting time series compaction...');
    
    const shardKeys = Object.keys(this.index.shards).sort();
    
    shardKeys.forEach(shardKey => {
      const shardData = this.loadShard(shardKey);
      
      const sorted = shardData.sort((a, b) => a.timestamp - b.timestamp);
      
      this.saveShard(shardKey, sorted);
      
      if (this.index.shards[shardKey]) {
        this.index.shards[shardKey].minTimestamp = sorted[0]?.timestamp || this.index.shards[shardKey].minTimestamp;
        this.index.shards[shardKey].maxTimestamp = sorted[sorted.length - 1]?.timestamp || this.index.shards[shardKey].maxTimestamp;
      }
    });

    this.saveIndex();
    console.log('Time series compaction completed.');
  }
}

const timeSeriesStore = new TimeSeriesStore({
  shardType: 'hourly',
  cacheMaxSize: 100
});

module.exports = {
  TimeSeriesStore,
  timeSeriesStore
};
