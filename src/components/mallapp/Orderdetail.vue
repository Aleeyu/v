<template>
  <div class="app-order app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>订单详情</h1>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>

    <list-panel class="app-body app-common-body" :refreshable="!busy" @refresh="load" :pageable="false">
      <div class="app-list" v-if="model">
        <div class="app-order-detail-status" :style="{backgroundColor: statusColors[model.status]}">{{ statusTexts[model.status] }}</div>

        <div class="app-list-item app-statement-address-panel simple" v-if="receiver">
          <div class="app-flex">
            <div class="app-statement-receiver">
              <b>{{ receiver.name }}</b>
              <b>{{ receiver.phone }}</b>
            </div>
            <div class="app-statement-address">
              <Icon type="ios-location"></Icon>
              <span>{{ receiver.address }}</span>
            </div>
          </div>
        </div>

        <div class="app-list-item" v-if="$isArray(model.orderDetails, true)">
          <div class="app-cart-item app-cart-item-coll bottom-border" v-for="d in model.orderDetails">
            <div class="app-cart-image" :style="{backgroundImage: getPicture(d), marginLeft: '1rem'}"></div>
            <div class="app-cart-info">
              <v-touch tag="h1">{{ d.goodsName }} {{ d.specKey }}</v-touch>
              <v-touch tag="h3">{{ d.spec }}</v-touch>
              <div class="app-cart-sale">
                <span class="app-cart-price">{{ Number(d.salesPrice / 100).toFixed(2) }}</span>
                <span class="app-statement-quantity">×{{d.number}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="app-list-item">
          <div class="app-order-record"><em>订单编号</em>{{ model.orderNo }}
            <!-- <Button type="text" @click.stop="copy(model.orderNo)">复制</Button> -->
          </div>
          <div class="app-order-record"><em>下单时间</em>{{ new Date(model.createdTime).format() }}</div>
          <div class="app-order-sep"></div>
          <div class="app-order-record"><em>支付方式</em>在线支付</div>
          <div class="app-order-sep"></div>
          <div class="app-order-record"><em>配送方式</em>快递运输</div>
          <div class="app-order-record" v-if="model.expressCompany"><em>快递公司</em>{{ model.expressCompany }}</div>
          <div class="app-order-record" v-if="model.expressNo"><em>快递单号</em>{{ model.expressNo }}</div>
        </div>

        <div class="app-list-item app-block">
          <div class="app-order-record app-statement-price-item">商品金额<i
            class="app-statement-price">{{ ((model.totalAmount - model.postage) / 100).toFixed(2)
            }}</i></div>
          <div class="app-order-record app-statement-price-item">运费<i
            class="app-statement-price">{{ (model.postage / 100).toFixed(2) }}</i>
          </div>
          <div class="app-order-sep"></div>
          <div class="app-order-summary app-statement-price-item">实付款<i
            class="app-statement-price app-statement-price-big">{{ (model.totalAmount / 100).toFixed(2) }}</i></div>
        </div>
      </div>
    </list-panel>

    <div class="app-menus" v-if="model">
      <Button class="horizontal" icon="ios-undo-outline" @click.stop="cancel"
              v-if="checkStatus(status.CANCELLED)">取消
      </Button>
      <Button class="horizontal" icon="ios-trash-outline" @click.stop="remove"
              v-if="checkStatus(status.DELETED)">删除
      </Button>
      <Button class="primary big app-no-flex" @click.stop="pay"
              v-if="checkStatus(status.UNDELIVERED)">立即支付
      </Button>
      <Button class="primary big app-no-flex" @click.stop="receive"
              v-if="checkStatus(status.COMPLETED)">确认收货
      </Button>
    </div>
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
        payParams: null,
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
        model: null
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
        this.load()
      },
      load: function (callback) {
        if (this.$route.query.id) {
          this.busy = true
          this.$http.get(`/wechat/customer/mallorder/${this.$route.query.id}`, true).then(res => {
            this.model = res
            this.checkAction()
          }).catch(err => {
            this.$Message.error(err.message || err.msg || '获取订单信息失败')
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') {
              callback()
            }
          })
        } else {
          if (typeof callback === 'function') {
            callback()
          }
          this.back()
        }
      },
      checkAction: function () {
        switch (this.$route.query.action) {
          case 'pay':
            if (this.model.status === this.status.UNPAY) {
              this.pay()
            }
            break
        }
      },
      pay: function () {
        if (this.$isPlainObject(this.model) && this.model.totalAmount > 0) {
          this.busy = true
          this.$http.post('/wechat/customer/pay', {
            id: this.model.orderId,
            _loading: true
          }).then(res => {
            this.payParams = res
            if (typeof window.WeixinJSBridge === 'undefined') {
              if (document.addEventListener) {
                document.addEventListener('WeixinJSBridgeReady', this.doPay, false)
              } else if (document.attachEvent) {
                document.attachEvent('WeixinJSBridgeReady', this.doPay)
                document.attachEvent('onWeixinJSBridgeReady', this.doPay)
              }
            } else {
              this.doPay()
            }
          }).catch(err => {
            console.log(err.message || err.msg || '请求支付失败，请稍候重试')
          }).then(() => {
            this.busy = false
          })
        }
      },
      doPay: function () {
        if (this.$isPlainObject(this.payParams)) {
          window.WeixinJSBridge.invoke('getBrandWCPayRequest', this.payParams, this.payCompleted)
        } else {
          console.log('请求支付失败，请稍候重试')
        }
      },
      payCompleted: function (res) {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          this.$Message.success('支付成功，感谢您的购买')
          this.load()
        } else {
          this.$Message.error('支付失败，请稍候重试')
        }
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
      /**
       * 检查当前订单是否可以进行指定状态的设置操作
       * @param item 订单信息
       * @param status 指定状态
       */
      checkStatus: function (status) {
        let item = this.model
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
      receive: function () {
        let item = this.model
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
      cancel: function () {
        let item = this.model
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
      remove: function () {
        let item = this.model
        if (!this.busy && this.$isPlainObject(item)) {
          this.$parent.confirm('确定要删除订单吗？').then(() => {
            this.busy = true
            this.$http.put(`/wechat/customer/mallorder/${item.orderId}`, {
              status: this.status.DELETED,
              _loading: true
            }).then(res => {
              this.$Message.success('删除订单成功')
              this.back()
            }).catch(err => {
              this.$Message.error(err.message || err.msg || '删除订单失败')
            }).finally(() => {
              this.busy = false
            })
          })
        }
      },
      copy: function (data) {
        this.$parent.copy(data)
      }
    },
    computed: {
      receiver: function () {
        if (this.model && this.model.address) {
          let s = this.model.address.split('#####')
          return {
            address: s.length > 0 ? s[0] : '',
            phone: s.length > 1 ? s[1] : '',
            name: s.length > 2 ? s[2] : ''
          }
        } else {
          return null
        }
      }
    }
  }
</script>
