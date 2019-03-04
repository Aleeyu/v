<style lang="less" scoped>
  .mobile-tracing {
    background: #7bb82f url("../../../static/images/action/actionbg.jpg") no-repeat;
    background-position: 0 0;
    background-size: 100%;
    .succ{
      width: 70vw;
      height: 100vh;
    }
    .fail{
      width: 60vw !important;
      padding-top: 7rem;
    }
    .failtxt{
      padding-top: 1rem;
      font-size: 1rem;
      color:white;
    }
    .title{
      width: 100vw;
      text-align: center;
      color: white;
      font-size: 1.5rem;
      padding-top:36vh;
      font-weight: normal;
    }
    .bag{
      width: 100vw;
      text-align: center;
      img{
        width: 75%;
      }
    }
    .btn{
      position: absolute;
      right:20px;
      width: 13vw;
    }
    .desc{
      width: 100vw;
      padding: 1rem;
      color: white;
      // position: fixed;
      // bottom: 0;
      p{
        text-indent: 1rem;
      }
    }
    .succbox{
      z-index: 10001;
      position: fixed;
      text-align: center;
      width: 100vw;
      height: 100%;
      background: rgba(0,0,0,0.9);
      img{
        // padding-top:5rem;
        width: 100vw;
      }
      .close{
        position: absolute;
        right:20px;
        top:3rem;
        font-size: 40px;
        color: white;
        z-index: 100000;
      }
      .prize{
        position: absolute;
        right:0;
        left:0;
        top:0;
        bottom:0;
        font-size: 40px;
        color: red;
        text-align: center;
        line-height: 100vh;
        .squar{
          font-size: 0.8rem;
        }
      }
    }
    @mainColor: #FF9800;
    .loading {
      position: fixed;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      .loading-info {
        margin: 1rem 0;
      }
      .ivu-spin-large .ivu-spin-dot {
        margin: auto;
      }
    }
  }
  .award{
    min-height: 50vh;
    padding: 1rem;
    text-align: center;
    color: white;
    font-size: 1.2rem;
    line-height: 10vh;
  }
  .mobile-tracing{
    min-height: 100vh;
  }
</style>

<template>
  <Row justify="center" class="mobile-tracing" v-if="!noData">
    <Col span="24" class="container">
        <div class="succbox" v-if="showPrize">
          <p class="close" @click="close"><Icon type="close"></Icon></p>
          <img class="succ" src="../../../static/images/action/succ.png"/>
          <span class="prize">{{prize.money}}<span class="squar">元</span><p v-if="!send">请重新扫码收取红包</p></span>
        </div>
        <div class="succbox" v-if="showNoPrize">
          <p class="close" @click="close"><Icon type="close"></Icon></p>
          <img class="fail" src="../../../static/images/action/app-logo.png"/>
        </div>

        <img @click="gotrack" class="btn" src="../../../static/images/action/btn.png"/>

        <h2 class="title">{{model.eventName}}</h2>
        <div class="bag" v-if="award && !error"><img src="../../../static/images/action/bag.png" @click="getprize"/></div>
        <div v-if="!award && !error" class="award">
          <p v-if="model.promPrizeRecord && model.promPrizeRecord.winMoney !==0">您已获得{{model.promPrizeRecord && model.promPrizeRecord.winMoney}}元红包，若没有收到请稍后重新扫码</p>
          <p v-if="model.promPrizeRecord && model.promPrizeRecord.winMoney === 0">此二维码已参加过活动！</p>
        </div>
        <div v-if="error" class="award">{{error}}</div>
        <div v-if="award && !error" class="desc">
          <h5>活动描述：</h5>
          <p>{{model.eventDescribe}}</p>
        </div>
    </Col>
  </Row>
</template>

<script>
import config from '@/config'

