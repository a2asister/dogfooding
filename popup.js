document.addEventListener('DOMContentLoaded', function() {
  let fpsChart = null;
  let longTasksChart = null;
  let renderingChart = null;
  let memoryChart = null;
  
  initTabs();
  initButtons();
  loadPerformanceData();
  setInterval(loadPerformanceData, 3000);
});

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      resizeCharts();
    });
  });
}

function initButtons() {
  const refreshBtn = document.getElementById('refreshBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  refreshBtn.addEventListener('click', function() {
    loadPerformanceData();
  });
  
  clearBtn.addEventListener('click', function() {
    clearPerformanceData();
  });
}

async function loadPerformanceData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'getTabPerformanceData',
      tabId: tab.id
    });
    
    if (response && response.success && response.data) {
      updateUI(response.data);
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
  }
}

async function clearPerformanceData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'clearTabPerformanceData',
      tabId: tab.id
    });
    
    if (response && response.success) {
      loadPerformanceData();
    }
  } catch (error) {
    console.error('Error clearing performance data:', error);
  }
}

function updateUI(data) {
  updateStats(data);
  
  if (typeof Chart !== 'undefined') {
    updateFpsChart(data.frameTimings);
    updateLongTasksChart(data.longTasks);
    updateRenderingChart(data.paintMetrics);
    updateMemoryChart(data.memoryMetrics);
  }
  
  updateLongTasksTable(data.longTasks);
  updateRenderingTable(data.paintMetrics);
  updateMemoryInfo(data.memoryMetrics);
}

function updateStats(data) {
  const currentFps = document.getElementById('currentFps');
  const longTaskCount = document.getElementById('longTaskCount');
  const memoryUsage = document.getElementById('memoryUsage');
  const paintCount = document.getElementById('paintCount');
  
  if (data.frameTimings && data.frameTimings.length > 0) {
    const lastFps = data.frameTimings[data.frameTimings.length - 1].fps;
    currentFps.textContent = lastFps;
    currentFps.style.color = lastFps >= 60 ? '#10b981' : lastFps >= 30 ? '#f59e0b' : '#ef4444';
  } else {
    currentFps.textContent = '--';
    currentFps.style.color = '#64748b';
  }
  
  longTaskCount.textContent = data.longTasks ? data.longTasks.length : 0;
  
  if (data.memoryMetrics && data.memoryMetrics.length > 0) {
    const lastMemory = data.memoryMetrics[data.memoryMetrics.length - 1];
    memoryUsage.textContent = formatBytes(lastMemory.usedJSHeapSize);
  } else {
    memoryUsage.textContent = '--';
  }
  
  paintCount.textContent = data.paintMetrics ? data.paintMetrics.length : 0;
}

function updateFpsChart(frameTimings) {
  const ctx = document.getElementById('fpsChart').getContext('2d');
  
  if (!frameTimings || frameTimings.length === 0) {
    if (fpsChart) {
      try {
        fpsChart.destroy();
      } catch (e) {
        console.log('Error destroying fpsChart:', e);
      }
      fpsChart = null;
    }
    return;
  }
  
  const labels = frameTimings.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString();
  });
  
  const data = frameTimings.map(item => item.fps);
  
  if (fpsChart && fpsChart.data) {
    try {
      fpsChart.data.labels = labels;
      if (fpsChart.data.datasets && fpsChart.data.datasets[0]) {
        fpsChart.data.datasets[0].data = data;
      }
      if (typeof fpsChart.update === 'function') {
        fpsChart.update();
      }
    } catch (e) {
      console.log('Error updating fpsChart:', e);
    }
  } else {
    fpsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'FPS',
          data: data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'FPS 变化趋势',
            color: '#1e293b',
            font: {
              size: 14,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleFont: {
              size: 12,
              weight: '600'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8
            }
          },
          y: {
            min: 0,
            max: 100,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            },
            ticks: {
              color: '#64748b',
              stepSize: 20
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }
}

