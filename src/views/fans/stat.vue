<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.official_account_id" clearable class="filter-item" filterable placeholder="请选择公众号" @change="handleFilter">
        <el-option
          v-for="item in restaurants"
          :key="item.id"
          :label="item.official_name"
          :value="item.id"
        />
      </el-select>
    </div>

    <div class="dashboard-editor-container">
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart :pie-chat-data="pieChatData" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { fetchFansSexStat } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import PieChart from './components/PieChart'
import { fetchOfficialList } from '@/api/official-balance'

export default {
  name: 'Stat',
  components: { PieChart },
  directives: { waves },
  data() {
    return {
      listLoading: true,
      restaurants: [],
      pieChatData: [],
      listQuery: {
        official_account_id: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchFansSexStat(this.listQuery).then(response => {
        this.pieChatData = response.data
        this.listLoading = false
      })
    },
    loadAllOfficial() {
      fetchOfficialList().then(response => {
        this.restaurants = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    handleFilter() {
      this.getList()
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
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