export default {
  data () {
    return {
      error: null,
      send: true,
      award: true,
      noData: true,
      showPrize: false,
      showNoPrize: false,
      model: {
        eventName: '',
        eventDescribe: '暂无法参与活动！'
      },
      prize: {
        money: 0
      }
    }
  },
  metaInfo () {
    return {
      meta: [
        {name: 'viewport', content: 'width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no'},
        {name: 'apple-mobile-web-app-capable', content: 'yes'},
        {'http-equiv': 'Cache-Control', content: 'no-siteapp'},
        {name: 'format-detection', content: 'telephone=no'},
        {'http-equiv': 'x-rim-auto-match', content: 'none'}
      ]
    }
  },
  computed: {
    productType () {
      return this.$route.query.productType || this.$route.path.split('/')[1].toLowerCase()
    },
    id () {
      return this.$route.query.id || this.$route.params.id
    }
  },
  methods: {
    gotrack () {
      this.$router.back()
    },
    getprize () {
      this.showPrize = false;
      this.showNoPrize = false;
      this.$http.post(
        `/wechat/customer/promo/prizeRecord?qrCodeId=${this.id}`
      ).then(res => {
        if (!res.result) {
          // 没有中奖
          this.showNoPrize = true;
        } else {
          // 中奖
          if (res.sendRedPackage) {
            // 红包发送成功
            this.send = true;
          } else {
            this.send = false;
          }
          this.prize.money = res.number;
          this.showPrize = true;
        }
      }).catch(res => {
        if (res.code === 'EVENT_SENDREDPACKAGE_ERROR') {
          this.$Message.error('服务器异常，请重新扫码再试！')
        } else {
          this.$Message.error(res.message)
        }
      })
    },
    close () {
      this.showPrize = false;
      this.showNoPrize = false;
    },
    wxRedirectTo (url) {
      return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.customerAppId}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=snsapi_userinfo&state=first#wechat_redirect`
    },
    buildWX (cb) {
      const self = this;
      this.$http.get(
        `/wechat/customer/jssdk/wxconfig?url=${encodeURIComponent(window.location.href)}`
      ).then(res => {
        window.wx.ready(() => {
          console.log('start to get location info');
          self.getLocation(cb)
        })
        window.wx.error(err => {
          console.log('wxJDK build error' + JSON.stringify(err));
        })
        window.wx.config(Object.assign(res, {
          debug: false,
          jsApiList: ['getLocation']
        }))
      })
    },
    getLocation (cb) {
      window.wx.getLocation({
        type: 'wgs84',
        success (location) {
          cb(location)
        }
      })
    },
    sendUserInfo (info) {
      return this.$http.post(
        `/wechat/customer/user/session`,
        {
          code: this.$route.query.code,
          latitude: info.latitude || 0,
          longitude: info.longitude || 0
        }
      )
    },
    getAction () {
      if (this.productType === 'UNITS_BAG' || this.productType === 'units_bag') {
        // 袋码才参加活动
        this.$http.post(
          `/wechat/customer/promo/getByQRCode?qrCodeId=${this.id}`
        ).then(res => {
          if (res.promPrizeRecord === null) {
            //  没有中奖信息，显示抽奖页面
            this.award = true
          } else {
            this.award = false
          }
          this.model = res;
          this.noData = false;
        }).catch(res => {
          if (res.message) {
            this.award = false
            this.model.eventName = '暂无法参与活动'
            this.error = res.message;
            this.noData = false;
          } else {
            this.award = false
            this.model.eventName = '暂无营销活动'
            this.error = '还没设置营销活动哦';
            this.noData = false;
          }
          // if (res.code === 'EVENT_NO_PARTICIPATE' || res.code === 'EVENT_NOT_STARTED' || res.code === 'EVENT_STOPPED' || res.code === 'EVENT_NO_NOT_STARTED') {
          //   // 没有活动
          //   this.award = false
          //   this.model.eventName = '暂无营销活动'
          //   this.error = '还没设置营销活动哦';
          //   this.noData = false;
          // } else {
          //   this.award = false
          //   this.model.eventName = '暂无法参与活动'
          //   this.error = res.message;
          //   this.noData = false;
          // }
        })
      } else {
        this.noData = true;
        this.gotrack()
      }
    }
  },
  mounted () {
    this.getAction()
  }
}
</script>