function updateLongTasksChart(longTasks) {
  const ctx = document.getElementById('longTasksChart').getContext('2d');
  
  if (!longTasks || longTasks.length === 0) {
    if (longTasksChart) {
      try {
        longTasksChart.destroy();
      } catch (e) {
        console.log('Error destroying longTasksChart:', e);
      }
      longTasksChart = null;
    }
    return;
  }
  
  const labels = longTasks.map((item, index) => {
    const date = new Date(item.timestamp);
    return `任务 ${index + 1} - ${date.toLocaleTimeString()}`;
  });
  
  const data = longTasks.map(item => item.duration);
  
  if (longTasksChart && longTasksChart.data) {
    try {
      longTasksChart.data.labels = labels;
      if (longTasksChart.data.datasets && longTasksChart.data.datasets[0]) {
        longTasksChart.data.datasets[0].data = data;
      }
      if (typeof longTasksChart.update === 'function') {
        longTasksChart.update();
      }
    } catch (e) {
      console.log('Error updating longTasksChart:', e);
    }
  } else {
    longTasksChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '耗时 (ms)',
          data: data,
          backgroundColor: data.map(duration => {
            if (duration > 200) return 'rgba(239, 68, 68, 0.8)';
            if (duration > 100) return 'rgba(245, 158, 11, 0.8)';
            return 'rgba(240, 147, 251, 0.8)';
          }),
          borderColor: data.map(duration => {
            if (duration > 200) return '#ef4444';
            if (duration > 100) return '#f59e0b';
            return '#f093fb';
          }),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '长任务耗时分布',
            color: '#1e293b',
            font: {
              size: 14,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleFont: {
              size: 12,
              weight: '600'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8
            }
          },
          y: {
            min: 0,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            },
            ticks: {
              color: '#64748b'
            }
          }
        }
      }
    });
  }
}

function updateLongTasksTable(longTasks) {
  const tableBody = document.getElementById('longTasksTable');
  
  if (!longTasks || longTasks.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">暂无长任务数据</td></tr>';
    return;
  }
  
  const html = longTasks.map(task => {
    const date = new Date(task.timestamp);
    const timeStr = date.toLocaleTimeString();
    const durationClass = task.duration > 200 ? 'danger' : task.duration > 100 ? 'warning' : 'normal';
    
    return `
      <tr>
        <td>${timeStr}</td>
        <td style="color: ${task.duration > 200 ? '#ef4444' : task.duration > 100 ? '#f59e0b' : '#1e293b'}">${task.duration.toFixed(2)}</td>
        <td>${task.entryType || 'longtask'}</td>
      </tr>
    `;
  }).join('');
  
  tableBody.innerHTML = html;
}

