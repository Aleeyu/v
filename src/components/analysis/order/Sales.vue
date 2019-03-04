<template>
  <Row class="container">
    <Query :show-area-type="false"
      :default-month-range="defaultMonthRange"
      :show-date="false"
      :show-month="true"
      @on-query="render"
      @on-change="handleConditionChange">
    </Query>
    <Row type="flex" justify="center" class="chart-container">
      <div ref="CHART1" class="chart" v-show="!error"></div>
      <div ref="CHART2" class="chart" v-show="!error"></div>
      <div ref="CHART3" class="chart" v-show="!error"></div>
      <div ref="CHART4" class="chart" v-show="!error"></div>
      <div ref="CHART5" class="chart" v-show="!error"></div>
      <error-view v-show="error" :error="error" @action="render" :loading="errorLoading"></error-view>
    </Row>
  </Row>
</template>

<script>
import echarts from 'echarts'
import Query from './Query'

function numberToFixed (value) {
  /* 转换为保留2位小数 */
  value = value.toFixed(2)
  return parseFloat(value)
}
/**
 * 将'201701'这样的日期转换为'2017-01'格式
 */
function formatDate (value) {
  return value.slice(0, 4) + '-' + value.slice(4, 6)
}

export default {
  components: { Query },
  data () {
    return {
      /* 销售量/销售金额 */
      chart1: {
        instance: null,
        data: []
      },
      /* 销售量同比 */
      chart2: {
        instance: null,
        data: []
      },
      /* 销售金额同比 */
      chart3: {
        instance: null,
        data: []
      },
      /* 销售量环比 */
      chart4: {
        instance: null,
        data: []
      },
      /* 销售金额环比 */
      chart5: {
        instance: null,
        data: []
      },
      condition: {
        area: {
          city: null
        },
        product: null,
        dealer: null,
        month: {
          start: null,
          end: null
        }
      },
      error: null,
      errorLoading: true
    }
  },
  methods: {
    formatValue (value) {
      let list = []
      while (value > 1000) {
        let mod = numberToFixed(value % 1000)
        value = Math.floor(value / 1000)
        list.unshift(mod)
      }
      list.unshift(value)
      return list.join()
    },
    handleConditionChange (condition) {
      this.condition = condition
    },
    init () {
      this.chart1.instance = echarts.init(this.$refs.CHART1)
      this.chart2.instance = echarts.init(this.$refs.CHART2)
      this.chart3.instance = echarts.init(this.$refs.CHART3)
      this.chart4.instance = echarts.init(this.$refs.CHART4)
      this.chart5.instance = echarts.init(this.$refs.CHART5)
    },
    render () {
      let data = { _loading: true }
      if (this.condition.month.start) {
        let date = new Date(this.condition.month.start)
        date.setDate(1)
        data.startTime = new Date(date.toLocaleDateString() + ' 00:00:00').getTime()
      }
      if (this.condition.month.end) {
        let date = new Date(this.condition.month.end)
        date.setMonth(date.getMonth() + 1)
        date.setDate(0)
        data.endTime = new Date(date.toLocaleDateString() + ' 23:59:59').getTime()
      }
      if (this.condition.area.city) {
        data.areaCity = this.condition.area.city
      }
      if (this.condition.product) {
        data.productId = this.condition.product.id
      }
      if (this.condition.dealer) {
        data.dealerId = this.condition.dealer.id
      }

      if (this.error) {
        this.errorLoading = true
      }
      this.$http.post('/order/sales/analysis', data).then(res => {
        this.chart1.data = res.salesResult
        this.chart1.instance.setOption(this.option1)

        this.chart2.data = res.yearOnYearResult
        this.chart2.instance.setOption(this.option2)

        this.chart3.data = res.yearOnYearResult
        this.chart3.instance.setOption(this.option3)

        this.chart4.data = res.salesRingResult
        this.chart4.instance.setOption(this.option4)

        this.chart5.data = res.salesRingResult
        this.chart5.instance.setOption(this.option5)

        this.error = null
      }).catch(error => {
        console.error(error)
        if (error.code === 'COMM_BIZ_ERROR') {
          this.error = {
            type: 2,
            title: '开始时间不能大于结束时间',
            content: '开始时间不能大于结束时间，请改变查询条件后重新尝试',
            action: '重新尝试'
          }
        } else {
          this.error = this.$Err.unhandled()
        }
      }).finally(() => {
        this.errorLoading = false
      })
    }
  },
  computed: {
    defaultMonthRange () {
      let now = new Date()
      let end = now.toLocaleDateString()
      now.setFullYear(now.getFullYear() - 1)
      let start = now.toLocaleDateString()
      return [start, end]
    },
    xAxis1 () {
      let data = []
      this.chart1.data.forEach(d => {
        data.push(formatDate(d.month))
      })
      return { 
        data, 
        axisLabel: {
          interval: 0,
          rotate: 45
        } 
      }
    },
    yAxis1 () {
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
    series1 () {
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
      this.chart1.data.forEach(d => {
        data[0].data.push(numberToFixed(d.totalAmount))
        data[1].data.push(numberToFixed(d.totalMoney))
      })
      return data
    },
    dataZoom1 () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis1.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis1.data.length
      }
      return zoom
    },
    option1 () {
      return {
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
          text: '销售量/金额分析',
          left: 'center'
        },
        xAxis: this.xAxis1,
        yAxis: this.yAxis1,
        series: this.series1,
        dataZoom: this.dataZoom1,
        grid: {
          bottom: 150
        }
      }
    },
    xAxis2 () {
      let data = []
      this.chart2.data.forEach(d => {
        data.push(formatDate(d.month))
      })
      return { 
        data,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      }
    },
    yAxis2 () {
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
          name: '销售量同比',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ]
    },
    series2 () {
      let data = [
        {
          name: '同比销售量',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售量',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售量同比',
          type: 'line',
          yAxisIndex: 1,
          data: [],
          smooth: true
        }
      ]
      this.chart2.data.forEach(d => {
        data[0].data.push(numberToFixed(d.lastAmount))
        data[1].data.push(numberToFixed(d.thisAmount))
        data[2].data.push(numberToFixed(d.amountRatio * 100))
      })
      return data
    },
    dataZoom2 () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis2.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis2.data.length
      }
      return zoom
    },
    option2 () {
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `<div>
              <div>${params[0].name}</div>
              <div>${params[0].marker}${params[0].seriesName}：${this.formatValue(params[0].value)} 盒</div>
              <div>${params[1].marker}${params[1].seriesName}：${this.formatValue(params[1].value)} 盒</div>
              <div>${params[2].marker}${params[2].seriesName}：${this.formatValue(params[2].value)} %</div>
            </div>`
          }
        },
        title: {
          text: '销售量同比分析',
          left: 'center'
        },
        xAxis: this.xAxis2,
        yAxis: this.yAxis2,
        series: this.series2,
        dataZoom: this.dataZoom2,
        grid: {
          bottom: 150
        }
      }
    },
    xAxis3 () {
      return this.xAxis2
    },
    yAxis3 () {
      return [
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
        },
        {
          type: 'value',
          name: '销售金额同比',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ]
    },
    series3 () {
      let data = [
        {
          name: '同比销售金额',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售金额',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售金额同比',
          type: 'line',
          yAxisIndex: 1,
          data: [],
          smooth: true
        }
      ]
      this.chart3.data.forEach(d => {
        data[0].data.push(numberToFixed(d.lastMoney))
        data[1].data.push(numberToFixed(d.thisMoney))
        data[2].data.push(numberToFixed(d.moneyRatio * 100))
      })
      return data
    },
    dataZoom3 () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis3.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis3.data.length
      }
      return zoom
    },
    option3 () {
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `<div>
              <div>${params[0].name}</div>
              <div>${params[0].marker}${params[0].seriesName}：${this.formatValue(params[0].value)} 元</div>
              <div>${params[1].marker}${params[1].seriesName}：${this.formatValue(params[1].value)} 元</div>
              <div>${params[2].marker}${params[2].seriesName}：${this.formatValue(params[2].value)} %</div>
            </div>`
          }
        },
        title: {
          text: '销售金额同比分析',
          left: 'center'
        },
        xAxis: this.xAxis3,
        yAxis: this.yAxis3,
        series: this.series3,
        dataZoom: this.dataZoom3,
        grid: {
          bottom: 150
        }
      }
    },
    xAxis4 () {
      let data = []
      this.chart4.data.forEach(d => {
        data.push(formatDate(d.month))
      })
      return { 
        data,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      }
    },
    yAxis4 () {
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
          name: '销售量环比',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ]
    },
    series4 () {
      let data = [
        {
          name: '环比销售量',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售量',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售量环比(%)',
          type: 'line',
          yAxisIndex: 1,
          data: [],
          smooth: true
        }
      ]
      this.chart4.data.forEach(d => {
        data[0].data.push(numberToFixed(d.lastAmount))
        data[1].data.push(numberToFixed(d.thisAmount))
        data[2].data.push(numberToFixed(d.amountRatio * 100))
      })
      return data
    },
    dataZoom4 () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis4.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis4.data.length
      }
      return zoom
    },
    option4 () {
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `<div>
              <div>${params[0].name}</div>
              <div>${params[0].marker}${params[0].seriesName}：${this.formatValue(params[0].value)} 盒</div>
              <div>${params[1].marker}${params[1].seriesName}：${this.formatValue(params[1].value)} 盒</div>
              <div>${params[2].marker}${params[2].seriesName}：${this.formatValue(params[2].value)} %</div>
            </div>`
          }
        },
        title: {
          text: '销售量环比分析',
          left: 'center'
        },
        xAxis: this.xAxis4,
        yAxis: this.yAxis4,
        series: this.series4,
        dataZoom: this.dataZoom4,
        grid: {
          bottom: 150
        }
      }
    },
    xAxis5 () {
      return this.xAxis4
    },
    yAxis5 () {
      return [
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
        },
        {
          type: 'value',
          name: '销售金额环比',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ]
    },
    series5 () {
      let data = [
        {
          name: '环比销售金额',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售金额',
          type: 'bar',
          yAxisIndex: 0,
          data: []
        },
        {
          name: '销售金额环比',
          type: 'line',
          yAxisIndex: 1,
          data: [],
          smooth: true
        }
      ]
      this.chart5.data.forEach(d => {
        data[0].data.push(numberToFixed(d.lastMoney))
        data[1].data.push(numberToFixed(d.thisMoney))
        data[2].data.push(numberToFixed(d.moneyRatio * 100))
      })
      return data
    },
    dataZoom5 () {
      let zoom = {
        show: true,
        start: 0,
        end: 100,
        bottom: 50
      }
      /* 保持一图大约10条数据 */
      if (this.xAxis5.data.length <= 10) {
        zoom.show = false
      } else {
        zoom.end = 1000 / this.xAxis5.data.length
      }
      return zoom
    },
    option5 () {
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            return `<div>
              <div>${params[0].name}</div>
              <div>${params[0].marker}${params[0].seriesName}：${this.formatValue(params[0].value)} 元</div>
              <div>${params[1].marker}${params[1].seriesName}：${this.formatValue(params[1].value)} 元</div>
              <div>${params[2].marker}${params[2].seriesName}：${this.formatValue(params[2].value)} %</div>
            </div>`
          }
        },
        title: {
          text: '销售金额环比分析',
          left: 'center'
        },
        xAxis: this.xAxis5,
        yAxis: this.yAxis5,
        series: this.series5,
        dataZoom: this.dataZoom5,
        grid: {
          bottom: 150
        }
      }
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
</style>
