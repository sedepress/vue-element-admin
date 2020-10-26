<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.belong_to"
        clearable
        style="width: 140px"
        placeholder="帐号类型"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in belongToOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select
        v-model="listQuery.official_type"
        clearable
        style="width: 140px"
        placeholder="公众号类型"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in officialTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select
        v-model="listQuery.is_authorize"
        clearable
        style="width: 140px"
        placeholder="是否授权"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in isAuthorizeOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-input
        v-model="listQuery.official_name"
        placeholder="公众号名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.category"
        placeholder="分类名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.company_name"
        placeholder="公司主体"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.operator_name"
        placeholder="运营者"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.wechat_admin_name"
        placeholder="管理员"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.owner"
        placeholder="归属者"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <router-link :to="'/official-account/create'">
        <el-button
          class="filter-item"
          style="margin-left: 10px;"
          type="primary"
          icon="el-icon-edit"
        >
          添加
        </el-button>
      </router-link>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-star-off"
        @click="handleAuthorize"
      >
        授权
      </el-button>
      <el-select
        v-model="browserPlugin"
        clearable
        style="width: 160px"
        placeholder="下载浏览器插件"
        class="filter-item"
        @change="handleDownloadBrowser"
      >
        <el-option v-for="item in browserPluginOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
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
      <el-table-column label="分类名称" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公司主体" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.company_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号归属" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.belong_to | belongToFilter">
            {{ row.belong_to | belongToNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="归属者" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.owner }}</span>
        </template>
      </el-table-column>
      <el-table-column label="微信号" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.official_account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运营者" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.operator_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="管理员" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.wechat_admin_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="粉丝数" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.count_user }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号类型" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.official_type | officialTypeFilter">
            {{ row.official_type | officialTypeNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="认证时间" width="" align="center">
        <template slot-scope="{row}">
          <span>{{ row.verified_at | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否授权" class-name="status-col" width="">
        <template slot-scope="{row}">
          <el-tag :type="row.is_authorize | authorizeTypeFilter">
            {{ row.is_authorize | authorizeTypeNameFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <router-link :to="'/official-account/send_template/'+row.appid">
            <el-button type="success" size="mini">
              模板
            </el-button>
          </router-link>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
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
        <el-form-item label="公众号名称" prop="official_name">
          <el-input v-model="temp.official_name" />
        </el-form-item>
        <el-form-item label="分类名称" prop="category">
          <el-input v-model="temp.category" />
        </el-form-item>
        <el-form-item label="公司主体" prop="company_name">
          <el-input v-model="temp.company_name" />
        </el-form-item>
        <el-form-item label="微信号" prop="official_account">
          <el-input v-model="temp.official_account" />
        </el-form-item>
        <el-form-item label="归属者名称" prop="owner">
          <el-input v-model="temp.owner" />
        </el-form-item>
        <el-form-item label="帐号类型" prop="belong_to">
          <el-select v-model="temp.belong_to" class="filter-item" placeholder="请选择">
            <el-option v-for="item in belongToOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="运营者" prop="operator_name">
          <el-input v-model="temp.operator_name" />
        </el-form-item>
        <el-form-item label="管理员" prop="wechat_admin_name">
          <el-input v-model="temp.wechat_admin_name" />
        </el-form-item>
        <el-form-item label="公众号类型" prop="official_type">
          <el-select v-model="temp.official_type" class="filter-item" placeholder="请选择">
            <el-option v-for="item in officialTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="公众号appid" prop="appid">
          <el-input v-model="temp.appid" />
        </el-form-item>
        <el-form-item label="公众号gh_id" prop="gh_id">
          <el-input v-model="temp.gh_id" />
        </el-form-item>
        <el-form-item label="认证日期" prop="verified_at">
          <el-date-picker v-model="temp.verified_at" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="微信后台账号" prop="wechat_account">
          <el-input v-model="temp.wechat_account" />
        </el-form-item>
        <el-form-item label="微信后台密码" prop="wechat_pwd">
          <el-input v-model="temp.wechat_pwd" />
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

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateOfficial, fetchAuthorize, deleteOfficial } from '@/api/official'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'OfficialList',
  components: { Pagination },
  directives: { waves },
  filters: {
    belongToFilter(status) {
      const belongToMap = {
        1: 'success',
        2: 'danger'
      }
      return belongToMap[status]
    },
    officialTypeFilter(status) {
      const officialTypeMap = {
        1: 'success',
        2: 'danger'
      }
      return officialTypeMap[status]
    },
    belongToNameFilter(status) {
      const belongToMap = {
        1: '自营',
        2: '其他'
      }
      return belongToMap[status]
    },
    officialTypeNameFilter(status) {
      const officialTypeMap = {
        0: '未知',
        1: '订阅号',
        2: '服务号'
      }
      return officialTypeMap[status]
    },
    authorizeTypeFilter(status) {
      const authorizeTypeMap = {
        0: 'danger',
        1: 'success'
      }
      return authorizeTypeMap[status]
    },
    authorizeTypeNameFilter(status) {
      const authorizeNameTypeMap = {
        0: '否',
        1: '是'
      }
      return authorizeNameTypeMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      browserPlugin: undefined,
      listQuery: {
        page: 1,
        limit: 20,
        belong_to: undefined,
        office_name: undefined,
        company_name: undefined,
        operator_name: undefined,
        wechat_admin_name: undefined,
        owner: undefined,
        category: undefined,
        official_type: undefined,
        auth_code: undefined,
        is_authorize: undefined,
        sort: '-id'
      },
      belongToOptions: [{ label: '自营', key: 1 }, { label: '其他', key: 2 }],
      officialTypeOptions: [{ label: '未知', key: 0 }, { label: '订阅号', key: 1 }, { label: '服务号', key: 2 }],
      browserPluginOptions: [{ label: '360极速浏览器', key: 'yunyue_helper_360cse.crx' }, { label: '360浏览器', key: 'yunyue_helper_360se.crx' }, { label: 'QQ浏览器', key: 'yunyue_helper_qq.crx' }, { label: '搜狗浏览器', key: 'yunyue_helper_sogou.crx' }],
      isAuthorizeOptions: [{ label: '否', key: 0 }, { label: '是', key: 1 }],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        category: undefined,
        owner: undefined,
        belong_to: undefined,
        operator_name: undefined,
        wechat_admin_name: undefined,
        verified_at: new Date(),
        wechat_account: undefined,
        wechat_pwd: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        official_name: [{ required: true, message: '公众号名称必填', trigger: 'change' }],
        category: [{ required: true, message: '分类名称必填', trigger: 'change' }],
        company_name: [{ required: true, message: '公司主体必填', trigger: 'change' }],
        official_account: [{ required: true, message: '微信号必填', trigger: 'change' }],
        owner: [{ required: true, message: '归属者名称必填', trigger: 'change' }],
        operator_name: [{ required: true, message: '运营者必填', trigger: 'change' }],
        belong_to: [{ required: true, message: '账号类型必填', trigger: 'change' }],
        wechat_admin_name: [{ required: true, message: '管理员必填', trigger: 'change' }],
        official_type: [{ required: true, message: '公众号类型必填', trigger: 'change' }],
        appid: [{ required: true, message: 'Appid必填', trigger: 'change' }],
        gh_id: [{ required: true, message: 'gh_id必填', trigger: 'change' }],
        wechat_account: [{ required: true, message: '微信后台帐号必填', trigger: 'change' }],
        wechat_pwd: [{ required: true, message: '微信后台密码必填', trigger: 'change' }],
        verified_at: [{ type: 'date', required: true, message: '认证时间必填', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.auth_code = this.$route.query.auth_code
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
      if (this.temp.verified_at === 0) {
        this.temp.verified_at = new Date()
      } else {
        this.temp.verified_at = new Date(parseTime(this.temp.verified_at, '{y}-{m}-{d}'))
      }
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
          tempData.verified_at = +new Date(tempData.verified_at) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateOfficial(tempData.id, tempData).then(() => {
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
      deleteOfficial(row.id).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
    },
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleAuthorize: function() {
      fetchAuthorize().then(response => {
        window.location.href = response.data[0]
      }).catch(err => {
        console.log(err)
      })
    },
    handleDownloadBrowser: function() {
      window.location.href = process.env.VUE_APP_BASE_API + `/download/crx/${this.browserPlugin}`
    }
  }
}
</script>
