<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.official_name"
        placeholder="公众号名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.is_migrate"
        clearable
        placeholder="是否迁移"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select
        v-model="listQuery.is_permanent_ban"
        clearable
        placeholder="是否永封"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select
        v-model="listQuery.unblock_date"
        clearable
        placeholder="违规期公众号"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        违规记录
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
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号类型" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.official_type | officialTypeFilter">
            {{ row.official_type | officialTypeNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="解封日期" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.unblock_date | unblockDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成本" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="回收" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="回本率" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.payback_rate }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="是否迁移" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.is_migrate | migrateFilter">
            {{ row.is_migrate | migrateNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否永封" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.is_permanent_ban | permanentFilter">
            {{ row.is_permanent_ban | permanentNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.is_migrate!=1" size="mini" type="danger" @click="handleModifyMigrate(row,1)">
            迁移
          </el-button>
          <el-button v-else size="mini" type="success" @click="handleModifyMigrate(row,0)">
            移回
          </el-button>
          <el-button v-if="row.is_permanent_ban!=1" size="mini" type="danger" @click="handleModifyBan(row,1)">
            永封
          </el-button>
          <el-button v-else size="mini" type="success" @click="handleModifyBan(row,0)">
            解封
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="公众号名称" prop="official_account_id">
          <el-select v-model="temp.official_account_id" filterable placeholder="请选择公众号">
            <el-option
              v-for="item in restaurants"
              :key="item.id"
              :label="item.official_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="违规标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="违规广告类型" prop="category">
          <el-input v-model="temp.category" />
        </el-form-item>
        <el-form-item label="违规截止日期" prop="unblock_date">
          <el-date-picker
            v-model="temp.unblock_date"
            type="datetime"
            value-format="timestamp"
            placeholder="选择日期时间"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchOfficialOperationList, updateStatus } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { fetchOfficialList } from '@/api/official-balance'
import { parseTime } from '@/utils'
import { createVioRecord } from '@/api/violation-record'

export default {
  name: 'MonthStatList',
  components: { Pagination },
  directives: { waves },
  filters: {
    officialTypeFilter(status) {
      const officialTypeMap = {
        1: 'success',
        2: 'danger'
      }
      return officialTypeMap[status]
    },
    officialTypeNameFilter(status) {
      const officialTypeMap = {
        0: '未知',
        1: '订阅号',
        2: '服务号'
      }
      return officialTypeMap[status]
    },
    migrateFilter(status) {
      const migrateMap = {
        0: 'success',
        1: 'danger'
      }
      return migrateMap[status]
    },
    migrateNameFilter(status) {
      const migrateNameMap = {
        0: '否',
        1: '是'
      }
      return migrateNameMap[status]
    },
    permanentFilter(status) {
      const permanentMap = {
        0: 'success',
        1: 'danger'
      }
      return permanentMap[status]
    },
    permanentNameFilter(status) {
      const permanentNameMap = {
        0: '否',
        1: '是'
      }
      return permanentNameMap[status]
    },
    unblockDateFilter(date) {
      if (date === 0) {
        return '无违规'
      } else {
        return parseTime(date)
      }
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        is_migrate: undefined,
        is_permanent_ban: undefined,
        official_name: undefined,
        unblock_date: undefined,
        sort: '-id'
      },
      restaurants: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      temp: {
        official_account_id: undefined,
        unblock_date: undefined,
        title: '',
        category: '',
        remark: ''
      },
      statusOptions: [{ label: '否', key: 0 }, { label: '是', key: 1 }],
      rules: {
        official_account_id: [{ required: true, message: '公众号名称必填', trigger: 'change' }],
        unblock_date: [{ required: true, message: '违规截止日期必填', trigger: 'change' }],
        title: [{ required: true, message: '标题必填', trigger: 'change' }],
        category: [{ required: true, message: '违规广告类型必填', trigger: 'change' }]
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
    loadAllOfficial() {
      fetchOfficialList().then(response => {
        this.restaurants = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchOfficialOperationList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        official_account_id: undefined,
        unblock_date: undefined,
        title: '',
        category: '',
        remark: ''
      }
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createVioRecord(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleModifyMigrate(row, status) {
      updateStatus(row.id, { 'is_migrate': status }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.is_migrate = status
      })
    },
    handleModifyBan(row, status) {
      updateStatus(row.id, { 'is_permanent_ban': status }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.is_permanent_ban = status
      })
    }
  }
}
</script>
