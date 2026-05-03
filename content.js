(function() {
  'use strict';
  
  const performanceData = {
    longTasks: [],
    paintMetrics: [],
    memoryMetrics: [],
    frameTimings: []
  };
  
  let observerLongTasks = null;
  let observerPaint = null;
  let observerLayout = null;
  let memoryInterval = null;
  let frameInterval = null;
  let lastFrameTime = performance.now();
  let frameCount = 0;
  
  function init() {
    initLongTaskObserver();
    initPaintObserver();
    initLayoutObserver();
    startMemoryMonitoring();
    startFrameMonitoring();
    
    window.addEventListener('message', handleMessage);
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getPerformanceData') {
        sendResponse({ success: true, data: performanceData });
      } else if (request.action === 'clearPerformanceData') {
        clearPerformanceData();
        sendResponse({ success: true });
      }
      return true;
    });
  }
  
  function initLongTaskObserver() {
    if (window.PerformanceObserver) {
      try {
        observerLongTasks = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
              performanceData.longTasks.push({
                startTime: entry.startTime,
                duration: entry.duration,
                name: entry.name,
                entryType: entry.entryType,
                timestamp: Date.now()
              });
            }
          });
        });
        
        observerLongTasks.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task observer not supported:', e);
      }
    }
  }
  
  function initPaintObserver() {
    if (window.PerformanceObserver) {
      try {
        observerPaint = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            performanceData.paintMetrics.push({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
              timestamp: Date.now()
            });
          });
        });
        
        observerPaint.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.log('Paint observer not supported:', e);
      }
    }
  }
  
  function initLayoutObserver() {
    if (window.PerformanceObserver) {
      try {
        observerLayout = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 10) {
              performanceData.paintMetrics.push({
                name: 'layout-shift',
                startTime: entry.startTime,
                duration: entry.duration,
                value: entry.value,
                hadRecentInput: entry.hadRecentInput,
                lastInputTime: entry.lastInputTime,
                timestamp: Date.now()
              });
            }
          });
        });
        
        observerLayout.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('Layout shift observer not supported:', e);
      }
    }
  }
  
  function startMemoryMonitoring() {
    if (performance.memory) {
      memoryInterval = setInterval(() => {
        const memory = performance.memory;
        performanceData.memoryMetrics.push({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 1000);
    }
  }
  
  function startFrameMonitoring() {
    function checkFrame() {
      const currentTime = performance.now();
      const elapsed = currentTime - lastFrameTime;
      frameCount++;
      
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        performanceData.frameTimings.push({
          fps: fps,
          timestamp: Date.now()
        });
        
        frameCount = 0;
        lastFrameTime = currentTime;
      }
      
      requestAnimationFrame(checkFrame);
    }
    
    requestAnimationFrame(checkFrame);
  }
  
  function clearPerformanceData() {
    performanceData.longTasks = [];
    performanceData.paintMetrics = [];
    performanceData.memoryMetrics = [];
    performanceData.frameTimings = [];
  }
  
  function handleMessage(event) {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'PERFORMANCE_DATA_REQUEST') {
      window.postMessage({
        type: 'PERFORMANCE_DATA_RESPONSE',
        data: performanceData
      }, '*');
    }
  }
  
  init();
})();
