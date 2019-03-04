<template>
  <div class="app-setting app-common-layout" v-if="store">
    <div class="app-banner bottom-border">
      <div class="app-banner-button">
        <Button type="text" icon="ivu-icon ivu-icon-ios-home"></Button>
      </div>
      <div class="app-banner-title category app-search">
        <form action="" style="width:100%">
          <input style="width:100%" type="search" v-model="keyword" placeholder="输入商品名称快速查找" @keydown="productByName"/>
        </form>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>
    <list-panel class="app-body app-common-body app-index-body" ref="productList" :refreshable="false" :pageable="false">
      <!-- <Carousel class="app-index-carousel"
        v-model="value"
        :autoplay="setting.autoplay"
        :autoplay-speed="setting.autoplaySpeed"
        :dots="setting.dots" :height="setting.height"
        :radius-dot="setting.radiusDot"
        :trigger="setting.trigger"
        :arrow="setting.arrow">
        <CarouselItem v-for="(item, inx) in detail && detail.pictures && detail.pictures.split(',')" :key="inx" @click.native="itemTap(detail)">
          <div><img style="width:100%;" :src="item"/></div>
        </CarouselItem>
      </Carousel> -->
      <div v-if="category && category.length !== 0" class="app-index-section">
      <h4 class="app-index-hot">推荐分类</h4>
      </div>
      <div class="app-index-quar">
        <div class="app-index-quaritem" v-for="d in category" :key="d.id" @click="product(d)">
          <img class="app-index-quarimg" :src="d.coverImage || '../../../static/images/test/1.jpg'">
          <p>{{d.categoryName}}</p>
        </div>
      </div>
      <div class="app-index-section">
        <h4 class="app-index-new">最新上架</h4>
        <div v-if="$isArray(store, true)" slot="items">
          <div class="app-production-group">
            <div class="app-index-item app-list-button" v-for="(item, inx) in store" :key="inx" @click="itemTap(item)">
              <div class="app-index-img"><img class="app-index-pic" :src="item.pictures && item.pictures.split(',')[0] || '../../../static/images/test/2.jpg'"/></div>
              <div class="app-index-info">
                <p class="app-index-title">{{item.goodsName}} {{item.specKey}}</p>
                <p class="app-index-bottom">
                  <p class="app-index-prize">¥<span>{{item.salesPrice /100}}</span>元<s>¥{{item.marketPrice /100}}</s></p>
                  <p class="app-index-spec">{{item.spec}}</p>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="app-index-bottom" @click="product">
        <h4>更多商品<Icon type="chevron-right" class="app-index-more"></Icon></h4>
      </div>
    </list-panel>
  </div>
</template>

<script>
  import Msg from '@/components/mallapp/Msg'
  import ListPanel from '@/components/mallapp/ListPanel'
  export default {
    components: {Msg, ListPanel},
    data () {
      return {
        busy: false,
        keyword: null,
        detail: null,
        store: null,
        category: null
      }
    },
    methods: {
      shown: function () {
        this.keyword = null;
        this.query();
        this.getcateGory();
      },
      queryAll: function () {
        this.query();
        this.queryPro();
      },
      itemTap: function (item) {
        this.$router.push({
          path: '/mallapp/detail',
          query: {
            id: item.goodsId,
            skuId: item.skuId
          }
        })
      },
      query: function () {
        this.busy = true
        let o = {
          page: 1,
          size: 10,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [{property: 'isOnShelf', op: '=', value: 0}, {property: 'stocks', op: '>', value: 0}],
          _loading: true
        }
        this.$http.post('/wechat/customer/market/goods/sku/search', o).then(res => {
          this.store = res.content
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品列表'))
        }).finally(() => {
          this.busy = false
        })
      },
      productByName: function (e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          if (this.keyword) {
            this.$router.push({
              path: '/mallapp/product',
              query: {
                productName: this.keyword
              }
            })
          }
        }
      },
      getcateGory: function () {
        this.error1 = null;
        let o = {
          _loading: true,
          page: 1,
          size: 4,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [{property: 'level', op: '=', value: '3'}, {property: 'isRecommend', op: '=', value: '0'}, {property: 'status', op: '=', value: '0'}]
          // queryFilter: [{property: 'isRecommend', op: '=', value: '0'}]
        }
        this.$http.post('/wechat/customer/market/goods/category/search', o).then(res => {
          console.log(res)
          this.category = res.content;
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品类别'))
        }).finally(() => {
          this.busy = false
        })
      },
      product: function (d) {
        this.$router.push({
          path: '/mallapp/product',
          query: {
            categoryId: d.id
          }
        })
      },
      mounted: function () {
        // this.query()
      }
    }
  }
</script>

<style lang="less">
.app-index{
  &-hot{
    background: url("../../../static/images/hot.svg") 1rem 0.8rem no-repeat;
    background-size: 2.2rem 2.2rem;
  }
  &-new{
    background: url("../../../static/images/new.svg") 1rem 0.8rem no-repeat;
    background-size: 2.2rem 2.2rem;
  }
  &-sale{
    background: url("../../../static/images/sale.svg") 1rem 0.8rem no-repeat;
    background-size: 2.2rem 2.2rem;
  }
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
    s{
      color: gray;
    }
  }
  &-spec{
    font-size: 0.8rem !important;
    color:#80848f;
  }
  &-section{
    h4{
      text-indent: 2.4rem;
      padding: 1rem;
      font-size: 1.2rem;
      letter-spacing: 0.1rem;
      border-bottom: 1px solid #e9eaec;
    }
  }
  &-more{
margin-left: 1rem;
  }
    &-quaritem{
      >p{
        position: absolute;
        bottom:0;
        left: 0;
        height: 30px !important;
        font-size: 1rem;
        line-height: 30px;
        padding-left: 0.2rem;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
        width: 100% !important;
        text-align: left !important;
        margin: 0 !important;
      }
    }
    &-quarimg{
      width: 10vw !important;
      height: 10vw !important;
      position: absolute;
      left: 0;
      right:0;
      top:0;
      bottom:0;
      margin: auto !important;
    }
  &-quar{
    :nth-child(1){
      width: 48vw;
      height: 50vw;
      margin: 1vw;
      >img{
      width: 30vw !important;
      height: 30vw !important;
      }
    }
    :nth-child(2){
      width: 48vw;
      height: 25vw;
      margin: 1vw;
    }
    :nth-child(3){
      width: 23vw;
      height: 23vw;
      margin: 1vw;
    }
    :nth-child(4){
      width: 23vw;
      height: 23vw;
      margin: 1vw;
    }
    >div{
      float: left;
      overflow: hidden;
      position: relative;
      background:white;
      text-align: center;
    }
    &:after{
      clear: both;
      display: table;
      content: '';
    }
  }
  &-bottom{
    h4{
      text-align: right;
      padding: 1rem;
      font-size: 1.2rem;
      letter-spacing: 0.1rem;
      border-bottom: 1px solid #e9eaec;
    }
  }
}
.app-banner-button{
  width:auto;
}
</style>
