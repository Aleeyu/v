<style lang="less" scoped>
  .title {
    background: #f8f8f9;
    padding: .5em 1em;
    margin: 0 -16px 10px -16px;
  }

  .orderform h4 {
    padding-top: 2px;
  }

  .order-usual-specification {
    display: flex;
    li {
      flex: 1;
      & :first-child {
        margin-right: 32px;
      }
    }
  }

  .main {
    display: flex;
    align-items: center;
  }

  .orderTrackBox {
    display: flex;
    justify-content: space-between;
  }

  .item {
    padding: 0px 10px;
  }

  .children > .item::after, .children > .item::before {
    content: "";
    display: block;
    width: 20px;
    height: 1px;
    background: black;
  }

  .children > .item::after {
    -webkit-transform: translate(-20px, -10px);
  }

  .children > .item::before {
    -webkit-transform: rotate(90deg) translate(0px, 30PX);
  }

  .children > .item:first-child::before {
    background: transparent;
  }
</style>

<style lang="less">
  .order-track {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    margin-left: 30px;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: -30px;
      height: 1px;
      width: 30px;
      background-color: #dddee1;
    }

    &:after {
      content: '';
      position: absolute;
      height: 100%;
      width: 1px;
      left: -30px;
      top: 0;
      background-color: #dddee1;
    }

    &:first-of-type:after {
      height: 50%;
      top: 50%;
    }

    &:last-of-type:after {
      height: 50%;
    }

    &-sub {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &-first > .order-track {
        &:after, &:before {
          display: none;
        }
      }

      &-single > .order-track:after {
        display: none;
      }
    }

    &-nosub:after {
      display: none;
    }

    &-item {
      display: flex;
      margin: 16px 0;
      flex-direction: row;
      align-items: center;

      &:after {
        content: '';
        width: 30px;
        height: 1px;
        margin-top: 1px;
        background-color: #dddee1;
      }

      &-info {
        padding: 16px;
        border-radius: 4px;
        border: rgba(0, 0, 0, .1) solid 1px;
        background-color: #f8f8f9;
        transition: all 300ms;
        cursor: pointer;

        h3, h4 {
          text-align: center;
          font-weight: normal;
        }
      }

      &:hover .order-track-item-info {
        background-color: #2d8cf0;
        color: white;
      }
    }
  }
</style>

