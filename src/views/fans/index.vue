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
      <el-select
        v-model="listQuery.sex"
        clearable
        placeholder="性别"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in sexOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-date-picker
        v-model="listQuery.subscribe_time"
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
      <el-table-column label="头像" width="" align="center">
        <template slot-scope="{row}">
          <el-image
            style="width: 100px; height: 100px"
            :src="row.headimgurl"
            fit="fill"
          />
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sex | sexNameFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="城市" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.country }}|{{ row.province }}|{{ row.city }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关注时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.subscribe_time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tagid_list == '[]' ? '暂未设置标签' : row.tagid_list }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark == '' ? '暂未设置备注' : row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="small" type="success" @click="handleUpdate(row)">
            修改备注
          </el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchFans, updateFansRemark } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { fetchOfficialList } from '@/api/official-balance'

export default {
  name: 'MonthStatList',
  components: { Pagination },
  directives: { waves },
  filters: {
    sexNameFilter(status) {
      const officialTypeMap = {
        0: '未知',
        1: '男',
        2: '女'
      }
      return officialTypeMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      restaurants: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      listQuery: {
        page: 1,
        limit: 20,
        subscribe_time: undefined,
        official_account_id: undefined,
        sex: undefined,
        sort: '+id'
      },
      sexOptions: [{ label: '未知', key: 0 }, { label: '男', key: 1 }, { label: '女', key: 2 }],
      rules: {
        remark: [{ required: true, message: '备注必填', trigger: 'change' }]
      },
      temp: {
        official_account_id: undefined,
        openid: undefined,
        remark: undefined
      },
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
      fetchFans(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateFansRemark(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
