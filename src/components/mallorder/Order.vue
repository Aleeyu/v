<style lang="less">
  .mallorder-container {
    .detail-container {
      .ivu-card {
        margin: 15px 0;
      }
      .add-margin-bottom {
        margin-bottom: 10px;
      }
      .key {
        min-width: 84px;
        display: inline-block;
      }
    }
  }
</style>

<template>
  <Card class="mallorder-container">
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>商城订单管理</BreadcrumbItem>
        <BreadcrumbItem v-if="!displayDetail">订单管理</BreadcrumbItem>
        <BreadcrumbItem v-if="displayDetail">订单详情</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <Row v-if="!error && !displayDetail">
      <Row type="flex" justify="end" align="middle">
        <DatePicker type="daterange"
                    @on-change="changeDate" 
                    :options="order.dateOptions" 
                    placement="bottom-end" 
                    placeholder="选择交易时间" 
                    style="width: 250px;margin-right: 10px"></DatePicker>
        <Input v-model="queryFilter.orderNo" 
               placeholder="订单号"
               style="width: 250px;margin-right: 10px" @on-enter="queryOrderList(1)"></Input>
        <Button type="default" @click="queryOrderList(1)">搜索</Button>
      </Row>
      <Table stripe :columns="order.columns" :data="order.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="order.page"
          :page-size="order.pageSize"
          :total="order.totalCount"
          @on-change="queryOrderList"></Page>
      </Row>
    </Row>

    <Row v-if="!error && displayDetail" class="detail-container">
      <ButtonGroup>
        <Button type="default" @click="back">返回</Button>
        <Button :disabled="!(detail.data.status === 1)" @click="showExpress(detail.data.orderId)">发货</Button>
        <!-- <Button :disabled="!(detail.data.status < 3)" type="warning" @click="cancel(detail.data.orderId)">撤销</Button> -->
      </ButtonGroup>
      <Card dis-hover>
        <p slot="title">订单信息</p>
        <Row type="flex" justify="start">
          <Col span="8">
            <span class="key">订单号：</span>
            <span class="value">{{detail.data.orderNo}}</span>
          </Col>
          <Col span="8">
            <span class="key">下单时间：</span>
            <span class="value">{{new Date(detail.data.createdTime).format()}}</span>
          </Col>
          <Col span="8">
            <span class="key">会员手机号：</span>
            <span class="value">{{detail.data.phone || '暂无'}}</span>
          </Col>
        </Row>
      </Card>
      <Card dis-hover>
        <p slot="title">商品列表</p>
        <Table :columns="detail.columns" :data="detail.data.orderDetails"></Table>
      </Card>
      <Card dis-hover>
        <p slot="title">支付信息</p>
        <Row type="flex" justify="start">
          <Col span="8" class="add-margin-bottom">
            <span class="key">折扣金额（元）：</span>
            <span class="value">{{detail.data.discountAmount | filterMoney}}</span>
          </Col>
          <Col span="8" class="add-margin-bottom">
            <span class="key">快递费（元）：</span>
            <span class="value">{{detail.data.postage | filterMoney}}</span>
          </Col>
          <Col span="24" class="add-margin-bottom">
            <span class="key">订单总价（元）：</span>
            <span class="value">{{detail.data.totalAmount | filterMoney}}</span>
          </Col>
          <Col span="24">
            <span class="key">实付款（元）：</span>
            <span class="value">{{detail.data.actualAmount | filterMoney}}</span>
          </Col>
        </Row>
      </Card>
      <Card dis-hover>
        <p slot="title">配送信息</p>
        <Row type="flex" justify="start">
          <Col span="24" class="add-margin-bottom">
            <span class="key">送货信息：</span>
            <span class="value">{{detail.data.address ? detail.data.address.replace(/\#/g, ' ') : '-'}}</span>
          </Col>
          <Col span="8" class="add-margin-bottom">
            <span class="key">联系人姓名：</span>
            <span class="value">{{detail.data.nickName}}</span>
          </Col>
          <Col span="24" class="add-margin-bottom">
            <span class="key">用户备注：</span>
            <span class="value">{{detail.data.comment || '无'}}</span>
          </Col>
          <Col span="24">
            <span class="key">物流信息：</span>
            <span class="value">
              {{detail.data.expressCompany ? detail.data.expressCompany + '，' + detail.data.expressNo : '暂无'}}
            </span>
          </Col>          
        </Row>
      </Card>
    </Row>

    <Modal v-model="displayExpress"
           title="填写物流信息" 
           ok-text="发货"
           @on-ok="delivery"
           @on-cancel="clearExpress">
      <Form ref="expressForm" :model="express.form" :rules="express.rules">
        <FormItem prop="company">
          <Select v-model="express.form.company" clearable placeholder="选择物流公司" style="width:100%;">
            <Option v-for="item in express.list" :value="item.name" :key="item.name">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="other" v-if="express.form.company === '其他'">
          <Input v-model="express.form.other" placeholder="填写其他物流公司名称" style="width:100%;"></Input>
        </FormItem>
        <FormItem prop="expressNo">
          <Input v-model="express.form.expressNo" placeholder="填写物流单号" style="width:100%;"></Input>
        </FormItem>
      </Form>
    </Modal>

    <!-- 异常界面 -->
    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoading"></error-view>
  </Card>
</template>

<script>
  export default {
    data () {
      return {
        error: null,
        errorLoading: false,
        displayDetail: false,
        displayExpress: false,
        order: {
          wd: null,
          dateOptions: {
            shortcuts: [
              {
                text: '一周内',
                value () {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  return [start, end];
                }
              },
              {
                text: '一月内',
                value () {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                  return [start, end];
                }
              },
              {
                text: '一季内',
                value () {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                  return [start, end];
                }
              }
            ]
          },
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: [],
          columns: [
            {
              title: '订单号',
              key: 'orderNo'
            },
            {
              title: '订单金额（元）',
              render: (h, p) => {
                return h('span', (p.row.totalAmount / 100).toFixed(2))
              }
            },
            {
              title: '联系人',
              key: 'nickName'
            },
            {
              title: '电话',
              render: (h, p) => {
                return h('span', p.row.phone || '暂无')
              }
            },
            {
              title: '下单时间',
              render: (h, p) => {
                return h('span', p.row.createdTime ? new Date(p.row.createdTime).format() : '暂无')
              }
            },
            {
              title: '订单状态',
              render: (h, p) => {
                return h('span', this.filterStatus(p.row.status))
              }
            },
            {
              title: '操作',
              width: 220,
              render: (h, p) => {
                let renderArr = [
                  h('Button', {
                    props: {
                      type: 'default'
                    },
                    on: {
                      click: () => {
                        this.showDetail(p.row.orderId)
                      }
                    }
                  }, '详情'),
                  h('Button', {
                    props: {
                      type: 'default',
                      disabled: p.row.status === 1 ? false : true
                    },
                    on: {
                      click: () => {
                        this.showExpress(p.row.orderId)
                      }
                    }
                  }, '发货')
                  // h('Button', {
                  //   props: {
                  //     type: 'warning',
                  //     disabled: p.row.status < 3 ? false : true
                  //   },
                  //   on: {
                  //     click: () => {
                  //       this.cancel(p.row.orderId)
                  //     }
                  //   }
                  // }, '撤销')
                ];

                return h('ButtonGroup', renderArr)
              }
            }
          ]
        },
        detail: {
          data: {},
          columns: [
            {
              title: '商品名称',
              key: 'goodsName'
            },
            {
              title: '规格',
              key: 'spec'
            },
            {
              title: '商品价格（元）',
              render: (h, p) => {
                return h('span', (p.row.salesPrice / 100).toFixed(2))
              }
            },
            {
              title: '商品数量',
              key: 'number'
            },
            {
              title: '总价（元）',
              render: (h, p) => {
                return h('span', (p.row.sumPrice / 100).toFixed(2))
              }
            }
          ]
        },
        express: {
          form: {
            company: '',
            other: '',
            expressNo: ''
          },
          rules: {
            company: [
              {required: true, message: '物流公司为必填项', trigger: 'change'}
            ],
            expressNo: [
              {required: true, message: '物流单号为必填项', trigger: 'blur'}
            ]
          },
          list: [
            {name: '顺丰'},
            {name: '圆通'},
            {name: '申通'},
            {name: '邮政（EMS）'},
            {name: '中通'},
            {name: '其他'}
          ],
          id: null
        },
        queryFilter: {
          pickTime: [],
          orderNo: null
        }
      }
    },
    filters: {
      filterMoney (m) {
        return (m / 100).toFixed(2);
      }
    },
    methods: {
      initPage () {
        /**
         * 如果url中有订单id则进入订单详情页
         * 没有则为订单列表页
         */
        if (this.$route.query.id) {
          this.queryDetail()
        }
        this.queryOrderList()
      },
      filterStatus (v) {
        const status = ['待付款', '待发货', '待收货', '已完成', '已取消', '已关闭', '已删除'];
        return status[v];
      },
      queryOrderList (page = 1) {
        let data = {
          page,
          size: this.order.pageSize,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: []
        };
        
        this.error ? this.errorLoading = true : data._loading = true;

        this.$http.post(`/system/mallorder/search`, this.formatSearch(data)).then(res => {
          ({content: this.order.data, page: this.order.page, totalCount: this.order.totalCount} = res);
        }).catch(err => {
          console.log(err);
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
        })
      },
      formatSearch (query) {
        if (this.queryFilter.pickTime && 
            this.queryFilter.pickTime[0] && 
            this.queryFilter.pickTime[1]) {
          query.queryFilter.push(
            {property: 'createdTime', op: '>=', value: this.queryFilter.pickTime[0]},
            {property: 'createdTime', op: '<=', value: this.queryFilter.pickTime[1] + 24 * 60 * 60 * 1000 - 1}
          )
        }

        if (this.queryFilter.orderNo) {
          query.queryFilter.push({
            property: 'orderNo', op: 'like', value: this.queryFilter.orderNo
          })
        }

        return query;
      },
      changeDate (v) {
        this.queryFilter.pickTime = v.map(e => new Date(e).getTime());
      },
      showDetail (id) {
        this.$router.push({
          path: this.$route.path,
          query: {
            id: id
          }
        });
        this.queryDetail();
      },
      queryDetail () {
        this.error ? this.errorLoading = true : this.displayDetail = true;

        let id = this.$route.query.id;
        
        this.$http.get(`/system/mallorder/${id}`).then(res => {
          this.detail.data = res;
          this.error = null;
          this.displayDetail = true;
        }).catch(err => {
          console.log(err);
          this.error = this.$Err.unhandled();
        }).finally(() => {
          this.errorLoading = false
        })
      },
      showExpress (id) {
        this.displayExpress = true;
        this.express.id = id;
      },
      delivery () {
        this.$refs['expressForm'].validate(valid => {
          if (!valid) return this.$Message.error('物流信息填写错误');

          if (this.error) {
            this.errorLoading = true;
          }

          let data = {
            expressCompany: this.express.form.other || this.express.form.company,
            expressNo: this.express.form.expressNo
          };

          this.$http.post(`/system/mallorder/${this.express.id}/express`, data).then(res => {
            this.error = null;
            res ? this.$Message.info('发货成功') : this.$Message.error('发货失败');
            this.initPage();
          }).catch(err => {
            console.log(err);
            this.error = this.$Err.unhandled();
          }).finally(() => {
            this.errorLoading = false
          })
        })
      },
      clearExpress () {
        this.express.form = {
          company: '',
          other: '',
          expressNo: ''
        }
      },
      cancel (id) {
        if (this.error) {
          this.errorLoading = true;
        }

        this.$Modal.confirm({
          title: '撤销订单提醒',
          content: '确定撤销该订单吗？',
          onOk: () => {
            this.$http.put(`/system/mallorder/${id}`, {
              status: 4
            }).then(res => {
              this.error = null;
              res ? this.$Message.info('撤销成功') : this.$Message.error('撤销失败');
              this.initPage();
            }).catch(err => {
              console.log(err);
              this.error = this.$Err.unhandled();
            }).finally(() => {
              this.errorLoading = false
            })
          }
        })
      },
      back () {
        this.$router.push({
          path: this.$route.path
        });
        this.displayDetail = false;
      }
    },
    mounted () {
      this.initPage();
    }
  }
</script>
