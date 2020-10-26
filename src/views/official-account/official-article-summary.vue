<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.official_account_id" multiple collapse-tags clearable class="filter-item" filterable placeholder="请选择公众号" @change="handleFilter">
        <el-option
          v-for="item in restaurants"
          :key="item.id"
          :label="item.official_name"
          :value="item.id"
        />
      </el-select>
      <el-input
        v-model="listQuery.operator_name"
        placeholder="运营者"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.position" placeholder="文章位置" style="width: 120px" clearable class="filter-item" @change="handleFilter">
        <el-option v-for="item in positionOptions" :key="item" :label="item" :value="item" />
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
        <template v-if="row.official_account" slot-scope="{row}">
          <span>{{ row.official_account.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发文时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ref_date | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运营者" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_account.operator_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文章位置" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.position }}</span>
        </template>
      </el-table-column>
      <el-table-column label="送达人数" width="" align="center" prop="target_user" sortable="custom" :class-name="getSortClass('target_user')">
        <template slot-scope="{row}">
          <span>{{ row.target_user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读数" width="" align="center" prop="int_page_read_count" sortable="custom" :class-name="getSortClass('int_page_read_count')">
        <template slot-scope="{row}">
          <span>{{ row.int_page_read_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原文阅读数" width="" align="center" prop="ori_page_read_count" sortable="custom" :class-name="getSortClass('ori_page_read_count')">
        <template slot-scope="{row}">
          <span>{{ row.ori_page_read_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分享次数" width="" align="center" prop="share_count" sortable="custom" :class-name="getSortClass('share_count')">
        <template slot-scope="{row}">
          <span>{{ row.share_count }}</span>
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
import { exportArticleSummary, fetchArticleSummary, fetchOfficialList } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'

export default {
  name: 'ArticleSummary',
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
        position: undefined,
        operator_name: undefined,
        sort: '-id'
      },
      positionOptions: [1, 2, 3],
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
  created() {
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchArticleSummary(this.listQuery).then(response => {
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
      if (prop === 'target_user') {
        this.sortByTargetUser(order)
      } else if (prop === 'int_page_read_count') {
        this.sortByIntPageReadCount(order)
      } else if (prop === 'ori_page_read_count') {
        this.sortByOriPageReadCount(order)
      } else if (prop === 'share_count') {
        this.sortByShareCount(order)
      }
    },
    sortByTargetUser(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+target_user'
      } else {
        this.listQuery.sort = '-target_user'
      }
      this.handleFilter()
    },
    sortByIntPageReadCount(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+int_page_read_count'
      } else {
        this.listQuery.sort = '-int_page_read_count'
      }
      this.handleFilter()
    },
    sortByOriPageReadCount(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+ori_page_read_count'
      } else {
        this.listQuery.sort = '-ori_page_read_count'
      }
      this.handleFilter()
    },
    sortByShareCount(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+share_count'
      } else {
        this.listQuery.sort = '-share_count'
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
      exportArticleSummary(this.listQuery).then(response => {
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['公众号名称', '标题', '发文时间', '文章位置', '送达人数', '阅读数', '原文阅读数', '分享次数']
          const filterVal = ['official_name', 'title', 'ref_date', 'position', 'target_user', 'int_page_read_count', 'ori_page_read_count', 'share_count']
          const data = this.formatJson(response.data, filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '阅读每日统计'
          })
          this.downloadLoading = false
        })
      }).catch(err => {
        console.log(err)
      })
    },
    formatJson(data, filterVal) {
      return data.map(v => filterVal.map(j => {
        if (j === 'ref_date') {
          return parseTime(v[j], '{y}-{m}-{d}')
        } else if (j === 'official_name') {
          return v['official_account']['official_name']
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
