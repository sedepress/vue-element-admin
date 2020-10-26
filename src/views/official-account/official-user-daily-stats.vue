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
      <el-date-picker
        v-model="listQuery.ref_date"
        class="filter-item"
        type="daterange"
        align="right"
        unlink-panels
        value-format="timestamp"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      show-summary
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ref_date | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="新关注人数" width="" align="center" prop="new_user" sortable="custom" :class-name="getSortClass('new_user')">
        <template slot-scope="{row}">
          <span>{{ row.new_user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="取消关注人数" width="" align="center" prop="cancel_user" sortable="custom" :class-name="getSortClass('cancel_user')">
        <template slot-scope="{row}">
          <span>{{ row.cancel_user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="净增关注人数" width="" align="center" prop="net_increase_user" sortable="custom" :class-name="getSortClass('net_increase_user')">
        <template slot-scope="{row}">
          <span>{{ row.net_increase_user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="累计关注人数" width="" align="center" prop="cumulate_user" sortable="custom" :class-name="getSortClass('cumulate_user')">
        <template slot-scope="{row}">
          <span>{{ row.cumulate_user }}</span>
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
import { fetchStat, fetchOfficialList, exportFansData } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'

export default {
  name: 'OfficialList',
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
        official_account_id: undefined,
        ref_date: undefined,
        sort: '-id'
      },
      restaurants: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      downloadLoading: false
    }
  },
  computed: {
    official: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return this.temp.official_account.official_name
      },
      set(val) {
        this.temp.official_account_id = val.id
        this.temp.official_account.official_name = val.official_name
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
      fetchStat(this.listQuery).then(response => {
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
      if (prop === 'cumulate_user') {
        this.sortByCumulateUser(order)
      } else if (prop === 'new_user') {
        this.sortByNewUser(order)
      } else if (prop === 'cancel_user') {
        this.sortByCancelUser(order)
      } else if (prop === 'net_increase_user') {
        this.sortByNetIncreaseUser(order)
      }
    },
    sortByCumulateUser(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+cumulate_user'
      } else {
        this.listQuery.sort = '-cumulate_user'
      }
      this.handleFilter()
    },
    sortByNewUser(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+new_user'
      } else {
        this.listQuery.sort = '-new_user'
      }
      this.handleFilter()
    },
    sortByCancelUser(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+cancel_user'
      } else {
        this.listQuery.sort = '-cancel_user'
      }
      this.handleFilter()
    },
    sortByNetIncreaseUser(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+net_increase_user'
      } else {
        this.listQuery.sort = '-net_increase_user'
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
    loadAllOfficial() {
      fetchOfficialList().then(response => {
        this.restaurants = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    handleDownload() {
      this.downloadLoading = true
      exportFansData(this.listQuery).then(response => {
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['序号', '公众号名称', '日期', '新增关注人数', '取消关注人数', '净增关注人数', '累计关注人数']
          const filterVal = ['id', 'official_name', 'ref_date', 'new_user', 'cancel_user', 'net_increase_user', 'cumulate_user']
          const data = this.formatJson(response.data, filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '粉丝每日统计'
          })
          this.downloadLoading = false
        })
      }).catch(err => {
        console.log(err)
      })
    },
    formatJson(xlsx_data, filterVal) {
      return xlsx_data.map(v => filterVal.map(j => {
        if (j === 'ref_date') {
          return parseTime(v[j], '{y}-{m}-{d}')
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
