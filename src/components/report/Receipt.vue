<template>
  <container>
    <div slot="content" class="page">
      <table class="head-table">
        <thead>
          <tr>
            <th>销售入库单</th>
          </tr>
        </thead>
      </table>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="key">制单人：</td>
            <td class="value">{{info.receivedBy}}</td>
            <td class="key">录单日期：</td>
            <td class="value  long-td">{{new Date(info.receivedTime).toLocaleString() || '暂无'}}</td>
            <td class="key">单据号：</td>
            <td class="value">{{info.code}}</td>
          </tr>
          <tr>
            <td class="key">保管员：</td>
            <td class="value"></td>
            <td class="key">部门：</td>
            <td class="value"></td>
          </tr>
          <tr>
            <td class="key">经手人：</td>
            <td class="value"></td>
            <td class="key">入库仓库：</td>
            <td class="value"></td>
            <td class="key">备注：</td>
            <td class="value"></td>
          </tr>
        </tbody>
      </table>
      <table class="list-table border">
        <thead>
          <tr>
            <th>编码</th>
            <th>产品名称</th>
            <th>数量（盒）</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td>{{item.productNo}}</td>
            <td>{{item.productName}}</td>
            <td>{{item.amount}}</td>
            <td>{{item.amountInfo}}</td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td>合计</td>
            <td></td>
            <td>{{total.amount.toFixed(0)}}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <table class="footer-table">
        <tbody>
          <tr>
            <td colspan="6">打印时间：</td>
            <td colspan="2">{{new Date().toLocaleString()}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div slot="content" class="page" style="page-break-before:always" v-if="data.length > 0">
      <table class="head-table" style="margin-top: 1.2cm">
        <thead>
          <tr>
            <th>货物编码表</th>
          </tr>
        </thead>
      </table>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="key">制单人：</td>
            <td class="value">{{info.receivedBy}}</td>
            <td class="key">录单日期：</td>
            <td class="value  long-td">{{new Date(info.receivedTime).toLocaleString() || '暂无'}}</td>
            <td class="key">单据号：</td>
            <td class="value">{{info.code}}</td>
          </tr>
        </tbody>
      </table>
      <expand v-if="data.length > 0" :data="data"></expand>
    </div>
    
  </container>
</template>

<script>
import container from '@/components/report/Container'
import expand from '@/components/report/QrCodeExpand'

export default {
  components: {container, expand},

  data () {
    return {
      info: {},
      data: [],
      detailList: [],
      total: {
        amount: 0
      },
      error: null
    }
  },
  methods: {
    initPage () {
      this.$http.get(`/store/receiptItems/${this.$route.params.id}`).then(res => {
        if (!res.storeItems || res.storeItems.length === 0) {
          this.error = this.$Err.noData();
          return this.$Message.error({
            content: '当前出入库单暂无数据！',
            duration: 60
          });
        }
        
        ({
          storeInfo: this.info,
          storeItems: this.data
          } = res);

        this.calculateTotal(res.storeItems);
      }).catch(error => {
        this.error = error;
      })
    },
    calculateTotal (data) {
      data.forEach(e => {
        this.total.amount += e.amount;
      })
    }
  },
  mounted () {
    this.initPage();
  }
}
</script>

