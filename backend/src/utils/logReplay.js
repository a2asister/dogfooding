const dayjs = require('dayjs');
const { timeSeriesStore } = require('./timeSeriesStore');

class LogReplayManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(options = {}) {
    const {
      traceId,
      startTime,
      endTime,
      service,
      level,
      replaySpeed = 1,
      autoPlay = false
    } = options;

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let logs = [];

    if (traceId) {
      const result = timeSeriesStore.query({
        traceId,
        limit: 10000
      });
      logs = result.data;
    } else {
      const result = timeSeriesStore.query({
        startTime,
        endTime,
        service,
        level,
        limit: 10000
      });
      logs = result.data;
    }

    logs.sort((a, b) => a.timestamp - b.timestamp);

    const timeline = this.buildTimeline(logs);

    const session = {
      id: sessionId,
      createdAt: Date.now(),
      status: 'created',
      currentIndex: 0,
      currentTime: logs.length > 0 ? logs[0].timestamp : Date.now(),
      logs,
      timeline,
      config: {
        traceId,
        startTime,
        endTime,
        service,
        level,
        replaySpeed,
        autoPlay
      },
      statistics: {
        totalLogs: logs.length,
        startTime: logs.length > 0 ? logs[0].timestamp : null,
        endTime: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
        services: this.countByField(logs, 'service'),
        levels: this.countByField(logs, 'level'),
        types: this.countByField(logs, 'type')
      }
    };

    this.sessions.set(sessionId, session);

    return this.getSessionInfo(sessionId);
  }

  buildTimeline(logs) {
    if (logs.length === 0) {
      return { events: [], intervals: [] };
    }

    const minTime = logs[0].timestamp;
    const maxTime = logs[logs.length - 1].timestamp;
    const totalDuration = maxTime - minTime;

    const events = logs.map((log, index) => ({
      index,
      timestamp: log.timestamp,
      relativeTime: log.timestamp - minTime,
      logId: log.id,
      service: log.service,
      level: log.level,
      type: log.type,
      traceId: log.traceId,
      message: log.message
    }));

    const intervalMs = Math.max(1000, totalDuration / 20);
    const intervals = [];
    
    for (let time = minTime; time <= maxTime; time += intervalMs) {
      const intervalEnd = Math.min(time + intervalMs, maxTime);
      const logsInInterval = logs.filter(
        log => log.timestamp >= time && log.timestamp < intervalEnd
      );
      
      intervals.push({
        startTime: time,
        endTime: intervalEnd,
        count: logsInInterval.length,
        levels: this.countByField(logsInInterval, 'level')
      });
    }

    return {
      events,
      intervals,
      minTime,
      maxTime,
      totalDuration
    };
  }

  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      const key = item[field] || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      status: session.status,
      currentIndex: session.currentIndex,
      currentTime: session.currentTime,
      config: session.config,
      statistics: session.statistics,
      timeline: {
        minTime: session.timeline.minTime,
        maxTime: session.timeline.maxTime,
        totalDuration: session.timeline.totalDuration,
        intervalCount: session.timeline.intervals.length,
        eventCount: session.timeline.events.length
      }
    };
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  startPlay(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    session.status = 'playing';
    return this.getSessionInfo(sessionId);
  }

  pausePlay(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    session.status = 'paused';
    return this.getSessionInfo(sessionId);
  }

  stopPlay(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    session.status = 'stopped';
    session.currentIndex = 0;
    session.currentTime = session.logs.length > 0 ? session.logs[0].timestamp : Date.now();
    return this.getSessionInfo(sessionId);
  }

  seekTo(sessionId, index) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    if (index < 0 || index >= session.logs.length) {
      return { error: 'Index out of bounds' };
    }

    session.currentIndex = index;
    session.currentTime = session.logs[index].timestamp;

    return {
      ...this.getSessionInfo(sessionId),
      currentLog: session.logs[index]
    };
  }

  seekToTime(sessionId, timestamp) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const index = session.logs.findIndex(log => log.timestamp >= timestamp);
    if (index === -1) {
      session.currentIndex = session.logs.length - 1;
      session.currentTime = session.logs[session.logs.length - 1]?.timestamp || timestamp;
    } else {
      session.currentIndex = index;
      session.currentTime = session.logs[index].timestamp;
    }

    return {
      ...this.getSessionInfo(sessionId),
      currentLog: session.logs[session.currentIndex]
    };
  }

  getNextEvents(sessionId, count = 10) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const startIndex = session.currentIndex;
    const endIndex = Math.min(startIndex + count, session.logs.length);
    const events = session.logs.slice(startIndex, endIndex);

    return {
      events,
      startIndex,
      endIndex,
      hasMore: endIndex < session.logs.length,
      isComplete: endIndex === session.logs.length
    };
  }

  getTimelineIntervals(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    return session.timeline.intervals;
  }

  getLogByIndex(sessionId, index) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    if (index < 0 || index >= session.logs.length) {
      return { error: 'Index out of bounds' };
    }

    return session.logs[index];
  }

  getLogsInRange(sessionId, startIndex, endIndex) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    return session.logs.slice(startIndex, endIndex);
  }

  getAllSessions() {
    const sessions = [];
    this.sessions.forEach((session, id) => {
      sessions.push({
        id,
        createdAt: session.createdAt,
        status: session.status,
        currentIndex: session.currentIndex,
        totalLogs: session.statistics.totalLogs,
        config: {
          traceId: session.config.traceId,
          service: session.config.service,
          replaySpeed: session.config.replaySpeed
        }
      });
    });
    return sessions;
  }

  closeSession(sessionId) {
    this.sessions.delete(sessionId);
    return { success: true, sessionId };
  }

  getCallChain(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const logs = session.logs;
    const callChain = [];
    const spanMap = new Map();

    const spans = logs.filter(log => log.spanId);
    
    spans.forEach(span => {
      spanMap.set(span.spanId, {
        ...span,
        children: []
      });
    });

    spans.forEach(span => {
      if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
        spanMap.get(span.parentSpanId).children.push(spanMap.get(span.spanId));
      } else if (!span.parentSpanId) {
        callChain.push(spanMap.get(span.spanId));
      }
    });

    if (callChain.length === 0 && spans.length > 0) {
      callChain.push(...spans);
    }

    return {
      callChain,
      totalSpans: spans.length,
      depth: this.calculateCallChainDepth(callChain)
    };
  }

  calculateCallChainDepth(nodes, currentDepth = 0) {
    if (!nodes || nodes.length === 0) return currentDepth;
    
    let maxDepth = currentDepth;
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        const childDepth = this.calculateCallChainDepth(node.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    
    return maxDepth;
  }

  getReplayFrame(sessionId, frameTime) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const logs = session.logs;
    const frameLogs = logs.filter(log => log.timestamp <= frameTime);

    return {
      frameTime,
      logs: frameLogs,
      logCount: frameLogs.length,
      isComplete: frameLogs.length === logs.length,
      progress: frameLogs.length / logs.length
    };
  }
}

const logReplayManager = new LogReplayManager();

module.exports = {
  LogReplayManager,
  logReplayManager
};
