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
        v-model="listQuery.content"
        placeholder="广告名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.position"
        clearable
        style="width: 140px"
        placeholder="文章位置"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in positionOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
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
    >
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_account_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.scheduling_date | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="广告内容" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文章位置" class-name="status-col">
        <template slot-scope="{row}">
          <el-tag :type="row.position | positionFilter">
            {{ row.position | positionNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
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
        <el-form-item label="日期">
          <el-date-picker v-model="temp.scheduling_date" disabled type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="广告内容" prop="content">
          <el-input v-model="temp.content" />
        </el-form-item>
        <el-form-item label="文章位置" prop="position">
          <el-select v-model="temp.position" class="filter-item" placeholder="请选择">
            <el-option v-for="item in positionOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
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
import { fetchOfficialList } from '@/api/official-balance'
import { deleteAdSchedulingDetail, fetchAdDetail, updateAdSchedulingDetail } from '@/api/other'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'AdSchedulingDetail',
  components: { Pagination },
  directives: { waves },
  filters: {
    positionFilter(type) {
      const positionMap = {
        1: 'success',
        2: 'danger',
        3: 'primary'
      }
      return positionMap[type]
    },
    positionNameFilter(type) {
      const positionNameMap = {
        1: '头条',
        2: '次条',
        3: '八条'
      }
      return positionNameMap[type]
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
        limit: 100,
        official_account: undefined,
        position: undefined,
        content: undefined,
        date: undefined
      },
      restaurants: [],
      positionOptions: [{ label: '头条', key: 1 }, { label: '次条', key: 2 }, { label: '八条', key: 3 }],
      temp: {
        id: undefined,
        official_account_id: undefined,
        scheduling_date: new Date(),
        content: '',
        position: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        official_account_id: [{ required: true, message: '公众号必填', trigger: 'change' }],
        content: [{ required: true, message: '广告内容必填', trigger: 'change' }],
        position: [{ required: true, message: '文章位置必填', trigger: 'change' }]
      }
    }
  },
  created() {
    this.listQuery.date = this.$route.query.date
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchAdDetail(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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
          updateAdSchedulingDetail(tempData.id, tempData).then(() => {
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
    },
    handleDelete(row, index) {
      deleteAdSchedulingDetail(row.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    loadAllOfficial() {
      fetchOfficialList().then(response => {
        this.restaurants = response.data
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
