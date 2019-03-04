<style lang="less" scoped>
  .container {
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
      .back {
        position: absolute;
        right: 4rem;
        top: 0rem;
        font-size: 1.5rem;
      }
    }
    > div {
      width: 100%;
    }
    .filter {
      display: flex;
      flex-flow: row nowrap;
      margin: 1rem 0;
      box-sizing: border-box;
      padding: 0 0.5rem;
      .time {
        width: 48%;
        >input {
          -webkit-appearance: none; 
          height: 2rem;
          width: 100%;
          border-style: solid;
          border-color: #DDDEE1;
          border-width: 1px;
          padding-left: 0.5rem;
          border-radius: 0;
        }
        background: #fff;
        border-color: #f1f1f1;
      }
      .middle {
        width: 4%;
      }
    }
    .list-container {
      height: 31rem;
      overflow: scroll;
      margin-bottom: 1rem;
      .list-item {
        margin: 0.8rem 0;
        border-bottom: 1px solid #f1f1f1;
        padding-bottom: 0.4rem;
        cursor: pointer;
      }
      .selected {
        color: red;
      }
    }
    .list-table {
      margin: 0.5rem 0.5rem 0;
    }
    .order-info {
      margin: 0.5rem;
      float: left;
      .info-container {
        float: left;
        margin-bottom: 0.5rem; 
      }
      .item {
        float: left;
        width: 100%;
        margin: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 0.5rem;
        .item-name {
          float: left;
        }
        .item-value {
          float: right;
          font-weight: bold;
          // margin: 0.3rem 0;
        }
      }
      .detail-list {
        float: left;
        width: 100%;
        background: #f0f0f0;
        padding: 0.2rem;
        border-radius: 0.2rem;
        .detail-item {
          float: left;
          width: 100%;
          margin-bottom: 0.2rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          padding: 0.5rem;
        }
      }
    }
    .receiving-info {
      .ivu-input-wrapper {
        margin: 0.5rem 0;
      }
    }
    .action {
      margin: 1rem 0;
      > button {
        margin: 0.5rem 0;
      }
    }
  }
</style>

<template>
  <Row justify="center">
    <Col span="24" class="container">
      <header>
        收货
        <div class="save" v-if="process===2" @click="confirmReceiving">
          <Icon type="checkmark-round" ></Icon>
        </div>
        <div class="back" v-if="process===2" @click="process=1">
          <Icon type="chevron-left"></Icon>
        </div>
      </header>

      <div class="filter" v-if="process===1">
        <div class="time">
          <label>开始时间</label>
          <input type="date" placeholder="开始时间" v-model="processOne.startTime" @change="goSearch" />
        </div>
        <div class="middle"></div>
        <div class="time">
          <label>结束时间</label>
          <input type="date" placeholder="结束时间" v-model="processOne.endTime" @change="goSearch" />
        </div>
      </div>

      <div class="list">

        <Table class="list-table" :height="devHeight-155" highlight-row ref="currentRowTable" :columns="processOne.ordercol" :data="list" @on-row-click="toDetail" v-if="process===1"></Table>

        <Card class="order-info" v-if="process===2" :padding="10">
          <p slot="title" style="color: red">请确认收货单信息</p>
          <div class="info-container">
            <div class="item">
              <span class="item-name">发货单号：</span>
              <span class="item-value">{{processOne.selected.code}}</span>
            </div>
            <div class="detail-list">
              <div class="detail-item" v-for="item in processTwo.info" :key="item.id">
                <div class="item">
                  <span class="item-name">产品名称：</span>
                  <span class="item-value">{{item.productName}}</span>
                </div>
                <div class="item">
                  <span class="item-name">发货数量：</span>
                  <span class="item-value">{{item.amountInfo}}</span>
                </div>
                <div class="item">
                  <span class="item-name">产品总数：</span>
                  <span class="item-value">{{item.amount}}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div v-if="process===2" style="margin: 0.5rem">
          <div class="receiving-info">
            <Input v-model="processTwo.consignee" placeholder="请输入您（收货人）的姓名" maxlength="20"></Input>
            <Input v-model="processTwo.commit" type="textarea" :rows="4" placeholder="请输入收货备注" maxlength="80"></Input>
          </div>
        </div>

      </div>

    </Col>
  </Row>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'mobile_receiving',
  data () {
    return {
      list: [],
      process: 1,
      processOne: {
        startTime: '',
        endTime: '',
        selected: null,
        ordercol: [
          {
            title: '发货单号',
            key: 'code'
          },
          {
            title: '发货人',
            key: 'sendBy'
          },
          {
            title: '发货单位',
            key: 'sendDepName'
          }
        ]
      },
      processTwo: {
        consignee: '',
        commit: '',
        info: {}
      }
    }
  },
  computed: {
    ...mapState('wechat', ['userInfo']),
    devHeight () {
      return document.documentElement.clientHeight;
    }
  },
  methods: {
    getList (start, end) {
      let data = {
        _loading: true,
        page: 1,
        size: 10000,
        orderBy: [{property: 'createdTime', order: 'desc'}],
        queryFilter: [
          {property: 'status', op: '=', value: '1'},
          {property: 'receivedDep', op: '=', value: this.userInfo.dealerId}
        ]
      };

      if (start) data.queryFilter.unshift({property: 'sendTime', op: '>=', value: new Date(start).getTime()});
      if (end) data.queryFilter.unshift({property: 'sendTime', op: '<=', value: new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1});

      this.$http.post(`system/wechat/dealermg/storeInvoices/search`, data).then(res => {
        this.list = res.content;
      }).catch(err => {
        this.$Message.error(typeof err === 'object' ? JSON.stringify(JSON) : err)
      })
    },
    getInfo () {
      const self = this;
      self.$http.get(`/system/wechat/dealermg/storeInvoiceItems/${self.processOne.selected.id}`).then(res => {
        res ? (self.processTwo.info = res, this.process = 2) : self.$Message.error('未找到该发货单详情，请联系开发人员');
      }).catch(err => {
        self.$Message.error({content: typeof err === 'object' ? JSON.stringify(err) : err});
      })
    },
    goSearch () {
      this.getList(this.processOne.startTime, this.processOne.endTime);
    },
    toDetail (currentRow, oldCurrentRow) {
      this.processOne.selected = currentRow;
      this.getInfo();
    },
    confirmReceiving () {
      this.$Modal.confirm({
        title: '确认收货提醒',
        content: '请再次核对该发货单中的信息，确定收货吗？',
        onOk: () => {
          this.$http.put(`/system/wechat/dealermg/storeInvoice/${this.processOne.selected.id}`, {
            'status': 2,
            'info': this.processTwo.commit
          }).then(res => {
            this.getList();
            this.processOne.selected = null;
            this.process = 1;
          }).catch(err => {
            self.$Message.error({content: typeof err === 'object' ? JSON.stringify(err) : err});
          })
        }
      });
    }
  },
  mounted () {
    this.getList();
  }
}
</script>