<template>
  <div class="content-inner">
    <card v-if="!this.$route.query.current" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>订单</Breadcrumb-item>
          <Breadcrumb-item>列表</Breadcrumb-item>
        </Breadcrumb>
      </p>

      <div>
        <Row>
          <i-col>
            <iCol v-if="!listError" style="float: left; margin-bottom: 20px;">
              <Button id="order_order_btn_addorder" @click="addOrder">
                新建订单
              </Button>
            </iCol>
            <div style="width: auto;float: right">
              下单日期：
              <DatePicker :editable="false" type="daterange" placeholder="选择日期" style="width: 180px" @on-change="changeTime"></DatePicker>
              <span style="padding-left: 10px">经销商：</span>
              <Select v-model="searchConfig.dealerId" clearable style="width:170px" id="order_order_select_dealerName">
                <Option v-for="item in dealersList" :value="item.id" :key="item.id">{{ item.name
                  }}
                </Option>
              </Select>
              <span style="padding-left: 10px">状态：</span>
              <Select v-model="searchConfig.status" clearable style="width:100px">
                <Option v-for="(item,index) in statusArray" :value="index" :key="index">{{ item}}
                </Option>
              </Select>
              <Button slot="append" id="order_order_btn_search" @click="getorderList(1)">搜索</Button>
            </div>
          </i-col>
        </Row>
      </div>

      <Row>
        <i-col span="24">
          <div v-if="loadedSuccess" style="padding-bottom: 10px;width: 100%">
            <div style="clear: both">
              <Table id="order_order_table_orderlist" stripe :columns="titleData" :data="detailData"
                     style="clear: both; margin: 0 0 20px 0"></Table>
              <Page id="order_order_page_orderlist" :total="total_num" show-elevator show-total
                    style="float:right;margin:10px 0 0 0;" :current="current_page"
                    @on-change="pageChange" :page-size="10" size="small"></Page>
            </div>
            <div style="clear: both"></div>
          </div>
          <error-view id="order_order_list_error" :error="listError" name="订单" @action="errorAction"
                      :loading="loadingList"></error-view>
        </i-col>
      </Row>
    </card>
    <card v-if="this.$route.query.current && this.$route.query.current !== 'show-track'" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>订单</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current && !this.$route.query.id">创建订单</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current === 'edit-order'">编辑订单</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current === 'show-order'">查看订单</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <div v-show="!editError">
        <Row v-if="this.$route.query.current === 'show-order'">
          <Button id="order_order_btn_back" @click="goBack" type="primary">返回</Button>
        </Row>
        <row>
          <Form label-position="left" :label-width="100" size="large" ref="currentItem" :model="currentItem" class="orderform"
                :rules="productRules">
            <div v-if="this.$route.query.current !== 'add-order'">
              <Form-item label="订单号">
                <h4>{{currentItem.orderNo}}</h4>
              </Form-item>
              <Form-item label="目标区域">
                <h4>{{currentItem.targetArea}}</h4>
              </Form-item>
              <Form-item label="创建时间">
                <h4>{{currentItem.createdTime ? new Date(currentItem.createdTime).toLocaleDateString() : '-'}}</h4>
              </Form-item>
              <Form-item label="创建人">
                <h4>{{currentItem.creator || '-'}}</h4>
              </Form-item>
              <Form-item label="更新人">
                <h4>{{currentItem.updator || '-'}}</h4>
              </Form-item>
              <Form-item label="更新时间">
                <h4>{{currentItem.updatedTime ? new Date(currentItem.updatedTime).toLocaleDateString() : '-'}}</h4>
              </Form-item>
              <Form-item label="状态">
                <h4>{{statusArray[currentItem.status]}}</h4>
              </Form-item>
              <Form-item label="发货时间">
                <h4>{{currentItem.deliverTime ? new Date(currentItem.deliverTime).toLocaleDateString() : '-'}}</h4>
              </Form-item>
              <Form-item label="总数量">
                <h4>{{currentItem.amount + '盒'}}</h4>
              </Form-item>
            </div>
            <Form-item label="下单时间" prop="orderTime">
              <DatePicker :readonly="this.$route.query.current === 'show-order'" type="date" :clearable="false"
                          v-model="itemTime.orderTime" placeholder="选择日期" @on-change="changeOrderTime"
                          style="width:100%;"></DatePicker>
            </Form-item>
            <Form-item label="紧急程度" prop="urgentLevel">
              <Select :disabled="this.$route.query.current === 'show-order'" v-model="currentItem.urgentLevel"  filterable>
                <Option v-for="(item,index) in urgentArray" :value="index" :key="index">{{ item}}</Option>
              </Select>
            </Form-item>
            <Form-item label="订单类型" prop="orderType">
              <Select :disabled="this.$route.query.current === 'show-order'" v-model="currentItem.orderType" filterable>
                <Option v-for="item in orderType" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Form-item>
            <Form-item label="经销商" prop="dealerId">
              <Select :disabled="this.$route.query.current === 'show-order'" v-model="currentItem.dealerId" @on-change="dealerDetail" filterable>
                <Option v-for="item in dealersList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </Form-item>
            <Form-item label="经销商信息" v-if="this.showDealer">
              <Table id="order_order_table_dealerlist" stripe :columns="dealerTitle" style="margin-top: 5px"
                     size="small"
                     width="720"
                     :data="dealerData"></Table>
            </Form-item>
            <Form-item label="产品">
              <Button v-if="this.$route.query.current !== 'show-order'" @click="addProduct">添加产品</Button>
              <Table id="order_order_table_productlist" stripe :columns="productTitle" @on-row-click="toDetail" style="margin-top: 5px"
                     size="small"
                     width="720"
                     :data="productData"></Table>
            </Form-item>
            <Form-item label="备注">
              <Input :readonly="this.$route.query.current === 'show-order'" v-model="currentItem.comment"
                     type="textarea" :maxlength="200" :rows="4" style="width: 720px"
                     placeholder="备注。。。"></Input>
            </Form-item>
            <Alert type="error" id="order_order_alert_error" v-show="errorMessage.saveProduce">
              {{errorMessage.saveProduce}}
            </Alert>
            <Form-item v-if="this.$route.query.current !== 'show-order'">
              <Button id="order_addorder_btn_save" type="primary" :disabled="this.savebtn" @click="saveOrder('currentItem')">保存
              </Button>
              <Button id="order_addorder_btn_back" @click="goBack">取消
              </Button>
            </Form-item>
          </Form>
        </row>
      </div>
      <error-view id="order_order_edit_error" :error="editError" name="订单" @action="getOrderById($route.query.id)"
                  :loading="editNow"></error-view>
    </card>
    <card v-if="this.$route.query.current && this.$route.query.current === 'show-track'" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>订单</Breadcrumb-item>
          <Breadcrumb-item>订单跟踪</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <Row>
        <i-col>
          <iCol v-if="!listError" style="float: left; margin-bottom: 20px;">
            <Button type="primary" @click="goBack" id="order_track_back">返回</Button>
          </iCol>
          <div style="width: auto;float: right">
            发货日期：
            <DatePicker id="order-track-query-begintime" type="date" placeholder="起始日期" style="width: 180px"
                        v-model="track.setter.beginTime"></DatePicker>
            ~
            <DatePicker id="order-track-query-endtime" type="date" placeholder="结束日期" style="width: 180px"
                        v-model="track.setter.endTime"></DatePicker>
            <Button id="order-track-query-btn" @click="trackQueryByManual">搜索</Button>
          </div>
          <!--<div style="width: auto;float: right;margin-right:10px">
            订单号：
            <Input id="order-track-query-orderid" v-model.trim="track.setter.orderId" placeholder="请输入订单号"
                   style="width: 180px"></Input>
          </div>-->
          <div style="width: auto;float: right;margin-right:10px">
            产品名称：
            <Input id="order-track-query-productname" v-model.trim="track.setter.productName" @on-enter="trackQueryByManual" placeholder="请输入产品名称"
                   style="width: 180px"></Input>
          </div>
        </i-col>
      </Row>
      <div>
        <div class="orderTrackBox">
          <span class="orderTrackItemTitle">订单号:{{orderInfo.orderNo}}</span>
          <span class="orderTrackItemTitle">订单时间:{{new Date(orderInfo.orderTime).toLocaleDateString()}}</span>
        </div>
        <div class="orderTrackItem">
          <span class="orderTrackItemTitle">经销商名称:</span><span
          class="orderTrackItemInfo">{{orderInfo.dealerName}}</span>
        </div>
      </div>
      <order-track :data="track.store" v-if="track.store" class="order-track-panel"></order-track>
      <error-view v-if="track.error" id="order_order_track_error" :error="track.error" name="订单跟踪信息"
                  @action="trackQueryByManual"
                  :loading="track.busy"></error-view>
    </card>
  </div>
