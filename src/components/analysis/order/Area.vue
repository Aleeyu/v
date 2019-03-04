<template>
  <Row class="container">
    <Row v-show="current === 'CHART'">
      <Query :show-area="false" 
        @on-query="render" 
        :show-order="true"
        :default-date-range="defaultDateRange"
        @on-change="handleConditionChange"></Query>
      <Row type="flex" justify="center" class="chart-container">
        <div ref="CHART" class="chart" v-show="!error"></div>
        <error-view v-show="error" :error="error" @action="render" :loading="errorLoading"></error-view>
      </Row>
    </Row>
    <Row v-show="current === 'INFO'">
      <Row>
        <Button type="primary" @click="back">返回</Button>
      </Row>
      <Table stripe :columns="info.columns" :data="info.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="info.page"
          :page-size="info.pageSize"
          :total="info.totalCount"
          @on-change="getInfo">
        </Page>
      </Row>
    </Row>
    <Row v-show="current === 'DETAIL'">
      <Row>
        <Button type="primary" @click="back">返回</Button>
      </Row>
      <Table stripe :columns="detail.columns" :data="detail.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="detail.page"
          :page-size="detail.pageSize"
          :total="detail.totalCount"
          @on-change="getDetail">
        </Page>
      </Row>
    </Row>
  </Row>
</template>

<script>
import echarts from 'echarts'
import Query from './Query'

