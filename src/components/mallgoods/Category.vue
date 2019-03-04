<template>
  <Card dis-hover>
    <Row slot="title">
      <Breadcrumb>
        <BreadcrumbItem>商城商品管理</BreadcrumbItem>
        <BreadcrumbItem>商品分类管理</BreadcrumbItem>
        <BreadcrumbItem v-for="(breadcrumb, index) in breadcrumbList" :key="id">
          <router-link 
            :to="{ path: $route.path, query: { parentId: breadcrumb.id } }"
            v-if="index !== breadcrumbList.length - 1">
            {{ breadcrumb.categoryName }}
          </router-link>
          <span v-else>{{ breadcrumb.categoryName }}</span>
        </BreadcrumbItem>
      </Breadcrumb>
    </Row>
    <CategoryList v-if="!isIllegalMethod"
      :parent-id="parentId"
      @on-parentchange="handleParentChange"
      @on-breadcrumbchange="handleBreadcrumbChange"
      @on-add="handleAdd"
      @on-edit="handleEdit"></CategoryList>
    <CategoryForm v-if="isIllegalMethod" 
      :method="method" 
      :id="id" 
      :parent-id="parentId"
      @on-parentchange="handleParentChange"
      @on-breadcrumbchange="handleBreadcrumbChange"
      @on-close="handleClose"></CategoryForm>
  </Card>
</template>

<script>
import CategoryList from './category/CategoryList'
import CategoryForm from './category/CategoryForm'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))

export default {
  components: { 
    CategoryList, 
    CategoryForm
  },
  data () {
    return {
      breadcrumbList: []
    }
  },
  computed: {
    method () {
      return this.$route.query.method
    },
    parentId () {
      return this.$route.query.parentId
    },
    id () {
      return this.$route.query.id
    },
    isIllegalMethod () {
      return this.method === 'add' || this.method === 'edit'
    },
    /* 是否为非法的query参数 */
    isIllegalQuery () {
      /* 合法返回false，非法返回true */

      /* 非法的method类型 */
      if (this.method && !this.isIllegalMethod) {
        return true
      }
      /* edit没有id */  
      if (this.method === 'edit' && !this.id) {
        return true
      }

      return false
    }
  },
  methods: {
    init () {
      /* 将非法的url转化为默认url */
      if (this.isIllegalQuery) {
        this.$router.replace({ path: this.$route.path })
      }
    },
    handleParentChange (parentId, replace = false) {
      if (this.$route.query.parentId === parentId) return

      let query = jsonCopy(this.$route.query)
      if (parentId) {
        query.parentId = parentId
      } else {
        delete query.parentId
      }

      let route = { path: this.$route.path }
      route.query = query

      if (replace) {
        this.$router.replace(route)
      } else {
        this.$router.push(route)
      }
    },
    handleBreadcrumbChange (breadcrumbList) {
      this.breadcrumbList = breadcrumbList
    },
    handleMethodChange (method, replace = false) {
      if (this.$route.query.method === method) return

      let query = jsonCopy(this.$route.query)
      if (method) {
        query.method = method
      } else {
        delete query.method
      }

      let route = { path: this.$route.path }
      route.query = query

      if (replace) {
        this.$router.replace(route)
      } else {
        this.$router.push(route)
      }
    },
    handleAdd () {
      let query = jsonCopy(this.$route.query)
      query.method = 'add'
      let route = { path: this.$route.path }
      route.query = query
      this.$router.push(route)
    },
    handleEdit (id) {
      let query = jsonCopy(this.$route.query)
      query.method = 'edit'
      query.id = id
      let route = { path: this.$route.path }
      route.query = query
      this.$router.push(route)
    },
    handleIdChange (id, replace = false) {
      if (this.$route.query.id === id) return

      let query = jsonCopy(this.$route.query)
      if (id) {
        query.id = id
      } else {
        delete query.id
      }

      let route = { path: this.$route.path }
      route.query = query

      if (replace) {
        this.$router.replace(route)
      } else {
        this.$router.push(route)
      }
    },
    handleClose () {
      let query = jsonCopy(this.$route.query)
      delete query.id
      delete query.method

      this.$router.replace({
        path: this.$route.path,
        query: query
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
