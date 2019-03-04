<template>
  <div class="app-setting app-common-layout" @click.stop="cancelItemMenu">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>购物车</h1>
      </div>
      <div class="app-banner-button right">
        <Button type="text" @click="onEdit" v-if="$isArray(store, true) && editing">完成</Button>
        <Button type="text" @click="onEdit" v-else-if="$isArray(store, true)">编辑</Button>
        <Msg></Msg>
      </div>
    </div>

    <list-panel v-if="!empty" ref="list" class="app-body app-common-body" :refreshable="!busy" :pageable="false"
                @refresh="load">
      <div slot="items" class="app-list app-cart-list">
        <v-touch class="app-list-item app-cart-item" v-for="d in store" :key="d.id" :data-date="d.id"
                 @press="onItemPress(d)" v-if="!d.removed">
          <v-touch class="app-cart-checkbox" @tap="onItemCheck(d)" @press="disableItemPress">
            <Icon :type="checkboxIcon(d)"></Icon>
          </v-touch>
          <v-touch class="app-cart-image" :style="{backgroundImage: getPicture(d)}" @tap="onItemTap(d)"></v-touch>
          <div class="app-cart-info">
            <v-touch tag="h1" @tap="onItemTap(d)">{{ d.goodsName }} {{ d.specKey }}</v-touch>
            <v-touch tag="h3" @tap="onItemTap(d)">{{ d.spec }}</v-touch>
            <div class="app-cart-sale">
              <span class="app-cart-price">{{ Number(d.salesPrice / 100).toFixed(2) }}</span>
              <quantity-panel :root="$parent" v-model="d.number" :max="d.stocks"
                              @press="disableItemPress"></quantity-panel>
            </div>
          </div>
          <div class="app-cart-menus app-item-menus" :class="{'app-cart-menus-show': current === d.id}">
            <Button type="error" @click.stop="removeItem(d)">删除</Button>
          </div>
        </v-touch>
      </div>
    </list-panel>

    <div v-else slot="items" class="app-body app-common-body app-address-empty">
      <h3>购物车里还没有商品哦，快去逛逛吧。</h3>
      <Button type="primary" icon="ios-home" class="horizontal" @click.stop="toHome">商城首页</Button>
    </div>

    <div class="app-menus" v-if="editing">
      <v-touch tag="label" class="app-cart-checkbox-all" @tap="onItemCheckAll($event)">
        <Icon :type="checkboxAllIcon()"></Icon>
        全选
      </v-touch>
      <div class="app-flex"></div>
      <Button class="primary big app-no-flex" :disabled="count === 0 || store.length === 0" @click="removeItem">删除<em>({{ count
        }})</em>
      </Button>
    </div>
    <div class="app-menus" v-else>
      <v-touch tag="label" class="app-cart-checkbox-all" @tap="onItemCheckAll($event)">
        <Icon :type="checkboxAllIcon()"></Icon>
        全选
      </v-touch>
      <div class="app-cart-sum app-flex">{{ Number(sum).toFixed(2) }}</div>
      <Button class="primary big app-no-flex" :disabled="count === 0 || store.length === 0" @click="submit">
        去结算<em>({{ count }})</em>
      </Button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'
  import QuantityPanel from '@/components/mallapp/QuantityPanel'
  import Msg from '@/components/mallapp/Msg'

  export default {
    components: {ListPanel, QuantityPanel, Msg},
    data () {
      return {
        editing: false,
        current: null,
        itemPressable: true,
        itemCancelable: true,
        busy: false,
        store: []
      }
    },
    methods: {
      /**
       * 后退至上一页
       */
      back: function () {
        this.$router.back()
      },
      toHome: function () {
        this.$router.push({
          path: '/mallapp/index'
        })
      },
      /**
       * 当进行编辑时
       */
      onEdit: function () {
        this.current = null
        this.editing = !this.editing
      },
      /**
       * 获取购物车数据
       * @param callback
       */
      load: function (callback) {
        if (!this.busy) {
          let cart = JSON.parse(window.localStorage.getItem('mallAppCart') || '[]')
          let ids = []
          for (let item of cart) {
            ids.push(item.id)
          }
          this.busy = true
          this.$http.post('/market/goods/wechat/customer/sku/list', {
            page: 1,
            size: 999999,
            queryFilter: [{property: 'id', op: 'in', value: ids.join(',')}],
            _loading: true
          }).then(res => {
            if (this.$isArray(res.content, true)) {
              for (let item of res.content) {
                let fi = cart.find(o => {
                  return item.id === o.id
                })
                if (fi) {
                  Object.assign(fi, item)
                  if (fi.stocks != null && !isNaN(fi.stocks) && fi.stocks > 0 && fi.number > fi.stocks) {
                    fi.number = fi.stocks
                  }
                }
              }
            }
          }).catch(err => {
            console.log(err)
          }).finally(() => {
            this.busy = false
            this.store = cart
          })
        }
        if (typeof callback === 'function') {
          callback()
        }
      },
      /**
       * 获取指定项的勾选图标
       * @param item
       * @returns {string}
       */
      checkboxIcon: function (item) {
        let icon = 'ios-circle-outline'
        if (this.$isPlainObject(item) && item.hasOwnProperty('id')) {
          if (this.editing) {
            icon = item.waiting ? 'ios-checkmark' : 'ios-circle-outline'
          } else {
            icon = item.checked ? 'ios-checkmark' : 'ios-circle-outline'
          }
        }
        return icon
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
       * 获取全选的勾选图标
       */
      checkboxAllIcon: function () {
        let icon = 'ios-circle-outline'
        if (this.$isArray(this.store, true)) {
          let field = this.editing ? 'waiting' : 'checked'
          let hasUncheck = false

          for (let item of this.store) {
            if (item[field] !== true) {
              hasUncheck = true
              break
            }
          }

          icon = hasUncheck ? 'ios-circle-outline' : 'ios-checkmark'
        }
        return icon
      },
      /**
       * 当点击指定项的勾选框时
       * @param item
       */
      onItemCheck: function (item) {
        if (!this.busy && this.$isPlainObject(item) && item.hasOwnProperty('id')) {
          this.editing ? item.waiting = !item.waiting : item.checked = !item.checked
        }
      },
      /**
       * 当点击全选的勾选框时
       * @param e
       */
      onItemCheckAll: function (e) {
        if (!this.busy && this.$isArray(this.store, true)) {
          let target = e.target.tagName === 'LABEL' ? e.target.children[0] : e.target
          let checked = target.classList.contains('ivu-icon-ios-circle-outline')
          let field = this.editing ? 'waiting' : 'checked'
          for (let item of this.store) {
            item[field] = checked
          }
        }
      },
      /**
       * 当长按指定项时
       * @param item
       */
      onItemPress: function (item) {
        if (this.itemPressable && !this.busy && !this.editing) {
          this.current = item.id
          this.itemCancelable = false
        }
        this.itemPressable = true
      },
      /**
       * 当点击指定项时
       * @param item
       */
      onItemTap: function (item) {
        if (!this.busy) {
          if (this.editing) {
            this.onItemCheck(item)
          } else {
            if (this.current) {
              this.current = null
            } else {
              this.$router.push({
                path: '/mallapp/detail',
                query: {
                  id: item.goodsId,
                  skuId: item.id
                }
              })
            }
          }
        }
      },
      /**
       * 禁止长按
       */
      disableItemPress: function () {
        this.itemPressable = false
      },
      /**
       * 当页面退出（隐藏）时
       */
      hidden: function () {
        this.editing = false
        this.current = null
        this.itemPressable = true
        this.itemCancelable = true
      },
      /**
       * 当页面进入（显示）时
       */
      shown: function () {
        this.editing = false
        this.load()
      },
      /**
       * 当数据发生改变时
       * @param newValue
       */
      onStoreChanged: function (newValue) {
        window.localStorage.setItem('mallAppCart', JSON.stringify(newValue))
      },
      /**
       * 从购物车中移除指定项
       * @param item
       */
      removeItem: function (item) {
        if (!this.busy && this.$isArray(this.store, true)) {
          if (this.$isPlainObject(item)) {
            for (let s of this.store) {
              if (s.id === item.id) {
                s.removed = true
                break
              }
            }
          } else if (this.editing && this.count > 0) {
            this.$parent.confirm(`确认要删除这${this.count}种商品吗？`).then(() => {
              for (let s of this.store) {
                if (s.waiting === true) {
                  s.removed = true
                }
              }
            })
            this.editing = false
          }
        }
      },
      submit: function () {
        if (!this.busy && !this.editing && this.count > 0) {
          this.busy = true
          this.$parent.checkReceivingAddress('statement', () => {
            this.busy = false
          })
        }
      },
      cancelItemMenu: function () {
        if (this.itemCancelable) {
          this.current = null
        }
        this.itemCancelable = true
      }
    },
    computed: {
      sum: function () {
        let d = 0
        if (this.$isArray(this.store, true)) {
          for (let item of this.store) {
            if (!item.removed && item.checked) {
              d += (item.salesPrice || 0) * (item.number || 0)
            }
          }
        }
        return d / 100
      },
      count: function () {
        let c = 0
        if (this.$isArray(this.store, true)) {
          let field = this.editing ? 'waiting' : 'checked'
          for (let item of this.store) {
            if (!item.removed && item[field] === true) {
              c += item.number
            }
          }
        }
        return c
      },
      empty: function () {
        let c = 0
        if (this.$isArray(this.store, true)) {
          for (let item of this.store) {
            if (!item.removed) {
              c++
            }
          }
        }
        return c === 0
      }
    },
    watch: {
      store: {
        deep: true,
        handler: 'onStoreChanged'
      }
    }
  }
</script>
