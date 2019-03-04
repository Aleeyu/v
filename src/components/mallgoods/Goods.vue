<template>
  <Card dis-hover>
    <Row slot="title">
      <Breadcrumb>
        <BreadcrumbItem>商城商品管理</BreadcrumbItem>
        <BreadcrumbItem>商品管理</BreadcrumbItem>
        <BreadcrumbItem v-for="breadcrumb in breadcrumbList" :key="breadcrumb.text">
          {{ breadcrumb.text }}
        </BreadcrumbItem>
      </Breadcrumb>
    </Row>
    <GoodsList ref="LIST" v-show="current === 'LIST'"
      @on-add="handleAdd"
      @on-edit="handleEdit"></GoodsList>
    <GoodsForm
      v-if="current === 'FORM'"
      :id="id"
      :method="method"
      @on-breadcrumbchange="handleBreadcrumbChange"
      @on-close="handleClose"></GoodsForm>
  </Card>
</template>

<script>
import GoodsList from './goods/GoodsList'
import GoodsForm from './goods/GoodsForm'

export default {
  components: { GoodsList, GoodsForm },
  data () {
    return {
      breadcrumbList: []
    }
  },
  computed: {
    method () {
      return this.$route.query.method
    },
    id () {
      return this.$route.query.id
    },
    /* 是否为非法的query参数 */
    isIllegalQuery () {
      /* 非法的method类型 */
      if (this.method && this.method !== 'add') {
        return true
      }
      return false
    },
    current () {
      if (this.method === 'add' || this.id) {
        return 'FORM'
      } else {
        return 'LIST'
      }
    }
  },
  methods: {
    handleAdd () {
      this.$router.push({
        path: this.$route.path,
        query: {
          method: 'add'
        }
      })
    },
    handleEdit (id) {
      this.$router.push({
        path: this.$route.path,
        query: { id }
      })
    },
    handleBreadcrumbChange (breadcrumbList) {
      this.breadcrumbList = breadcrumbList
    },
    handleClose (refresh = false) {
      this.$router.replace({
        path: this.$route.path
      })
      if (refresh) {
        this.$refs.LIST.getList()
      }
    },
    init () {
      /* 将非法的url转化为默认url */
      if (this.isIllegalQuery) {
        this.$router.replace({ path: this.$route.path })
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
