<template>
  <div class="app-order app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>我的订单</h1>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>

    <div class="app-order-status bottom-border">
      <Button type="text" :class="{selected: filterStatus == null}" @click.stop="queryByStatus(null)">全部</Button>
      <Button type="text" :class="{selected: filterStatus === 0}" @click.stop="queryByStatus(0)">待付款</Button>
      <Button type="text" :class="{selected: filterStatus === 2}" @click.stop="queryByStatus(2)">待收货</Button>
      <Button type="text" :class="{selected: filterStatus === 3}" @click.stop="queryByStatus(3)">已完成</Button>
      <Button type="text" :class="{selected: filterStatus === 4}" @click.stop="queryByStatus(4)">已取消</Button>
    </div>

    <list-panel class="app-body app-common-body" :pageable="!last" :refreshable="!busy"
                @refresh="queryByManual" @nextpage="queryByPage">
      <error-view class="app-body app-common-body" name="订单" v-if="error" :error="error"></error-view>

      <div class="app-order-list app-list" v-else-if="$isArray(store, true)" slot="items">
        <div class="app-list-item" v-for="item in store" :key="item.orderId"
             v-if="$isArray(item.orderDetails, true) && item.status !== status.DELETED"
             @click.stop="detail(item)">
          <div class="app-order-title">
            <span class="app-flex">订单号: {{ item.orderNo }}</span>
            <Button type="text" icon="ios-undo-outline" @click.stop="cancel(item)"
                    v-if="checkStatus(item, status.CANCELLED)"></Button>
            <Button type="text" icon="ios-box-outline" @click.stop="receive(item)"
                    v-if="checkStatus(item, status.COMPLETED)"></Button>
            <Button type="text" icon="ios-trash-outline" @click.stop="remove(item)"
                    v-if="checkStatus(item, status.DELETED)"></Button>
          </div>
          <div class="app-order-base" v-if="item.orderDetails.length === 1">
            <div class="app-order-image" :style="{backgroundImage: getPicture(item.orderDetails[0])}"></div>
            <div class="app-order-name app-flex">{{ item.orderDetails[0].goodsName }} {{ item.orderDetails[0].specKey
              }}
            </div>
          </div>
          <list-panel class="app-order-base" v-else :refreshable="false" :pageable="false" :vertical="false">
            <div class="app-order-image" v-for="d in item.orderDetails" :style="{backgroundImage: getPicture(d)}"></div>
          </list-panel>
          <div class="app-order-summary">
            <span class="app-flex" :style="{color: statusColors[item.status]}">{{ statusTexts[item.status] }}</span>
            共{{ getQuanity(item) }}件商品&nbsp;&nbsp;&nbsp;&nbsp;实付款: <b>{{ Number(item.actualAmount / 100).toFixed(2)
            }}</b>
          </div>
        </div>
      </div>
    </list-panel>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'
  import Msg from '@/components/mallapp/Msg'

  export default {
    components: {ListPanel, Msg},
    data () {
      return {
        busy: false,
        filterStatus: null,
        store: null,
        page: 1,
        size: 10,
        keyword: null,
        last: true,
        status: {
          UNPAY: 0,
          UNDELIVERED: 1,
          UNRECEIVED: 2,
          COMPLETED: 3,
          CANCELLED: 4,
          CLOSED: 5,
          DELETED: 6
        },
        statusTexts: ['待付款', '待发货', '待收货', '已完成', '已取消', '已关闭', '已删除'],
        statusColors: ['#ed3f14', '#495060', '#495060', '#2d8cf0', '#80848f', '#80848f', '#1c2438'],
        error: null
      }
    },
    methods: {
      /**
       * 后退至上一页
       */
      back: function () {
        this.$router.back()
      },
      shown: function () {
        this.filterStatus = Number(this.$route.query.status)
        if (isNaN(this.filterStatus)) {
          this.filterStatus = null
        }
        this.queryByStatus()
      },
      queryByManual: function (callback) {
        if (!this.busy) {
          this.page = 1
          this.last = true
          this.keyword = null
          this.query(callback)
        }
      },
      queryByPage: function (callback) {
        if (!this.busy) {
          this.page++
          this.query(callback)
        }
      },
      queryByStatus: function (status) {
        if (!this.busy) {
          this.filterStatus = status == null ? null : status
          this.page = 1
          this.last = true
          this.query()
        }
      },
      query: function (callback) {
        this.$parent.getUserInfo().then(res => {
          this.doQuery(callback)
        }).catch(err => {
          console.log(err)
          if (typeof callback === 'function') {
            callback()
          }
        })
      },
      doQuery: function (callback) {
        if (!this.busy) {
          let o = {
            page: this.page,
            size: this.size,
            orderBy: [{property: 'createdTime', order: 'desc'}],
            _loading: true,
            queryFilter: []
          }

          if (this.filterStatus !== null && !isNaN(this.filterStatus)) {
            o.queryFilter.push({property: 'status', op: '=', value: this.filterStatus})
          }

          this.busy = true
          this.$http.post('/wechat/customer/mallorder/search', o).then(res => {
            this.error = null
            if (this.page <= 1) {
              this.store = []
            }
            this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
            this.store = this.store.concat(res.content)
            if (!this.$isArray(this.store, true)) {
              this.error = this.$Err.noData(false)
            }
          }).catch(err => {
            console.log(err)
            this.error = this.$Err.unhandled()
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      },
      /**
       * 检查当前订单是否可以进行指定状态的设置操作
       * @param item 订单信息
       * @param status 指定状态
       */
      checkStatus: function (item, status) {
        let enable = false
        if (this.$isPlainObject(item) && item.hasOwnProperty('status')) {
          switch (status) {
            case this.status.DELETED:
              enable = item.status !== this.status.UNDELIVERED && item.status !== this.status.UNRECEIVED && item.status !== this.status.DELETED
              break
            case this.status.CANCELLED:
              enable = item.status !== this.status.DELETED && item.status !== this.status.CANCELLED && item.status !== this.status.CLOSED
              break
            case this.status.UNDELIVERED:
              enable = item.status === this.status.UNPAY
              break
            case this.status.COMPLETED:
              enable = item.status === this.status.UNRECEIVED
              break
          }
        }
        return enable
      },
      /**
       * 生成图片地址
       * @param d 商品信息
       */
      getPicture: function (d) {
        let pic = null
        if (this.$isPlainObject(d) && d.hasOwnProperty('pictures')) {
          let pics = String(d.pictures).split(',')
          if (pics.length > 0 && !!pics[0]) {
            pic = `url(${pics[0]})`
          }
        }
        return pic
      },
      detail: function (item) {
        if (!this.busy && this.$isPlainObject(item)) {
          this.$router.push({
            path: '/mallapp/orderdetail',
            query: {
              id: item.orderId
            }
          })
        }
      },
      cancel: function (item) {
        if (!this.busy && this.$isPlainObject(item)) {
          if (item.status === this.status.UNPAY) {
            this.$parent.confirm('确定要取消订单吗？').then(() => {
              this.busy = true
              this.$http.put(`/wechat/customer/mallorder/${item.orderId}`, {
                status: this.status.CANCELLED,
                _loading: true
              }).then(res => {
                item.status = this.status.CANCELLED
                this.$Message.success('取消订单成功')
              }).catch(err => {
                this.$Message.error(err.message || err.msg || '取消订单失败')
              }).finally(() => {
                this.busy = false
              })
            })
          } else {
            // 转到工单页面
            this.$router.push({
              path: '/mallapp/service',
              query: {
                id: item.orderId
              }
            })
          }
        }
      },
      remove: function (item) {
        if (!this.busy && this.$isPlainObject(item)) {
          this.$parent.confirm('确定要删除订单吗？').then(() => {
            this.busy = true
            this.$http.put(`/wechat/customer/mallorder/${item.orderId}`, {
              status: this.status.DELETED,
              _loading: true
            }).then(res => {
              item.status = this.status.DELETED
              this.$Message.success('删除订单成功')
            }).catch(err => {
              this.$Message.error(err.message || err.msg || '删除订单失败')
            }).finally(() => {
              this.busy = false
            })
          })
        }
      },
      receive: function (item) {
        if (!this.busy && this.$isPlainObject(item)) {
          this.$parent.confirm('确定已经收到商品吗？').then(() => {
            this.busy = true
            this.$http.put(`/wechat/customer/mallorder/${item.orderId}`, {
              status: this.status.COMPLETED,
              _loading: true
            }).then(res => {
              item.status = this.status.COMPLETED
              this.$Message.success('确定收货成功')
            }).catch(err => {
              this.$Message.error(err.message || err.msg || '确定收货失败')
            }).finally(() => {
              this.busy = false
            })
          })
        }
      },
      getQuanity: function (item) {
        let q = 0
        if (this.$isPlainObject(item) && item.hasOwnProperty('orderDetails') && this.$isArray(item.orderDetails)) {
          for (let s of item.orderDetails) {
            q += s.number || 0
          }
        }
        return q
      }
    }
  }
</script>
