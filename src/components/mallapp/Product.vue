<template>
  <div class="app-setting app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-button" @click="back">
        <Button type="text" icon="chevron-left"></Button>
      </div>
      <div class="app-banner-title category app-search">
        <form action="" style="width:100%">
          <input ref="inp" style="width:100%" type="search" v-model="keyword" placeholder="输入商品名称快速查找" @keydown="queryByManual"/>
        </form>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>
    <list-panel class="app-body app-common-body app-product-body" ref="productList" :refreshable="false" :pageable="!last" @nextpage="queryByPage">
      <div v-if="$isArray(store, true)" slot="items">
        <div class="app-production-group">
          <div class="app-product-item app-list-button" v-for="(item, inx) in store" :key="inx" @click="itemTap(item)">
            <div class="app-product-img"><img class="app-product-pic" :src="item.pictures && item.pictures.split(',')[0] || '/static/images/default-image.png'"/></div>
            <div class="app-product-info">
              <p class="app-product-title">{{item.goodsName}} {{item.specKey}}</p>
              <p class="app-product-bottom">
                <p class="app-product-prize">¥<span>{{item.salesPrice /100}}</span>元</p>
                <p class="app-product-spec">{{item.spec}}</p>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-else slot="items" class="app-list-empty">
        {{ keyword ? '没有查询到商品信息' : '目前还没有商品信息' }}
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
        scrollTo: null,
        keyword: null,
        page: 1,
        size: 10,
        last: true,
        store: null,
        storeObject: null
      }
    },
    methods: {
      shown: function () {
        this.shunt()
      },
      shunt: function () {
        this.keyword = null;
        let qs = this.$route.query
        if (qs.productName) {
          this.keyword = qs.productName
        }
        this.$refs.inp.focus()
        this.resetParams()
        this.query()
      },
      back: function () {
        this.$router.back()
      },
      resetParams: function () {
        this.last = true
        this.page = 1
      },
      queryByPage: function () {
        this.page += 1
        this.query()
      },
      queryByManual: function (e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          this.resetParams()
          this.query()
        }
      },
      query: function () {
        this.busy = true
        let o = {
          page: this.page,
          size: this.size,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [{property: 'isOnShelf', op: '=', value: 0}, {property: 'stocks', op: '>', value: 0}],
          _loading: true
        }
        if (this.keyword) {
          o.queryFilter.push({property: 'goodsName', op: 'like', value: this.keyword})
          if (this.$route.query.categoryId) {
            o.queryFilter.push({property: 'categoryThreeId', op: '=', value: this.$route.query.categoryId})
          }
        } else {
          if (this.$route.query.productName) {
            o.queryFilter.push({property: 'goodsName', op: 'like', value: this.$route.query.productName})
          }
          if (this.$route.query.categoryId) {
            o.queryFilter.push({property: 'categoryThreeId', op: '=', value: this.$route.query.categoryId})
          }
        }
        this.$http.post('/wechat/customer/market/goods/sku/search', o).then(res => {
          if (this.page <= 1) {
            this.store = []
            this.storeObject = {}
          }
          this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
          this.store = this.store.concat(res.content)
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品列表'))
        }).finally(() => {
          this.busy = false
        })
      },
      itemTap: function (item) {
        this.$router.push({
          path: '/mallapp/detail',
          query: {
            id: item.goodsId,
            skuId: item.skuId
          }
        })
      }
    }
  }
</script>

<style lang="less">
.app-product{
  &-item{
    color:#495060;
    border-bottom: 1px solid #e9eaec;
    display: flex;
    flex-flow:row;
    background: white;
  }
  &-pic{
    width: 8rem;
    height: 8rem;
    vertical-align: middle;
  }
  &-info{
    padding: 8px;
    display: flex;
    flex-direction:column;
    justify-content:space-between;
    flex:1;
  }
  &-img{
        width: 8rem;
        padding: 4px;
  }
  &-title{
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 1rem
  }
  &-bottom{
    display: flex;
    flex-direction:column;
    justify-content:space-between;
    flex:1;
  }
  &-prize{
    color: red;
    font-size: 1rem;
    span{
      font-size: 1.4rem;
    }
  }
  &-spec{
    font-size: 0.8rem !important;
    color:#80848f;
  }
}
.app-banner-button{
  width:auto;
}
</style>
