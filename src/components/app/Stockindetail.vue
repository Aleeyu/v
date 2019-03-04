<template>
  <div class="app-stockin-detail app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>入库单明细</h1>
        <h4>下面是当前生产单的入库详细情况，点击入库单项可查看入库明细</h4>
      </div>
    </div>

    <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息" @action="getBaseInfo"
                :loading="busy"></error-view>

    <div class="app-base-info" v-if="!error && model">
      <div class="app-list-info-group">
        <div class="app-list-info">
          <i>生产单号</i>
          <h2 class="app-stockin-detail-code">{{ model.code }}</h2>
        </div>
        <div class="app-list-info flex">
          <i>创建时间</i>
          <h2>{{ new Date(model.createdTime).toLocaleDateString() }}</h2>
        </div>
        <div class="app-list-info">
          <i>状态</i>
          <h2 :class="[`app-stockin-detail-status-${model.status}`]">{{ status[model.status] }}</h2>
        </div>
      </div>
    </div>

    <list-panel v-show="!error && model" class="app-body app-common-body" :refreshable="!busy" :pageable="!list.last"
                @refresh="queryByManual" @nextpage="queryByPage">
      <div slot="items" class="app-list" v-if="$isArray(list.store, true)">
        <v-touch class="app-list-item app-list-item-arrow app-list-button" v-for="d in list.store" :key="d.id" @tap="getDetails(d)">
          <div class="app-list-info-group">
            <div class="app-list-info" style="width: 10rem;">
              <i>入库单号</i>
              <h2 class="app-stockin-detail-code">{{ d.code }}</h2>
            </div>
            <div class="app-list-info-sep">&nbsp;&nbsp;</div>
            <div class="app-list-info">
              <i>入库时间</i>
              <h2>{{ new Date(d.receivedTime).format() }}</h2>
            </div>
          </div>
          <div v-show="!d.collapsed">
            <div v-if="d.busy" class="app-list-empty">
              正在加载明细…
            </div>
            <div v-else-if="$isArray(d.details, true)">
              <Table :columns="detailcolumns" :data="d.details"></Table>
            </div>
          </div>
        </v-touch>
      </div>
      <div v-else slot="items" class="app-list-empty">
        当前生产单还没有任何入库信息
      </div>
    </list-panel>

    <div class="app-menus">
      <button @click="collapseAll">
        <Icon type="arrow-shrink"></Icon>
        <span>全部收起</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>返回列表</span>
      </button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/app/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        busy: false,
        status: ['待接收', '待生产', '生产中', '已生产', '已入库'],
        error: null,
        model: null,
        list: {
          last: true,
          page: 1,
          size: 10,
          store: null
        },
        detailcolumns: [{
          key: 'productName',
          title: '商品名称'
        }, {
          key: 'amountInfo',
          title: '数量'
        }]
      }
    },
    methods: {
      back: function () {
        this.$router.back()
      },
      collapseAll: function () {
        for (let d of this.list.store) {
          d.collapsed = true
        }
      },
      shown: function () {
        if (this.$route.query.id) {
          this.getBaseInfo(this.$route.query.id)
        } else {
          this.$router.back()
        }
      },
      getBaseInfo: function () {
        if (this.model == null || this.model.id !== this.$route.query.id) {
          this.model = null
          this.list.store = null
          this.busy = true

          this.$http.post('/production/order/search', {
            _loading: true,
            page: 1,
            size: 10,
            queryFilter: [{property: 'id', op: '=', value: this.$route.query.id}]
          }).then(res => {
            if (this.$isArray(res.content, true)) {
              this.error = null
              this.model = res.content[0]
            } else {
              this.error = {
                type: this.$ErrType.NOTFOUND,
                title: '未找到生产单',
                content: '未找到生产单信息，无法查看入库明细',
                action: '',
                cancel: ''
              }
            }
          }).catch(res => {
            this.error = this.$Err.notFound(false, true)
          }).finally(() => {
            this.busy = false
            if (this.model) {
              this.queryByManual()
            }
          })
        }
      },
      resetParams: function (clearAll = false) {
        this.list.last = true
        this.list.currentDate = null
        this.list.page = 1
      },
      queryByPage: function (callback) {
        this.list.page += 1
        this.query(callback)
      },
      queryByManual: function (callback) {
        if (!this.busy) {
          this.resetParams()
          this.query(callback)
        }
      },
      query: function (callback) {
        if (!this.busy && this.model && this.model.id) {
          this.busy = true
          this.$http.post('/store/receipt/search', {
            page: this.list.page,
            size: this.list.size,
            queryFilter: [{property: 'productionId', op: '=', value: this.model.id}],
            _loading: true
          }).then(res => {
            if (this.list.page <= 1) {
              this.list.store = []
            }
            this.list.last = this.list.page >= res.totalPages || (this.list.page === 1 && res.content.length === 0)
            for (let d of res.content) {
              d.busy = false
              d.collapsed = true
              d.details = null
              this.list.store.push(d)
            }
          }).catch(res => {
            this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('入库单列表'))
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') callback()
          })
        }
      },
      getDetails: function (d) {
        d.collapsed = !d.collapsed
        if (d.details == null) {
          d.busy = true
          this.$http.get(`/store/receipt/${d.id}`).then(res => {
            d.details = res.itemList
          }).finally(() => {
            d.busy = false
          })
        }
      }
    }
  }
</script>
