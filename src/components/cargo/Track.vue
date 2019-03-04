<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <Breadcrumb-item >货物跟踪</Breadcrumb-item>
        <Breadcrumb-item >货物跟踪</Breadcrumb-item>
      </Breadcrumb>
    </p>
    <div>
      <Row type="flex" justify="space-between">
        <i-col></i-col>
        <i-col class="v-inline">
          <div>
            <Input style="width:400px;" id="cargo_manage_keyword" v-model.lazy.trim="setter.code" placeholder="请输入流水号查询货物信息"
                   @on-enter="queryByManual">
            <Button id="cargo_manage_query" slot="append" @click="queryByManual" :loading="busy">搜索</Button>
            </Input>
          </div>
        </i-col>
        <i-col></i-col>
      </Row>
      <Table id="cargo_manage_list" stripe :columns="list.columns" :data="list.store" v-if="!error"></Table>
    </div>
    <error-view v-if="error" :error="error" name="货物跟踪信息" @action="errorAction"
                :loading="busy" id="cargo_error"></error-view>
  </Card>
</template>

<script>
  export default {
    data () {
      return {
        error: null,
        busy: false,
        color: 'blue',
        setter: {
          code: ''
        },
        list: {
          columns: [{
            title: '单元识别码',
            width: 280,
            render: (h, p) => {
              return h('div', [
                h('span', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.base.code)
              ])
            }
          }, {
            title: '产品名称',
            width: 120,
            render: (h, p) => {
              return h('div', [
                h('span', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.base.productName)
              ])
            }
          }, {
            title: '状态',
            width: 80,
            render: (h, p) => {
              return h('div', [
                h('span', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.base.state)
              ])
            }
          }, {
            title: '订单号',
            ellipsis: true,
            render: (h, p) => {
              return h('span', {
                style: {
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: this.color,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    if (p.row.order && p.row.order.orderNo) {
                      this.$router.push({
                        path: '/order/order',
                        query: this.$PageToken({
                          current: 'show-order',
                          id: p.row.order.id
                        })
                      })
                    }
                  }
                }
              }, p.row.order && p.row.order.orderNo || '暂无订单')
            }
          }, {
            title: '生产单号',
            ellipsis: true,
            render: (h, p) => {
              return h('span', {
                style: {
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: this.color,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    if (p.row.production && p.row.production.productionCode) {
                      this.$router.push({
                        path: '/production/order',
                        query: this.$PageToken({
                          id: p.row.production.productionId
                        })
                      })
                    }
                  }
                }
              }, p.row.production && p.row.production.productionCode || '暂无生产单号')
            }
          }, {
            title: '入库单号',
            ellipsis: true,
            render: (h, p) => {
              return h('span', {
                style: {
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: this.color,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    if (p.row.receipt && p.row.receipt.id) {
                      this.$router.push({
                        path: '/store/receive',
                        query: this.$PageToken({
                          id: p.row.receipt.id
                        })
                      })
                    }
                  }
                }
              }, p.row.receipt && p.row.receipt.code || '暂无入库单号')
            }
          }, {
            title: '出库单号',
            ellipsis: true,
            render: (h, p) => {
              return h('span', {
                style: {
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: this.color,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    if (p.row.invoice && p.row.invoice.id) {
                      this.$router.push({
                        path: '/store/outstore',
                        query: this.$PageToken({
                          id: p.row.invoice.id
                        })
                      })
                    }
                  }
                }
              }, p.row.invoice && p.row.invoice.code || '暂无出库单号')
            }
          }],
          store: []
        }
      }
    },
    methods: {
      shunt: function () {
        this.error = {
          title: '查询货物跟踪信息',
          content: '您可以输入流水号查询货物跟踪信息'
        }
        this.list.store = [];
        if (this.$route.query.code) {
          this.setter.code = this.$route.query.code
          this.query()
        }
      },
      errorAction: function () {
        this.shunt()
      },
      queryByManual: function () {
        this.$router.push({
          path: this.$route.path,
          query: {
            code: this.setter.code
          }
        })
      },
      query: function () {
        this.busy = true
        this.$http.get(`trackByCode/${this.$route.query.code}`).then(res => {
          this.error = null;
          this.list.store = [];
          if (res.order && res.order.orderNo) {
            this.color = 'blue'
          } else {
            this.color = 'gray'
          }
          this.list.store.push(res)
        }).catch(res => {
          this.error = {
            title: '未能找到货物信息',
            content: '您可以重新输入流水号查询'
          }
        }).finally(() => {
          this.busy = false
        })
      }
    },
    mounted: function () {
      this.shunt()
    },
    watch: {
      $route: 'shunt'
    }
  }
</script>

<style lang="less">

</style>
