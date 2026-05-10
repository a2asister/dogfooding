import { createEffect, onCleanup } from 'solid-js';
import { Chart, ArcElement, Tooltip, Legend, PieController, DoughnutController } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, PieController, DoughnutController);

const PieChart = ({ data, labels, colors, title, type = 'doughnut' }) => {
  let canvasEl;
  let chartInstance;

  createEffect(() => {
    if (!canvasEl) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const chartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe',
          '#00f2fe',
          '#43e97b',
          '#fa709a'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    chartInstance = new Chart(canvasEl, {
      type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
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

export default PieChart;
