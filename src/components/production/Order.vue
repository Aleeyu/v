<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>生产管理</BreadcrumbItem>
        <BreadcrumbItem>生产单管理</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === undefined">生产单详情</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === 'receive'">接收生产单</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === 'edit'">编辑生产单</BreadcrumbItem>
        <BreadcrumbItem v-if="current === 'a'">生产单明细</BreadcrumbItem>
        <BreadcrumbItem v-if="current === 'b'">入库明细</BreadcrumbItem>
        <BreadcrumbItem v-if="current === 'c'">出库明细</BreadcrumbItem>
      </Breadcrumb>
    </p>
    <!-- 生产单列表界面 -->
    <Row v-if="!error && $route.query.id === undefined && !firstLoading && current === null">
      <Row type="flex" justify="end" align="middle">
        <Col style="margin-right: 10px;">
          <span>创建时间：</span>
          <DatePicker type="daterange" placeholder="选择日期" style="width: 180px"
            @on-change="handleDateChange"></DatePicker>
        </Col>
        <Col style="margin-right: 10px;">
          <span>订单号/生产单号：</span>
          <Input v-model="order.wd" style="width: 120px;" placeholder="订单号/生产单号" @on-enter="orderQuery(1)"></Input>
        </Col>
        <Col style="margin-right: 10px;">
          <span>状态：</span>
          <Select v-model="order.status" style="width: 120px;" id="production_order_input_status">
            <Option v-for="option in order.statusOptions" :key="option.value" :value="option.value">{{ option.text }}</Option>
          </Select>
        </Col>
        <Col>
          <Button @click="orderQuery(1)" id="production_order_btn_query">搜索</Button>
        </Col>
      </Row>
      <Table stripe :columns="order.columns" :data="order.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="order.page"
          :page-size="order.pageSize"
          :total="order.totalCount"
          @on-change="orderQuery">
        </Page>
      </Row>
    </Row>
    <!-- 生产单编辑和接收界面 -->
    <Row v-if="!error && ($route.query.action === 'receive' || $route.query.action === 'edit') && $route.query.id !== undefined">
      <h4>请填写生产单对应的信息</h4>
      <Form ref="FORM" :model="form.model" :rules="form.rules" label-position="left" :label-width="160">
        <Form-item label="计划生产开始时间" prop="startTime">
          <DatePicker style="display: block;" :editable="false"
            @on-change="handleStartTimeChange"
            @on-clear="handleStartTimeChange"
            :value="form.model.startTime" size="large"></DatePicker>
        </Form-item>
        <Form-item label="计划生产结束时间" prop="endTime" data-describe="需大于等于计划生产开始时间">
          <DatePicker style="display: block;" :editable="false"
            @on-change="handleEndTimeChange"
            @on-clear="handleEndTimeChange"
            :value="form.model.endTime" size="large"></DatePicker>
        </Form-item>
        <Form-item label="备注" prop="remarks">
          <Input type="textarea" :rows="4" placeholder="请输入备注..." v-model="form.model.remarks" :maxlength="200"></Input>
        </Form-item>
        <Form-item>
          <Row>
            <Button type="primary" @click="save">保存</Button>
            <Button @click="back">取消</Button>
          </Row>
        </Form-item>
      </Form>
    </Row>
    <!-- 生产单详情列表界面 -->
    <Row v-if="!error && $route.query.id !== undefined && $route.query.action === undefined && !firstLoading">
      <Row>
        <Button type="primary" @click="back" id="production_order_btn_back">返回</Button>
      </Row>
      <Row>
        <Col :span="12" style="margin: 10px 0;">
          <Row type="flex" align="middle">
            <Col :span="8" style="text-align: right;">
              接收人：
            </Col>
            <Col :span="16">
              {{ item.recipientName || '-' }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row>
            <Col :span="8" style="text-align: right;">
              接收时间：
            </Col>
            <Col :span="16">
              {{ filterTime(item.recipientTime) }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row>
            <Col :span="8" style="text-align: right;">
              计划生产开始时间：
            </Col>
            <Col :span="16">
              {{ filterDate(item.startTime) }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row>
            <Col :span="8" style="text-align: right;">
              计划生产结束时间：
            </Col>
            <Col :span="16">
              {{ filterDate(item.endTime) }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row>
            <Col :span="8" style="text-align: right;">
              生产打印日期：
            </Col>
            <Col :span="16">
              {{ filterDate(item.finishPrintTime) }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row>
            <Col :span="8" style="text-align: right;">
              已完成箱数：
            </Col>
            <Col :span="16">
              {{ item.completeBox || '-' }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Row :class="{emergency: item.urgentLevel === 1}">
            <Col :span="8" style="text-align: right;">
              紧急程度：
            </Col>
            <Col :span="16">
              {{ filterUrgentLevel(item.urgentLevel) }}
            </Col>
          </Row>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Col :span="8" style="text-align: right;">
            公司：
          </Col>
          <Col :span="16">
            {{ item.company || '-' }}
          </Col>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Col :span="8" style="text-align: right;">
            收货地址：
          </Col>
          <Col :span="16">
            {{ item.address || '-' }}
          </Col>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Col :span="8" style="text-align: right;">
            收货人：
          </Col>
          <Col :span="16">
            {{ item.contacter || '-' }}
          </Col>
        </Col>
        <Col :span="12" style="margin: 10px 0;">
          <Col :span="8" style="text-align: right;">
            联系人电话：
          </Col>
          <Col :span="16">
            {{ item.phone || '-' }}
          </Col>
        </Col>
        <Col :span="24" style="margin: 10px 0;">
          <Row>
            <Col :span="4" style="text-align: right;">
              备注：
            </Col>
            <Col :span="16" class="text-ellipsis">
              {{ item.remarks || '-'}}
            </Col>
          </Row>
        </Col>
      </Row>
      <Table stripe :columns="item.columns" :data="item.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="item.page"
          :page-size="item.pageSize"
          :total="item.totalCount"
          @on-change="itemQuery">
        </Page>
      </Row>
    </Row>
    <!-- 生产单明细列表 -->
    <Row v-if="!error && !firstLoading && current === 'a'">
      <p class="card-header">点击确认按钮将设置生成单为已完成</p>
      <Table stripe :columns="a.columns" :data="a.data"></Table>
      <Row type="flex" justify="center">
        <Button type="primary" style="margin-right: 10px;" @click="aConfirm">确认</Button>
        <Button @click="kBack">取消</Button>
      </Row>
    </Row>
    <!-- 入库明细列表 -->
    <Row v-if="!error && !firstLoading && current === 'b'">
      <p class="card-header">点击确认按钮将设置生成单为入库完成</p>
      <Table stripe :columns="b.columns" :data="b.data"></Table>
      <Row type="flex" justify="center">
        <Button type="primary" style="margin-right: 10px;" @click="bConfirm">确认</Button>
        <Button @click="kBack">取消</Button>
      </Row>
    </Row>
    <!-- 出库明细列表 -->
    <Row v-if="!error && !firstLoading && current === 'c'">
      <p class="card-header">点击确认按钮将设置生成单为出库完成</p>
      <Table stripe :columns="c.columns" :data="c.data"></Table>
      <Row type="flex" justify="center">
        <Button type="primary" style="margin-right: 10px;" @click="cConfirm">确认</Button>
        <Button @click="kBack">取消</Button>
      </Row>
    </Row>
    <!-- 异常界面 -->
    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoading"></error-view>
  </Card>
</template>

<script>
  import Expand from '@/components/production/Expand'

  export default {
    components: { Expand },
    data () {
      const validateEndTime = (rule, value, callback) => {
        if (this.form.model.startTime > this.form.model.endTime) {
          callback(new Error('计划生产结束时间需要大于等于计划生产时间'))
        } else {
          callback()
        }
      }

      return {
        order: {
          startDateTime: null,
          endDateTime: null,
          wd: null,
          statusOptions: [
            { value: -1, text: '全部' },
            { value: '0', text: '待接收' },
            { value: '1', text: '待生产' },
            { value: '2', text: '生产中' },
            { value: '3', text: '已生产' },
            { value: '4', text: '已入库' }
          ],
          status: -1,
          columns: [
            {
              title: '基本信息',
              render: (h, p) => {
                return (
                  <row>
                    <row class="table-row">
                      <i-col span="14">
                        <span>订单号：{ p.row.orderNo }</span>
                      </i-col>
                      <i-col span="10">
                        <span>生产单号：{ p.row.code }</span>
                      </i-col>
                    </row>
                    <row class="table-row">
                      <i-col span="14">
                        <span>创建时间：{ this.filterTime(p.row.createdTime) }</span>
                      </i-col>
                      <i-col span="10">
                        <span>数量：{ this.formatBox(p.row) }</span>
                      </i-col>
                    </row>
                    <row class="table-row">
                      <i-col span="14">
                        <span>完成箱数：{ p.row.completeBox || '-' }</span>
                      </i-col>
                      <i-col span="10">
                        <span>状态：{ this.filterStatus(p.row.status) }</span>
                      </i-col>
                    </row>
                    <row class="table-row">
                      <i-col span="14" class={ p.row.urgentLevel === 1 ? 'emergency' : undefined }>
                        <span>紧急程度：{ this.filterUrgentLevel(p.row.urgentLevel) }</span>
                      </i-col>
                      <i-col span="10">
                        <span>订单类型：{ this.filterType(p.row.type) }</span>
                      </i-col>
                    </row>
                  </row>
                )
              }
            },
            {
              title: '完成日期',
              width: 180,
              render: (h, p) => {
                if (p.row.status !== '3' && p.row.status !== '4') {
                  return '未完成'
                }
                let datePicker = h('DatePicker', {
                  props: {
                    clearable: false,
                    editable: false,
                    value: p.row.completionTime ? new Date(p.row.completionTime) : null
                  },
                  on: {
                    'on-change': (date) => {
                      p.row.completionTime = new Date(date).getTime()
                      let order = this.order.data.find(order => order.id === p.row.id)
                      if (!order || order.completionTime === new Date(date).getTime()) {
                        return
                      }

                      let input = datePicker.elm.querySelector('input.ivu-input')
                      input.setAttribute('disabled', 'disabled')
                      this.$http.put(`/production/order/${p.row.id}`, {
                        completionTime: new Date(date).getTime()
                      }).then(res => {
                        order.completionTime = new Date(date).getTime()
                        this.$Message.success('完成日期修改成功！')
                      }).catch(error => {
                        console.error(error)
                        this.$Message.error('完成日期修改失败！')
                        /* 重新设置为原时间 */
                        p.row.completionTime = order.completionTime ? new Date(order.completionTime) : null
                        datePicker.componentInstance.picker.value = p.row.completionTime
                      }).finally(() => {
                        input.removeAttribute('disabled')
                      })
                    }
                  }
                })
                return datePicker
              }
            },
            {
              title: '生产打印日期',
              width: 180,
              render: (h, p) => {
                if (p.row.status === '0') {
                  return '未接收'
                }
                let datePicker = h('DatePicker', {
                  props: {
                    clearable: false,
                    editable: false,
                    value: p.row.finishPrintTime ? new Date(p.row.finishPrintTime) : null
                  },
                  on: {
                    'on-change': (date) => {
                      p.row.finishPrintTime = new Date(date).getTime()
                      let order = this.order.data.find(order => order.id === p.row.id)
                      if (!order || order.finishPrintTime === new Date(date).getTime()) {
                        return
                      }

                      let input = datePicker.elm.querySelector('input.ivu-input')
                      input.setAttribute('disabled', 'disabled')
                      let printTime = new Date(date)
                      printTime.setHours(0)
                      printTime.setMinutes(0)
                      printTime.setSeconds(0)
                      this.$http.put(`/production/order/${p.row.id}`, {
                        finishPrintTime: printTime.getTime()
                      }).then(res => {
                        order.finishPrintTime = printTime.getTime()
                        this.$Message.success('生产打印日期修改成功！')
                      }).catch(error => {
                        console.error(error)
                        this.$Message.error('生产打印日期修改失败！')
                        /* 重新设置为原时间 */
                        p.row.finishPrintTime = order.finishPrintTime ? new Date(order.finishPrintTime) : null
                        datePicker.componentInstance.picker.value = p.row.finishPrintTime
                      }).finally(() => {
                        input.removeAttribute('disabled')
                      })
                    }
                  }
                })
                return datePicker
              }
            },
            {
              title: ' ',
              align: 'right',
              width: 250,
              render: (h, p) => {
                let printButton = h('Button', {
                  on: {
                    click: () => {
                      this.print(p.row.id)
                    }
                  }
                }, '打印')

                let instoreButton = h('Button', {
                  on: {
                    click: () => {
                      this.$router.push({
                        path: '/store/receive',
                        query: {
                          productioncode: p.row.code
                        }
                      })
                    }
                  }
                }, '入库信息')

                let outstoreButton = h('Button', {
                  on: {
                    click: () => {
                      this.$router.push({
                        path: '/store/outstore',
                        query: {
                          productioncode: p.row.orderNo
                        }
                      })
                    }
                  }
                }, '出库信息')

                let detailButton = h('Button', {
                  on: {
                    click: () => {
                      this.showItem(p.row.id)
                    }
                  }
                }, '查看详情')

                let editButton = h('Button', {
                  on: {
                    click: () => {
                      this.showForm(p.row.id, 'edit')
                    }
                  }
                }, '编辑')

                let actionButtonText
                let afterStatus
                if (p.row.status === '0') {
                  actionButtonText = '接收'
                  afterStatus = '1'
                } else if (p.row.status === '1') {
                  actionButtonText = '生产'
                  afterStatus = '2'
                } else if (p.row.status === '2') {
                  actionButtonText = '生产完成'
                  afterStatus = '3'
                } else if (p.row.status === '3') {
                  actionButtonText = '入库完成'
                  afterStatus = '4'
                } else if (p.row.status === '4') {
                  actionButtonText = '出库完成'
                }
                let actionButton = h('Button', {
                  props: { type: 'primary' },
                  on: {
                    click: () => {
                      if (p.row.status === '0') {
                        this.showForm(p.row.id, 'receive')
                      } else if (p.row.status === '2') {
                        this.aQuery(p.row.id)
                      } else if (p.row.status === '3') {
                        this.bQuery(p.row.id)
                      } else if (p.row.status === '4' && p.row.orderEntity.status === 3) {
                        this.cQuery(p.row.id, p.row.orderEntity.id)
                      } else {
                        this.updateStatus(afterStatus, p.row.id)
                      }
                    }
                  }
                }, actionButtonText)

                let buttonGroup1 = [printButton, instoreButton, outstoreButton]
                let buttonGroup2 = []

                if (['0', '1', '2'].indexOf(p.row.status) !== -1) {
                  buttonGroup2.push(editButton)
                }

                buttonGroup2.push(detailButton)

                if (p.row.status !== '4' || (p.row.status === '4' && p.row.orderEntity.status === 3 && p.row.type !== 1)) {
                  buttonGroup2.push(actionButton)
                }

                return h('Row', {
                  props: {
                    type: 'flex',
                    justify: 'start'
                  }
                }, [
                  h('Button-group', {
                    style: {
                      marginBottom: '10px'
                    }
                  }, buttonGroup1),
                  h('Button-group', buttonGroup2)
                ])
              }
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: []
        },
        item: {
          columns: [
            {
              title: '产品名称',
              key: 'productName'
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
              title: '总盒数',
              key: 'amount'
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: [],
          recipientName: null,
          recipientTime: null,
          startTime: null,
          endTime: null,
          finishPrintTime: null,
          remarks: null
        },
        form: {
          id: null,
          model: {
            startTime: null,
            endTime: null,
            remarks: null
          },
          rules: {
            startTime: [
              { required: true }
            ],
            endTime: [
              { required: true },
              { validator: validateEndTime }
            ]
          }
        },
        /* 三种详细单 */
        /* 生产 */
        a: {
          id: null,
          columns: [
            {
              type: 'expand',
              width: 50,
              render (h, p) {
                return h(Expand, {
                  props: {
                    boxList: p.row.boxList
                  }
                })
              }
            },
            {
              title: '产品',
              key: 'productName'
            },
            {
              title: '计划生产数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.amount, p.row.boxCase) }</span>
            },
            {
              title: '实际生产数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.produced, p.row.boxCase) }</span>
            }
          ],
          data: []
        },
        /* 入库 */
        b: {
          id: null,
          columns: [
            {
              type: 'expand',
              width: 50,
              render (h, p) {
                return h(Expand, {
                  props: {
                    boxList: p.row.boxList,
                    caseList: p.row.caseList
                  }
                })
              }
            },
            {
              title: '产品',
              key: 'productName'
            },
            {
              title: '计划入库数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.amount, p.row.boxCase) }</span>
            },
            {
              title: '实际入库数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.produced, p.row.boxCase) }</span>
            }
          ],
          data: []
        },
        /* 出库 */
        c: {
          id: null,
          orderId: null,
          columns: [
            {
              type: 'expand',
              width: 50,
              render (h, p) {
                return h(Expand, {
                  props: {
                    boxList: p.row.boxList,
                    caseList: p.row.caseList
                  }
                })
              }
            },
            {
              title: '产品',
              key: 'productName'
            },
            {
              title: '计划出库数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.amount, p.row.boxCase) }</span>
            },
            {
              title: '实际出库数量',
              render: (h, p) => <span>{ this.filterBoxCase(p.row.produced, p.row.boxCase) }</span>
            }
          ],
          data: []
        },
        error: null,
        firstLoading: true,
        errorLoading: false,
        current: null
      }
    },
    methods: {
      filterBoxCase: function (value, boxCase) {
        let boxCount = parseInt(value / boxCase)
        let caseCount = value % boxCase
        let str = ''
        if (boxCount > 0) {
          str += boxCount + '箱'
        }
        if (caseCount > 0) {
          str += caseCount + '盒'
        }
        return str
      },
      /* 将在render函数中使用 */
      filterStatus: function (value) {
        if (value === '0') {
          return '待接收'
        } else if (value === '1') {
          return '待生产'
        } else if (value === '2') {
          return '生产中'
        } else if (value === '3') {
          return '已完成'
        } else if (value === '4') {
          return '已入库'
        } else {
          return '-'
        }
      },
      filterTime: function (value) {
        if (!value) {
          return '-'
        }
        let time = new Date(value)
        let timeString = time.toLocaleString()
        return timeString === 'Invalid Date' ? '-' : timeString
      },
      filterDate: function (value) {
        if (!value) {
          return '-'
        }
        let date = new Date(value)
        let dateString = date.toLocaleDateString()
        return dateString === 'Invalid Date' ? '-' : dateString
      },
      filterUrgentLevel: function (value) {
        if (value === 0) return '常规'
        else if (value === 1) return '加急'
        else return '-'
      },
      filterType: function (value) {
        if (value === 0) {
          return '现生产单'
        } else if (value === 1) {
          return '备货单'
        }
        return '-'
      },
      formatBox: function (value) {
        let str = ''
        if (value.box) {
          str += value.box + '箱'
        }
        if (value.cases) {
          str += value.cases + '盒'
        }
        return str ? str : '-'
      },
      handleDateChange: function (dateList) {
        if (Array.isArray(dateList)) {
          dateList[0] += ' 00:00:00'
          dateList[1] += ' 23:59:59'
          this.order.startDateTime = new Date(dateList[0]).getTime()
          this.order.startDateTime = this.order.startDateTime ? this.order.startDateTime : null
          this.order.endDateTime = new Date(dateList[1]).getTime()
          this.order.endDateTime = this.order.endDateTime ? this.order.endDateTime : null
        }
      },
      orderQuery: function (page) {
        let data = {
          page: page || this.order.page,
          size: this.order.size,
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
          queryFilter: []
        }
        if (this.order.wd) {
          data.wd = this.order.wd
        }
        if (this.order.status !== -1) {
          data.queryFilter.push({
            property: 'status',
            op: '=',
            value: this.order.status
          })
        }
        if (this.order.startDateTime) {
          data.queryFilter.push({
            property: 'createdTime',
            op: '>=',
            value: this.order.startDateTime
          })
        }
        if (this.order.endDateTime) {
          data.queryFilter.push({
            property: 'createdTime',
            op: '<=',
            value: this.order.endDateTime
          })
        }

        if (this.error) {
          this.errorLoading = true
        } else {
          data._loading = true
        }

        this.$http.post(`/production/order/search`, data).then(res => {
          this.order.data = res.content
          this.order.page = res.page
          this.order.totalCount = res.totalCount

          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      updateStatus: function (status, id) {
        let data = {
          status: status,
          ids: [id]
        }
        this.$http.put(`/production/orders/status`, data).then(res => {
          let order = this.order.data.find(order => order.id === id)
          if (order) {
            order.status = status
            if (status === '3') {
              order.completionTime = new Date().getTime()
            }
          }
          this.$Message.success('操作生产单成功！')
        }).catch(error => {
          console.error(error)
          this.$Message.error('操作生产单失败，请稍后重试！')
        })
      },
      showForm: function (id, action) {
        this.form.id = id
        let order = this.order.data.find(order => order.id === id)
        if (order) {
          this.form.model.startTime = order.startTime
          this.form.model.endTime = order.endTime
          this.form.model.remarks = order.remarks
        }

        this.$router.push({
          path: this.$route.path,
          query: {
            id: id,
            action: action
          }
        })
      },
      handleStartTimeChange: function (date) {
        if (date) {
          this.form.model.startTime = new Date(date).getTime()
        } else {
          this.form.model.startTime = null
        }
      },
      handleEndTimeChange: function (date) {
        if (date) {
          this.form.model.endTime = new Date(date).getTime()
        } else {
          this.form.model.endTime = null
        }
      },
      save: function () {
        this.$refs.FORM.validate(valid => {
          if (!valid) {
            return
          }

          let data = {
            startTime: this.form.model.startTime,
            endTime: this.form.model.endTime,
            remarks: this.form.model.remarks
          }

          let msgPrefix = ''
          if (this.$route.query.action === 'receive') {
            data.status = '1'
            let printTime = new Date()
            printTime.setHours(0)
            printTime.setMinutes(0)
            printTime.setSeconds(0)
            data.finishPrintTime = printTime.getTime()
            msgPrefix = '生产单接收'
          } else {
            msgPrefix = '生产单编辑'
          }

          this.$http.put(`/production/order/${this.form.id}/receive`, data).then(res => {
            this.$Message.success(`${msgPrefix}成功！`)
            this.back()
          }).catch(error => {
            console.error(error)
            this.$Message.success(`${msgPrefix}失败！`)
          })
        })
      },
      showItem: function (id) {
        this.item.data = []
        this.item.page = 1
        this.item.totalCount = 0

        if (id !== this.$route.query.id) {
          this.$router.push({
            path: this.$route.path,
            query: {
              id: id
            }
          })
        }
        this.itemQuery()
      },
      back: function () {
        if (this.$route.query.token) {
          this.$router.back()
        } else {
          this.$router.push({
            path: this.$route.path
          })
          this.orderQuery()
        }
      },
      itemQuery: function (page) {
        let data = {
          page: page || this.item.page,
          size: this.item.pageSize,
          queryFilter: [
            {
              property: 'productionId',
              op: '=',
              value: this.$route.query.id
            }
          ]
        }
        if (this.error) {
          this.errorLoading = true
        } else {
          data._loading = true
        }

        this.$http.post(`/production/order/${this.$route.query.id}/search`, data).then(res => {
          this.item.data = res.productionItem.content || []
          this.item.page = res.productionItem.page
          this.item.totalCount = res.productionItem.totalCount

          this.item.recipientName = res.production.recipientName
          this.item.recipientTime = res.production.recipientTime
          this.item.startTime = res.production.startTime
          this.item.endTime = res.production.endTime
          this.item.remarks = res.production.remarks
          this.item.completeBox = res.production.completeBox
          this.item.urgentLevel = res.production.urgentLevel
          this.item.company = res.production.company
          this.item.address = res.production.address
          this.item.contacter = res.production.contacter
          this.item.phone = res.production.phone
          this.item.finishPrintTime = res.production.finishPrintTime

          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      initPage: function () {
        if (this.$route.query.id && this.$route.query.action === undefined) {
          this.showItem(this.$route.query.id)
        } else {
          this.$router.push({ path: this.$route.path })
          this.orderQuery()
        }
      },
      print: function (id) {
        window.open(`${window.location.origin}/report/productionorder?id=${id}`)
      },
      aQuery (id) {
        this.$http.get(`/production/order/${id}/productinfo`).then(res => {
          this.a.data = res.item || []
          this.a.id = id
          this.current = 'a'
        }).catch(error => {
          console.error(error)
          this.$Message.error('获取生成单对应详情失败！')
        })
      },
      bQuery (id) {
        this.$http.get(`/production/order/${id}/receiptinfo`).then(res => {
          this.b.data = res.item || []
          this.b.id = id
          this.current = 'b'
        }).catch(error => {
          console.error(error)
          this.$Message.error('获取生成单对应详情失败！')
        })
      },
      cQuery (id, orderId) {
        this.$http.get(`/production/order/${id}/invoiceinfo`).then(res => {
          this.c.data = res.item || []
          this.c.id = id
          this.c.orderId = orderId
          this.current = 'c'
        }).catch(error => {
          console.error(error)
          this.$Message.error('获取生成单对应详情失败！')
        })
      },
      aConfirm () {
        let data = {
          status: '3',
          ids: [this.a.id]
        }
        this.$http.put(`/production/orders/status`, data).then(res => {
          let order = this.order.data.find(order => order.id === this.a.id)
          if (order) {
            order.status = '3'
            order.completionTime = new Date().getTime()
          }
          this.$Message.success('操作生产单成功！')
          this.kBack()
        }).catch(error => {
          console.error(error)
          this.$Message.error('操作生产单失败，请稍后重试！')
        })
      },
      bConfirm () {
        let data = {
          status: '4',
          ids: [this.b.id]
        }
        this.$http.put(`/production/orders/status`, data).then(res => {
          let order = this.order.data.find(order => order.id === this.b.id)
          if (order) {
            order.status = '4'
          }
          this.$Message.success('操作生产单成功！')
          this.kBack()
        }).catch(error => {
          console.error(error)
          this.$Message.error('操作生产单失败，请稍后重试！')
        }).finally((res) => {
          this.orderQuery()
        })
      },
      cConfirm () {
        this.$http.put(`/order/${this.c.orderId}`, {
          _loading: true,
          status: 4
        }).then(res => {
          let order = this.order.data.find(order => order.id === this.c.id)
          if (order) {
            order.orderEntity.status = 4
          }
          this.$Message.success('操作生产单成功！')
          this.kBack()
        }).catch(error => {
          console.error(error)
          this.$Message.error('操作生产单失败，请稍后重试！')
        })
      },
      kBack () {
        this.c.orderId = this.a.id = this.b.id = this.c.id = null
        this.a.page = this.b.page = this.c.page = 1
        this.a.totalCount = this.b.totalCount = this.c.totalCount = 0
        this.a.data = []
        this.b.data = []
        this.c.data = []
        this.current = null
      }
    },
    mounted: function () {
      this.initPage()
    }
  }
</script>

<style scoped>
.text-ellipsis {
  overflow : hidden;
  text-overflow: ellipsis;
  word-break:break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

div >>> .emergency {
  color: #ed3f14;
}

div >>> .table-row {
  margin-bottom: 10px;
}
</style>
