<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container" label-width="120px" style="width: 1200px;">
      <div class="createPost-main-container">
        <el-form-item prop="task_name" label="任务名称" style="width: 500px;">
          <el-input v-model="postForm.task_name" />
        </el-form-item>
        <el-form-item label="群发对象">
          <el-select v-model="postForm.object_send" placeholder="请选择群发对象">
            <el-option v-for="item in objectSendOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="postForm.object_send == 2" prop="openid" label="openid">
          <el-input v-model="postForm.openid" style="width: 500px;" />
        </el-form-item>
        <el-form-item label="选择模板">
          <el-select v-model="postForm.template.templateId" placeholder="请选择模板" @change="handleTemp">
            <el-option v-for="(item,index) in postForm.template.templateNames" :key="index" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-for="(item,index) in postForm.template.templateContents" :key="index" :label="item.type">
          <el-input v-model="item.value" style="width: 500px;" />
          <el-color-picker v-model="item.color" style="position: absolute;margin-left: 10px;" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="postForm.external_link" style="width: 500px;" />
        </el-form-item>
        <el-form-item label="发送时间">
          <el-radio-group v-model="postForm.is_timing">
            <el-radio :label="false">立即发送</el-radio>
            <el-radio :label="true">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="postForm.is_timing" prop="started_at" label="定时发送时间" class="postInfo-container-item">
          <el-date-picker v-model="displayTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Select date and time" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即创建</el-button>
          <el-button type="success" @click="previewMessage">预览</el-button>
        </el-form-item>
      </div>
    </el-form>
    <div class="message-pre">
      <div class="message-content" v-html="postForm.template.templatePre" />
    </div>
  </div>
</template>

<script>
import { createTemp, fetchTemp, fetchTempDetail } from '@/api/template-message'

export default {
  name: 'TempDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateTiming = (rule, value, callback) => {
      if (this.postForm.is_timing) {
        if (value === undefined) {
          this.$message({
            message: '定时任务时间为必填项',
            type: 'error'
          })
          callback(new Error(rule.field + '为必传项'))
        } else if (value < new Date()) {
          this.$message({
            message: '不能设置过去的时间',
            type: 'error'
          })
          callback(new Error(rule.field + '填写错误'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateOpenid = (rule, value, callback) => {
      if (this.postForm.object_send === 2) {
        if (value === undefined) {
          this.$message({
            message: rule.field + '为必传项',
            type: 'error'
          })
          callback(new Error(rule.field + '为必传项'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      postForm: {
        task_name: '',
        external_link: '',
        openid: undefined,
        is_timing: false,
        started_at: undefined,
        object_send: undefined,
        title: '',
        appid: '',
        template: {
          templateId: '',
          templateContents: [],
          templateNames: [],
          templateExample: '',
          templatePre: ''
        }
      },
      objectSendOptions: [{ label: '全部用户', key: 1 }, { label: '单个openid', key: 2 }],
      loading: false,
      rules: {
        task_name: [{ validator: validateRequire }],
        started_at: [{ validator: validateTiming }],
        openid: [{ validator: validateOpenid }]
      },
      tempRoute: {}
    }
  },
  computed: {
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.started_at))
      },
      set(val) {
        this.postForm.started_at = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm.appid = this.$route.params.appid
      this.fetchData(this.$route.params.appid)
    }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(appid) {
      console.log(111)
      fetchTemp(appid).then(response => {
        this.postForm.template = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    handleTemp() {
      fetchTempDetail({ 'appid': this.postForm.appid, 'templateId': this.postForm.template.templateId }).then(response => {
        this.postForm.template = response.data
      }).catch(err => {
        console.log(err)
      })
    },
    submitForm() {
      this.postForm.title = this.calendarTitleValue(this.postForm.template.templateId)
      this.previewMessage()
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          createTemp(this.postForm).then(response => {
            this.$notify({
              title: 'Success',
              message: '模板消息设置成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            console.log(err)
          })
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    calendarTitleValue(templateId) {
      const calendar = this.postForm.template.templateNames.reduce((acc, cur) => {
        acc[cur.id] = cur.name
        return acc
      }, {})
      return calendar[templateId]
    },
    previewMessage() {
      const reg = /\{\{(.*?)\.DATA\}\}/
      this.postForm.template.templatePre = this.postForm.template.templateExample
      this.postForm.template.templateContents.reduce((acc, cur) => {
        const ret = reg.exec(this.postForm.template.templatePre)
        const str = '<span style=color:' + cur.color + '>' + cur.value + '\n</span>'
        this.postForm.template.templatePre = this.postForm.template.templatePre.replace(ret[0], str)
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea /deep/ {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}

.message-pre {
  width: 250px;
  height: 520px;
  position: absolute;
  top: 50px;
  right: 400px;
  background: url("../../../assets/images/message-pre.jpg") 0 0 no-repeat;
  background-size: 100%;

  .message-content {
    position: relative;
    left: 24px;
    top: 115px;
    line-height: 1.5;
    background-color: #fff;
    width: 200px;
    padding: 10px;
    border-radius: 3px;
    font-size: 12px;
  }
}
</style>
