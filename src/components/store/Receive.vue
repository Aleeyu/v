<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>库存管理</BreadcrumbItem>
        <BreadcrumbItem>入库管理</BreadcrumbItem>
        <BreadcrumbItem v-if="displayDetail">入库信息列表</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <Row v-if="!displayDetail && !error">
      <Row type="flex" justify="end" align="middle">
        <Input v-model="receive.wd" style="width: 300px;" placeholder="关键字：单号/生产单号" @on-enter="queryReceive(1)">
          <Button slot="append" @click="queryReceive(1)">搜索</Button>
        </Input>
      </Row>
      <Table stripe :columns="receive.columns" :data="receive.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="receive.page"
          :page-size="receive.pageSize"
          :total="receive.totalCount"
          @on-change="queryReceive"></Page>
      </Row>
    </Row>
    <Row v-if="displayDetail">
      <Row type="flex" justify="space-between" align="middle">
        <Button type="primary" @click="back">返回</Button>
      </Row>
      <Table stripe :columns="detail.columns" :data="detail.data"></Table>
    </Row>

    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoading"></error-view>
  </Card>
</template>

<script>
  import qrcodeExpand from '@/components/store/QrCodeExpand';

  export default {
    data () {
      return {
        receive: {
          wd: null,
          id: null,
          columns: [
            {
              title: '单号',
              key: 'code'
            },
            {
              title: '生产单号',
              key: 'productionCode'
            },
            {
              title: '发货人',
              render (h, p) {
                return h('span', p.row.sendBy || '厂商')
              }
            },
            {
              title: '收货人',
              render (h, p) {
                return h('span', p.row.receivedBy || '无')
              }
            },
            {
              title: '收货时间',
              render: (h, p) => {
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
                        this.showDetail(p.row.id)
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
        detail: {
          wd: null,
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
          data: []
        },
        displayDetail: false,
        error: null,
        errorLoading: false
      }
    },
    methods: {
      initPage () {
        this.receive.wd = this.$route.query.productioncode;
        this.receive.id = this.$route.query.id;
        if (this.receive.id) {
          this.showDetail(this.receive.id);
        } else {
          this.queryReceive();
        }
      },
      queryReceive (page = this.receive.page) {
        let data = {
          _loading: true,
          page,
          size: this.receive.pageSize,
          orderBy: [
            { property: 'receivedTime', order: 'desc' }
          ],
          queryFilter: [
            { property: 'type', op: '=', value: '0' }
          ],
          wd: this.receive.wd
        }

        this.error ? this.errorLoading = true : data._loading = true;

        this.$http.post(`/store/invoiceReceipt/product/all/search`, data).then(res => {
          this.receive.data = res.content
          this.receive.page = res.page
          this.receive.totalCount = res.totalCount

          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
        })
      },
      showDetail (id) {
        this.displayDetail = true;

        // this.$router.push({
        //   path: this.$route.path,
        //   query: {
        //     id: id,
        //     token: this.$route.query.token
        //   }
        // });

        this.queryDetail(id);
      },
      queryDetail (id) {
        if (this.error) {
          this.errorLoading = true
        }

        this.$http.get(`/store/receiptItems/${id}`).then(res => {
          ({
            storeInfo: this.detail.info,
            storeItems: this.detail.data
           } = res)
          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
        })
      },
      back () {
        this.displayDetail = false
        if (this.$route.query.token) {
          this.$router.go(-1);
        }
      },
      toPrint (id) {
        window.open(`${window.location.origin}/report/receipt/${id}`);
      }
    },
    mounted () {
      this.initPage()
    }
  }
</script>
