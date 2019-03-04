<template>
  <Row>
    <Row>
      <!--查询条件-->
      <Query :show-product="true" :show-dealer="false" :show-area-type="false" :disableCity="true"
             @on-query="drawChart"
             @on-change="handleConditionChange"></Query>
      <Button type="primary" style="position: absolute;z-index: 9999; top: 0" @click="back">返回上级</Button>
      <!-- 图表内容 -->
      <error-view v-show="error" :error="error" @action="drawChart" :loading="errorLoading"></error-view>
      <div v-show="!error">
        <Row type="flex" justify="center">
          <div ref="histogram" style="height: 350px;width: 100%"></div>
        </Row>
        <Row type="flex" justify="center">
          <div ref="piechart" style="height: 450px;width: 80%"></div>
        </Row>
      </div>
    </Row>
  </Row>
</template>

<script type="text/ecmascript-6">
  import Query from '@/components/analysis/order/Query'
  //  import echarts from 'echarts'
  var echarts = require('echarts');
  export default {
    components: {Query},
    data () {
      return {
        currentDealer: 0,
        chart: {
          Hchart: null,
          Pchart: null,
          Hdata: [],
          Pdata: []
        },
        url: {
          HISTOGRAM: 'order/illegalGoodsdea/analysis',
          PIE: 'order/illegalGoodsPie/analysis'
        },
        dealerArray: ['一级经销商', '二级经销商', '三级经销商'],
        error: null,
        errorLoading: false,
        condition: {
          date: {
            start: null,
            end: null
          },
          area: {
            city: null
          },
          product: null
        }
      }
    },
    methods: {
      handleConditionChange (condition) {
        this.condition = condition
      },
      back () {
        this.$router.push({
          path: this.$route.path
        })
      },
      init () {
        this.chart.Hchart = echarts.init(this.$refs.histogram)
        this.chart.Pchart = echarts.init(this.$refs.piechart)
        this.chart.Hchart.on('click', params => {
          let dealer = this.chart.Hdata.find(d => d.dealerName === params.name)
          if (dealer) {
            this.$router.push({
              path: this.$route.path,
              query: {
                current: 'TABLE',
                dealerId: dealer.dealerId
              }
            })
          } else {
            this.$Message.error('获取经销商信息失败！')
          }
        })
      },
      render (type) {
        let data = {
          _loading: true
        }
        if (this.condition.date.start) {
          data.startTime = new Date(this.condition.date.start + ' 00:00:00').getTime()
        }
        if (this.condition.date.end) {
          data.endTime = new Date(this.condition.date.end + ' 23:59:59').getTime()
        }
        if (this.condition.area.province) {
          data.areaCity = this.condition.area.province
        }
        if (this.condition.product) {
          data.proName = this.condition.product.productName
        }
        if (this.error) {
          this.errorLoading = true
        }
        data.dealerLevel = this.$route.query.level
        this.$http.post(this.url[type], data).then(res => {
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
          let Hoption = {
            title: {
              text: `${this.dealerArray[this.$route.query.level - 1] || ''}窜货量`,
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: null,
            yAxis: null,
            series: null
          }
          let Poption = {
            title: {
              text: `${this.dealerArray[this.$route.query.level - 1] || ''}窜货占比`,
              x: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: null
            },
            series: null
          }
          if (type === 'HISTOGRAM') {
            this.chart.Hdata = res
            Hoption.xAxis = this.xAxis
            Hoption.yAxis = this.yAxis
            Hoption.series = this.Hseries
            this.chart.Hchart.setOption(Hoption)
          } else {
            this.chart.Pdata = res
            Poption.series = this.pieSeries
            Poption.legend.data = this.pieLegend
            this.chart.Pchart.setOption(Poption)
          }
        }).catch((error) => {
          this.error = {
            type: 2,
            title: '获取数据失败',
            content: error.message,
            action: '重新尝试'
          }
          console.error(error)
        }).finally(() => {
          this.errorLoading = false
        })
      },
      drawChart: function () {
        this.render('HISTOGRAM')
        this.render('PIE')
      }
    },
    computed: {
      xAxis () {
        let data = {
          data: []
        }
        this.chart.Hdata.forEach(d => {
          data.data.push(d.dealerName)
        })
        return data
      },
      yAxis () {
        return [
          {
            type: 'value',
            name: '窜货量（盒）'
          }
        ]
      },
      Hseries () {
        let data = [
          {
            name: '窜货量',
            type: 'bar',
            data: []
          }
        ]
        this.chart.Hdata.forEach(d => {
          data[0].data.push(d.amount)
        })
        return data
      },
      pieLegend () {
        let data = []
        this.chart.Pdata.forEach(d => {
          data.push(d.dealerName)
        })
        return data
      },
      pieSeries () {
        let data = [
          {
            name: '窜货占比',
            type: 'pie',
            radius: '70%',
            center: ['50%', '60%'],
            data: [],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
        this.chart.Pdata.forEach(d => {
          data[0].data.push({
            value: d.amount,
            name: d.dealerName
          })
        })
        return data
      }
    },
    mounted () {
      this.init()
      this.drawChart()
    }
  }
</script>
