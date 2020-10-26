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
        v-model="listQuery.title"
        placeholder="标题"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.category"
        placeholder="违规广告类型"
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
    >
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="违规标题" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="违规广告类型" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="违规解封日期" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.unblock_date | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
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
import { fetchOfficialList } from '@/api/official-balance'
import { deleteVioRecord, fetchVio, updateVioRecord } from '@/api/violation-record'
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
        limit: 20,
        official_account: undefined,
        position: undefined,
        content: undefined
      },
      restaurants: [],
      positionOptions: [{ label: '头条', key: 1 }, { label: '次条', key: 2 }, { label: '八条', key: 3 }],
      temp: {
        id: undefined,
        official_account_id: undefined,
        unblock_date: undefined,
        title: '',
        category: '',
        remark: ''
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
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchVio(this.listQuery).then(response => {
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
      this.temp.unblock_date *= 1000
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.unblock_date /= 1000
          const tempData = Object.assign({}, this.temp)
          updateVioRecord(tempData.id, tempData).then(() => {
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
      deleteVioRecord(row.id).then(() => {
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
