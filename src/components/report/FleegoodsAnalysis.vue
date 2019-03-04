<template>
  <container>
    <div slot="content">
      <table class="head-table">
        <thead>
          <tr>
            <th>窜货详情</th>
          </tr>
        </thead>
      </table>
      <table class="list-table border">
        <thead>
        <tr>
          <th>时间</th>
          <th>商品名称</th>
          <th>数量（盒）</th>
          <th>扫码人</th>
          <th>扫码人所在区域</th>
          <th>供货区域</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in tableData" :key="item.id">
          <td>{{item.scanTime ? new Date(item.scanTime).toLocaleDateString() : '-' }}</td>
          <td>{{item.productName}}</td>
          <td>{{item.unitNumber || '-'}}</td>
          <td>{{item.nick || '-'}}</td>
          <td>{{`${item.provinceName || ''}${item.cityName || ''}${item.areaName || ''}` || '-'}}</td>
          <td>{{`${item.dealerProvinceName || ''}${item.dealerCityName || ''}${item.dealerAreaName || ''}` || '-'}}</td>
          <td>{{statusArray[item.status]}}</td>
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
        statusArray: ['待确认', '已下发', '生产中', '已生产', '已发货', '已接收'],
        currentItem: {creator: '-'},
        tableData: []
      }
    },
    methods: {
      print () {
        window.print();
      }
    },
    mounted () {
      this.$http.post(`order/illegalGoodsInfo/analysis`, {
        _loading: true,
        page: 1,
        size: 9999,
        queryFilter: [
          {
            property: 'dealerId',
            op: '=',
            value: this.$route.query.id
          }
        ]
      }).then((res) => {
        this.currentItem = res
        this.tableData = res.content
      })
    }
  }
</script>

