<style lang="less">
  .mobile-tracing {
    // @mainColor: #2d8cf0;  
    // @mainColor: #f90;
    @mainColor: #FF9800;
  
    .floatItem {
      float: left;
      width: 100%;
    }
    .container {
      header {
        height: 4rem;
        background: @mainColor;
        font-size: 1.2rem;
        line-height: 4rem;
        padding: 0 0.5rem;
        color: #fff;
        position: relative;
      }
      header.nav {
        background: #fff;
        height: auto;
        text-align: center;
        padding: 0.5rem;
        padding-top: 1rem;
        background-repeat: no-repeat;
        background-position-y: 40%;
        background-size: cover;
        background-image: url('../../../static/images/field.jpg'); 
        .avatar {
          display: block;
          background: @mainColor;
          margin: auto;
        }
        .name {
          color: #111;
          font-size: 0.7rem;
          height: 2rem;
          line-height: 2rem;
        }
      }
      > section {
        .floatItem;
        .item {
          .floatItem;
          padding: 0.5rem;
          font-size: 0.9rem;
          background: #fff;
          .name {
            float: left;
          }
          .value {
            float: right;
          }
        }
        .header {
          .floatItem;
          font-size: 1rem;
          // font-weight: bold;
          padding: 0.5rem;
          color: @mainColor;
        }
        .order {
          background: #f7f7f7;
          padding: 0.5rem 0.5rem;
          .floatItem;
          .item {
            font-size: 0.8rem;
            margin-bottom: 1px;
          }
          .sendinfo {
            display: flex;
            flex-flow: row nowrap;
            .dop {
              flex: 1;
              text-align: left;
              font-size: 0.7rem;
              // font-weight: bold;
            }
            .t-right {
              text-align: right;
            }
            .sendicon {
              flex: 1;
              display: flex;
              font-size: 1.5rem;
              color: @mainColor;
              i {
                display: block;
                margin: auto;
              }
            }
          }
        }
        .addsidepadding {
          padding: 0.5rem 0.5rem 0 0.5rem;
        }
        .nodata {
          display: flex;
          float: left;
          width: 100%;
          height: 4rem;
          padding: 0.5rem 0;
          background: #f7f7f7;
          >div {
            margin: 0;
            height: 3rem;
            background: #fff;
            width: 100%;
            text-align: center;
            line-height: 3rem;
          }
        }
        .little-header {
          color: #FF9800;
          margin-bottom: 0.5rem;
        }
      }
    }
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
</style>

<template>
  <Row justify="center" class="mobile-tracing">
    <Col span="24" class="container" v-if="!noData">
      <header class="nav">
        <Row type="flex" justify="space-between">
          <Col span="6" v-for="(item, index) in linkList" :key="index">
            <a :href="item.link">
              <Avatar class="avatar" :icon="item.icon" />
              <div class="name">{{item.name}}</div>
            </a>
          </Col>
        </Row>
      </header>

      <section class="produceinfo">
        <div class="header">基础信息</div>
        <div class="order" v-if="baseInfo">
          <div class="item">
            <span class="name">编码：</span>
            <span class="value">{{productId}}</span>
          </div>
          <div class="item">
            <span class="name">产品名称：</span>
            <span class="value">{{baseInfo.productName}}</span>
          </div>
          <div class="item">
            <span class="name">产品规格：</span>
            <span class="value">{{spec}}</span>
          </div>
          <div class="item">
            <span class="name">生产日期：</span>
            <span class="value">{{(produceInfo ? produceInfo.finishPrintTime : null)  | formatMilliseconds}}</span>
          </div>
          <div class="item">
            <span class="name">生产企业：</span>
            <span class="value">{{baseInfo.company || '德国阿格福莱农林环境生物技术股份有限公司'}}</span>
          </div>
          <div class="item">
            <span class="name">查询次数：</span>
            <span class="value">{{scanTimes}}次</span>
          </div>
           <div class="item">
            <span class="name">首次查询：</span>
            <span class="value">{{datetime | formatMToM}}</span>
          </div>
        </div>
        <div v-if="!baseInfo" class="nodata">
          <div>暂无数据</div>
        </div>
      </section>

      <section class="produceinfo">
        <div class="header">验证结果</div>
        <div class="order">
          <div class="item" style="text-align: center; font-size: 0.79rem">
            <span>
              您所查询的产品是德国阿格福莱生产的碧护正品，请放心使用
            </span>
          </div>
        </div>
      </section>

      <section class="logisticsinfo">
        <div class="header">产品流向</div>
        <div v-if="logisticsInfo">
          <div class="order addsidepadding" 
               v-for="(item, index) in logisticsInfo" 
               :key="item.orderId" 
               :style="index === (logisticsInfo.length - 1) ? {paddingBottom: '0.5rem'} : ''">
            <div class="item">
              <span class="name">箱流水码：</span>
              <span class="value">{{scanItemInfo ? scanItemInfo.qrcodeOrderCode : '-'}}</span>
            </div>
            <div class="item">
              <span class="name">收货经销商：</span>
              <span class="value">{{item.receivedCompany || '无'}}</span>
            </div>
            <div class="item">
              <span class="name">收货时间：</span>
              <span class="value">{{item.receivedTime | formatMilliseconds}}</span>
            </div>
          </div>
        </div>
        <div v-if="!logisticsInfo || logisticsInfo.length === 0" class="nodata">
          <div>暂无数据</div>
        </div>
      </section>
    </Col>
    <Col v-if="noData" class="loading">
      <Spin size="large"></Spin>
      <div class="loading-info">获取数据中</div>
    </Col>
  </Row>
</template>

<script>
import config from '@/config'

export default {
  data () {
    return {
      noData: false,
      spec: null,
      scanTimes: 0,
      baseInfo: {},
      scanItemInfo: {},
      produceInfo: null,
      logisticsInfo: null,
      datetime: null,
      done: false
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
      return this.$route.query.productType ? this.$route.query.productType : this.$route.path.split('/')[1].toLowerCase()
    },
    productId () {
      return this.$route.params.id || this.$route.query.id
    },
    linkList () {
      let that = this;

      return [
        {name: '防伪追踪', link: '#', icon: 'paper-airplane'}, 
        {name: '企业新闻', link: 'https://bihuch.kuaizhan.com/0/23/p4942887727d85e', icon: 'ios-paper-outline'}, 
        {name: '热门产品', link: 'https://bihuch.kuaizhan.com/17/0/p4854432632b3ff', icon: 'fireball'}, 
        {name: '精彩活动', link: `${config.host}/lottery?productType=${that.productType}&id=${that.productId}`, icon: 'ios-compose'}, 
        {name: '技术展示', link: 'http://mp.weixin.qq.com/mp/homepage?__biz=MjM5OTI2MTE3Mg==&hid=1&sn=31f77833a4cb02bdeea5da25720b3a8a#wechat_redirect', icon: 'images'}, 
        {name: '使用方法', link: 'https://bihuch.kuaizhan.com/70/81/p49431542782076', icon: 'android-hand'}, 
        {name: '微官网', link: 'https://bihuch.kuaizhan.com/19/26/p376303545fafcf', icon: 'map'}, 
        {name: '联系我们', link: 'https://bihuch.kuaizhan.com/35/45/p5046530793d2aa', icon: 'ios-telephone'}
      ];
    }
  },
  filters: {
    formatMilliseconds (value) {
      if (value) {
        let time = new Date(value);
        return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate() >= 10 ? time.getDate() : 0 + time.getDate().toString()}`;
      } else {
        return '无';
      }
    },
    formatMToM (value) {
      if (value) {
        return new Date(value).toLocaleString();
      } else {
        return '无';
      }
    }
  },
  methods: {
    wxRedirectTo (url) {
      return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.customerAppId}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=snsapi_userinfo&state=first#wechat_redirect`
    },
    getSpec (productInfo) {
      const typeName = {
        'units_case': productInfo.specCase,
        'units_bag': productInfo.specBag,
        'units_box': productInfo.specBox
      }
      this.spec = typeName[this.productType] || '未定义';
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
    getProductionInfo () {
      this.$http.get(
        `/origin/qrcode/${this.productId}`
      ).then(res => {
        ({
          productInfo: this.baseInfo,
          scanItemInfo: this.scanItemInfo,
          productionInfo: this.produceInfo,
          invoiceInfos: this.logisticsInfo,
          scanTimes: this.scanTimes,
          datetime: this.datetime
        } = res);

        this.getSpec(res.productInfo);
        
        this.done = true;
        this.noData = false;
      }).catch(err => {
        this.$Message.error(err.message || err.toString())
      })
    },
    checkLogin () {
      return this.$http.get(`/wechat/customer/user/session`)
    },
    doLogin () {
      if (!this.$route.query.code) {
        window.location.href = this.wxRedirectTo(window.location.href);
        return;
      }

      this.buildWX(res => {
        this.sendUserInfo(res)
        .then(this.getProductionInfo)
        .catch(err => {
          if (err.code === 'WECHAT_INVALID_CODE') {
            window.location.href = this.wxRedirectTo(window.location.origin + window.location.pathname);
          } else {
            this.$Message.error(err.message || err.toString())
          }
        })
      })
    }
  },
  beforeCreate () {
    this.$ScriptLinker('//res.wx.qq.com/open/js/jweixin-1.2.0.js');
  },
  mounted () {
    if (!this.$route.query.code) {
      window.location.href = this.wxRedirectTo(window.location.href);
      return;
    }
    
    this.checkLogin()
    .then(res => {
      if (res === 'COMM_WECHAT_NOT_LOGIN') {
        this.doLogin()
      } else if (res.id) {
        this.getProductionInfo()
      } else {
        this.$Message.error('登录错误，请联系管理员')
      }
    })
  }
}
</script>
