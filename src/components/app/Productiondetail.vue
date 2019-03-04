<template>
  <div class="app-production-detail app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>生产单明细</h1>
        <h4>以下是当前生产单的明细信息</h4>
      </div>
    </div>

    <error-view class="app-body app-common-body" v-show="error" :error="error" name="生产单明细" @action="queryByManual"
                :loading="busy"></error-view>

    <div class="app-base-info" v-if="!error && model"
         :class="{'app-orders-list-item-urgent': model.urgentLevel === 1}">
      <div class="app-list-info-group">
        <div class="app-list-info flex">
          <i>生产单号</i>
          <h2 class="app-production-box-code">{{ model.code }}</h2>
        </div>
        <div class="app-list-info" style="width: 14.5rem;">
          <i>创建时间</i>
          <h2>{{ new Date(model.createdTime).format() }}</h2>
        </div>
      </div>
    </div>
    <div v-else-if="!error" class="app-body app-common-body app-list-empty">
      正在加载数据，请稍候...
    </div>

    <list-panel v-show="!error && model" class="app-body app-common-body" :refreshable="!busy" :pageable="!last"
                @refresh="queryByManual" @nextpage="queryByPage">
      <div slot="items" class="app-list" v-if="$isArray(store)">
        <div class="app-orders-list-item app-list-button" v-for="item in store" :key="item.id">
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>产品名称</i>
              <h2>{{ item.productName }}</h2>
            </div>
            <div class="app-list-info-sep">&nbsp;&nbsp;</div>
            <div class="app-list-info" style="width: 7rem;">
              <i>计划数量</i>
              <h2>{{ item.box || 0 }}箱{{item.cases || 0}}盒</h2>
            </div>
            <div class="app-list-info-sep">&nbsp;&nbsp;</div>
            <div class="app-list-info" style="width: 7rem;">
              <i>完成箱数</i>
              <h2>{{ item.produced || 0 }}箱</h2>
            </div>
          </div>
        </div>
      </div>
    </list-panel>


    <div class="app-menus">
      <button @click="selectProduction" :disabled="!model || busy">
        <Icon type="ios-flag"></Icon>
        <span>选择该生产单</span>
      </button>
      <button @click="back" :disabled="busy">
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
        error: null,
        model: null,
        store: null,
        last: true,
        page: 1,
        size: 10
      }
    },
    methods: {
      back: function () {
        this.$router.back()
      },
      shown: function () {
        if (this.$route.query.id) {
          this.queryByManual()
        } else {
          this.$parent.replaceRoute({
            path: '/app/production'
          })
        }
      },
      resetParams: function () {
        this.last = true
        this.page = 1
      },
      queryByPage: function (callback) {
        this.page += 1
        this.query(callback)
      },
      queryByManual: function (callback) {
        if (!this.busy) {
          this.resetParams()
          this.query(callback)
        }
      },
      query: function (callback) {
        this.busy = true
        let o = {
          page: this.page,
          size: this.size,
          orderBy: [{property: 'productName', order: 'asc'}],
          queryFilter: [{property: 'productionId', op: '=', value: this.$route.query.id}],
          _loading: true
        }
        this.$http.post(`/production/order/${this.$route.query.id}/search`, o).then(res => {
          this.error = null
          if (this.page <= 1) {
            this.store = []
          }
          this.last = this.page >= res.productionItem.totalPages || (this.page === 1 && res.productionItem.content.length === 0)
          this.model = res.production
          this.store = this.store.concat(res.productionItem.content)
        }).catch(res => {
          this.model = null
          this.store = null
          this.error = this.$Err.notFound(false, true)
        }).finally(() => {
          this.busy = false
          if (typeof callback === 'function') callback()
        })
      },
      selectProduction: function () {
        if (this.model) {
          this.$parent.executeBroadcast('selectProduction', this.model)
          this.back()
        }
      }
    }
  }
</script>
