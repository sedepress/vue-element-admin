<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.type"
        clearable
        style="width: 140px"
        placeholder="收入类型"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in typeOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.amount_type" clearable class="filter-item" placeholder="金额类型" @change="handleFilter">
        <el-option-group
          v-for="group in costOrIncomeOptions"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-option-group>
      </el-select>
      <el-date-picker
        v-model="listQuery.happened_at"
        type="daterange"
        value-format="timestamp"
        class="filter-item"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
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
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_account.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收支类型" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.type | typeFilter">
            {{ row.type | typeNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.amount / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额类型" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.amount_type | amountTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.happened_at | parseTime('{y}-{m}-{d}') }}</span>
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
        <el-form-item label="公众号名称">
          <el-select v-model="official" disabled filterable placeholder="请选择公众号">
            <el-option
              v-for="item in restaurants"
              :key="item.id"
              :label="item.official_name"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收支类型" prop="amount_type">
          <el-select v-model="temp.amount_type" placeholder="请选择">
            <el-option-group
              v-for="group in costOrIncomeOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="temp.amount" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" />
        </el-form-item>
        <el-form-item label="发生日期" prop="happened_at">
          <el-date-picker v-model="temp.happened_at" disabled value-format="timestamp" type="date" placeholder="Please pick a date" />
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
import { fetchList, fetchOfficialList, updateOfficialBalanceDetail, deleteOfficialBalanceDetail } from '@/api/official-balance'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'OfficialList',
  components: { Pagination },
  directives: { waves },
  filters: {
    typeFilter(type) {
      const typeMap = {
        1: 'success',
        2: 'danger'
      }
      return typeMap[type]
    },
    typeNameFilter(type) {
      const typeNameMap = {
        1: '收入',
        2: '成本'
      }
      return typeNameMap[type]
    },
    amountTypeFilter(type) {
      const amountTypeMap = {
        1: '加粉成本',
        2: '运营成本',
        3: '其他成本',
        4: '商务收入',
        5: '平台收入',
        6: '其他收入'
      }
      return amountTypeMap[type]
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
        amount_type: undefined,
        type: undefined,
        official_balance_stat_id: undefined,
        happened_at: undefined,
        sort: '-id'
      },
      restaurants: [],
      typeOptions: [{ label: '收入', key: 1 }, { label: '成本', key: 2 }],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        official_account_id: undefined,
        official_account: {
          official_name: ''
        },
        amount_type: undefined,
        type: undefined,
        amount: '',
        remark: '',
        happened_at: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        amount_type: [{ required: true, message: '收支类型必填', trigger: 'change' }],
        amount: [{ required: true, message: '金额必填', trigger: 'change' }],
        happened_at: [{ type: 'date', required: true, message: '发生日期必填', trigger: 'change' }]
      },
      costOrIncomeOptions: [{
        label: '成本',
        options: [{
          value: 1,
          label: '加粉成本'
        }, {
          value: 2,
          label: '运营成本'
        }, {
          value: 3,
          label: '其他成本'
        }]
      }, {
        label: '收入',
        options: [{
          value: 4,
          label: '商务收入'
        }, {
          value: 5,
          label: '平台收入'
        }, {
          value: 6,
          label: '其他收入'
        }]
      }]
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
    this.listQuery.official_balance_stat_id = this.$route.params.official_balance_stat_id
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.happened_at *= 1000
      this.temp.amount /= 100
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
          updateOfficialBalanceDetail(tempData.id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.temp.happened_at /= 1000
            this.temp.amount *= 100
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
      deleteOfficialBalanceDetail(row.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
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
