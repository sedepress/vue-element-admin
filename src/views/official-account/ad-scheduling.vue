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
      <el-date-picker
        v-model="listQuery.month"
        type="month"
        placeholder="选择月份"
        class="filter-item"
        @change="handleMonthFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加
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
      @cell-click="editItem"
    >
      <el-table-column label="公众号名称" width="200px" fixed align="center">
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
      <el-table-column
        v-for="(item, index) in tableColumns"
        :key="index"
        :label="item"
        width="150px"
        align="center"
        :filters="[{ text: '有排期', value: true }, { text: '无排期', value: false }]"
        :filter-method="filterSche"
      >
        <template slot-scope="{row}">
          <span>{{ row[item] }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dynamicValidateForm" :model="temp" label-width="100px" class="demo-dynamic" style="width: 600px;">
        <el-form-item
          label="广告日期"
          prop="scheduling_date"
          :rules="{
            required: true, message: '广告日期不能为空', trigger: 'change'
          }"
        >
          <el-date-picker v-model="temp.scheduling_date" value-format="timestamp" type="date" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item
          v-for="(group, index) in temp.groups"
          :key="group.key"
          :label="'公众号分组' + (index + 1)"
        >
          <el-form-item
            :prop="'groups.' + index + '.official_ids'"
            :rules="{
              required: true, message: '公众号不能为空', trigger: 'change'
            }"
          >
            <el-select v-model="group.official_ids" multiple collapse-tags filterable placeholder="请选择公众号" style="width: 250px;">
              <el-option
                v-for="item in restaurants"
                :key="item.id"
                :label="item.official_name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :prop="'groups.' + index + '.content'"
            :rules="{
              required: true, message: '广告名称不能为空', trigger: 'change'
            }"
          >
            <el-input v-model="group.content" style="width: 300px;margin: 20px 20px 20px 0;" placeholder="广告名称" />
          </el-form-item>
          <el-form-item
            :prop="'groups.' + index + '.position'"
            :rules="{
              required: true, message: '文章位置不能为空', trigger: 'change'
            }"
          >
            <el-select
              v-model="group.position"
              clearable
              style="width: 200px"
              placeholder="文章位置"
            >
              <el-option v-for="item in positionOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-button @click.prevent="removeDomain(group)">删除</el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dynamicValidateForm')">提交</el-button>
          <el-button @click="addDomain">新增分组</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { fetchOfficialList } from '@/api/official-balance'
import { createAdSche, deleteAdSchedulingDetail, fetchMonthAd, updateAdSchedulingDetail, deleteAd } from '@/api/other'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

export default {
  name: 'AdSchedulingDetail',
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
        3: '三条',
        4: '四条',
        5: '五条',
        6: '六条',
        7: '七条',
        8: '八条'
      }
      return positionNameMap[type]
    },
    officialTypeNameFilter(status) {
      const officialTypeMap = {
        0: '未知',
        1: '订阅号',
        2: '服务号'
      }
      return officialTypeMap[status]
    },
    officialTypeFilter(status) {
      const officialTypeMap = {
        1: 'success',
        2: 'danger'
      }
      return officialTypeMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      tableColumns: [],
      listQuery: {
        official_account: undefined,
        position: undefined,
        content: undefined,
        month: undefined,
        official_type: undefined
      },
      restaurants: [],
      officialTypeOptions: [{ label: '未知', key: 0 }, { label: '订阅号', key: 1 }, { label: '服务号', key: 2 }],
      positionOptions: [{ label: '头条', key: 1 }, { label: '次条', key: 2 }, { label: '三条', key: 3 }, { label: '四条', key: 4 }, { label: '五条', key: 5 }, { label: '六条', key: 6 }, { label: '七条', key: 7 }, { label: '八条', key: 8 }],
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
    this.createColumns(new Date())
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    createColumns(d) {
      const date = d
      const year = date.getFullYear()
      const month = date.getMonth()
      const days = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= days; i++) {
        const day = new Date(year, month, i)
        this.tableColumns.push(parseTime(day, '{y}-{m}-{d}'))
      }
    },
    getList() {
      this.listLoading = true
      fetchMonthAd(this.listQuery).then(response => {
        this.list = response.data
        // this.total = response.data.total
        this.listLoading = false
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          createAdSche(this.temp).then(response => {
            if (response.data.hasOwnProperty('msg')) {
              this.$notify.error({
                title: '错误',
                message: response.data.msg
              })
            } else {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    removeDomain(item) {
      var index = this.temp.groups.indexOf(item)
      if (index !== -1) {
        this.temp.groups.splice(index, 1)
      }
    },
    addDomain() {
      this.temp.groups.push({
        content: '',
        official_ids: [],
        position: undefined,
        key: Date.now()
      })
    },
    resetTemp() {
      this.temp = {
        scheduling_date: undefined,
        groups: [{
          content: '',
          official_ids: [],
          position: undefined
        }]
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dynamicValidateForm'].clearValidate()
      })
    },
    handleMonthFilter() {
      this.tableColumns = []
      this.createColumns(new Date(this.listQuery.month))
      this.listQuery.page = 1
      this.getList()
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
    },
    editItem(row, column, cell, event) {
      if (column.label !== '公众号名称' && column.label !== '账号类型' && row[column.label] !== undefined) {
        this.$confirm('此操作将永久删除该公众号该日的排期, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAd({ official_name: row.official_name, scheduling_date: column.label }).then(response => {
            this.getList()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }).catch(err => {
            console.log(err)
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    filterSche(value, row, column) {
      if (value) {
        return row.hasOwnProperty(column.label)
      }
      return !row.hasOwnProperty(column.label)
    }
  }
}
</script>
