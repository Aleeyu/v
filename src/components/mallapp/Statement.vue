<template>
  <div class="app-statement app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>确认订单</h1>
      </div>
      <div class="app-banner-button right">
      </div>
    </div>

    <list-panel class="app-body app-common-body" :refreshable="false" :pageable="false">
      <div class="app-statement-body" slot="items">
        <v-touch class="app-statement-address-panel" @tap="onAddressTap" v-if="$isPlainObject(address)">
          <div class="app-flex">
            <div class="app-statement-receiver">
              <b>{{ address.contactUser }}</b>
              <b>{{ address.mobile }}</b>
            </div>
            <div class="app-statement-address">
              <Icon type="ios-location"></Icon>
              <span>{{ address.provinceName }} {{ address.cityName }} {{ address.areaName }} {{ address.address
                }}</span>
            </div>
          </div>
          <Icon type="chevron-right" class="app-statement-chevron"></Icon>
        </v-touch>

        <div class="app-list-item app-cart-item" v-if="$isArray(store, true) && store.length === 1">
          <div class="app-cart-image" :style="{backgroundImage: getPicture(store[0]), marginLeft: '.5rem'}"></div>
          <div class="app-cart-info">
            <v-touch tag="h1">{{ store[0].goodsName }} {{ store[0].specKey }}</v-touch>
            <v-touch tag="h3">{{ store[0].spec }}</v-touch>
            <div class="app-cart-sale">
              <span class="app-cart-price">{{ Number(store[0].salesPrice / 100).toFixed(2) }}</span>
              <span class="app-statement-quantity">×{{store[0].number}}</span>
            </div>
          </div>
        </div>

        <v-touch class="app-list-item" v-if="$isArray(store, true) && store.length > 1" @tap="showItems">
          <div class="app-statement-products">
            <list-panel class="app-statement-images" :refreshable="false" :pageable="false" :vertical="false">
              <div class="app-cart-image" v-for="d in store" :style="{backgroundImage: getPicture(d)}"></div>
            </list-panel>
            <div class="app-statement-quantity">共{{quantityCount}}件</div>
            <Icon type="chevron-right" class="app-statement-chevron"></Icon>
          </div>
        </v-touch>

        <div class="app-list-item app-statement-item">
          <h2>支付配送</h2>
          <h3>在线支付<br/>快递运输<br/><em>除节假日外均可送货</em><br/>运费: <span
            class="app-statement-price">{{ (freight / 100).toFixed(2) }}</span></h3>
        </div>

        <div class="app-list-item app-statement-message">
          <input maxlength="50" v-model.trim="comment" placeholder="选填：给商家留言"/>
        </div>

        <div class="app-list-item app-statement-item app-block">
          <div class="app-statement-price-item">商品金额<i class="app-statement-price">{{ (priceCount / 100).toFixed(2)
            }}</i></div>
          <div class="app-statement-price-item">运费<i class="app-statement-price">{{ (freight / 100).toFixed(2) }}</i>
          </div>
        </div>
      </div>
    </list-panel>

    <div class="app-menus">
      <label class="app-flex app-statement-summary">实付款：<i
        class="app-statement-price app-statement-price-big">{{ ((priceCount + freight) / 100).toFixed(2) }}</i></label>
      <Button class="primary big app-no-flex" :disabled="quantityCount === 0 || address == null" @click.stop="submit">
        立即下单
      </Button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        busy: false,
        address: null,
        comment: '',
        store: null,
        quantityCount: null,
        priceCount: null,
        freight: 0
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
        this.address = this.$parent.receivingAddress
        if (this.$isPlainObject(this.address)) {
          this.load()
        } else {
          this.$parent.replaceRoute({
            path: '/mallapp/cart'
          })
        }
      },
      load: function (callback) {
        if (!this.busy) {
          this.busy = true
          this.$http.get(`/wechat/customer/mallorder/postage/${this.address.addressId}`, true).then(res => {
            this.freight = Number(res)
            if (this.freight == null || isNaN(this.freight)) {
              throw new Error('')
            }

            let cart = JSON.parse(window.localStorage.getItem('mallAppCart') || '[]')
            let s = []

            if (this.$isArray(cart, true)) {
              for (let item of cart) {
                if (item.checked === true && item.removed !== true) {
                  s.push(item)
                }
              }
            }
            this.store = s
            this.calc()
          }).catch(err => {
            console.log(err)
            this.$Message.error(err.message || err.msg || '获取结算信息失败！')
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      },
      calc: function () {
        let c = 0
        let p = 0

        if (this.$isArray(this.store, true)) {
          for (let item of this.store) {
            c += item.number || 0
            p += (item.salesPrice || 0) * (item.number || 0)
          }
        }

        this.quantityCount = c
        this.priceCount = p
      },
      showItems: function () {
        if (!this.busy && this.$isArray(this.store, true)) {
          this.$router.push({
            path: '/mallapp/statementitems'
          })
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
      update: function () {
        this.busy = true
        let ids = []
        for (let item of this.store) {
          ids.push(item.id)
        }
        this.$http.post('/market/goods/wechat/customer/sku/list', {
          page: 1,
          size: 999999,
          queryFilter: [{property: 'id', op: 'in', value: ids.join(',')}],
          _loading: true
        }).then(res => {
          if (this.$isArray(res.content, true)) {
            for (let item of res.content) {
              let fi = this.store.find(o => {
                return item.id === o.id
              })
              if (fi) {
                Object.assign(fi, item)
                if (fi.stocks != null && !isNaN(fi.stocks) && fi.stocks > 0 && fi.number > fi.stocks) {
                  fi.number = fi.stocks
                }
              }
            }
            this.calc()
          }
        }).catch(err => {
          console.log(err)
        }).finally(() => {
          this.busy = false
        })
      },
      onAddressTap: function () {
        this.$router.push({
          path: '/mallapp/address'
        })
      },
      submit: function () {
        if (!this.busy && this.address) {
          this.busy = true
          this.$http.post('/wechat/customer/mallorder', {
            cartList: this.store,
            comment: this.comment,
            addressId: this.address.addressId,
            _loading: true
          }).then(res => {
            this.$Message.success('提交订单成功')
            let cart = JSON.parse(window.localStorage.getItem('mallAppCart') || '[]')
            let newCart = cart.filter(item => {
              return item.checked !== true
            })
            window.localStorage.setItem('mallAppCart', JSON.stringify(newCart))

            this.$parent.replaceRoute({
              path: '/mallapp/orderdetail',
              query: {
                id: res.orderId,
                action: 'pay'
              }
            })
          }).catch(err => {
            let msg = err.message || err.msg || '提交订单失败'
            let update = false
            if (err.hasOwnProperty('code')) {
              switch (err.code) {
                case 'MALL_GOODS_PRICE_ERROR':
                  msg = '部分商品的价格已经发生变化，将自动更新价格，请重新确认订单。'
                  update = true
                  break
                case 'MALL_GOODS_STOCK_ERROR':
                  msg = '部分商品的库存数量不足，将自动调整数量，请重新确认订单。'
                  update = true
                  break
              }
            }
            this.$Message.error(msg)
            if (update) {
              this.update()
            }
          }).finally(() => {
            this.busy = false
          })
        }
      }
    }
  }
</script>
