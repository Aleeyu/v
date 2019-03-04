<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>生产管理</BreadcrumbItem>
        <BreadcrumbItem>查看生产单</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === undefined">生产单详情</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === 'receive'">接收生产单</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.id !== undefined && $route.query.action === 'edit'">编辑生产单</BreadcrumbItem>
      </Breadcrumb>
    </p>
    <!-- 生产单列表界面 -->
    <Row v-if="!error && $route.query.id === undefined && !firstLoading">
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
        <Form-item label="计划生产结束时间" prop="endTime" data-describe="需大于等于计划生产时间">
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
          :current="order.page"
          :page-size="item.pageSize"
          :total="item.totalCount"
          @on-change="itemQuery">
        </Page>
      </Row>
    </Row>
    <!-- 异常界面 -->
    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoading"></error-view>
  </Card>
</template>

<script>
  export default {
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
              title: ' ',
              align: 'right',
              width: 350,
              render: (h, p) => {
                let printButton = h('Button', {
                  on: {
                    click: () => {
                      this.print(p.row.id)
                    }
                  }
                }, '打印')

                let detailButton = h('Button', {
                  on: {
                    click: () => {
                      this.showItem(p.row.id)
                    }
                  }
                }, '查看详情')

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
                          productioncode: p.row.code
                        }
                      })
                    }
                  }
                }, '出库信息')

                return h('Button-group', [printButton, detailButton, instoreButton, outstoreButton])
              }
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: [
          ]
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
        error: null,
        firstLoading: true,
        errorLoading: false
      }
    },
    methods: {
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
          return '正常订单'
        } else if (value === 1) {
          return '备货订单'
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

        this.$router.push({
          path: this.$route.path,
          query: {
            id: id
          }
        })
        this.itemQuery()
      },
      back: function () {
        this.$router.push({
          path: this.$route.path
        })
        this.orderQuery()
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
