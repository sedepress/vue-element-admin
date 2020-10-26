<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container" label-width="120px" style="width: 1200px;">
      <div class="createPost-main-container">
        <el-form-item label="公众号名称" prop="official_name">
          <el-input v-model="postForm.official_name" />
        </el-form-item>
        <el-form-item label="分类名称" prop="category">
          <el-input v-model="postForm.category" />
        </el-form-item>
        <el-form-item label="公司主体" prop="company_name">
          <el-input v-model="postForm.company_name" />
        </el-form-item>
        <el-form-item label="微信号" prop="official_account">
          <el-input v-model="postForm.official_account" />
        </el-form-item>
        <el-form-item label="归属者名称" prop="owner">
          <el-input v-model="postForm.owner" />
        </el-form-item>
        <el-form-item label="帐号类型" prop="belong_to">
          <el-select v-model="postForm.belong_to" placeholder="请选择群发对象">
            <el-option v-for="item in belongToOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="运营者" prop="operator_name">
          <el-input v-model="postForm.operator_name" />
        </el-form-item>
        <el-form-item label="管理员" prop="wechat_admin_name">
          <el-input v-model="postForm.wechat_admin_name" />
        </el-form-item>
        <el-form-item label="公众号类型" prop="official_type">
          <el-select v-model="postForm.official_type" placeholder="请选择群发对象">
            <el-option v-for="item in officialTypeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="公众号appid" prop="appid">
          <el-input v-model="postForm.appid" />
        </el-form-item>
        <el-form-item label="公众号gh_id" prop="gh_id">
          <el-input v-model="postForm.gh_id" />
        </el-form-item>
        <el-form-item label="认证日期" class="postInfo-container-item" prop="verified_at">
          <el-date-picker v-model="displayTime" type="date" format="yyyy-MM-dd" placeholder="Select date and time" />
        </el-form-item>
        <el-form-item label="微信后台账号" prop="wechat_account">
          <el-input v-model="postForm.wechat_account" />
        </el-form-item>
        <el-form-item label="微信后台密码" prop="wechat_pwd">
          <el-input v-model="postForm.wechat_pwd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即创建</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { createOfficial } from '@/api/official'

export default {
  name: 'OfficialDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      postForm: {
        category: undefined,
        company_name: undefined,
        owner: undefined,
        belong_to: undefined,
        official_account: undefined,
        official_name: undefined,
        operator_name: undefined,
        wechat_admin_name: undefined,
        official_type: undefined,
        appid: undefined,
        gh_id: undefined,
        verified_at: new Date(),
        wechat_account: undefined,
        wechat_pwd: undefined
      },
      belongToOptions: [{ label: '自营', key: 1 }, { label: '其他', key: 2 }],
      officialTypeOptions: [{ label: '未知', key: 0 }, { label: '订阅号', key: 1 }, { label: '服务号', key: 2 }],
      loading: false,
      tempRoute: {},
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
      }
    }
  },
  computed: {
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.verified_at))
      },
      set(val) {
        this.postForm.verified_at = new Date(val)
      }
    }
  },
  created() {
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    submitForm() {
      this.loading = true
      this.postForm.verified_at = +new Date(this.postForm.verified_at)
      this.$refs['postForm'].validate((valid) => {
        if (valid) {
          createOfficial(this.postForm).then(response => {
            this.$notify({
              title: 'Success',
              message: '公众号添加成功',
              type: 'success',
              duration: 2000
            })
          }).catch(err => {
            console.log(err)
          })
          this.loading = false
        }
      })
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
</style>
