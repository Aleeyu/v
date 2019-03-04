<template>
  <Row>
    <Row v-if="!error">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <Row>
            <Button type="ghost" @click="back" 
              v-if="!isTop">返回</Button>
            <Button type="primary" 
              @click="add">新增商品分类</Button>
          </Row>
        </Col>
        <Col>
          <Row type="flex" justify="end" align="middle">
            <!-- <Col style="margin-right: 10px;">
              <span>状态：</span>
              <Select style="width: 150px;" v-model="condition.isEnable">
                <Option v-for="option in condition.isEnableOptions"
                  :value="option.value"
                  :key="option.value">{{ option.text }}</Option>
              </Select>
            </Col> -->
            <Col style="margin-right: 10px;">
              <span>分类名称：</span>
              <Input style="width: 150px;"
                v-model="condition.categoryName"
                placeholder="分类名称"
                @on-enter="refreshList(1)">
              </Input>
            </Col>
            <Col>
              <Button @click="refreshList(1)">搜索</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Table stripe :columns="isBottom ? list.bottomColumns : list.topColumns" :data="list.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="list.page"
          :page-size="list.pageSize"
          :total="list.totalCount"
          @on-change="refreshList"></Page>
      </Row>
    </Row>
    <error-view v-if="error" :error="error" :loading="errorLoading" @action="init"></error-view>
  </Row>
</template>

<script>
export default {
  data () {
    return {
      error: null,
      errorLoading: false,
      list: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: [],
        topColumns: [
          {
            title: '分类名称',
            key: 'categoryName'
          },
          // {
          //   title: '启用状态',
          //   render: (h, p) => <span>{ this.filterEnable(p.row.isEnable) }</span>
          // },
          {
            title: '下级分类',
            render: (h, p) => <i-button onClick={ () => this.next(p.row.id) }>查看下级</i-button>
          },
          {
            title: '操作',
            render: (h, p) => <button-group>
              <i-button type="ghost" onClick={ () => this.edit(p.row.id) }>编辑</i-button>
              <i-button type="warning" onClick={ () => this.delete(p.row.id) }>删除</i-button>
            </button-group>
          }
        ],
        bottomColumns: [
          {
            title: '分类名称',
            key: 'categoryName'
          },
          // {
          //   title: '启用状态',
          //   render: (h, p) => <span>{ this.filterEnable(p.row.isEnable) }</span>
          // },
          {
            title: '是否推荐',
            render: (h, p) => <span>{ this.filterEnable(p.row.isRecommend) }</span>
          },
          {
            title: '操作',
            render: (h, p) => <button-group>
              <i-button type="ghost" onClick={ () => this.edit(p.row.id) }>编辑</i-button>
              <i-button type="warning" onClick={ () => this.delete(p.row.id) }>删除</i-button>
            </button-group>
          }
        ]
      },
      condition: {
        level: '1',
        categoryName: null,
        isEnable: -1,
        isEnableOptions: [
          { text: '全部', value: -1 },
          { text: '开启', value: 0 },
          { text: '关闭', value: 1 }
        ]
      },
      parent: null
    }
  },
  props: {
    /* 外部传入父级id */
    parentId: [String, Object]
  },
  computed: {
    /* 是否位于最底层 */
    isBottom () {
      return this.parent && this.parent.level === '2'
    },
    /* 是否位于最高层 */
    isTop () {
      return !this.parent
    }
  },
  methods: {
    filterEnable (value) {
      if (value === 0) {
        return '开启'
      } else if (value === 1) {
        return '关闭'
      }
      return '-'
    },
    filterRecommend (value) {
      if (value === 0) {
        return '是'
      } else if (value === 1) {
        return '否'
      }
      return '-'
    },
    init () {
      let listPromise = this.getList()
      let categoryPromise = this.getCategory()

      if (this.error) {
        this.errorLoading = true
      }

      Promise.all([listPromise, categoryPromise])
      .then(([listRes, categoryRes]) => {
        this.list.data = listRes.content
        this.list.page = listRes.page
        this.list.totalCount = listRes.totalCount

        /*
         * 触发on-parentchange和on-breadcrumbchange事件
         */
        this.parent = categoryRes
        this.$emit('on-parentchange', this.parent ? this.parent.id : undefined)

        let breadcrumbList = []
        let parent = this.parent
        while (parent) {
          breadcrumbList.unshift({
            id: parent.id,
            categoryName: parent.categoryName
          })
          parent = parent.parent
        }
        this.$emit('on-breadcrumbchange', breadcrumbList)

        this.error = null
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    /* 刷新列表数据 */
    refreshList (page = this.list.page) {
      this.getList(page).then(res => {
        this.list.data = res.content
        this.list.page = res.page
        this.list.totalCount = res.totalCount
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      })
    },
    /* 
     * 核心：获取列表
     * return promise
     */
    getList (page = this.list.page, parentId = this.parentId) {
      let data = {
        _loading: true,
        page,
        size: this.list.pageSize,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (!parentId) {
        data.queryFilter.push({
          property: 'level',
          op: '=',
          value: this.condition.level
        })
      } else {
        data.queryFilter.push({
          property: 'parentId',
          op: '=',
          value: parentId
        })
      }

      if (this.condition.isEnable !== -1) {
        data.queryFilter.push({
          property: 'isEnable',
          op: '=',
          value: this.condition.isEnable
        })
      }

      if (this.condition.categoryName) {
        data.queryFilter.push({
          property: 'categoryName',
          op: 'like',
          value: this.condition.categoryName
        })
      }

      return this.$http.post('/market/goods/category/search', data)
    },
    /*
     * 核心：获取分类信息
     * return promise
     */
    getCategory (id = this.parentId) {
      if (!id) {
        return Promise.resolve(null)
      }
      return this.$http.get(`/market/goods/category/${id}`, true)
    },
    /* 下钻一层 */
    next (id) {
      /* 下钻时清除搜索条件 */
      this.condition.isEnable = -1
      this.condition.categoryName = null

      this.$emit('on-parentchange', id)
    },
    /* 返回一层 */
    back () {
      let id 
      if (this.parent) {
        id = this.parent.parent ? this.parent.parent.id : undefined
      } else {
        id = undefined
      }
      /* 返回时清除搜索条件 */
      this.condition.isEnable = -1
      this.condition.categoryName = null

      this.$emit('on-parentchange', id) 
    },
    add () {
      this.$emit('on-add')
    },
    edit (id) {
      this.$emit('on-edit', id)
    },
    delete (id) {
      this.$Modal.confirm({
        title: '确认删除？',
        content: '<p>确定删除商品分类吗？如果有关联商品，将删除失败！</p>',
        onOk: () => {
          this.$http.delete(`/market/goods/category/${id}`, true).then(res => {
            this.$Message.success('商品分类删除成功！')
            this.refreshList()
          }).catch(error => {
            this.$Message.error(error.message)
          })
        }
      })
    }
  },
  watch: {
    parentId (val, oldVal) {
      if (!this.parent || this.parent.id !== this.parentId) {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
