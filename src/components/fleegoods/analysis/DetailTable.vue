<style lang="less" scoped>
  .title {
    text-align:center;
    padding: .5em 1em;
    margin: 0 -16px 10px -16px;
  }
</style>

<template>
  <div class="content-inner">
    <div>
      <Button id="order_analysis_btn_back" @click="goBack" type="primary">返回上级</Button>
      <Button id="order_analysis_btn_print" @click="print">打印</Button>
    </div>
    <error-view v-show="error" :error="error" @action="getdetailTable(1, this.dealerId)" :loading="errorLoading"></error-view>
    <card dis-hover v-show="!error">
      <Row>
        <i-col span="24">
          <div style="padding-bottom: 10px;width: 100%">
            <div style="clear: both">
              <Table id="analysis_fleeingGoods_table_detailTable" stripe :columns="detailTable" :data="detailData"
                     style="clear: both; margin: 0 0 20px 0"></Table>
              <Page id="analysis_fleeingGoods_page_detailTable" :total="total_num" show-elevator show-total
                    style="float:right;margin:10px 0 0 0;" :current="current_page"
                    @on-change="pageChange" :page-size="pageSize" size="small"></Page>
            </div>
            <div style="clear: both"></div>
          </div>
        </i-col>
      </Row>
    </card>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    data () {
      return {
        total_num: 0,
        current_page: 1,
        pageSize: 10,
        dealerName: '',
        error: null,
        errorLoading: false,
        statusArray: ['待确认', '已下发', '生产中', '已生产', '已发货', '已接收'],
        detailTable: [
          {
            title: '时间',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', p.row.scanTime ? new Date(p.row.scanTime).toLocaleDateString() : '-')
              ])
            }
          },
          {
            title: '商品',
            width: 160,
            render: (h, p) => {
              return h('div', [
                h('p', p.row.productName || '-')
              ])
            }
          },
          {
            ellipsis: true,
            title: '数量（盒）',
            render: (h, p) => {
              return h('div', [
                h('p', p.row.unitNumber || '-')
              ])
            }
          },
          {
            title: '扫码人',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', p.row.nick || '-')
              ])
            }
          },
          {
            title: '扫码人所在区域',
            width: 150,
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', `${p.row.provinceName || ''}${p.row.cityName || ''}${p.row.areaName || ''}` || '-')
              ])
            }
          },
          {
            title: '供货区域',
            width: 150,
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', `${p.row.dealerProvinceName || ''}${p.row.dealerCityName || ''}${p.row.dealerAreaName || ''}` || '-')
              ])
            }
          },
          {
            title: '状态',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', this.statusArray[p.row.status])
              ])
            }
          }
        ],
        detailData: []
      }
    },
    props: {
      dealerId: {
        type: String,
        default: ''
      }
    },
    methods: {
      goBack () {
        this.$router.back()
      },
      print () {
        window.open(`${this.$http.defaults.baseURL.split('/')[0]}/report/fleegoodsanalysis?id=${this.dealerId}`);
      },
      pageChange (page) {
        this.getdetailTable(page, this.dealerId)
      },
      getdetailTable (page, dealerId) {
        this.current_page = page
        this.updatedata = {
          _loading: true,
          page: page,
          size: this.pageSize,
          queryFilter: [
            {
              property: 'dealerId',
              op: '=',
              value: dealerId
            }
          ]
        }
        this.$http.post(`order/illegalGoodsInfo/analysis`, this.updatedata).then((res) => {
          this.detailData = res.content
          if (this.detailData.length > 0) {
            this.dealerName = res.content[0].dealerName
            this.total_num = res.totalCount
            this.error = null
          } else {
            this.detailData = []
            this.total_num = 0
            this.error = {
              type: 2,
              title: '没有对应条件的数据',
              content: '没有对应条件的数据，请改变查询条件后重新尝试',
              action: '重新尝试'
            }
            return
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
      }
    },
    mounted () {
      this.getdetailTable(1, this.dealerId)
    }
  }
</script>
