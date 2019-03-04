<template>
  <Row>
    <Row>
      <!--查询条件-->
      <Query :show-product="true" :show-dealer="false" :show-area-type="false" :disableCity="true"
             @on-query="render"
             @on-change="handleConditionChange"></Query>
      <!-- 图表内容 -->
      <error-view v-show="error" :error="error" @action="render" :loading="errorLoading"></error-view>
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
        current: 'LEVEL',
        currentLevel: 0,
        currentDealer: 0,
        chart: {
          Hchart: null,
          Pchart: null,
          Hdata: [],
          Pdata: []
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
      init () {
        this.chart.Hchart = echarts.init(this.$refs.histogram)
        this.chart.Pchart = echarts.init(this.$refs.piechart)
        this.chart.Hchart.on('click', params => {
          let level = this.chart.Hdata.find(d => this.dealerArray[d.dealerLevel - 1] === params.name)
          if (level) {
            this.$router.push({
              path: this.$route.path,
              query: {
                level: level.dealerLevel,
                current: 'DEALER'
              }
            })
          } else {
            this.$Message.error('获取该等级经销商信息失败！')
          }
        })
      },
      render () {
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
        this.$http.post('order/illegalGoodslev/analysis', data).then(res => {
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
              text: `经销商窜货量`,
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
              text: `经销商窜货占比`,
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
          this.chart.Hdata = res
          Hoption.xAxis = this.xAxis
          Hoption.yAxis = this.yAxis
          Hoption.series = this.Hseries

          this.chart.Pdata = res
          Poption.series = this.pieSeries
          Poption.legend.data = this.pieLegend

          this.chart.Hchart.setOption(Hoption)
          this.chart.Pchart.setOption(Poption)
        }).catch(error => {
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
      }
    },
    computed: {
      xAxis () {
        let data = {
          data: []
        }
        this.chart.Hdata.forEach(d => {
          data.data.push(this.dealerArray[d.dealerLevel - 1])
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
          data.push(this.dealerArray[d.dealerLevel - 1])
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
            name: this.dealerArray[d.dealerLevel - 1]
          })
        })
        return data
      }
    },
    mounted () {
      this.init()
      this.render()
    }
  }
</script>
