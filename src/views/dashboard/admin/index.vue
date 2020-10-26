<template>
  <div class="dashboard-editor-container">

    <panel-group :count-total="countTotal" @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <div class="chart-container">
      <chart :mix-chart-data="mixChartData" height="100%" width="100%" />
    </div>
  </div>
</template>

<script>
import { getIndex } from '@/api/index'

import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import Chart from './components/MixChart'

export default {
  name: 'DashboardAdmin',
  components: {
    Chart,
    PanelGroup,
    LineChart
  },
  data() {
    return {
      statData: [],
      lineChartData: [],
      countTotal: {},
      mixChartData: {}
    }
  },
  created() {
    this.getData()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = this.statData[type]
    },
    getData() {
      getIndex().then(response => {
        this.statData = response.data.lineChart
        this.lineChartData = response.data.lineChart.newFans
        this.countTotal = response.data.total
        this.mixChartData = response.data.mixChartData
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .chart-container{
    position: relative;
    width: 100%;
    height: calc(100vh - 84px);
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
