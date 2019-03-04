<template>
  <Row>
    <Form v-if="!error" :model="category" :rules="categoryRules" 
      label-position="left"
      :label-width="100">
      <Form-item label="分类名称" prop="categoryName"
        data-describe="分类分类最大长度为20">
        <Input placeholder="请输入分类名称"
          v-model="category.categoryName"
          :maxlength="20"
          @on-change="handleCategoryNameChange"></Input>
      </Form-item>
      <!-- <Form-item label="是否开启" prop="isEnable">
        <RadioGroup v-model="category.isEnable">
          <Radio :label="0">是</Radio>
          <Radio :label="1">否</Radio>
        </RadioGroup>
      </Form-item> -->
      <Form-item label="是否推荐" prop="isRecommend" v-if="category.level === '3'">
        <RadioGroup v-model="category.isRecommend">
          <Radio :label="0">是</Radio>
          <Radio :label="1">否</Radio>
        </RadioGroup>
      </Form-item>
      <Form-item label="分类封面" prop="coverImage">
        <FileUploader 
          v-if="uuid"
          :immediate="true"
          :ent-id="uuid"
          type-key="categorycover"
          accept="image/*"
          :multiple="false"
          @on-change="handleCategoryCoverChange">
        </FileUploader>
      </Form-item>
      <Form-item label="分类描述">
        <Input type="textarea" placeholder="分类描述，最大长度为100"
          v-model="category.descript"
          :maxlength="100"></Input>
      </Form-item>
      <Form-item>
        <Alert type="error" show-icon v-if="errorMsg">{{ errorMsg }}</Alert>
        <Row>
          <Button type="primary" @click="submit">保存</Button>
          <Button @click="back">取消</Button>
        </Row>
      </Form-item>
    </Form>
    <error-view v-if="error" :error="error" :loading="errorLoading" @action="init"></error-view>
  </Row>
</template>

<script>
import FileUploader from '@/components/common/FileUploader'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))
const defaultCategory = {
  categoryName: null,
  isEnable: 0,
  isRecommend: 1,
  coverImage: null,  
  descript: null,
  parentId: null,
  status: 0,
  level: '1'
}

export default {
  components: { FileUploader },
  data () {
    return {
      error: null,
      errorLoading: false,
      category: jsonCopy(defaultCategory),
      categoryRules: {
        categoryName: [
          { required: true } 
        ]
      },
      uuid: null,
      errorMsg: null
    }
  },
  props: {
    parentId: [String, Object],
    id: [String, Object]
  },
  methods: {
    handleCategoryNameChange (value) {
      this.errorMsg = null
    },
    handleCategoryCoverChange (event) {
      let imgUrl = event.list
      if (imgUrl && imgUrl.startsWith('http')) {
        this.category.coverImage = imgUrl;
      } else {
        this.category.coverImage = null;
      }
    },
    init () {
      this.uuid = this.$uuid()

      let promise
      if (this.id) {
        promise = this.$http.get(`/market/goods/category/${this.id}`, true)
      } else if (this.parentId) {
        promise = this.$http.get(`/market/goods/category/${this.parentId}`, true)
      } else {
        promise = Promise.resolve(null)
      }

      if (this.error) this.errorLoading = true

      promise.then(res => {
        let breadcrumbList = []
        let parent = res
        let suffix
        if (this.id && res) {
          /* 通过id查找到分类 */
          this.category = res
          this.uuid = res.id
          suffix = '编辑'
          this.$emit('on-parentchange', res.parentId ? res.parentId : undefined, true)
        } else if (this.parentId && res) {
          /* 通过parentId查找到父级分类 */
          suffix = '新增'
          this.category.parentId = res.id
          this.category.level = (parseInt(res.level) + 1).toString()
          this.$emit('on-parentchange', res.id, true)
        } else if (res === null) {
          suffix = '新增'
          this.$emit('on-parentchange', undefined, true)
        }
        breadcrumbList.push({ categoryName: suffix })
      
        /* 触发on-breadcrumb事件 */
        while (parent) {
          breadcrumbList.unshift({
            id: parent.id,
            categoryName: parent.categoryName
          })
          parent = parent.parent
        }
        this.$emit('on-breadcrumbchange', breadcrumbList)
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    submit () {
      let data = jsonCopy(this.category)
      data._loading = true
      if (!data.id) {
        data.id = this.uuid
      }

      let url = this.category.id ? `/market/goods/category/${this.category.id}` : '/market/goods/category'
      let method = this.category.id ? 'PUT' : 'POST'

      this.$http({
        url,
        method,
        data
      }).then(res => {
        this.$Message.success('商品分类保存成功！')
        this.back()
      }).catch(error => {
        console.error(error)
        if (error.code === 'COMM_BIZ_EXISTS') {
          this.errorMsg = error.message
        }
        this.$Message.error('商品分类保存失败，请稍后重试！')
      })
    },
    back () {
      this.$emit('on-close')
    }
  },
  mounted () {
    this.init()
  }
}
</script>
