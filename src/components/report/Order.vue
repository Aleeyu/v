<template>
  <container>
    <div slot="content">
      <table class="head-table">
        <thead>
          <tr>
            <th>销售订单</th>
          </tr>
        </thead>
      </table>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="key">制单人：</td>
            <td class="value">{{currentItem.creator || '-'}}</td>
            <td class="key">录单日期：</td>
            <td class="value  long-td">{{new Date(currentItem.createdTime).toLocaleString()}}</td>
            <td class="key">单据号：</td>
            <td class="value">{{currentItem.orderNo}}</td>
          </tr>
          <tr>
            <td class="key">审核人：</td>
            <td class="value"></td>
            <td class="key">部门：</td>
            <td class="value"></td>
            <td class="key">往来单位：</td>
            <td class="value">{{currentItem.dealerName}}</td>
          </tr>
          <tr>
            <td class="key">类型状态：</td>
            <td class="value">{{currentItem.orderType === 0 ? '现生产单' : '备货单'}} / {{currentItem.urgentLevel === 1 ? '加急' : '常规'}}</td>
            <td class="key">备注：</td>
            <td class="value">{{currentItem.comment || '-'}}</td>
          </tr>
        </tbody>
      </table>
      <table class="list-table border">
        <thead>
        <tr>
          <th>商品名称</th>
          <th>生产</th>
          <th>备货</th>
          <th>单价（元）</th>
          <th>金额（元）</th>
          <th>税额（元）</th>
          <th>价税合计（元）</th>
          <!--<th>备注</th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in tableData" :key="item.id">
          <td>{{item.proName }}</td>
          <td>{{item.box === '-' ? item.box : item.box + '箱' + item.cases + '盒'}}</td>
          <td>{{item.box === '-' ? item.box : item.stockBox + '箱' + item.stockCases + '盒'}}</td>
          <td>{{item.price}}</td>
          <td>{{parseFloat(item.totalMoney).toFixed(2)}}</td>
          <td>{{parseFloat(item.totalTax).toFixed(2)}}</td>
          <td>{{parseFloat(item.totalTaxMoney).toFixed(2)}}</td>
          <!--<td>{{item.box === '-' ? item.box : item.box + '箱' + item.cases + '盒'}}</td>-->
        </tr>
        </tbody>
        <tbody>
        <tr>
          <td>收款账户</td>
          <td colspan="6"></td>
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
  </container>
</template>

<script type="text/ecmascript-6">
  import container from '@/components/report/Container'
  export default {
    components: {container},
    data () {
      return {
        currentItem: {creator: 'asdfdf'},
        tableData: []
      }
    },
    methods: {
      print () {
        window.print();
      }
    },
    mounted () {
      this.$http.get(`/order/${this.$route.query.id}`, {
        '_loading': true
      }).then((res) => {
        this.currentItem = res
        this.tableData = res.orderItemOuts
        let totalTax = 0
        let totalMoney = 0
        let totalTaxMoney = 0
        for (let i in this.tableData) {
          totalTax += this.tableData[i].totalTax
          totalMoney += this.tableData[i].totalMoney
          totalTaxMoney += this.tableData[i].totalTaxMoney
        }
        this.tableData.push({
          amount: '-',
          box: '-',
          cases: '-',
          price: '-',
          stockAmount: '-',
          proName: '合计',
          totalTax: totalTax,
          totalMoney: parseFloat(totalMoney).toFixed(2),
          totalTaxMoney: parseFloat(totalTaxMoney).toFixed(2)
        })
      })
    }
  }
</script>

