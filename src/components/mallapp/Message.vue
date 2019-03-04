<template>
  <div class="app-setting app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-button" @click="back">
        <Button type="text" icon="chevron-left"></Button>
      </div>
      <div class="app-banner-title">
        <h1>消息</h1>
      </div>
      <div class="app-banner-button right">

      </div>
    </div>
    <div  class="app-message-tab">
      <div><span @click="tab(true)" :class="isread ? 'app-message-active' : ''">全部</span></div>
      <div><span @click="tab(false)" :class="!isread ? 'app-message-active' : ''">未读</span></div>
    </div>
    <div class="app-body app-common-body">
      <list-panel ref="productList" :refreshable="!busy" :pageable="!last" @nextpage="queryByPage">
        <div v-if="$isArray(store, true)" slot="items">
          <div class="app-message-item" v-for="(item, inx) in store" :key="inx">
            <p class="app-message-time">{{new Date(item.createdTime).toLocaleString()}}</p>
            <div class="app-message-info">
              <div class="app-message-left">
                <h5>{{item.title}}</h5>
                <p>{{item.content}}</p>
              </div>
              <div class="app-message-right" @click="del(item.id)">删除</div>
            </div>
          </div>
        </div>
        <div v-else slot="items" class="app-list-empty">
          {{ keyword ? '没有查询到消息' : '目前还没有消息' }}
        </div>
      </list-panel>
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
        isread: true,
        scrollTo: null,
        keyword: null,
        unreadList: [],
        page: 1,
        size: 10,
        last: true,
        store: null,
        storeObject: null
      }
    },
    methods: {
      shown: function () {
        this.$parent.getUserInfo().then(res => {
          this.shunt()
        }).catch(err => {
          this.$Message.error(err.message || err.msg || '用户未登录')
        })
      },
      tab: function (bol) {
        this.isread = bol;
        this.resetParams()
        if (bol) {
          // 全部
          this.queryAll()
        } else {
          // 未读
          this.queryUnread()
        }
      },
      del: function (id) {
        this.$http.put('/wechat/customer/mobile/msg/delete', {'ids': [id]}).then(res => {
          if (this.isread) {
            this.queryAll()
          } else {
            this.queryUnread()
          }
        }).catch(res => {
          this.$Message.error('消息删除失败')
        }).finally(() => {
          this.busy = false
        })
      },
      update: function () {
        if (this.unreadList.length !== 0) {
          this.$http.put('/wechat/customer/mobile/msg/status', {'isread': 1, 'ids': this.unreadList}).then(res => {

          }).catch(res => {
            this.$Message.error('标记已读失败')
          }).finally(() => {
            this.busy = false
          })
        }
      },
      shunt: function () {
        let qs = this.$route.query
        if (qs.unread) {
          this.isread = false;
          this.queryUnread()
        } else {
          this.isread = true;
          this.queryAll()
        }
      },
      back: function () {
        this.$router.back()
      },
      resetParams: function () {
        this.last = true
        this.page = 1
      },
      queryByPage: function (callback) {
        this.page += 1
        this.query(callback)
      },
      queryUnread: function () {
        this.busy = true
        let o = {
          page: this.page,
          size: this.size,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [],
          _loading: true
        }
        this.$http.post('/wechat/customer/mobile/msg/searchByUnRead', o).then(res => {
          if (this.page <= 1) {
            this.store = []
            this.storeObject = {}
          }
          this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
          this.store = res.content
          this.unreadList = [];
          for (let item of res.content) {
            this.unreadList.push(item.id)
          }
        }).catch(res => {
          this.$Message.error('未读消息列表')
        }).finally(() => {
          this.update()
          this.busy = false
        })
      },
      queryAll: function (callback) {
        this.busy = true
        let o = {
          page: this.page,
          size: this.size,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [],
          _loading: true
        }
        this.$http.post('/wechat/customer/mobile/msg/search', o).then(res => {
          if (this.page <= 1) {
            this.store = []
            this.storeObject = {}
          }
          this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
          this.store = res.content
        }).catch(res => {
          this.$Message.error('消息列表')
        }).finally(() => {
          this.busy = false
          if (typeof callback === 'function') callback()
        })
      }
    },
    watch: {
      $route: 'shunt'
    }
  }
</script>

<style lang="less">
.app-message{
  &-item{
    color:#495060;
    border-bottom: 1px solid #e9eaec;
    padding: 0.5rem;
  }
  &-time{
    text-align: center;
    padding:0.4rem;
  }
  &-tab{
    border-bottom:1px solid #e9eaec;
    display: flex;
    align-items: center;
    justify-content:center;
    div{
      padding: 0.6rem;
      span{
        padding: 0.6rem;
      }
    }
  }
  &-active{
    border-bottom:2px solid red;
    color: red;
  }
  &-info{
    padding: 0.4rem;
    background: white;
    color: #1c2438;
    display: flex;
    flex-direction: row;
    // p{
    //   text-indent: 1rem;
    //   color: #495060;
    // }
  }
  &-left{
    flex-grow :8;
    p{
      text-indent: 1rem;
    }
  }
  &-right{
    flex-grow :1;
    text-align: center;
    align-self:center;
    color: red;
  }
}
</style>

