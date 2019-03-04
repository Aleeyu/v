<template>
  <Row>
    <Row v-if="!error">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <Row>
            <Button type="primary" @click="add">新增商品</Button>
          </Row>
        </Col>
        <Col>
          <Row type="flex" justify="end" align="middle">
            <Col style="margin-right: 10px;">
              <span>上架状态：</span>
              <Select style="width: 150px;" v-model="condition.isOnShelf">
                <Option v-for="option in condition.isOnShelfOptions"
                  :value="option.value"
                  :key="option.value">{{ option.text }}</Option>
              </Select>
            </Col>
            <Col style="margin-right: 10px;">
              <span>商品名称：</span>
              <Input style="width: 150px;"
                v-model="condition.goodsName"
                placeholder="商品名称"
                @on-enter="getList(1)"></Input>
            </Col>
            <Col>
              <Button @click="getList(1)">搜索</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Table stripe :columns="list.columns" :data="list.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="list.page"
          :page-size="list.pageSize"
          :total="list.totalCount"
          @on-change="getList"></Page>
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
        columns: [
          {
            title: '商品名称',
            key: 'goodsName'
          },
          {
            title: '商品分类',
            key: 'categoryThreeName'
          },
          {
            title: '更新时间',
            render: (h, p) => {
              let val = p.row.updatedTime ? p.row.updatedTime : p.row.createdTime
              return this.filterDateTime(val)
            }
          },
          {
            title: '上架状态',
            render: (h, p) => this.filterOnShelf(p.row.isOnShelf)
          },
          {
            title: '操作',
            render: (h, p) => {
              let deleteBtn = <i-button type="warning" onClick={ () => this.delete(p.row.id) }>删除</i-button>
              return <button-group>
                <i-button type="ghost" onClick={ () => this.edit(p.row.id) }>编辑</i-button>
                { p.row.isOnShelf === 0 ? undefined : [deleteBtn] }                
              </button-group>
            }
          }
        ]
      },
      condition: {
        goodsName: null,
        isOnShelf: -1,
        isOnShelfOptions: [
          { value: -1, text: '全部' },
          { value: 0, text: '已上架' },
          { value: 1, text: '已下架' }
        ]
      }
    }
  },
  methods: {
    filterDateTime (val) {
      if (!val) {
        return '-'
      }
      let date = new Date(val)
      let dateString = date.toLocaleString()
      return dateString === 'Invalid Date' ? '-' : dateString
    },
    filterOnShelf (val) {
      if (val === 0) {
        return '已上架'
      } else if (val === 1) {
        return '已下架'
      }
      return '-'
    },
    init () {
      this.getList()
    },
    getList (page = this.list.page) {
      let data = {
        _loading: true,
        page,
        size: this.list.pageSize,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (this.condition.goodsName) {
        data.queryFilter.push({
          property: 'goodsName',
          op: 'like',
          value: this.condition.goodsName
        })
      }
      
      if (this.condition.isOnShelf !== -1) {
        data.queryFilter.push({
          property: 'isOnShelf',
          op: '=',
          value: this.condition.isOnShelf
        })
      }

      if (this.error) {
        this.errorLoading = true
      }
      this.$http.post('/market/goods/search', data).then(res => {
        this.list.data = res.content
        this.list.page = res.page
        this.list.totalCount = res.totalCount

        this.error = null
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
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
        content: '<p>确定删除商品吗？</p>',
        onOk: () => {
          this.$http.delete(`/market/goods/${id}`, true)
          .then(res => {
            this.$Message.success('商品删除成功！')
            this.getList()
          }).catch(error => {
            console.error(error)
            this.$Message.error(error.message)
          })
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
