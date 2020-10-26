<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.stat_month"
        class="filter-item"
        type="monthrange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
        :picker-options="pickerOptions"
        value-format="timestamp"
        @change="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      :summary-method="getSummaries"
      show-summary
      highlight-current-row
      style="width: 100%;"
      :cell-style="columnStyle"
    >
      <el-table-column label="时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.stat_month | parseTime('{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="加粉成本" width="" align="center" prop="fans_cost" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('fans_cost')">
        <template slot-scope="{row}">
          <span>{{ row.fans_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运营成本" width="" align="center" prop="operating_cost" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('operating_cost')">
        <template slot-scope="{row}">
          <span>{{ row.operating_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其他成本" width="" align="center" prop="other_cost" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('other_cost')">
        <template slot-scope="{row}">
          <span>{{ row.other_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成本合计" width="" align="center" prop="total_cost" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('total_cost')">
        <template slot-scope="{row}">
          <span>{{ row.total_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商务收入" width="" align="center" prop="business_income" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('business_income')">
        <template slot-scope="{row}">
          <span>{{ row.business_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台收入" width="" align="center" prop="platform_income" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('platform_income')">
        <template slot-scope="{row}">
          <span>{{ row.platform_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其他收入" width="" align="center" prop="other_income" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('other_income')">
        <template slot-scope="{row}">
          <span>{{ row.other_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入合计" align="center" prop="total_income" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('total_income')">
        <template slot-scope="{row}">
          <span>{{ row.total_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="月毛利" width="" align="center" prop="profit" :sort-method="(a,b)=>{return a.profit - b.profit}" sortable :class-name="getSortClass('profit')">
        <template slot-scope="{row}">
          <span>{{ row.profit / 100 }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchSummaryList } from '@/api/official-balance'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'MonthStatList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        stat_month: undefined,
        sort: undefined
      },
      restaurants: [],
      pickerOptions: {
        shortcuts: [{
          text: '本月',
          onClick(picker) {
            picker.$emit('pick', [new Date(), new Date()])
          }
        }, {
          text: '今年至今',
          onClick(picker) {
            const end = new Date()
            const start = new Date(new Date().getFullYear(), 0)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近六个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 6)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    columnStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 8) {
        return 'background-color: #00FF00;'
      } else if (columnIndex === 4) {
        return 'background-color: #FF6347;'
      } else if (columnIndex === 9) {
        if (row.profit > 0) {
          return 'background-color: #00FF00;'
        } else if (row.profit < 0) {
          return 'background-color: #FF6347;'
        }
      }
    },
    getList() {
      this.listLoading = true
      fetchSummaryList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'fans_cost') {
        this.sortByFansCost(order)
      } else if (prop === 'operating_cost') {
        this.sortByOperatingCost(order)
      } else if (prop === 'other_cost') {
        this.sortByOtherCost(order)
      } else if (prop === 'total_cost') {
        this.sortByTotalCost(order)
      } else if (prop === 'business_income') {
        this.sortByBusinessIncome(order)
      } else if (prop === 'platform_income') {
        this.sortByPlatformIncome(order)
      } else if (prop === 'other_income') {
        this.sortByOtherIncome(order)
      } else if (prop === 'total_income') {
        this.sortByTotalIncome(order)
      } else if (prop === 'profit') {
        this.sortByProfit(order)
      }
    },
    sortByFansCost(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+fans_cost'
      } else {
        this.listQuery.sort = '-fans_cost'
      }
      this.handleFilter()
    },
    sortByOperatingCost(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+operating_cost'
      } else {
        this.listQuery.sort = '-operating_cost'
      }
      this.handleFilter()
    },
    sortByOtherCost(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+other_cost'
      } else {
        this.listQuery.sort = '-other_cost'
      }
      this.handleFilter()
    },
    sortByTotalCost(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+total_cost'
      } else {
        this.listQuery.sort = '-total_cost'
      }
      this.handleFilter()
    },
    sortByBusinessIncome(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+business_income'
      } else {
        this.listQuery.sort = '-business_income'
      }
      this.handleFilter()
    },
    sortByPlatformIncome(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+platform_income'
      } else {
        this.listQuery.sort = '-platform_income'
      }
      this.handleFilter()
    },
    sortByOtherIncome(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+other_income'
      } else {
        this.listQuery.sort = '-other_income'
      }
      this.handleFilter()
    },
    sortByTotalIncome(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+total_income'
      } else {
        this.listQuery.sort = '-total_income'
      }
      this.handleFilter()
    },
    sortByProfit(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+profit'
      } else {
        this.listQuery.sort = '-profit'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      let ret = ''
      if (sort === `+${key}`) {
        ret = 'ascending'
      } else if (sort === `-${key}`) {
        ret = 'descending'
      }
      return ret
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }

        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index] = sums[index] / 100 + ' 元'
        } else {
          sums[index] = ''
        }
      })

      return sums
    }
  }
}
</script>
