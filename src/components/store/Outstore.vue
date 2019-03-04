<style lang="less">
  .outstore-container {
    .ivu-select-dropdown {
      width: 180px!important;
    }
  }
</style>


<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>库存管理</BreadcrumbItem>
        <BreadcrumbItem>出库管理</BreadcrumbItem>
        <BreadcrumbItem v-if="displayDetail">出库信息列表</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <Row v-if="!displayDetail && !error">
      <!-- 搜索功能 -->
      <Row type="flex" justify="end" align="middle" class="outstore-container">
        <Input v-model="outStore.wd" 
               style="width: 350px;" 
               placeholder="关键字：单号/订单号" 
               @on-enter="queryInvoiceList(1)">
          <Select v-model="dealer.selectedDealer" 
                  filterable
                  clearable
                  :loading="dealer.loading"
                  slot="prepend"
                  style="width:120px"
                  placeholder="选择收货经销商">
            <Option v-for="item in dealer.data" 
                    :value="item.name" 
                    :key="item.id">{{ item.name }}</Option>
          </Select>
          <Button slot="append" @click="queryInvoiceList(1)">搜索</Button>
        </Input>
      </Row>
      <Table stripe :columns="outStore.columns" :data="outStore.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="outStore.page"
          :page-size="outStore.pageSize"
          :total="outStore.totalCount"
          @on-change="queryInvoiceList"></Page>
      </Row>
    </Row>

    <!-- 出/入库信息列表 -->
    <Row v-if="displayDetail && !error">
      <Row type="flex" justify="space-between" align="middle">
        <Button type="primary" @click="goBack">返回</Button>
      </Row>
      <Table stripe :columns="detailInfo.columns" :data="detailInfo.data"></Table>
    </Row>

    <!-- 异常界面 -->
    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoaing"></error-view>
  </Card>
</template>

<script>
  import qrcodeExpand from '@/components/store/QrCodeExpand';

  export default {
    data () {
      return {
        dealer: {
          page: 1,
          pageSize: 10000,
          data: [],
          loading: true,
          selectedDealer: null
        },
        outStore: {
          wd: null,
          columns: [
            {
              title: '单号',
              key: 'code'
            },
            {
              title: '订单号',
              key: 'productionCode'
            },
            {
              title: '发货人',
              key: 'sendBy'
            },
            {
              title: '发货经销商',
              key: 'sendDepName'
            },
            {
              title: '发货时间',
              render (h, p) {
                return h('span', new Date(p.row.sendTime).toLocaleString())
              }
            },
            {
              title: '收货人',
              render (h, p) {
                return h('span', p.row.receivedBy || '无')
              }
            },
            {
              title: '收货经销商',
              key: 'receivedDepName'
            },
            {
              title: '收货时间',
              render (h, p) {
                return h('span', p.row.receivedTime ? new Date(p.row.receivedTime).toLocaleString() : '暂未收货')
              }
            },
            {
              title: ' ',
              align: 'right',
              width: '180',
              render: (h, p) => {
                return h('ButtonGroup', [
                  h('Button', {
                    props: {
                      type: 'default'
                    },
                    on: {
                      click: () => {
                        this.showDetailInfo(p.row.id)
                      }
                    }
                  }, '查看详情'),
                  h('Button', {
                    props: {
                      type: 'primary'
                    },
                    on: {
                      click: () => {
                        this.toPrint(p.row.id)
                      }
                    }
                  }, '打印')
                ])
              }
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: []
        },
        detailInfo: {
          columns: [
            {
              type: 'expand',
              width: 50,
              render (h, p) {
                return h(qrcodeExpand, {
                  props: {
                    row: p.row.storeDetailList
                  }
                })
              }
            },
            {
              title: '产品名称',
              key: 'productName'
            },
            {
              title: '产品数量',
              key: 'amount'
            },
            {
              title: '产品数量备注',
              key: 'amountInfo'
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          info: {},
          data: []
        },
        displayDetail: false,
        error: null,
        errorLoaing: false,
        firstLoading: true
      }
    },
    methods: {
      initPage () {
        this.outStore.wd = this.$route.query.productioncode;
        this.outStore.id = this.$route.query.id;
        if (this.outStore.id) {
          this.showDetailInfo(this.outStore.id);
        } else {
          this.queryInvoiceList();
        }
        this.queryDealer();
      },
      queryDealer (query) {
        let data = {
          page: this.dealer.page,
          size: this.dealer.pageSize,
          orderBy: [
            { property: 'dealerLevel', order: 'asc' },
            { property: 'createdTime', order: 'desc' }
          ],
          queryFilter: []
        }

        if (query) {
          data.queryFilter.push({ property: 'name', op: 'like', value: query })
        }

        this.$http.post('/system/dealers', data).then(res => {
          this.dealer.data = res.content;
          this.dealer.data.unshift({
            name: '厂商',
            id: '0001'
          })
        }).catch(err => {
          console.log(err)
          this.error = this.$Err.unhandled();
        }).finally(() => {
          this.dealer.loading = false;
          this.errorLoaing = false;
        })
      },
      showDetailInfo (id) {
        this.displayDetail = true;
        this.queryDetailInfo(id);
      },
      queryInvoiceList (page = 1) {
        let data = {
          _loading: true,
          page,
          size: this.outStore.pageSize,
          orderBy: [
            {property: 'sendTime', order: 'desc'}
          ],
          queryFilter: [
            { property: 'type', op: '=', value: '1' }
          ],
          wd: this.outStore.wd
        }

        if (this.dealer.selectedDealer) {
          data.queryFilter.push({
            property: 'receivedDepName',
            op: '=',
            value: this.dealer.selectedDealer === '厂商' ? '' : this.dealer.selectedDealer
          })
        }

        this.error ? this.errorLoading = true : data._loading = true;

        this.$http.post(`/store/invoiceReceipt/product/all/search`, data).then(res => {
          ({content: this.outStore.data, page: this.outStore.page, totalCount: this.outStore.totalCount} = res);
          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      queryDetailInfo (id) {
        if (this.error) {
          this.errorLoaing = true
        }

        this.$http.get(`/store/invoiceItems/${id}`).then(res => {
          ({
            storeInfo: this.detailInfo.info,
            storeItems: this.detailInfo.data
           } = res)
          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      goBack () {
        this.displayDetail = false;
        if (this.$route.query.token) {
          this.$router.go(-1);
        }
      },
      toPrint (id) {
        window.open(`${window.location.origin}/report/invoice/${id}`);
      }
    },
    mounted () {
      this.initPage()
    }
  }
</script>
