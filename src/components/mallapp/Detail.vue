<template>
  <div class="app-product-detail app-common-layout" v-if="store">
    <div class="app-banner bottom-border">
      <div class="app-banner-button" @click="back">
        <Button type="text" icon="chevron-left"></Button>
      </div>
      <div class="app-banner-title">
        <h1>商品名称</h1>
      </div>
      <div class="app-banner-button right">
        <Msg></Msg>
      </div>
    </div>

    <list-panel class="app-body app-common-body" v-if="store && sku" :refreshable="!busy" @refresh="query" :pageable="false" @scroll="onScroll">
      <div class="app-product-detail-carousel" :style="{height: calcedCarouselHeight + 'px'}">
        <Carousel class="app-flex"
          v-model="value"
          :autoplay="setting.autoplay"
          :autoplay-speed="setting.autoplaySpeed"
          :dots="setting.dots" :height="carouselHeight"
          :radius-dot="setting.radiusDot"
          :trigger="setting.trigger"
          :arrow="setting.arrow">
          <CarouselItem v-for="(item, inx) in sku.pictures.split(',')" :key="inx" :style="{backgroundImage: `url(${item})`}">
          </CarouselItem>
        </Carousel>
      </div>

      <div class="app-list-item app-product-detail-info">
        <h1>{{store.goods.goodsName}}</h1>
        <div class=" app-statement-price-big app-statement-price-large app-product-detail-info-price">
          ¥{{(sku.salesPrice / 100).toFixed(2)}}元<s v-if="sku.marketPrice" class="app-product-detail-s">¥{{(sku.marketPrice / 100).toFixed(2)}}元</s>
        </div>

        <div class="app-product-detail-item">
          <h3>选择规格</h3>
          <div class="app-flex app-product-detail-specs">
            <div v-for="item in store.goodsSku" :class="{active: item.id === sku.id}"
                     @click="specTap(item)" :key="item.id" v-if="item.stocks > 0">{{item.spec}}
            </div>
          </div>
        </div>

        <div class="app-order-sep"></div>

        <div class="app-product-detail-item">
          <h3 class="app-flex">库存数量</h3>
          <h3>{{ sku.stocks || 0 }}</h3>
        </div>
        <div class="app-product-detail-item">
          <h3 class="app-flex">购买数量</h3>
          <quantity-panel :root="$parent" v-model="number"
                          :style="{marginRight: '1rem', alignSelf: 'center'}" :max="sku.stocks"></quantity-panel>
        </div>
      </div>

      <div class="app-product-detail-desc">
        <p class="app-product-detail-desc-title">商品介绍</p>
        <!-- <img alt="" class="" src="//img30.360buyimg.com/jgsq-productsoa/jfs/t9307/332/1187929069/366519/d59e5816/59b860b4N53f06414.jpg"> -->
        <div v-if="store.goods.goodsInfo" v-html="store.goods.goodsInfo"></div>
        <div v-if="!store.goods.goodsInfo" style="padding:1rem">还没有详情</div>
      </div>
    </list-panel>

    <div class="app-menus">
      <Button class="app-flex horizontal" icon="ios-cart" @click="gocart">购物车</Button>
      <Button class="primary big app-no-flex long" @click="cartPush">
        加入购物车
      </Button>
    </div>
    <!--<div v-show="cart && goodsInfo" class="cartPanel">
      <transition name="slide-fade">
        <div v-show="cart && goodsInfo" class="panel-main">
          <div class="panel-head">
            <div class="panel-head-img"><img src="/static/images/default-image.png"/></div>
            <div class="panel-head-info">
              <h4>¥{{model.price}}</h4>
              <p>{{model.spec}}</p>
            </div>
            <div class="panel-head-close" @click="closecart">
              <Icon type="close-round"></Icon>
            </div>
          </div>
          <div class="panel-content">
            <div class="spec">
              <h3>商品规格</h3>
              <div class="specList">
                <v-touch :class="item.id === $route.query.skuId ? 'active specitem' : 'specitem'" v-for="item in speclist" @tap="specTap(item)" :key="item.id">{{item.spec}}</v-touch>
              </div>
            </div>
            <div class="spec quaty">
              <h3>商品数量</h3>
              <quantity-panel :root="$parent" v-model="number"></quantity-panel>
            </div>
          </div>
          <div class="panel-foot" @click="cartPush">确定</div>
        </div>
      </transition>
    </div>-->
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
        value: 0,
        store: null,
        carouselHeight: document.body.offsetHeight * 0.5,
        calcedCarouselHeight: 0,
        number: 1,
        max: 1000,
        skuId: null,
        setting: {
          autoplay: false,
          autoplaySpeed: 2000,
          dots: 'inside',
          radiusDot: false,
          trigger: 'click',
          arrow: 'always'
        },
        goodsInfo: null,
        speclist: [],
        busy: false
      }
    },
    methods: {
      shown: function () {
        this.number = 1;
        this.skuId = this.$route.query.skuId
        this.query()
      },
      onScroll: function (e) {
        this.calcedCarouselHeight = this.carouselHeight - (e.target.scrollTop / 2)
      },
      closecart: function () {
        this.cart = false;
      },
      gocart: function () {
        this.$router.push({
          path: '/mallapp/cart'
        })
      },
      specTap: function (item) {
        this.skuId = item.id
        // this.max = item.
        /* this.$router.replace({
          path: '/mallapp/detail',
          query: {
            id: item.goodsId,
            skuId: item.id
          }
        })
        this.query() */
      },
      /**
       * 加入购物车
       * @param info 商品购买信息
       */
      cartPush: function () {
        if (this.number) {
          console.log(1)
        }
        let info = Object.assign(this.sku, {
          specId: this.sku.id,
          goodsName: this.store.goods.goodsName
        });
        if (this.$isPlainObject(info) && info.hasOwnProperty('goodsId') && info.hasOwnProperty('id')) {
          let cart = JSON.parse(window.localStorage.getItem('mallAppCart') || '[]')
          let exist = null
          for (let item of cart) {
            if (item.goodsId === info.goodsId && item.id === info.id) {
              exist = item
              break
            }
          }
          if (exist) {
            Object.assign(exist, info)
            if (exist.removed === true) {
              exist.removed = false
              exist.number = this.number
            } else {
              exist.number += this.number
            }
            if (info.stocks != null && !isNaN(info.stocks) && info.stocks > 0 && exist.number > info.stocks) {
              exist.number = info.stocks
            }
          } else {
            cart.push(Object.assign({}, info, {
              number: this.number,
              checked: true,
              waiting: false,
              removed: false
            }))
          }
          window.localStorage.setItem('mallAppCart', JSON.stringify(cart))
          this.$Message.success('添加购物车成功.')
        }
      },
      addCart: function () {
        this.cart = true;
      },
      back: function () {
        this.$router.back()
      },
      query: function () {
        this.busy = true
        this.$http.get(`/wechat/customer/market/goods/${this.$route.query.id}`).then(res => {
          this.calcedCarouselHeight = this.carouselHeight
          this.store = res
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('商品详情'))
        }).finally(() => {
          this.busy = false
        })
      }
    },
    computed: {
      sku: function () {
        let v = null
        if (this.store && this.store.hasOwnProperty('goodsSku') && this.skuId) {
          v = this.store.goodsSku.find(item => {
            return item.id === this.skuId
          })
        }
        return v
      }
    }
  }