export default {
  components: { Query },
  data () {
    return {
      current: 'CHART',
      chart: {
        instance: null,
        data: []
      },
      info: {
        areaCode: null,
        columns: [
          {
            title: '订单单号',
            key: 'orderNo'
          },
          {
            title: '时间',
            render (h, p) {
              return new Date(p.row.createdTime).toLocaleString()
            }
          },
          {
            title: '地区',
            key: 'cityName'
          },
          {
            title: '经销商',
            key: 'dealerName'
          },
          {
            title: '产品',
            key: 'proName'
          },
          {
            title: '销售量',
            key: 'totalAmount'
          },
          {
            title: '金额（元）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.totalMoney) }</span>)
            }
          },
          {
            title: ' ',
            render: (h, p) => {
              return h('Button', {
                on: {
                  click: () => {
                    this.detail.orderId = p.row.id
                    this.getDetail()
                  }
                }
              }, '订单明细')
            }
          }
        ],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: []
      },
      detail: {
        orderId: null,
        columns: [
          {
            title: '产品名称',
            key: 'proName'
          },
          {
            title: '单价（元）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.price) }</span>)
            }
          },
          {
            title: '数量',
            render: (h, p) => {
              let str = ''
              if (p.row.box) {
                str += p.row.box + '箱'
              }
              if (p.row.cases) {
                str += p.row.cases + '盒'
              }
              return str
            }
          },
          {
            title: '总金额（元）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.totalMoney) }</span>)
            }
          },
          {
            title: '税率（%）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.tax) }</span>)
            }
          },
          {
            title: '税额（元）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.totalTax) }</span>)
            }
          },
          {
            title: '价税合计（元）',
            render: (h, p) => {
              return (<span>{ this.toFixed(p.row.totalTaxMoney) }</span>)
            }
          }
        ],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: []
      },
      condition: {
        date: {
          start: null,
          end: null
        },
        areaType: 'city',
        dealer: null,
        product: null,
        order: { 
          fieldName: 'default',
          orderRule: 'DESC'  
        }
      },
      error: null,
      errorLoading: false
    }
  },
  methods: {
    formatValue (value) {
      let list = []
      while (value > 1000) {
        let mod = this.toFixed(value % 1000)
        value = Math.floor(value / 1000)
        list.unshift(mod)
      }
      list.unshift(value)
      return list.join()
    },
    toFixed (value, precision = 2) {
      if (typeof value === 'number') {
        return parseFloat(value.toFixed(precision))
      }
      return '-'
    },
    handleConditionChange (condition) {
      this.condition = condition
    },
    init () {
      this.chart.instance = echarts.init(this.$refs.CHART)
      this.chart.instance.on('click', params => {
        let area = this.chart.data.find(d => d.areaName === params.name)
        if (area) {
          this.info.areaCode = area.areaCode
          this.getInfo() 
        } else {
          this.$Message.error('获取地区相关的信息失败！')
        }
      })
    },
    render () {
      let data = {
        _loading: true,
        isProvince: this.condition.areaType === 'province',
        fieldName: this.condition.order.fieldName === 'default' ? 'areaName' : this.condition.order.fieldName,
        orderRule: this.condition.order.orderRule
      }
      
      if (this.condition.date.start) {
        data.startTime = new Date(this.condition.date.start + ' 00:00:00').getTime()
      }
      if (this.condition.date.end) {
        data.endTime = new Date(this.condition.date.end + ' 23:59:59').getTime()
      }
      if (this.condition.dealer) {
        data.dealerId = this.condition.dealer.id
      }
      if (this.condition.product) {
        data.productId = this.condition.product.id
      }

      if (this.error) {
        this.errorLoading = true
      }
      this.$http.post('/order/area/analysis', data).then(res => {
        if (res.length === 0) {
          this.error = {
            type: 2,
            title: '没有对应条件的数据',
            content: '没有对应条件的数据，请改变查询条件后重新尝试',
            action: '重新尝试'
          }
          return 
        }
        this.error = null

        this.chart.data = res
        let option = {
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              return `<div>
                <div>${params[0].name}</div>
                <div>${params[0].marker}${params[0].seriesName}：${this.formatValue(params[0].value)} 盒</div>
                <div>${params[1].marker}${params[1].seriesName}：${this.formatValue(params[1].value)} 元</div>
              </div>`
            }
          },
          title: {
            text: '地区分析',
            left: 'center'
          },
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          series: this.series,
          dataZoom: this.dataZoom,
          grid: {
            bottom: 150
          }
        }
        this.chart.instance.setOption(option)
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    getInfo (page) {
      let data = {
        _loading: true,
        page: page || this.info.page,
        size: this.info.pageSize,
        queryFilter: [
          {
            property: 'targetArea',
            op: '=',
            value: this.info.areaCode
          }
        ]
      }

      if (this.condition.date.start) {
        data.queryFilter.push({
          property: 'orderTime',
          op: '>=',
          value: new Date(this.condition.date.start + ' 00:00:00').getTime()
        })
      }
      if (this.condition.date.end) {
        data.queryFilter.push({
          property: 'orderTime',
          op: '<=',
          value: new Date(this.condition.date.end + ' 23:59:59').getTime()
        })
      }
      if (this.condition.dealer) {
        data.queryFilter.push({
          property: 'dealerId',
          op: '=',
          value: this.condition.dealer.id
        })
      }
      if (this.condition.product) {
        data.queryFilter.push({
          property: 'productId',
          op: '=',
          value: this.condition.product.id
        })
      }

      this.$http.post('/order/analysis/info', data).then(res => {
        this.info.data = res.content
        this.info.page = res.page
        this.info.totalCount = res.totalCount

        this.current = 'INFO'
      }).catch(error => {
        console.error(error)
        this.$Message.error('获取地区相关的信息失败！')
      })
    },
    getDetail (page) {
      let data = {
        _loading: true,
        page: page || this.detail.page,
        size: this.detail.pageSize,
        queryFilter: [
          {
            property: 'orderId',
            op: '=',
            value: this.detail.orderId
          }
        ]
      }

      this.$http.post('/order/analysis/item/info', data).then(res => {
        this.detail.data = res.content
        this.detail.page = res.page
        this.detail.totalCount = res.totalCount

        this.current = 'DETAIL'
      }).catch(error => {
        console.error(error)
        this.$Message.error('获取订单信息失败！')
      })
    },
    back () {
      if (this.current === 'DETAIL') {
        this.current = 'INFO'
      } else {
        this.current = 'CHART'
      }
    }
  },
  computed: {
    defaultDateRange () {
      let now = new Date()
      let end = now.toLocaleDateString()
      now.setFullYear(now.getFullYear() - 1)
      let start = now.toLocaleDateString()
      return [start, end]
    },
    xAxis () {
      let data = {
        data: [],
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      }
      this.chart.data.forEach(d => {
        data.data.push(d.areaName)
      })
      return data
    },
    yAxis () {
      return [
        {
          type: 'value',
          name: '销售量',
          axisLabel: {
            formatter: (value, index) => {
              if (value > 100000000) {
                return value / 100000000 + ' 亿'
              } if (value > 10000) {
                return value / 10000 + ' 万'
              } else {
                return value
              }
            }
          }
        },
        {
          type: 'value',
          name: '销售金额',
          axisLabel: {
            formatter: (value, index) => {
              if (value > 100000000) {
                return value / 100000000 + ' 亿元'
              } if (value > 10000) {
                return value / 10000 + ' 万元'
              } else {
                return value
              }
            }
          }
        }
      ]
    },
    series () {
      let data = [
        {
          name: '销售量',
          type: 'bar',
          data: []
        },
        {
          name: '销售金额',
          type: 'bar',
          yAxisIndex: 1,
          data: []
        }
      ]
      this.chart.data.forEach(d => {
        data[0].data.push(d.totalAmount)
        data[1].data.push(d.totalMoney)
      })
      return data
    },
    dataZoom () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis.data.length
      }
      return zoom
    }
  },
  mounted () {
    this.init()
    this.render()
  }
}
</script>

<style scoped>
.container {
  padding-bottom: 10px;
}

.chart-container {
  margin-top: 10px;
}

.chart {
  height: 600px;
  width: 1000px;
}

div >>> table {
  width: 100%;
}
</style>
