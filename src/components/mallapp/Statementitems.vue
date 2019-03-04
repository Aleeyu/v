<template>
  <div class="app-statement app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>商品清单</h1>
      </div>
      <div class="app-banner-button right">
        <Button type="text">共{{ quantityCount }}件</Button>
      </div>
    </div>
    <list-panel class="app-body app-common-body" :refreshable="false" :pageable="false">
      <div class="app-list" slot="items">
        <div class="app-list-item app-cart-item" v-if="$isArray(store, true)" v-for="d in store">
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
    </list-panel>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        store: null,
        quantityCount: null
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
        // this.address = this.$parent.receivingAddress
        this.load()
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
      load: function (callback) {
        if (!this.busy) {
          let cart = JSON.parse(window.localStorage.getItem('mallAppCart') || '[]')
          let s = []
          let c = 0
          if (this.$isArray(cart, true)) {
            for (let item of cart) {
              if (item.checked === true) {
                s.push(item)
                c += item.number || 0
              }
            }
          }
          this.store = s
          this.quantityCount = c
        }
      }
    },
    mounted: function () {
      this.load()
    }
  }
</script>
