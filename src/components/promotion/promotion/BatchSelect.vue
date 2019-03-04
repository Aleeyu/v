<template>
  <Row>
    <Row v-if="expand">
      <div class="ivu-table-banner">
        <Row type="flex" justify="space-between" align="bottom">
          <Col>
            <Input :maxlength="20" placeholder="请输入关键字" v-model="optionList.wd" @on-enter="getOptionList(1)">
              <Button icon="search" slot="append" @click="getOptionList(1)">搜索</Button>
            </Input>
          </Col>
          <Col>
            <Page size="small"
              :current="optionList.page"
              :page-size="optionList.pageSize"
              :total="optionList.totalCount"
              @on-change="getOptionList"></Page>
          </Col>
        </Row>
      </div>
      <Table stripe :columns="optionList.columns" 
        :data="optionList.data"
        :loading="optionList.loading"
        @on-selection-change="handleOptionSelectionChange"></Table>
      <Row type="flex" justify="space-between" align="middle">
        <div>
          <Button icon="ios-arrow-down" @click="applyAddBatch" 
            :disabled="optionList.selection.length === 0">添加所选批次</Button>
          <Button type="ghost" icon="ios-arrow-up" @click="removeCurrentSelection"
            :disabled="currentList.selection.length === 0">移除所选批次</Button>
          <Button type="ghost" @click="cancel">关闭</Button>
        </div>
        <!-- <span>数量合计: {{ 10 }}</span> -->
      </Row>
    </Row>

    <Row type="flex" justify="space-between" align="middle" v-if="!disabled && !expand">
      <div>
        <Button @click="addBatch">添加批次</Button>
        <Button type="ghost" @click="removeCurrentSelection"
          :disabled="currentList.selection.length === 0">移除所选批次</Button>
      </div>
      <!-- <span>数量合计: {{ 0 }}</span> -->
    </Row>

    <Table stripe :columns="disabled ? currentList.disabledColumns : currentList.columns" 
      :data="currentList.data"
      :disabled-hover="disabled"
      @on-selection-change="handleCurrentSelectionChange"></Table>
  </Row>
</template>

<script>

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))

export default {
  data () {
    const columns = [
      {
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '产品名称',
        key: 'productName'
      },
      {
        title: '批次',
        key: 'batch',
        width: 150
      },
      {
        title: '数量',
        key: 'quantity'
      }
    ]

    const disabledColumns = [
      {
        title: '批次名称',
        key: 'productName'
      },
      {
        title: '批次',
        key: 'batch',
        width: 150
      },
      {
        title: '数量',
        key: 'quantity'
      }
    ]

    return {
      /* 当前列表相关 */
      currentList: {
        columns: columns,
        disabledColumns: disabledColumns,
        selection: [],
        data: []       
      },
      /* 备选列表相关 */
      optionList: {
        wd: null,
        page: 1,
        pageSize: 5,
        totalCount: 0,
        loading: false,
        data: [],
        selection: [],
        columns: columns
      },
      /* 展开option */
      expand: false
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    batchList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  watch: {
    batchList: {
      deep: true,
      handler (val, oldVal) {
        this.currentList.data = jsonCopy(this.batchList)
      }
    }
  },
  methods: {
    /* 处理当前列表所选项change */
    handleCurrentSelectionChange (selection) {
      this.currentList.selection = selection
    },
    /* 删除当前列表所选项 */
    removeCurrentSelection () {
      this.currentList.selection.forEach(d => {
        let i = this.currentList.data.findIndex(e => e.id === d.id)
        if (i !== -1) {
          this.currentList.data.splice(i, 1) 
          this.optionList.data.push(d)
        }
      })
      this.$emit('on-change', this.currentList.data)
      this.currentList.selection = []
    },
    /* 添加批次 */
    addBatch () {
      this.expand = true
      this.getOptionList()
    },
    /* 应用添加所选批次 */
    applyAddBatch () {
      this.optionList.selection.forEach(d => {
        let i = this.optionList.data.findIndex(e => e.id === d.id)
        if (i !== -1) {
          this.optionList.data.splice(i, 1)
          this.currentList.data.push(d)
        }
      })
      this.$emit('on-change', this.currentList.data)
      this.optionList.selection = []
    },
    /* 取消添加并初始化备选项 */
    cancel () {
      this.expand = false
      this.optionList.wd = null
      this.optionList.page = 1
      this.optionList.totalCount = 0
      this.optionList.data = []
    },
    /* 处理备选列表所选项change */
    handleOptionSelectionChange (selection) {
      this.optionList.selection = selection
    },
    /* 获取备选列表 */
    getOptionList (page = this.optionList.page) {
      let ids = this.currentList.data.map(d => d.id)

      let data = {
        page,
        size: this.optionList.pageSize,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (this.optionList.wd) {
        data.wd = this.optionList.wd
      }
      if (ids.length > 0) {
        data.queryFilter.push({
          property: 'id',
          op: 'notin',
          value: ids.join()
        })
      }

      this.optionList.loading = true
      this.$http.post('/promo/batch/search', data).then(res => {
        this.optionList.data = res.content
        this.optionList.page = res.page
        this.optionList.totalCount = res.totalCount
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        this.optionList.loading = false
      })
    }
  },
  mounted () {
    this.currentList.data = jsonCopy(this.batchList)
  }
}
</script>