</script>

<style lang="less">
  .app-product-detail {
    &-info {
      padding: 1rem 0;

      h1 {
        font-size: 1.5rem;
        padding: 0 1rem;
      }

      .app-statement-price {
        padding: 0 1rem;
      }
    }

    &-price {
      color: red;
      font-size: 1rem;
    }

    &-cost {
      color: red;
      font-size: 1rem;
    }

    &-desc {
      &-title {
        text-align: center;
        font-size: 1.3rem;
        padding: 10px;
        margin-bottom: 10px;
        border-top: 1px solid #e9eaec;
        border-bottom: 1px solid #e9eaec
      }

      img {
        max-width: 100%;
      }
    }

    &-item {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      margin: 1rem;

      h3 {
        font-size: 1rem;
        padding: .5rem 1rem .5rem 0;
      }
    }
    &-s{
      font-size: 1.2rem;
      color: gray;
      padding-left: 0.5rem;
    }
    &-info-price{
      padding-left: 1rem;
    }
    &-specs {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: left;

      > div {
        padding: 0.5rem 1rem;
        border: rgba(0, 0, 0, .1) solid 1px;
        border-radius: .2rem;
        margin: 0 .5rem .5rem 0;

        &.active {
          border-color: #2d8cf0;
          color: #2d8cf0;
        }
      }
    }

    &-carousel {
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;

      .ivu-carousel-item {
        background-repeat: no-repeat;
        background-position: center center;
        background-size: contain;
      }
    }
  }

  /*.category {
    display: flex;
  }

  .spec {
    padding: 10px;
  }

  .specList > .active {
    border: 1px solid #2d8cf0;
  }

  .specitem {
    padding: 0.5rem;
    width: 40%;
    text-align: center;
    border: 1px solid white;
  }

  .spec > h3 {
    padding: 6px;
  }

  //   .cartPanel{
  //     position: fixed;
  //     top:0;
  //     bottom:0;
  //     left: 0;
  //     right: 0;
  //     background: rgba(0, 0, 0, 0.5);
  //     width: 100%;
  //     height: 100%;
  //     z-index: 100000;
  //   }
  //   .panel-main{
  //     background: white;
  //     height: 300px;
  //     position: absolute;
  //     bottom:0;
  //     width: 100%;
  //     display: flex;
  //     flex-direction:column;
  //     justify-content:space-between;
  //   }
  //   .panel-head{
  //     padding-bottom: 10px;
  //     border-bottom:1px solid #e9eaec;
  //     display: flex;
  //     flex-direction:row;
  //     img{
  //       width: 100px;
  //       vertical-align: bottom;
  //       margin-top: -20px;
  //       margin-left: 10px;
  //     }
  //   }
  //   .panel-content{
  //     display: flex;
  //     flex-direction:column;
  //     flex-grow:1;
  //     flex-shrink:0;
  //     overflow-y: scroll;
  //     height: 0;
  //     .spec{
  //       width:100%;
  //     }
  //     .quaty{
  //       display: flex;
  //       flex-direction:row;
  //       justify-content:space-between;
  //     }
  //   }
  //   .panel-foot{
  //     font-size: 1.3rem;
  //     padding: .8rem 5rem;
  //     background: #2d8cf0;
  //     color:white;
  //     justify-content: center;
  //     align-items: center;
  //     display: flex;
  //   }
  //   .panel-head-img{
  //     width: 110px;

  //   }
  //   .panel-head-info{
  //     flex-grow:1;
  //     padding: 10px;
  //     display: flex;
  //     justify-content:flex-end;
  //     flex-direction:column;
  //     h4{
  //       color: red;
  //       font-size: 1.5rem;
  //     }
  //     p{

  //     }
  //   }
  //   .panel-head-close{
  //     width: 50px;
  //     justify-content: center;
  //     align-items: center;
  //     display: flex;
  //     font-size: 1.5rem;
  //     color: #bbbec4;
  //   }
  // .slide-fade-enter-active {
  //   transition: all .3s ease;
  // }
  // .slide-fade-leave-active {
  //   transition: all .3s ease;
  // }
  // .slide-fade-enter{
  //   transform: translateY(300px);
  // }
  // .slide-fade-leave-to
  // !* .slide-fade-leave-active for below version 2.1.8 *! {
  //   transform: translateY(500px);
  // }
  .box {
    background: white;
  }

  .quaty {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .number {
    margin-right: 1rem;
  }

  .detailContent img {
    max-width: 100% !important;
  }*/
</style>
