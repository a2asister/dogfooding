import { createEffect, onCleanup } from 'solid-js';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController);

const BarChart = ({ data, labels, colors, title, horizontal = false }) => {
  let canvasEl;
  let chartInstance;

  createEffect(() => {
    if (!canvasEl) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const barColors = colors || [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(240, 147, 251, 0.8)',
      'rgba(245, 87, 108, 0.8)',
      'rgba(79, 172, 254, 0.8)',
      'rgba(67, 233, 123, 0.8)'
    ];

    const borderColors = barColors.map(c => c.replace('0.8', '1'));

    const chartData = {
      labels,
      datasets: [{
        label: '数量',
        data,
        backgroundColor: barColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    };

    chartInstance = new Chart(canvasEl, {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `数量: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  });

  onCleanup(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });

  return (
    <div class="chart-wrapper">
      {title && <h3 class="chart-title">{title}</h3>}
      <canvas ref={(el) => (canvasEl = el)} />
    </div>
  );
};

export default BarChart;
