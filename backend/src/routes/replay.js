const Router = require('koa-router');
const { logReplayManager } = require('../utils/logReplay');
const { timeSeriesStore } = require('../utils/timeSeriesStore');

const router = new Router();

router.post('/session/create', async (ctx) => {
  const {
    traceId,
    startTime,
    endTime,
    service,
    level,
    replaySpeed,
    autoPlay
  } = ctx.request.body;

  const session = logReplayManager.createSession({
    traceId,
    startTime: startTime ? parseInt(startTime) : null,
    endTime: endTime ? parseInt(endTime) : null,
    service,
    level,
    replaySpeed,
    autoPlay
  });

  ctx.body = {
    success: true,
    data: session
  };
});

router.get('/session/:sessionId', async (ctx) => {
  const { sessionId } = ctx.params;
  const session = logReplayManager.getSessionInfo(sessionId);

  if (!session) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: 'Session not found'
    };
    return;
  }

  ctx.body = {
    success: true,
    data: session
  };
});

router.post('/session/:sessionId/play', async (ctx) => {
  const { sessionId } = ctx.params;
  const result = logReplayManager.startPlay(sessionId);

  if (result.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: result.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.post('/session/:sessionId/pause', async (ctx) => {
  const { sessionId } = ctx.params;
  const result = logReplayManager.pausePlay(sessionId);

  if (result.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: result.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.post('/session/:sessionId/stop', async (ctx) => {
  const { sessionId } = ctx.params;
  const result = logReplayManager.stopPlay(sessionId);

  if (result.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: result.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.post('/session/:sessionId/seek', async (ctx) => {
  const { sessionId } = ctx.params;
  const { index, timestamp } = ctx.request.body;

  let result;
  if (timestamp !== undefined) {
    result = logReplayManager.seekToTime(sessionId, parseInt(timestamp));
  } else if (index !== undefined) {
    result = logReplayManager.seekTo(sessionId, parseInt(index));
  } else {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: 'Must provide index or timestamp'
    };
    return;
  }

  if (result.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: result.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.get('/session/:sessionId/events', async (ctx) => {
  const { sessionId } = ctx.params;
  const { count = 10 } = ctx.query;

  const result = logReplayManager.getNextEvents(sessionId, parseInt(count));

  if (result.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: result.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.get('/session/:sessionId/timeline', async (ctx) => {
  const { sessionId } = ctx.params;
  const intervals = logReplayManager.getTimelineIntervals(sessionId);

  if (intervals.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: intervals.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: intervals
  };
});

router.get('/session/:sessionId/logs/:index', async (ctx) => {
  const { sessionId, index } = ctx.params;
  const log = logReplayManager.getLogByIndex(sessionId, parseInt(index));

  if (log.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: log.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: log
  };
});

router.get('/session/:sessionId/callchain', async (ctx) => {
  const { sessionId } = ctx.params;
  const callChain = logReplayManager.getCallChain(sessionId);

  if (callChain.error) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: callChain.error
    };
    return;
  }

  ctx.body = {
    success: true,
    data: callChain
  };
});

router.delete('/session/:sessionId', async (ctx) => {
  const { sessionId } = ctx.params;
  const result = logReplayManager.closeSession(sessionId);

  ctx.body = {
    success: true,
    data: result
  };
});

router.get('/sessions', async (ctx) => {
  const sessions = logReplayManager.getAllSessions();
  ctx.body = {
    success: true,
    data: sessions
  };
});

router.get('/timeseries/stats', async (ctx) => {
  const stats = timeSeriesStore.getStats();
  ctx.body = {
    success: true,
    data: stats
  };
});

router.get('/timeseries/aggregation', async (ctx) => {
  const { type, key, startTime, endTime, aggType = 'hourly' } = ctx.query;

  let result;
  if (startTime && endTime) {
    result = timeSeriesStore.getTimeRangeAggregation(
      parseInt(startTime),
      parseInt(endTime),
      aggType
    );
  } else if (type && key) {
    result = timeSeriesStore.getAggregation(type, key);
  } else {
    result = timeSeriesStore.getAggregation('all');
  }

  ctx.body = {
    success: true,
    data: result
  };
});

router.get('/timeseries/trend', async (ctx) => {
  const { startTime, endTime, interval = 'hour' } = ctx.query;

  const now = Date.now();
  const defaultStartTime = now - 24 * 60 * 60 * 1000;

  const result = timeSeriesStore.getTrendData(
    startTime ? parseInt(startTime) : defaultStartTime,
    endTime ? parseInt(endTime) : now,
    interval
  );

  ctx.body = {
    success: true,
    data: result
  };
});

router.post('/timeseries/query', async (ctx) => {
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
  } = ctx.request.body;

  const result = timeSeriesStore.query({
    startTime: startTime ? parseInt(startTime) : null,
    endTime: endTime ? parseInt(endTime) : null,
    service,
    level,
    type,
    traceId,
    keyword,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  ctx.body = {
    success: true,
    data: result
  };
});

router.post('/timeseries/compact', async (ctx) => {
  timeSeriesStore.compact();
  ctx.body = {
    success: true,
    message: 'Time series compaction started'
  };
});

router.post('/timeseries/clear-cache', async (ctx) => {
  timeSeriesStore.clearCache();
  ctx.body = {
    success: true,
    message: 'Cache cleared'
  };
});

module.exports = router;
