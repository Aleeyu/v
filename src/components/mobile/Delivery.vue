<style lang="less" scoped>
  .container {
    > div {
      width: 100%;
    }
    header {
      height: 4rem;
      background: #2d8cf0;
      font-size: 1.2rem;
      line-height: 4rem;
      padding: 0 0.5rem;
      color: #fff;
      position: relative;
      .save {
        position: absolute;
        right: 1rem;
        top: 0rem;
        font-size: 1.5rem;
      }
      .scan {
        position: absolute;
        right: 4rem;
        top: 0rem;
        font-size: 1.5rem;
      }
    }
    .main {
      padding: 0.5rem;
      label {
        display: block;
        margin: 0.3rem 0;
      }
      .list {
        height: 25rem;
        // background: #f7f7f7;
      }
      .list-table {
        margin: 0.5rem 0;
      }
      .scan {
        display: flex;
        > div {
          margin: auto;
        }
        .scan-button {
          font-size: 3rem;
          color: #2d8cf0;
        }
      }
    }
  }
  .show-detail {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: rgba(55, 55, 55, 0.6);
    display: flex;
    z-index: 1000;
    .detail-container {
      margin: auto;
      margin-top: 30%;
      width: 95%;
      background: #fff;
      box-sizing: border-box;
      padding: 0 1rem;
      border-radius: 0.5rem;
      > div {
        float: left;
        width: 100%;
        margin: 0.5rem 0;
      }
      header {
        height: 2rem;
        line-height: 2rem;
        font-weight: bold;
        margin: 0.5rem 0;
        border-bottom: 1px solid #DDDEE1;
      }
      span {
        float: right;
      }
      .detail-list {
        ul {
          float: right;
        }
      }
      .action {
        margin: 1rem 0;
      }
    }
  }
</style>

<template>
  <Row justify="center">
    <Col span="24">
      <div class="container">
        <header>
          新建发货
          <div class="save" @click="saveInvoice"><Icon type="checkmark-round" ></Icon></div>
          <div class="scan" @click="scan"><Icon class="scan-button" type="qr-scanner"></Icon></div>
        </header>

        <section class="main" v-if="editInfo">
          <label for="">请选择收货经销商</label>
          <select v-model="dealer" style="width:100%">
            <option v-for="item in dealerlist" :value="item.name" :key="item.id">{{ item.name }}</option>
          </select>
          <label for="">请选择实际发货日期</label>
          <input v-model="sendTime" type="date" style="width: 100%;margin-bottom: 0.3rem" />
          <Table :height="devHeight - 224" :columns="listcol" :data="list" no-data-text="暂未扫码，无商品数据" class="list-table"></Table>
        </section>
        <error-view v-if="!editInfo" :error="error" name="发货" :loading="false"></error-view>
      </div>

      <!-- 发货信息复查弹框 -->
      <section v-if="showDetail" class="show-detail">
        <div class="detail-container">
          <header>发货单信息复查</header>
          <div>发货单号： <span>{{resOrderInfo.code}}</span></div>
          <div>收货经销商： <span>{{resOrderInfo.receivedDepName}}</span></div>
          <div class="detail-list">
            发货列表：
            <ul>
              <li v-for="item in resOrderInfo.itemList" :key="item.id">{{item.productName}}：{{item.amountInfo}}</li>
            </ul>
          </div>
          <div class="action"><Button type="primary" long @click="confirmDetail">确定</Button></div>     
        </div>
      </section>
      
    </Col>
  </Row>
</template>

