<template>
  <div class="app-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-question">
            <i class="el-icon-question" style="font-size: 48px;" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              我的待发
            </div>
            <count-to :start-val="0" :end-val="panelGroup.count_pending" :duration="2600" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-loading">
            <i class="el-icon-loading" style="font-size: 48px;" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              本周任务平均处理时间（秒）
            </div>
            <count-to :start-val="0" :end-val="panelGroup.avg_processing_time" :duration="3000" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-circle-check">
            <i class="el-icon-circle-check" style="font-size: 48px;" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              本周完成任务数
            </div>
            <count-to :start-val="0" :end-val="panelGroup.count_week_complete" :duration="3200" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="filter-container">
      <el-select
        v-model="listQuery.status"
        style="width: 140px"
        placeholder="状态"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-input
        v-model="listQuery.title"
        placeholder="标题"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
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
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送日期" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.started_at | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.user_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.started_at | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总发送人数" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.count_send }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="发送成功人数" width="" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.count_send_success }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.status === 2" type="primary" size="mini" @click="handleUpdateStatus(row)">
            取消
          </el-button>
          <!--                <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">-->
          <!--                  复制-->
          <!--                </el-button>-->
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
import { fetchList, updateStatus } from '@/api/template-message'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination/index' // secondary package based on el-pagination
import CountTo from 'vue-count-to'

export default {
  name: 'TemplateMessageList',
  components: { Pagination, CountTo },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'primary',
        1: 'success',
        2: 'danger',
        3: 'primary'
      }
      return statusMap[status]
    },
    statusNameFilter(status) {
      const statusMap = {
        0: '已取消',
        1: '进行中',
        2: '等待中',
        3: '已完成'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      panelGroup: {
        count_pending: 0,
        avg_processing_time: 0,
        count_week_complete: 0
      },
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        title: undefined,
        sort: '-id'
      },
      statusOptions: [{ label: '已取消', key: '0' }, { label: '进行中', key: '1' }, { label: '等待中', key: '2' }, { label: '已完成', key: '3' }],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.panelGroup = response.data.panel_group
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleUpdateStatus(row) {
      updateStatus(row.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '取消成功',
          type: 'success',
          duration: 2000
        })
        row.status = 0
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .panel-group {
    margin: 18px auto 0 auto;

    .card-panel-col {
      margin-bottom: 32px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-question {
          background: #f4516c;
        }

        .icon-loading {
          background: #36a3f7;
        }

        .icon-circle-check {
          background: #40c9c6;
        }

        .icon-shopping {
          background: #34bfa3
        }
      }

      .icon-question {
        color: #f4516c;
      }

      .icon-loading {
        color: #36a3f7;
      }

      .icon-circle-check {
        color: #40c9c6;
      }

      .icon-shopping {
        color: #34bfa3
      }

      .card-panel-icon-wrapper {
        float: left;
        margin: 14px 0 0 14px;
        padding: 16px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 48px;
      }

      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0px;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }

  @media (max-width:550px) {
    .card-panel-description {
      display: none;
    }

    .card-panel-icon-wrapper {
      float: none !important;
      width: 100%;
      height: 100%;
      margin: 0 !important;

      .svg-icon {
        display: block;
        margin: 14px auto !important;
        float: none !important;
      }
    }
  }
</style>
