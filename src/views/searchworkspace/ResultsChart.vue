<template>
  <div class="chart-wrapper">
    <div class="chart-options"></div>
    <canvas id="results-chart" ref="resultsChart"></canvas>
  </div>
</template>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 200px;
}

.chart-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.chart-option {
  width: 100%;
}
</style>

<script>
export default {
  name: "ResultsChart",
  props: {
    datasets: {
      type: Array,
      default: () => [],
    },
    labels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart_type: "bar",
      chart_options: {
        bar: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  unit: "day",
                  displayFormats: {
                    day: "MMM D",
                  },
                },
                gridLines: {
                  display: true,
                },
                ticks: {
                  display: true,
                  autoSkip: true,
                },
              },
            ],
            yAxes: [
              {
                beginAtZero: true,
                gridLines: {
                  display: true,
                },
                ticks: {
                  display: true,
                  autoSkip: true,
                  maxTicksLimit: 5,
                },
              },
            ],
          },
        },
        line: {},
        pie: {},
      },
      group_by: null,
    };
  },
  created() {},
  computed: {
    chart_datasets() {
      return this.datasets;
    },
    chart_labels() {
      return this.labels;
    },
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    getChartOptions(chart_type) {
      return this.chart_options[chart_type];
    },
    renderChart() {
      const ctx = document.getElementById("results-chart");

      new Chart(ctx, {
        type: this.chart_type,
        data: {
          labels: this.chart_labels,
          datasets: this.chart_datasets,
        },
        options: this.getChartOptions(this.chart_type),
      });
    },
  },
  watch: {
    /* Deep watch the datasets and labels so that we can re-render the chart
    when they change. */
    datasets: {
      handler: function (val, oldVal) {
        this.renderChart();
      },
      deep: true,
    },
    labels: {
      handler: function (val, oldVal) {
        this.renderChart();
      },
      deep: true,
    },
  },
};
</script>
