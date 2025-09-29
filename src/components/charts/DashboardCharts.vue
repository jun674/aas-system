<template>
  <div class="charts-container">
    <!-- Category Overview Chart -->
    <div class="chart-card">
      <h3 class="chart-title">
        <i class="fas fa-chart-bar"></i>
        Category Overview
      </h3>
      <div class="chart-wrapper">
        <Bar :data="categoryChartData" :options="barOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Bar } from 'vue-chartjs'

// Register Chart.js components
ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const props = defineProps({
  menuCounts: {
    type: Object,
    default: () => ({})
  }
})

// Category Overview Data (Bar Chart)
const categoryChartData = computed(() => {
  const categories = {
    'Equipment': ['CO2', 'TIG', 'MIG', 'Robot', 'CNC_Milling', 'AMR', 'Boring'],
    'Material': ['Steel', 'Aluminum', 'Copper'],
    'Process': ['Welding', 'Cutting', 'Assembly'],
    'Operation': ['Operation'],
    'Quality': ['Quality'],
    'Production': ['Production']
  }

  const categoryTotals = Object.entries(categories).map(([, types]) => {
    return types.reduce((sum, type) => sum + (props.menuCounts[type] || 0), 0)
  })

  return {
    labels: Object.keys(categories),
    datasets: [{
      label: 'Total Items',
      data: categoryTotals,
      backgroundColor: [
        '#667eea',
        '#48bb78',
        '#f6ad55',
        '#3498db',
        '#e74c3c',
        '#9b59b6'
      ],
      borderRadius: 8
    }]
  }
})

// Chart Options
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return `Count: ${context.parsed.y}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 50
      }
    }
  }
}

</script>

<style scoped>
.charts-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 800px;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.chart-title {
  margin: 0 0 20px 0;
  font-size: 1.1em;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-title i {
  color: #667eea;
  font-size: 0.9em;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .charts-container {
    padding: 0 20px;
  }

  .chart-wrapper {
    height: 250px;
  }
}
</style>
