<template>
  <div class="ad">
    <div class="filter-container">
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
    <el-calendar>
      <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
      <template
        slot="dateCell"
        slot-scope="{date, data}"
      >
        <div @click="detail(data.day)">
          {{ data.day.split('-').slice(-1).join('-').replace(/\b(0+)/gi, '') }} <span v-for="(day, index) in dealMyDate(data.day)" :key="index"><br> <span style="font-size: 14px;color: red;">{{ day }}</span></span>
        </div>
      </template>
    </el-calendar>

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
import { createAdSche, fetchMonthAd } from '@/api/other'

export default {
  name: 'AdScheduling',
  data() {
    return {
      listLoading: false,
      calendarData: [],
      restaurants: [],
      positionOptions: [{ label: '头条', key: 1 }, { label: '次条', key: 2 }, { label: '八条', key: 3 }],
      temp: {
        scheduling_date: undefined,
        groups: [{
          content: '',
          official_ids: [],
          position: undefined
        }]
      },
      listQuery: {
        month: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      gridData: []
    }
  },
  created() {
    this.$nextTick(() => {
      // 点击前一个月
      const prevBtn = document.querySelector(
        '.el-calendar__button-group .el-button-group>button:nth-child(1)'
      )
      prevBtn.addEventListener('click', e => {
        const cal = document.querySelector('.el-calendar .el-calendar__header .el-calendar__title')
        this.listQuery.month = cal.innerHTML.replace(/^\s+|\s+$/g, '')
        this.getList()
      })

      // 点击下一个月
      const nextBtn = document.querySelector(
        '.el-calendar__button-group .el-button-group>button:nth-child(3)'
      )
      nextBtn.addEventListener('click', () => {
        const cal = document.querySelector('.el-calendar .el-calendar__header .el-calendar__title')
        this.listQuery.month = cal.innerHTML.replace(/^\s+|\s+$/g, '')
        this.getList()
      })
    })
    this.getList()
  },
  mounted() {
    this.loadAllOfficial()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchMonthAd(this.listQuery).then(response => {
        this.calendarData = response.data
        this.listLoading = false
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          createAdSche(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
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
    loadAllOfficial() {
      fetchOfficialList().then(response => {
        this.restaurants = response.data
      }).catch(err => {
        console.log(err)
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
    dealMyDate(v) {
      const len = this.calendarData.length
      let res = ''
      for (let i = 0; i < len; i++) {
        if (this.calendarData[i].scheduling_date === v) {
          res = this.calendarData[i].ads
          break
        }
      }
      return res
    },
    detail(date) {
      this.$router.push({ path: '/official-account/detail', query: { date }})
    }
  }
}
</script>

<style scoped>
.ad {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}
</style>