</template>

<script type="text/ecmascript-6">
  import OrderTrack from '@/components/order/Track'

  export default {
    components: {OrderTrack},
    data () {
      const orderTimePass = (rule, value, callback) => {
        if (value === null) {
          callback(new Error('下单时间不能为空'));
        } else {
          callback();
        }
      }
      const urgentLevelPass = (rule, value, callback) => {
        if (value === null) {
          callback(new Error('紧急程度不能为空'));
        } else {
          callback();
        }
      }
      const orderTypePass = (rule, value, callback) => {
        if (value === null) {
          callback(new Error('订单类型不能为空'));
        } else {
          callback();
        }
      }
      return {
        orderList: [],
        orderInfo: {},
        showDealer: false,
        savebtn: false,
        track: {
          busy: false,
          error: null,
          setter: {
            orderId: '',
            productName: '',
            beginTime: null,
            endTime: null
          },
          store: null
        },
        updatedata: {},
        statusArray: ['待下发', '已下发', '生产中', '已生产', '已发货', '生产已接收'],
        urgentArray: ['常规', '加急'],
        searchConfig: {
          dealerName: '',
          dealerId: '',
          status: ''
        },
        listError: null,
        loadingList: null,               // 列表加载中
        loading: true,                   // 加载中
        loadedSuccess: true,            //  加载成功
        total_num: 0,                    //  总条数
        currentItem: {                   // 已选的条目
          orderNo: '',
          dealerId: '',
          orderType: 0,
          deliverTime: null,
          orderItems: null,
          dealerName: '',
          orderTime: Date.parse(new Date()),
          urgentLevel: 0,
          status: 0,
          comment: '',
          amount: null
        },
        itemTime: {
          orderTime: new Date()
        },
        dealersList: [],
        current_page: 1,              // 当前页
        errorMessage: {               // 错误信息
          saveProduce: ''
        },
        orderType: [{value: 0, label: '现生产单'}, {value: 1, label: '备货单'}],
        productRules: {
          dealerId: [
            {required: true, message: '经销商名称不能为空', trigger: 'blur'}
          ],
          urgentLevel: [
            {required: true, validator: urgentLevelPass, trigger: 'blur'}
          ],
          orderType: [
        {required: true, validator: orderTypePass, trigger: 'blur'}
          ],
          orderTime: [
            {required: true, validator: orderTimePass, trigger: 'blur'}      //   应用自定义规则验证
          ]
        },
        currentIndex: -1,
        updateProduct: [],
        productList: [],
        titleData: [
          {
            title: '订单号',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', p.row.orderNo),
                h('p', `状态： ${this.statusArray[p.row.status]}`),
                h('p', {style: {color: p.row.urgentLevel === 1 ? 'red' : 'none'}}, `紧急程度： ${p.row.urgentLevel === 1 ? '加急' : '常规'}`)
              ])
            }
          },
          {
            title: '经销商',
            width: 230,
            render: (h, p) => {
              return h('div', [
                h('p', `经销商名称： ${p.row.dealerName || '-'}`),
                h('p', `目标区域： ${p.row.targetArea}`)
              ])
            }
          },
          {
            ellipsis: true,
            align: 'center',
            title: '总数量 (盒)',
            key: 'amount'
          },
          {
            ellipsis: true,
            align: 'center',
            title: '订单类型',
            render: (h, p) => {
              return h('div', [
                h('p', p.row.orderType === 0 ? '现生产单' : '备货单')
              ])
            }
          },
          {
            title: '下单时间',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', new Date(p.row.orderTime).toLocaleDateString())
              ])
            }
          },
          {
            title: ' ',
            key: 'action',
            width: 260,
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  on: {
                    click: (evt) => {
//                      window.location.href = `${this.$http.defaults.baseURL.split('/')[0]}/report/order?id=${params.row.id}`;
                      window.open(`${this.$http.defaults.baseURL.split('/')[0]}/report/order?id=${params.row.id}`);
                    }
                  }
                }, '打印'),
                h('Button', {
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.editOrder(params.row)
                      this.dealerDetail(params.row.dealerId)
                      evt.stopPropagation()
                    }
                  }
                }, '编辑'),
                h('Button', {
                  style: {display: (params.row.status !== 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.showOrder(params.row)
                      this.dealerDetail(params.row.dealerId)
                      evt.stopPropagation()
                    }
                  }
                }, '查看'),
                h('Button', {
                  style: {display: (params.row.status !== 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.ordeRtracking(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '订单跟踪'),
                h('Button', {
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.$http.put(`/order/${params.row.id}`, {status: 1}).then(() => {
                        this.$Message.success('下发成功')
                        this.getorderList(this.current_page)
                      }).catch((res) => {
                        this.$Message.error(res.message)
                      })
                      evt.stopPropagation()
                    }
                  }
                }, '下发'),
                h('Button', {
                  props: {type: 'warning'},
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.deleteOrder(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        detailData: [],
        productTitle: [
          {
            ellipsis: true,
            title: '产品名称',
            render: (h, params) => {
              let optionArray = []
              for (let i = 0; i < this.productList.length; i++) {
                optionArray.push(h('Option', {
                  props: {
                    value: this.productList[i].id,
                    key: this.productList[i].productName
                  },
                  style: {
                    display: 'inline-block'
                  }
                }, this.productList[i].productName),
                h('br'))
              }

              if (params.index !== this.currentIndex) {
                return this.updateProduct[params.index].proName
              } else {
                return h('Select', {
                  props: {
                    size: 'small',
                    value: this.updateProduct[params.index].proId
                  },
                  on: {
                    'on-change': (v) => {
                      for (let i = 0; i < this.productList.length; i++) {
                        if (this.productList[i].id === v) {
                          this.updateProduct[params.index].proName = this.productList[i].productName
                          this.boxCase = this.productList[i].boxCase
                          this.updateProduct[params.index].proId = v
                        }
                      }
                      this.calculate(params.index)
                      this.reflashTable()
                    }
                  }
                }, optionArray)
              }
            }
          },
          {
            ellipsis: true,
            title: '生产数量',
            width: 120,
            render: (h, params) => {
              if (params.index !== this.currentIndex) {
                return h('div', [
                  h('p', `箱： ${this.updateProduct[params.index].box}`),
                  h('p', `盒： ${this.updateProduct[params.index].cases}`)
                ])
              } else {
                return h('div', [
                  h('div', [
                    h('span', `箱：`),
                    h('Input', {
                      props: {
                        size: 'small',
                        min: 0,
                        value: this.updateProduct[params.index].box
                      },
                      style: {width: '75px'},
                      on: {
                        'on-blur': (v) => {
                          if (!isNaN(parseInt(v.srcElement.value)) && parseFloat(v.srcElement.value) < 1000 && parseFloat(v.srcElement.value) >= 0) {
                            this.updateProduct[params.index].box = parseInt(v.srcElement.value)
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ]),
                  h('div', [
                    h('span', `盒：`),
                    h('Input', {
                      props: {
                        size: 'small',
                        precision: 0,
                        min: 0,
                        value: this.updateProduct[params.index].cases
                      },
                      style: {width: '75px'},
                      on: {
                        'on-blur': (v) => {
                          if (!isNaN(parseInt(v.srcElement.value)) && parseFloat(v.srcElement.value) < 1000 && parseFloat(v.srcElement.value) >= 0) {
                            this.updateProduct[params.index].cases = parseInt(v.srcElement.value)
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ])
                ])
              }
            }
          },
          {
            ellipsis: true,
            title: '备货数量',
            width: 120,
            render: (h, params) => {
              if (params.index !== this.currentIndex) {
                return h('div', [
                  h('p', `箱： ${this.updateProduct[params.index].stockBox}`),
                  h('p', `盒： ${this.updateProduct[params.index].stockCases}`)
                ])
              } else {
                return h('div', [
                  h('div', [
                    h('span', `箱：`),
                    h('Input', {
                      props: {
                        disabled: this.currentItem.orderType === 0 ? false : true,
                        size: 'small',
                        min: 0,
                        value: this.updateProduct[params.index].stockBox
                      },
                      style: {width: '75px'},
                      on: {
                        'on-blur': (v) => {
                          if (!isNaN(parseInt(v.srcElement.value)) && parseFloat(v.srcElement.value) < 1000 && parseFloat(v.srcElement.value) >= 0) {
                            this.updateProduct[params.index].stockBox = parseInt(v.srcElement.value)
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ]),
                  h('div', [
                    h('span', `盒：`),
                    h('Input', {
                      props: {
                        disabled: this.currentItem.orderType === 0 ? false : true,
                        size: 'small',
                        precision: 0,
                        min: 0,
                        value: this.updateProduct[params.index].stockCases
                      },
                      style: {width: '75px'},
                      on: {
                        'on-blur': (v) => {
                          if (!isNaN(parseInt(v.srcElement.value)) && parseFloat(v.srcElement.value) < 1000 && parseFloat(v.srcElement.value) >= 0) {
                            this.updateProduct[params.index].stockCases = parseInt(v.srcElement.value)
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ])
                ])
              }
            }
          },
          {
            ellipsis: true,
            title: '单位金额',
            width: 150,
            render: (h, params) => {
              if (params.index !== this.currentIndex) {
                return h('div', [
                  h('p', `单价(元)： ${parseFloat(this.updateProduct[params.index].price).toFixed(2)}`),
                  h('p', `税率(%)： ${parseFloat(this.updateProduct[params.index].tax).toFixed(2)}`)
                ])
              } else {
                return h('div', [
                  h('div', [
                    h('span', `单价(元)：`),
                    h('Input', {
                      props: {
                        size: 'small',
                        step: 0.01,
                        min: 0,
                        value: this.updateProduct[params.index].price.toFixed(2)
                      },
                      style: {width: '70px'},
                      on: {
                        'on-blur': (v) => {
                          let inputVal = parseFloat(v.srcElement.value)
                          if (!isNaN(inputVal) && inputVal < 10000 && inputVal >= 0) {
                            this.updateProduct[params.index].price = Math.round(inputVal * 100) / 100
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ]),
                  h('div', [
                    h('span', `税率(%)：`),
                    h('Input', {
                      props: {
                        size: 'small',
                        step: 0.01,
                        min: 0,
                        value: this.updateProduct[params.index].tax.toFixed(2)
                      },
                      style: {width: '70px'},
                      on: {
                        'on-blur': (v) => {
                          let inputVal = parseFloat(v.srcElement.value)
                          if (!isNaN(inputVal) && inputVal <= 100 && inputVal >= 0) {
                            this.updateProduct[params.index].tax = Math.round(inputVal * 100) / 100
                          }
                          this.calculate(params.index)
                          this.reflashTable()
                        }
                      }
                    })
                  ])
                ])
              }
            }
          },
          {
            ellipsis: true,
            title: '单项合计(元)',
            width: 150,
            render: (h, params) => {
              return h('div', {style: {'line-height': '20px'}}, [
                h('p', `金额： ${parseFloat(this.updateProduct[params.index].totalMoney).toFixed(2)}`),
                h('p', `税额： ${parseFloat(this.updateProduct[params.index].totalTax).toFixed(2)}`),
                h('p', `合计： ${parseFloat(this.updateProduct[params.index].totalTaxMoney).toFixed(2)}`)
              ])
            }
          },
          {
            title: ' ',
            width: 55,
            key: 'action',
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  style: {
                    display: this.$route.query.current !== 'show-order' ? 'block' : 'none',
                    padding: '5px 10px'
                  },
                  on: {
                    click: (evt) => {
                      this.updateProduct.splice(params.index, 1)
                      this.productData.splice(params.index, 1)
                      this.resetIndex(params.index)
                      evt.stopPropagation()
                    }
                  }
                }, [
                  h('Icon', {props: {type: 'close-round', size: 15}})
                ])
              ])
            }
          }
        ],
        dealerTitle: [
          {
            title: '收货地址',
            render: (h, p) => {
              return h('div', [
                h('p', this.dealerData[p.index].address)
              ])
            }
          },
          {
            title: '收货人',
            width: 200,
            render: (h, p) => {
              return h('div', [
                h('p', this.dealerData[p.index].contacter)
              ])
            }
          },
          {
            title: '联系电话',
            width: 130,
            render: (h, p) => {
              return h('div', [
                h('p', this.dealerData[p.index].phone)
              ])
            }
          }
        ],
        dealerData: [
          {
            contacter: '',
            address: '',
            phone: ''
          }
        ],
        productData: [],
        boxCase: 0,
        editError: null,
        editNow: false
      }
    },
    methods: {
      dealerDetail (params) {
        this.showDealer = true
        for (let i = 0; i < this.dealersList.length; i++) {
          if (this.dealersList[i].id === params) {
            let dealer = {
              contacter: this.dealersList[i].contacter,
              address: this.dealersList[i].provinceName + this.dealersList[i].cityName + this.dealersList[i].areaName + this.dealersList[i].address,
              phone: this.dealersList[i].phone
            }
            this.dealerData = [dealer]
          }
        }
      },
      toDetail (params) {
        if (this.$route.query.current !== 'show-order') {
          for (let i = 0; i < this.productList.length; i++) {
            if (this.productList[i].id === params.proId) {
              this.boxCase = this.productList[i].boxCase
            }
          }
          this.currentIndex = params.indexNo
        }
      },
      resetIndex (index) {
        for (let i = 0; i < this.updateProduct.length; i++) {
          if (this.updateProduct[i].indexNo > index) {
            this.updateProduct[i].indexNo = this.updateProduct[i].indexNo - 1
          }
        }
        for (let i = 0; i < this.productData.length; i++) {
          if (this.productData[i].indexNo > index) {
            this.productData[i].indexNo = this.productData[i].indexNo - 1
          }
        }
      },
      calculate (index) {
        let number = (this.updateProduct[index].box + this.updateProduct[index].stockBox) * this.boxCase + this.updateProduct[index].cases + this.updateProduct[index].stockCases
        let money = number * this.updateProduct[index].price
        let totalTax = money * this.updateProduct[index].tax / 100
        let taxMoney = money + totalTax
        this.updateProduct[index].totalMoney = money.toFixed(2)
        this.updateProduct[index].totalTax = totalTax.toFixed(2)
        this.updateProduct[index].totalTaxMoney = taxMoney.toFixed(2)
      },
      reflashTable: function () {
//        深拷贝productData，刷新表格
        let midArray = []
        for (let i = 0; i < this.updateProduct.length; i++) {
          midArray.push(JSON.parse(JSON.stringify(this.updateProduct[i])))
        }
        this.productData = midArray
      },
      ordeRtracking (r) {
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'show-track',
            id: r.id
          }
        })
        this.track.error = null;
        this.trackResetQueryParams()
        this.trackQueryByManual()
        this.getOrder()
      },
      trackResetQueryParams: function () {
        this.track.setter.orderId = ''
        this.track.setter.productName = ''
        this.track.setter.beginTime = null
        this.track.setter.endTime = null
      },
      trackQueryByManual: function (callback) {
        this.trackQuery(callback)
      },
      trackQuery: function (callback) {
        let o = {
          _loading: true,
          page: 1,
          size: 99999,
          orderBy: [{property: 'sendTime', order: 'desc'}],
          queryFilter: [{property: 'orderId', op: '=', value: this.$route.query.id}]
        }

        if (this.track.setter.productName) {
          o.queryFilter.push({property: 'productName', op: 'like', value: this.track.setter.productName})
        }

        if (this.track.setter.beginTime) {
          o.queryFilter.push({property: 'sendTime', op: '>=', value: new Date(this.track.setter.beginTime).getTime()})
        }

        if (this.track.setter.endTime) {
          o.queryFilter.push({
            property: 'sendTime',
            op: '<',
            value: new Date(this.track.setter.endTime).getTime() + 24 * 60 * 60 * 1000
          })
        }

        let buildData = (source, target, sendDept = '') => {
          let depts = {}
          for (let s of source) {
            if (s.sendDep === sendDept) {
              let key = s.receivedDep
              if (!depts.hasOwnProperty(key)) {
                let si = Object.assign({children: [], products: [], boxAmount: 0, caseAmount: 0, bagAmount: 0}, s)
                target.push(si)
                depts[key] = si
                buildData(source, si.children, s.receivedDep)
              }
              let pi = depts[key]
              pi.products.push(s)
              if (s.qrcodeType === 'UNITS_BOX') {
                pi.boxAmount += s.amount
              } else if (s.qrcodeType === 'UNITS_CASE') {
                pi.caseAmount += s.amount
              } else if (s.qrcodeType === 'UNITS_BAG') {
                pi.bagAmount += s.amount
              }
            }
          }
        }

        this.track.busy = true
        this.track.store = null
        this.$http.post('/order/viewivc/search', o).then(res => {
          if (this.$isArray(res.content, true)) {
            this.track.error = null
            let target = []
            buildData(res.content, target)
            this.track.store = target
          } else {
            this.track.error = this.$Err.noResult(false)
          }
        }).catch(res => {
          this.track.error = this.$Err.unhandled()
        }).finally(() => {
          this.track.busy = false
        })
      },
      addOrder () {
        this.resetOrder()
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'add-order'
          }
        })
      },
      editOrder (data) {
        this.productData = (data.orderItems ? data.orderItems : [])
        this.updateProduct = []
//        深拷贝
        for (let i = 0; i < this.productData.length; i++) {
          this.productData[i].indexNo = i
          this.updateProduct.push(JSON.parse(JSON.stringify(this.productData[i])))
        }
        this.currentItem = data
        this.itemTime = {
          orderTime: this.currentItem.orderTime
        }
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'edit-order',
            id: data.id
          }
        })
      },
      showOrder (data) {
        this.productData = (data.orderItems ? data.orderItems : [])
        this.updateProduct = []
//        深拷贝
        for (let i = 0; i < this.productData.length; i++) {
          this.productData[i].indexNo = i
          this.updateProduct.push(JSON.parse(JSON.stringify(this.productData[i])))
        }
        this.currentItem = data
        this.itemTime = {
          orderTime: this.currentItem.orderTime
        }
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'show-order',
            id: data.id
          }
        })
      },
      addProduct () {
        let index = this.productData.length
        this.productData.push({
          proName: '',
          proId: '',
          box: 0,
          cases: 0,
          stockCases: 0,
          stockBox: 0,
          price: 0,
          tax: 0,
          totalMoney: 0,
          totalTax: 0,
          indexNo: index,
          totalTaxMoney: 0
        })
        this.updateProduct.push({
          proName: '',
          proId: '',
          box: 0,
          cases: 0,
          stockCases: 0,
          stockBox: 0,
          boxCase: 0,
          price: 0,
          tax: 0,
          totalMoney: 0,
          totalTax: 0,
          indexNo: index,
          totalTaxMoney: 0
        })
        this.currentIndex = this.productData.length - 1
      },
      saveOrder (name) {
        var rulesArray = ['dealerId', 'orderTime', 'urgentLevel', 'orderType']
        var editValid = true
        for (var i in rulesArray) {
          this.$refs[name].validateField(rulesArray[i], (valid) => {
            if (valid) {
              editValid = false
            }
          })
        }
        if (editValid) {
          let message = '编辑订单成功'
          let url = `/order/update/${this.currentItem.id}`
          if (this.$route.query.current === 'add-order') {
            message = '添加订单成功'
            url = `/order`
          }
          var updateWarn = ''
          for (let i in this.updateProduct) {
            if (!this.updateProduct[i].proName) {
              updateWarn = `“产品名称”不能为空`
            } else if (this.updateProduct[i].cases === 0 && this.updateProduct[i].box === 0 && this.updateProduct[i].stockBox === 0 && this.updateProduct[i].stockCases === 0) {
              updateWarn = '产品数量不能为0'
            }
          }
          if (updateWarn) {
            this.errorMessage.saveProduce = updateWarn
          } else {
            this.savebtn = true
            this.$http.post(url, {
              dealerId: this.currentItem.dealerId,
              orderType: this.currentItem.orderType,
              orderTime: this.currentItem.orderTime,
              urgentLevel: this.currentItem.urgentLevel,
              status: 0,
              comment: this.currentItem.comment,
              orderItems: this.updateProduct
            }).then((res) => {
              this.$Message.success(message)
              this.goBack()
              this.errorMessage.saveProduce = ''
            }).catch((res) => {
              this.errorMessage.saveProduce = res.message
              this.savebtn = false
            })
          }
        }
      },
      deleteOrder (item) {
        this.$Modal.confirm({
          title: '删除订单',
          content: this.$C.MSG_COMM_DELETE_CONFIRM.format('订单', item.orderNo),
          onOk: () => {
            this.$http.post(`/order/delete`, {id: item.id}).then((res) => {
              this.$Message.success('删除订单成功')
              if (this.current_page === parseInt((this.total_num - 1) / 10 + 1)) {                    //  判断当前页是不是最后一页
                this.current_page = parseInt((this.total_num - 2) / 10 + 1)                         //   该页最后一条被删后更新页码
                if (this.current_page < 1) {
                  this.current_page = 1
                }
              }
              this.total_num--
              this.getorderList(this.current_page)
              this.currentItem = []
            }).catch((res) => {
              this.$Message.error(res.message)
            }).finally(() => {
            })
          },
          onCancel: () => {
            this.currentItem = []
          }
        })
      },
      goBack () {
        this.$router.back()
        this.resetOrder()
        this.getorderList(this.current_page)
        this.currentIndex = -1
        this.errorMessage.saveProduce = null
        this.savebtn = false
      },
      pageChange (page) {
        this.getorderList(page)
        this.current_page = page
      },
      errorAction () {
        if (this.listError.type === 'noData') {
          this.loadedSuccess = true
          this.listError = null
          this.addOrder()
        } else if (this.listError.type === 'noResult') {
          this.loadedSuccess = true
          this.listError = null
          this.addOrder()
        } else {
          this.getorderList(1)
        }
      },
      getOrder () {
        let updatedata = {
          page: 1,
          size: 10,
          queryFilter: [
            {property: 'id', op: '=', value: this.$route.query.id}
          ]
        }
        this.$http.post(`/orders/search`, updatedata).then((res) => {
          this.orderInfo = res.content[0]
        }).catch((res) => {
          this.listError = {...this.$Err.unhandled()}
        }).finally(() => {
          this.loadingList = false
        })
      },
      getorderList (page) {
        this.current_page = page
        this.loadingList = true

        this.updatedata = {
          _loading: true,
          page: page,
          size: 10,
          orderBy: [
            {
              property: 'urgentLevel',
              order: 'desc'
            },
            {
              property: 'createdTime',
              order: 'desc'
            }
          ],
          queryFilter: [
            {property: 'dealerId', op: '=', value: this.searchConfig.dealerId},
            {property: 'status', op: '=', value: this.searchConfig.status},
            {property: 'orderTime', op: '>=', value: this.searchConfig.startTime},
            {property: 'orderTime', op: '<=', value: this.searchConfig.endTime}
          ]
        }
        // 清除数组中空元素
        let filterData = []
        for (let i in this.updatedata.queryFilter) {
          if (this.updatedata.queryFilter[i].value || this.updatedata.queryFilter[i].value === 0) {
            filterData.push(this.updatedata.queryFilter[i])
          }
        }
        if (filterData.length > 0) {
          this.updatedata.queryFilter = filterData
        } else {
          delete this.updatedata.queryFilter
        }
        this.$http.post(`/orders/search`, this.updatedata).then((res) => {
          var listData = res.content
          if (listData.length > 0) {
            this.total_num = res.totalCount
            this.loadedSuccess = true
            this.listError = null
          } else {
            if (this.updatedata.queryFilter || this.searchConfig.status === 0) {
              this.listError = {...this.$Err.noResult()}
            } else {
              this.listError = {...this.$Err.noData()}
            }
            this.listError.type = 'noData'
            this.loadedSuccess = false
            listData = []
            this.total_num = 0
          }
          this.detailData = res.content
        }).catch((res) => {
          this.loadedSuccess = false
          this.listError = {...this.$Err.unhandled()}
        }).finally(() => {
          this.loadingList = false
        })
      },
      resetOrder () {
        this.currentItem = {
          orderNo: '',
          dealerId: '',
          orderType: 0,
          deliverTime: null,
          orderItems: null,
          dealerName: '',
          orderTime: Date.parse(new Date()),
          status: 0,
          urgentLevel: 0,
          comment: '',
          amount: null
        }
        this.itemTime = {
          orderTime: new Date()
        }
        this.updateProduct = []
        this.productData = []
        this.dealerData = [
          {
            contacter: '',
            address: '',
            phone: ''
          }
        ]
        this.showDealer = false
      },
      changeTime (time) {
        if (time[1]) {
          var startTime = new Date(Date.parse(time[0].replace(/-/g, '/')))
          var endTime = new Date(Date.parse(time[1].replace(/-/g, '/')))
          this.searchConfig.startTime = startTime.getTime()
          this.searchConfig.endTime = endTime.getTime() + (24 * 60 * 60 * 1000 - 1)
        } else {
          this.searchConfig.startTime = null
          this.searchConfig.endTime = null
        }
      },
      changeOrderTime (time) {
        if (time) {
          var deliverTime = new Date(Date.parse(time.replace(/-/g, '/')))
          this.currentItem.orderTime = deliverTime.getTime()
        } else {
          this.currentItem.orderTime = null
        }
      },
      getdealersList (callback, parameter) {
        this.$http.post(`/system/dealers`, {
          _loading: true,
          page: 1,
          size: 99999,
          queryFilter: [
            {property: 'status', op: '=', value: 0}
          ]
        }).then((res) => {
          this.dealersList = res.content
          if (typeof callback === 'function') {
            callback(parameter)
          }
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      getProductList () {
        this.$http.post(`/products/search`, {
          _loading: true,
          page: 1,
          size: 99999
        }).then((res) => {
          this.productList = res.content
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      getOrderById (id) {
        if (id) {
          this.editNow = true
          this.$http.get(`/order/${id}`).then((data) => {
            if (data) {
              this.editError = null
              this.dealerDetail(data.dealerId)
            } else {
              this.editError = {...this.$Err.notFound()}
            }

            this.productData = (data.orderItemOuts ? data.orderItemOuts : [])
            this.updateProduct = []
//        深拷贝
            for (let i = 0; i < this.productData.length; i++) {
              this.productData[i].indexNo = i
              this.updateProduct.push(JSON.parse(JSON.stringify(this.productData[i])))
            }
            this.currentItem = data
            this.itemTime = {
              orderTime: this.currentItem.orderTime
            }
          }).catch((res) => {
            this.$Message.error(res.message)
            this.editError = {...this.$Err.unhandled(true)}
          }).finally(() => {
            this.editNow = false
          })
        }
      }
    },
    mounted () {
      this.getdealersList()
      this.getProductList()
      if (['edit-order', 'add-order', 'show-order', 'show-track'].indexOf(this.$route.query.current) > -1) {
        if (this.$route.query.id) {
          if (this.$route.query.current === 'edit-order' || this.$route.query.current === 'show-order') {
            this.getdealersList(this.getOrderById, this.$route.query.id)
            this.getProductList()
          } else if (this.$route.query.current === 'show-track') {
            this.trackResetQueryParams()
            this.trackQueryByManual()
            this.getOrder()
          }
        }
      } else {
        this.getorderList(1)
      }
    }
  }
</script>
