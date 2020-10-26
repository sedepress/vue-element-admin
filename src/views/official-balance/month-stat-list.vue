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
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
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
      @sort-change="sortChange"
    >
      <el-table-column label="公众号名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.stat_month | parseTime('{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="加粉成本" width="" align="center" prop="fans_cost" sortable="custom" :class-name="getSortClass('fans_cost')">
        <template slot-scope="{row}">
          <span>{{ row.fans_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运营成本" width="" align="center" prop="operating_cost" sortable="custom" :class-name="getSortClass('operating_cost')">
        <template slot-scope="{row}">
          <span>{{ row.operating_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其他成本" width="" align="center" prop="other_cost" sortable="custom" :class-name="getSortClass('other_cost')">
        <template slot-scope="{row}">
          <span>{{ row.other_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成本合计" width="" align="center" prop="total_cost" sortable="custom" :class-name="getSortClass('total_cost')">
        <template slot-scope="{row}">
          <span>{{ row.total_cost / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商务收入" width="" align="center" prop="business_income" sortable="custom" :class-name="getSortClass('business_income')">
        <template slot-scope="{row}">
          <span>{{ row.business_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台收入" width="" align="center" prop="platform_income" sortable="custom" :class-name="getSortClass('platform_income')">
        <template slot-scope="{row}">
          <span>{{ row.platform_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="其他收入" width="" align="center" prop="other_income" sortable="custom" :class-name="getSortClass('other_income')">
        <template slot-scope="{row}">
          <span>{{ row.other_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入合计" width="" align="center" prop="total_income" sortable="custom" :class-name="getSortClass('total_income')">
        <template slot-scope="{row}">
          <span>{{ row.total_income / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <router-link :to="'/official-balance/detail/'+row.id">
            <el-button type="success" size="small">
              收支明细
            </el-button>
          </router-link>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="公众号名称" prop="official_account_id">
          <el-select v-model="official" filterable placeholder="请选择公众号">
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
          <el-date-picker v-model="temp.happened_at" value-format="timestamp" type="date" placeholder="Please pick a date" />
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
import { createOfficialBalanceDetail, fetchMonthStatList, fetchOfficialList } from '@/api/official-balance'
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
        official_account_id: undefined,
        stat_month: undefined,
        sort: '-id'
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
      }],
      temp: {
        id: undefined,
        official_account_id: undefined,
        official_account: {
          official_name: ''
        },
        amount_type: undefined,
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
        official_account_id: [{ required: true, message: '公众号名称必填', trigger: 'change' }],
        amount_type: [{ required: true, message: '收支类型必填', trigger: 'change' }],
        amount: [{ required: true, message: '金额必填', trigger: 'change' }],
        happened_at: [{ type: 'date', required: true, message: '发生日期必填', trigger: 'change' }]
      }
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
      fetchMonthStatList(this.listQuery).then(response => {
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
    resetTemp() {
      this.temp = {
        id: undefined,
        official_account_id: undefined,
        official_account: {
          official_name: ''
        },
        amount_type: undefined,
        amount: '',
        remark: '',
        happened_at: undefined
      }
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
          createOfficialBalanceDetail(this.temp).then(() => {
            this.getList()
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
