<template>
  <container>
    <div slot="content" v-if="!error && !firstLoading">
      <table class="head-table">
        <thead>
          <tr>
            <th>生产单</th>
          </tr>
        </thead>
      </table>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="key">接收人：</td>
            <td class="value">{{ order.recipientName }}</td>
            <td class="key auto">接收日期：</td>
            <td class="value">{{ order.recipientTime | date }}</td>
            <td class="key">单据号：</td>
            <td class="value">{{ order.code }}</td>
          </tr>
          <tr>
            <td class="key">订单号：</td>
            <td class="value">{{ order.orderNo }}</td>
            <td class="key auto">生产打印日期：</td>
            <td class="value">{{ order.finishPrintTime | date }}</td>
            <td class="key">往来单位：</td>
            <td class="value">{{ order.dealerName }}</td>
          </tr>
          <tr>
            <td class="key">等级状态：</td>
            <td class="value">{{ order.urgentLevel | urgentLevel }}</td>
            <td class="key">审核人：</td>
            <td class="value"></td>
          </tr>
          <tr>
            <td class="key">备注：</td>
            <td class="value" colspan="5">{{ order.remarks }}</td>
          </tr>
        </tbody>
      </table>
      <table class="list-table border">
        <thead>
          <tr>
            <th>商品名称</th>
            <th>数量（盒）</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in order.data">
            <td>{{ data.productName }}</td>
            <td>{{ data.amount }}</td>
            <td>{{ data | format }}</td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td>合计</td>
            <td>{{ total.amount }}</td>
            <td>{{ total | format }}</td>
          </tr>
        </tbody>
      </table>
      <table class="footer-table">
        <tbody>
          <tr>
            <td colspan="6">打印时间：</td>
            <td colspan="2">{{ new Date() | datetime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div slot="content" v-if="error">
      <error-view :error="error" @action="init" :loading="errorLoading"></error-view>
    </div>
  </container>
</template>

<script>
import container from '@/components/report/Container'

export default {
  components: {container},
  data () {
    return {
      order: {
        page: 1,
        pageSize: 10000,
        data: [],
        orderNo: null,
        recipientName: null,
        recipientTime: null,
        startTime: null,
        endTime: null,
        finishPrintTime: null,
        remarks: null,
        urgentLevel: null
      },
      error: null,
      errorLoading: false,
      firstLoading: true
    }
  },
  filters: {
    format (data) {
      let str = ''
      if (data.box) {
        str += data.box + '箱'
      }
      if (data.cases) {
        str += data.cases + '盒'
      }
      return str
    },
    date (value) {
      if (!value) {
        return ''
      }
      let date = new Date(value)
      let dateString = date.toLocaleDateString()
      return dateString === 'Invalid Date' ? '' : dateString
    },
    datetime (value) {
      var date = new Date(value)  
      var y = date.getFullYear()    
      var m = date.getMonth() + 1    
      m = m < 10 ? ('0' + m) : m    
      var d = date.getDate()    
      d = d < 10 ? ('0' + d) : d    
      var h = date.getHours()  
      h = h < 10 ? ('0' + h) : h  
      var minute = date.getMinutes()  
      var second = date.getSeconds()  
      minute = minute < 10 ? ('0' + minute) : minute    
      second = second < 10 ? ('0' + second) : second   
      return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second 
    },
    urgentLevel (value) {
      if (value === 0) return '常规'
      else if (value === 1) return '加急'
    }
  },
  methods: {
    init: function () {
      if (this.$route.query.id) {
        this.query()
      } else {
        this.$router.push({ path: '/' })
      }
    },
    query: function () {
      let data = {
        page: this.order.page,
        size: this.order.pageSize,
        queryFilter: [
          {
            property: 'productionId',
            op: '=',
            value: this.$route.query.id
          }
        ]
      }

      if (this.error) {
        this.errorLoading = true
      } else {
        data._loading = true
      }

      this.$http.post(`/production/order/${this.$route.query.id}/search`, data).then(res => {
        this.order.data = res.productionItem.content

        this.order.orderNo = res.production.orderNo
        this.order.recipientName = res.production.recipientName
        this.order.recipientTime = res.production.recipientTime
        this.order.startTime = res.production.startTime
        this.order.endTime = res.production.endTime
        this.order.finishPrintTime = res.production.finishPrintTime
        this.order.remarks = res.production.remarks
        this.order.urgentLevel = res.production.urgentLevel
        this.order.dealerName = res.production.dealerName
        this.order.code = res.production.code

        this.error = null
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
        this.firstLoading = false
      })
    }
  },
  computed: {
    total () {
      let data = {
        amount: 0,
        box: 0,
        cases: 0
      }
      this.order.data.forEach(innerData => {
        data.amount += innerData.amount
        data.box += innerData.box
        data.cases += innerData.cases
      })
      return data
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>
.key.auto {
  width: auto !important;
}
</style>