function updateRenderingChart(paintMetrics) {
  const ctx = document.getElementById('renderingChart').getContext('2d');
  
  if (!paintMetrics || paintMetrics.length === 0) {
    if (renderingChart) {
      try {
        renderingChart.destroy();
      } catch (e) {
        console.log('Error destroying renderingChart:', e);
      }
      renderingChart = null;
    }
    return;
  }
  
  const labels = paintMetrics.map((item, index) => {
    const date = new Date(item.timestamp);
    return `${item.name} - ${date.toLocaleTimeString()}`;
  });
  
  const data = paintMetrics.map(item => item.duration);
  
  if (renderingChart && renderingChart.data) {
    try {
      renderingChart.data.labels = labels;
      if (renderingChart.data.datasets && renderingChart.data.datasets[0]) {
        renderingChart.data.datasets[0].data = data;
      }
      if (typeof renderingChart.update === 'function') {
        renderingChart.update();
      }
    } catch (e) {
      console.log('Error updating renderingChart:', e);
    }
  } else {
    renderingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '耗时 (ms)',
          data: data,
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#f093fb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '渲染耗时趋势',
            color: '#1e293b',
            font: {
              size: 14,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleFont: {
              size: 12,
              weight: '600'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8
            }
          },
          y: {
            min: 0,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            },
            ticks: {
              color: '#64748b'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }
}

function updateRenderingTable(paintMetrics) {
  const tableBody = document.getElementById('renderingTable');
  
  if (!paintMetrics || paintMetrics.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">暂无渲染数据</td></tr>';
    return;
  }
  
  const html = paintMetrics.map(metric => {
    const date = new Date(metric.timestamp);
    const timeStr = date.toLocaleTimeString();
    
    return `
      <tr>
        <td>${metric.name}</td>
        <td>${timeStr}</td>
        <td>${metric.duration.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  tableBody.innerHTML = html;
}

function updateMemoryChart(memoryMetrics) {
  const ctx = document.getElementById('memoryChart').getContext('2d');
  
  if (!memoryMetrics || memoryMetrics.length === 0) {
    if (memoryChart) {
      try {
        memoryChart.destroy();
      } catch (e) {
        console.log('Error destroying memoryChart:', e);
      }
      memoryChart = null;
    }
    return;
  }
  
  const labels = memoryMetrics.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString();
  });
  
  const usedData = memoryMetrics.map(item => item.usedJSHeapSize / 1024 / 1024);
  const totalData = memoryMetrics.map(item => item.totalJSHeapSize / 1024 / 1024);
  
  if (memoryChart && memoryChart.data) {
    try {
      memoryChart.data.labels = labels;
      if (memoryChart.data.datasets) {
        if (memoryChart.data.datasets[0]) {
          memoryChart.data.datasets[0].data = usedData;
        }
        if (memoryChart.data.datasets[1]) {
          memoryChart.data.datasets[1].data = totalData;
        }
      }
      if (typeof memoryChart.update === 'function') {
        memoryChart.update();
      }
    } catch (e) {
      console.log('Error updating memoryChart:', e);
    }
  } else {
    memoryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '已用内存 (MB)',
            data: usedData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#667eea'
          },
          {
            label: '总内存 (MB)',
            data: totalData,
            borderColor: '#764ba2',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#764ba2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#64748b',
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: '内存使用趋势',
            color: '#1e293b',
            font: {
              size: 14,
              weight: '600'
            },
            padding: {
              bottom: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleFont: {
              size: 12,
              weight: '600'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8
            }
          },
          y: {
            min: 0,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            },
            ticks: {
              color: '#64748b'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }
}

function updateMemoryInfo(memoryMetrics) {
  const usedMemory = document.getElementById('usedMemory');
  const totalMemory = document.getElementById('totalMemory');
  const limitMemory = document.getElementById('limitMemory');
  
  if (!memoryMetrics || memoryMetrics.length === 0) {
    usedMemory.textContent = '--';
    totalMemory.textContent = '--';
    limitMemory.textContent = '--';
    return;
  }
  
  const lastMemory = memoryMetrics[memoryMetrics.length - 1];
  
  usedMemory.textContent = formatBytes(lastMemory.usedJSHeapSize);
  totalMemory.textContent = formatBytes(lastMemory.totalJSHeapSize);
  limitMemory.textContent = formatBytes(lastMemory.jsHeapSizeLimit);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function resizeCharts() {
  try {
    if (fpsChart && typeof fpsChart.resize === 'function') {
      fpsChart.resize();
    }
  } catch (e) {
    console.log('Error resizing fpsChart:', e);
  }
  
  try {
    if (longTasksChart && typeof longTasksChart.resize === 'function') {
      longTasksChart.resize();
    }
  } catch (e) {
    console.log('Error resizing longTasksChart:', e);
  }
  
  try {
    if (renderingChart && typeof renderingChart.resize === 'function') {
      renderingChart.resize();
    }
  } catch (e) {
    console.log('Error resizing renderingChart:', e);
  }
  
  try {
    if (memoryChart && typeof memoryChart.resize === 'function') {
      memoryChart.resize();
    }
  } catch (e) {
    console.log('Error resizing memoryChart:', e);
  }
}
