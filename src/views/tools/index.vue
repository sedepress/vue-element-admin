<template>
  <div class="app-container">
    <el-upload
      ref="upload"
      class="upload-demo"
      drag
      action="http://yyadmin.test/tools"
      list-type="picture-card"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      :auto-upload="false"
      :http-request="uploadFile"
      multiple
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <el-select
      v-model="speed"
      clearable
      placeholder="图片切换速度"
      class="filter-item"
    >
      <el-option v-for="item in speedOptions" :key="item.key" :label="item.label" :value="item.key" />
    </el-select>
    <el-button style="margin-top: 30px;" size="small" type="success" @click="submitUpload">生成动图</el-button>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { createGif } from '@/api/other'

export default {
  name: 'GifCreator',
  directives: { waves },
  data() {
    return {
      speed: undefined,
      fileData: '',
      fileList: [],
      speedOptions: [{ label: '正常', key: 1 }, { label: '快', key: 2 }, { label: '慢', key: 3 }, { label: '很慢', key: 4 }]
    }
  },
  methods: {
    uploadFile(file) {
      this.fileData.append('files[]', file.file)
    },

    // 上传到服务器
    submitUpload() {
      if (this.fileList.length === 0) {
        this.$message({
          message: '请先选择文件',
          type: 'warning'
        })
      } else {
        const isLt100M = this.fileList.every(file => file.size / 1024 / 1024 < 1)
        if (!isLt100M) {
          this.$message.error('请检查，上传文件大小不能超过1MB!')
        } else {
          this.fileData = new FormData()
          this.$refs.upload.submit()
          createGif(this.fileData, this.speed).then((response) => {
            open(response.data.url)
          })
        }
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      const existFile = fileList.slice(0, fileList.length - 1).find(f => f.name === file.name)
      if (existFile) {
        this.$message.error('当前文件已经存在!')
        fileList.pop()
      }
      this.fileList = fileList
    }
  }
}
</script>
