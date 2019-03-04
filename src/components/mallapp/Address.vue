<template>
  <div class="app-address app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1 v-if="editable">收货地址管理</h1>
        <h1 v-else>选择收货地址</h1>
      </div>
      <div class="app-banner-button right">
      </div>
    </div>

    <list-panel class="app-body app-common-body" :refreshable="false" :pageable="false"
                v-if="$isArray(store, true) && editable">
      <div class="app-list" slot="items">
        <div class="app-list-item" v-if="$isArray(store, true)" v-for="d in store" :key="d.addressId">
          <div class="app-address-base app-flex">
            <b>{{ d.contactUser }}</b>
            <b>{{ d.mobile }}</b><br/>
            <span>{{ d.provinceName }} {{ d.cityName }} {{ d.areaName }} {{ d.address }}</span>
          </div>
          <div class="app-address-opera">
            <Button type="text" :icon="d.selected ? 'ios-checkmark' : 'ios-circle-outline'"
                    @click.stop="setAsDefault(d)">
              设为默认
            </Button>
            <i class="app-flex"></i>
            <Button type="text" icon="ios-compose-outline" @click.stop="edit(d)">编辑</Button>
            <Button type="text" icon="ios-trash-outline" @click.stop="remove(d)">删除</Button>
          </div>
        </div>
      </div>
    </list-panel>

    <list-panel class="app-body app-common-body" :refreshable="false" :pageable="false"
                v-else-if="$isArray(store, true)">
      <div class="app-list" slot="items">
        <div class="app-list-item app-address-item" v-if="$isArray(store, true)" v-for="d in store"
             :key="d.addressId" @click.stop="select(d)">
          <div class="app-address-selected" v-if="isSelected(d)">
            <Icon type="ios-checkmark-empty"></Icon>
          </div>
          <div class="app-address-base app-flex">
            <b>{{ d.contactUser }}</b>
            <b>{{ d.mobile }}</b><br/>
            <span>{{ d.provinceName }} {{ d.cityName }} {{ d.areaName }} {{ d.address }}</span>
          </div>
          <div class="app-address-opera1">
            <Button type="text" icon="ios-compose-outline" @click.stop="edit(d)"></Button>
          </div>
        </div>
      </div>
    </list-panel>

    <div class="app-body app-common-body app-address-empty" v-if="!$isArray(store, true)">
      <h3>还没有收货地址，现在就去新建吧！</h3>
      <Button type="primary" icon="plus" class="horizontal" @click.stop="edit">新建收货地址</Button>
    </div>

    <div class="app-menus" v-else>
      <Button icon="plus" class="primary horizontal" @click.stop="edit">新建收货地址</Button>
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
        editable: false,
        store: null
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
        this.editable = this.$route.query.action === 'edit'
        this.load()
      },
      load: function (callback) {
        if (!this.busy) {
          this.busy = true
          this.$http.post('/wechat/customer/address/search', {
            page: 1,
            size: 9999,
            queryFilter: []
          }).then(res => {
            this.store = res.content
          }).catch(err => {
            console.log(err)
          }).finally(() => {
            this.busy = false
          })
        }
      },
      isSelected: function (d) {
        let selected = false
        if (this.$parent.receivingAddress != null && this.$parent.receivingAddress.addressId === d.addressId) {
          selected = true
        }
        return selected
      },
      select: function (d) {
        if (this.$isPlainObject(d)) {
          this.$parent.receivingAddress = d
          if (this.$route.query.cUrl) {
            this.$router.replace({
              path: '/mallapp/' + this.$route.query.cUrl
            })
          } else {
            this.back()
          }
        }
      },
      edit: function (d) {
        if (!this.busy) {
          let o = {}
          if (this.$isPlainObject(d) && d.hasOwnProperty('addressId')) {
            o.id = d.addressId
          }
          if (!this.editable && this.$route.query.cUrl) {
            o.cUrl = this.$route.query.cUrl
          }
          this.$router.push({
            path: '/mallapp/addressedit',
            query: o
          })
        }
      },
      remove: function (d) {
        if (!this.busy) {
          this.$parent.confirm('确定删除该地址吗？').then(() => {
            this.busy = true
            this.$http.delete(`/wechat/customer/address/${d.addressId}`, true).then(res => {
              let inx = this.store.findIndex((item) => {
                return item.addressId === d.addressId
              })
              this.store.splice(inx, 1)
              this.$Message.success('删除地址成功')
            }).catch(err => {
              this.$message.error(err.message || err.msg || '删除地址失败，请稍候重试')
            }).finally(() => {
              this.busy = false
            })
          })
        }
      },
      setAsDefault: function (d) {
        if (!this.busy && this.$isArray(this.store) && !d.selected) {
          this.busy = true
          this.$http.put(`/wechat/customer/address/${d.addressId}/default`, true).then(res => {
            for (let item of this.store) {
              if (item.selected) {
                item.selected = 0
                break
              }
            }
            d.selected = 1
            this.$Message.success('设置成功')
          }).catch(err => {
            this.$message.error(err.message || err.msg || '设置失败，请稍候重试')
          }).finally(() => {
            this.busy = false
          })
        }
      }
    }
  }
</script>