<script>
export default {
  data () {
    return {
      error: null,
      wxJDK: null,
      editInfo: true,
      dealerlist: [],
      dealer: '',
      sendTime: '',
      listcol: [
        {
          title: '产品名称',
          key: 'productName'
        },
        {
          title: '包装方式',
          key: 'type'
        }, {
          title: '二维码ID',
          key: 'showQR'
        }, {
          title: '操作',
          key: 'action',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.list.splice(params.index, 1);
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      list: [],
      resOrderInfo: {},
      showDetail: false
    }
  },
  computed: {
    devHeight () {
      return document.documentElement.clientHeight;
    }
  },
  methods: {
    initSendTime () {
      let time = new Date();
      let day = time.getDate() >= 10 ? time.getDate() : 0 + time.getDate().toString()
      this.sendTime = `${time.getFullYear()}-${time.getMonth() + 1}-${day}`;
    },
    getSubDealer () {
      this.$http.post(`/system/wechat/dealermg/dealers`, {
        _loading: true,
        page: 1,
        size: 10000,
        orderBy: [
          {property: 'createdTime', order: 'desc'}
        ],
        queryFilter: [
          {property: 'status', op: '=', value: '0'},
          {property: 'parentId', op: '=', value: this.$store.state.wechat.userInfo.dealerId}
        ]
      }).then(res => {
        this.dealerlist = res.content;
      }).catch(err => {
        this.editInfo = false;
        this.error = {title: '获取下级经销商错误', content: err.message};
      });
    },
    buildWX () {
      this.$http.get(`/wechat/dealermg/jssdk/wxconfig?url=${encodeURIComponent(window.location.href)}`).then(res => {
        window.wx.ready(() => {
          console.log('wxJDK get ready')
        })
        window.wx.error(res => {
          console.log('wxJDK build error' + JSON.stringify(res));
        })
        window.wx.config(Object.assign(res, {
          debug: false,
          jsApiList: ['scanQRCode']
        }))
      }).catch(err => {
        this.$Message.error({content: typeof err === 'object' ? JSON.stringify(err) : err});
      })
    },
    saveInvoice () {
      const self = this;

      let selected = {};
      self.dealerlist.forEach(element => {
        if (element.name === self.dealer) selected = element;
      }, this);
      
      // 使用原生表单控件，需手动进行输入校验
      if (!self.dealer) {
        return self.$Message.error('未选择下级经销商');
      } else if (!self.sendTime) {
        return self.$Message.error('未选择发货时间');
      } else if (self.list.length === 0) {
        return self.$Message.error('暂无扫码商品进行发货');
      }

      self.$Modal.confirm({
        title: '发货提醒',
        content: '确定发货吗？',
        onOk: () => {
          self.$http.post(`/system/wechat/dealermg/storeInvoice`, {
            _loading: true,
            info: '',
            receivedDep: selected.id,
            receivedDepName: selected.name,
            sendTime: new Date(self.sendTime).getTime(),
            detailList: self.list
          }).then(res => {
            self.resOrderInfo = res;
            self.showDetail = true;
          }).catch(err => {
            self.$Message.error(`发货失败，错误为：${typeof err === 'object' ? JSON.stringify(err) : err.toString()}`)
          })
        }
      });
    },
    handleQR (qr) {
      let arr = qr.split('/');
      return arr[arr.length - 1];
    },
    filterType (type) {
      const typeName = {
        'UNITS_BOX': '箱',
        'UNITS_CASE': '盒',
        'UNITS_BAG': '袋'
      }
      return typeName[type] || '未定义';
    },
    scan () {
      const self = this;
      window.wx.scanQRCode({
        needResult: 1,                    // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode', 'barCode'],  // 可以指定扫二维码还是一维码，默认二者都有
        success (qrinfo) {
          /**
           * 扫码结果格式：
           * {
           *  resultStr: 'http://{HOST}/UNITS_BOX/{PRODUCT_ID}',
           *  errMsg: 'scanQRCode:ok'
           * }
           */
          let qrCode = self.handleQR(qrinfo.resultStr.toString());

          self.$http.get(`/system/wechat/dealermg/qrCodeInfo/${qrCode}`).then(res => {
            // 判断是否重复扫码，是否为父子箱盒关系
            let isExist = false;
            let isParent = false;
            self.list.forEach(ele => {
              if (ele && ele.qrcodeId === res.qrcodeId) isExist = true;
              if (ele && ele.parentId === res.qrcodeId || ele.qrcodeId === res.qrCodeInfoEntity.parentId) isParent = true;
            })

            if (isExist) {
              throw {message: '不可重复添加同一商品'};
            } else if (isParent) {
              throw {message: '不可添加存在父子关系的箱盒码'}
            } else {
              self.list.unshift({
                productId: res.productId,
                productName: res.productName,
                qrcodeType: res.qrcodeType,
                showQR: res.qrCodeInfoEntity.orderCode,
                parentId: res.qrCodeInfoEntity.parentId,
                qrcodeId: res.qrcodeId,
                orderId: res.orderId,
                orderType: res.orderType,
                dealerId: res.dealerId,
                type: self.filterType(res.qrcodeType)
              });
            }
          }).catch(err => {
            self.$Message.error(err.message)
          })
        },
        fail (err) {
          self.$Message.error({content: typeof err === 'object' ? JSON.stringify(err) : err});
        }
      });
    },
    confirmDetail () {
      this.dealer = '';
      this.sendTime = '';
      this.list = [];
      this.resOrderInfo = {};
      this.showDetail = false;
    }
  },
  beforeCreate () {
    this.$ScriptLinker('//res.wx.qq.com/open/js/jweixin-1.2.0.js');
  },
  mounted () {
    this.getSubDealer();
    this.buildWX();
    this.initSendTime();
  }
}
</script>

