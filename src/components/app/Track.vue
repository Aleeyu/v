<template>
  <div class="app-track app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>货物追踪</h1>
        <h4>以下是当前二维码对应货物的生产、出入库等信息</h4>
      </div>
    </div>

    <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息" @action="reload"
                :loading="busy"></error-view>

    <list-panel v-if="!error && model" class="app-body app-common-body" :refreshable="!busy" :pageable="false"
                @refresh="reload">
      <div slot="items" class="app-track-info-body">
        <i class="app-track-info-title">基本信息</i>
        <div class="app-track-info-group" v-if="model.base">
          <div class="app-list-info-group">
            <div class="app-list-info">
              <i>单元识别码</i>
              <h2>{{ model.base.code }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>产品名称</i>
              <h2>{{ model.base.productName }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>二维码类型</i>
              <h2>{{ units[model.base.codeType] }}</h2>
            </div>
            <div class="app-list-info" style="width: 50%;">
              <i>状态</i>
              <h2>{{ model.base.state }}</h2>
            </div>
          </div>
        </div>
        <div v-else class="app-track-info-none">未能找到该货物相关信息</div>

        <i class="app-track-info-title">生产信息</i>
        <div class="app-track-info-group" v-if="model.production">
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>生产单号</i>
              <h2>{{ model.production.productionCode }}</h2>
            </div>
            <div class="app-list-info" style="width: 50%;">
              <i>生产时间</i>
              <h2>{{ new Date(model.production.createdTime).format() }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info">
              <i>操作人</i>
              <h2>{{ model.production.createdByUser.name }}</h2>
            </div>
          </div>
        </div>
        <div v-else class="app-track-info-none">该货物还没有开始进行生产或正在生产中</div>

        <i class="app-track-info-title">入库信息</i>
        <div class="app-track-info-group" v-if="model.receipt">
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>入库单号</i>
              <h2>{{ model.receipt.code }}</h2>
            </div>
            <div class="app-list-info" style="width: 50%;">
              <i>入库时间</i>
              <h2>{{ new Date(model.receipt.receivedTime).format() }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info">
              <i>操作人</i>
              <h2>{{ model.receipt.receivedBy }}</h2>
            </div>
          </div>
        </div>
        <div v-else class="app-track-info-none">该货物还没有入库</div>

        <i class="app-track-info-title">出库信息</i>
        <div class="app-track-info-group" v-if="model.invoice">
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>订单号</i>
              <h2>{{ model.invoice.orderCode }}</h2>
            </div>
            <div class="app-list-info" style="width: 50%;">
              <i>出库单号</i>
              <h2>{{ model.invoice.code }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info flex">
              <i>出库时间</i>
              <h2>{{ new Date(model.invoice.sendTime).format() }}</h2>
            </div>
            <div class="app-list-info" style="width: 50%;">
              <i>操作人</i>
              <h2>{{ model.invoice.sendBy }}</h2>
            </div>
          </div>
          <div class="app-list-info-group">
            <div class="app-list-info">
              <i>经销商</i>
              <h2>{{ model.invoice.receivedDepName }}</h2>
            </div>
          </div>
        </div>
        <div v-else class="app-track-info-none">该货物还没有出库</div>
      </div>
    </list-panel>
    <div v-else-if="!error" class="app-body app-common-body app-list-empty">
      正在加载数据，请稍候...
    </div>

    <div class="app-menus">
      <button @click="scan" :disabled="busy">
        <Icon type="android-expand"></Icon>
        <span>扫描二维码</span>
      </button>
      <button v-if="model && model.base && model.production && model.base.codeType === 'UNITS_BOX' && $parent.user.appRole !== 'OPERATOR'" @click="deleteItem" :disabled="busy">
        <Icon type="trash-a"></Icon>
        <span>删除生产信息</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>关闭页面</span>
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
        units: {
          UNITS_BOX: '箱码',
          UNITS_BAG: '袋码',
          UNITS_CASE: '盒码'
        },
        current: null,
        busy: false,
        model: null,
        error: null
      }
    },
    methods: {
      back: function () {
        this.$router.back()
      },
      load: function (id, nocheck = false, callback) {
        if (!this.busy && id) {
          this.current = id
          this.busy = true
          this.$http.get(`/track/${id}`, true).then(res => {
            this.error = null
            this.model = res
          }).catch(res => {
            this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('货物信息'))
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') callback()
          })
        }
      },
      reload: function (callback) {
        this.load(this.current, true, callback)
      },
      deleteItem: function () {
        this.$parent.confirm('删除确认', '您正准备删除当前箱码的生产信息，该操作不可撤消。您确定要进行删除吗？').then(() => {
          this.busy = true
          this.$http.post('/scanitem/batch/force/box', [this.model.production.id]).then(res => {
            this.busy = false
            this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('生产信息'))
            this.load(this.current, true)
            this.$parent.executeBroadcast('productionRemove', this.model.production.id)
          }).catch(res => {
            this.busy = false
            this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('生产信息'))
          })
        })
      },
      scan: function () {
        let scanFailed = (msg) => {
          this.busy = false
          this.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scan()
          })
        }

        this.$parent.scan().then(res => {
          this.load(res.code)
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      shown: function () {
        if (this.$route.query.id) {
          this.load(this.$route.query.id)
        } else {
          this.back()
        }
      }
    }
  }
</script>

<style lang="less">
  .app-track-info {
    &-title {
      display: block;
      font-size: .8rem;
      color: #80848f;
      padding: 1.5rem 1rem .5rem 1rem;
      font-style: normal;
    }

    &-none {
      position: relative;
      padding: 1rem 1rem 1rem;
      background-color: white;
      margin: 5px 0;
      font-size: 1rem;
      color: #80848f;
      box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
    }

    &-group {
      position: relative;
      padding: .5rem 0 1rem 0;
      background-color: white;
      margin: 5px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
    }
  }
</style>
