<style lang="less">
  .product-qrcode-container {
    .ivu-modal-header, .ivu-modal-footer {
      border-bottom: none;
    }
  }

  .product-qrcode-desc {
    strong {
      color: #2d8cf0;
    }
  }

  .product-qrcode-list-action-group {
    margin-top: 32px;
    .product-qrcode-list-query {
      .product-qrcode-list-query-type,
      .product-qrcode-list-query-date,
      .product-qrcode-list-query-number,
      .product-qrcode-list-query-keywords {
        margin-bottom: .5em;
        text-align: right;
        .ivu-select-selected-value, .ivu-select-item {
          text-align: left;
        }
      }
    }
  }

  .product-qrcode-page {
    text-align: right;
  }

  .product-qrcode-card-desc {
    margin-bottom: 1em;
  }

  .product-qrcode-edit-tag {
    cursor: default;
  }

  .print-enter-active {
    transition: all 1s
  }

  .print-leave-active {
    transition: all 0s
  }

  .print-enter {
    opacity: 0;
    height: 0;
  }

  .print-leave-to {
    opacity: 0;
    height: 0;
  }

  .product-qrcode-edit-printPreview {
    display: flex;
    justify-content: center;
    /*height: 6em;*/
    margin-top: 6px;
    padding: .6em 2em;
    background-color: #f8f8f9;
    .printContent {
      display: inline-block;
      height: 100%;
      background-color: white;
      padding: 1em;
      overflow: auto;

      .printRow {
        list-style: none;
        white-space: nowrap;
        .printItem {
          display: inline-block;
          width: 2em;
          height: 2em;
          margin-right: 6px;
          background-color: #5cadff;
          text-align: center;
          line-height: 2em;
          color: white;
          &:nth-last-child(1) {
            margin-right: 0;
          }
        }
        .printEllipsis {

        }
      }
    }
  }

  .product-qrcode-edit-return {
    margin-bottom: 2.5em;
  }

  .product-qrcode-edit-block {
    margin-bottom: 2em;
    position: relative;
    line-height: 2em;
    .product-qrcode-edit-block-title {
      padding: .5em 1em;
      background-color: #fafafa;
      color: #1c2438;
    }
  }

  .product-qrcode-qrcode-info {
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    margin-left: 16px;
    ul > li {
      margin-bottom: 16px;
    }
  }

</style>

<template>
  <div id="product_qrcode_container">
    <Card dis-hover class="product-qrcode-list" v-show="listShow">
      <Breadcrumb slot="title">
        <Breadcrumb-item>产品管理</Breadcrumb-item>
        <Breadcrumb-item>二维码申请</Breadcrumb-item>
        <Breadcrumb-item>列表</Breadcrumb-item>
      </Breadcrumb>

      <Row type="flex" justify="space-between" class="card-header">
        <iCol span="24" class="product-qrcode-desc">
          <strong>箱码(Box Code)</strong>
          <p>
            箱码是产品的最大包装—‘箱’的外包装上贴的二维码。该码主要用于和箱内最小包装 —‘袋’进行关联，从而做到箱码袋码关联。还能对生产、入库、出库以及经销商的流向做出查询、溯源。
          </p>
        </iCol>
      </Row>
      <Row type="flex" justify="space-between" class="product-qrcode-list-action-group">
        <iCol>
          <div v-show="!listError">
            <Button id="product_qrcode_add" @click="addLine" :loading="addQrcodeNow">
              新增二维码
            </Button>
          </div>
        </iCol>
        <iCol class="product-qrcode-list-query">
          <div class="product-qrcode-list-query-type">
            <span>类型：</span>
            <Select v-model="search.qrcodeType" style="width:200px">
              <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            &nbsp;
            <iInput v-model.trim="search.keywords" @on-enter="searchQrcode"
                    placeholder="关键字：产品/批次号"
                    style="width: 200px"/>
            <Button @click="search.otherShow = true" v-show="!search.otherShow">更多</Button>
            <Button type="primary" @click="searchQrcode" v-show="!search.otherShow">搜索</Button>
          </div>
          <div class="product-qrcode-list-query-date" v-show="search.otherShow">
            <span>日期范围：</span>
            <DatePicker type="date" placeholder="开始日期" style="width: 200px" v-model="search.startDate"></DatePicker>
            -
            <DatePicker type="date" placeholder="结束日期" style="width: 200px" v-model="search.endDate"></DatePicker>
          </div>
          <div class="product-qrcode-list-query-number" v-show="search.otherShow">
            <span>生成数量：</span>
            <InputNumber :min="1" v-model="search.min" :precision="0.1" style="width: 200px"></InputNumber>
            -
            <InputNumber :min="search.min" v-model="search.max" :precision="0.1" style="width: 200px"></InputNumber>
          </div>
          <div style="text-align: right" v-show="search.otherShow">
            <Button @click="search.otherShow = false">隐藏</Button>
            <Button type="primary" @click="searchQrcode">搜索</Button>
          </div>
        </iCol>
      </Row>
      <div v-show="list.data && list.data.length > 0 && !listError">
        <Table :columns="list.columns" :data="list.data" @on-selection-change="selectChange" stripe></Table>
        <Page :total="list.total" :page-size="list.pageSize" :current="list.currentPage" show-elevator show-total
              class="product-qrcode-page" @on-change="getList"></Page>
      </div>
      <error-view id="product_qrcode_list_error_view" :error="listError" name="二维码" @action="listErrorAction"
                  :loading="getListNow"></error-view>

    </Card>
    <Card class="product-qrcode-edit" dis-hover v-show="edit || add">
      <Breadcrumb slot="title">
        <Breadcrumb-item>二维码管理</Breadcrumb-item>
        <Breadcrumb-item>{{$route.query.type === 'add' ? '添加' : '编辑'}}</Breadcrumb-item>
        <Breadcrumb-item>{{qrcode.qrcodeType === 'UNITS_BAG' ? '袋码' : '箱码'}}</Breadcrumb-item>
      </Breadcrumb>
      <div v-show="!editError">
        <div class="product-qrcode-edit-block">
          <p class="product-qrcode-card-desc">下面是所生成二维码的基本信息，请如实填写</p>
          <Row>
            <Form ref="qrcode" :model="qrcode" :rules="qrcodeRules" label-position="left" :label-width="140">
              <Form-item label="二维码类型" prop="qrcodeType">
                <RadioGroup v-if="add" v-model="qrcode.qrcodeType">
                  <Radio label="UNITS_BAG">袋码</Radio>
                  <Radio label="UNITS_BOX">箱码</Radio>
                </RadioGroup>
                <Tag type="dot" v-else class="product-qrcode-edit-tag" color="blue" style="width: 100%">
                  {{qrcode.qrcodeType === 'UNITS_BAG' ? '袋码' : '箱码' }}
                </Tag>
              </Form-item>

              <Form-item v-if="edit" label="批号" prop="batch">
                <iInput id="product_qrcode_edit_batch" readonly type="text" placeholder="批号"
                        :maxlength="50" v-model.trim="qrcode.batch" size="large">
                </iInput>
              </Form-item>

              <Form-item label="产品" prop="productId">
                <Select v-model="qrcode.productId" :disabled="edit ? true : false" filterable
                        :remote="edit ? false : true"
                        :remote-method="getProductList" :loading="remoteLoading" :label-in-value="true"
                        @on-change="productSelect"
                        placeholder="请选择产品，或者输入查询"
                        size="large">
                  <Option v-for="item in productList" :value="item.id" :key="item.id" :label="item.productName">
                    {{item.productName}}
                  </Option>
                </Select>
              </Form-item>

              <Form-item label="数量" prop="quantity" data-describe="最大数量为999999"
                         v-if="qrcode.qrcodeType === 'UNITS_BOX'">
                <InputNumber id="product_qrcode_edit_code_number_box" :min="1"
                             :max="999999"
                             :disabled="edit ? true : false"
                             placeholder="生成二维码数量"
                             style="width: 100%"
                             v-model.trim="qrcode.quantity"
                             size="large">
                </InputNumber>
              </Form-item>

              <Form-item label="数量" prop="quantity" data-describe="最大数量为10000000" v-else>
                <InputNumber id="product_qrcode_edit_code_number_bag" :min="1"
                             :max="10000000"
                             :disabled="edit ? true : false"
                             placeholder="生成二维码数量"
                             style="width: 100%"
                             v-model.trim="qrcode.quantity"
                             size="large">
                </InputNumber>
              </Form-item>

              <Form-item label="二维码文件份数" prop="txtQuantity"
                         data-describe="二维码文件份数最多支持100份，二维码文件份数乘以每个文件最小数量应该小于等于生成二维码数量">
                <InputNumber :min="1"
                             :max="100"
                             :disabled="edit ? true : false"
                             placeholder="二维码文件份数"
                             style="width: 100%"
                             v-model="qrcode.txtQuantity"
                             @on-change="handleTxtNumberChange"
                             size="large">
                </InputNumber>
              </Form-item>

              <Form-item label="每个文件最小数量" prop="txtMinCodes"
                         data-describe="最小数量最大为999999，二维码文件份数乘以每个文件最小数量应该小于等于生成二维码数量"
                         v-if="qrcode.qrcodeType === 'UNITS_BOX'">
                <InputNumber :min="1"
                             :max="999999"
                             :disabled="edit ? true : false"
                             placeholder="每个文件最小数量"
                             style="width: 100%"
                             v-model="qrcode.txtMinCodes"
                             @on-change="handleTxtNumberChange"
                             size="large">
                </InputNumber>
              </Form-item>

              <Form-item label="每个文件最小数量" prop="txtMinCodes"
                         data-describe="最小数量最大为10000000，二维码文件份数乘以每个文件最小数量应该小于等于生成二维码数量"
                         v-else>
                <InputNumber :min="1"
                             :max="10000000"
                             :disabled="edit ? true : false"
                             placeholder="每个文件最小数量"
                             style="width: 100%"
                             v-model="qrcode.txtMinCodes"
                             @on-change="handleTxtNumberChange"
                             size="large">
                </InputNumber>
              </Form-item>

              <Form-item label="卷膜列数" prop="printColumns" v-if="qrcode.qrcodeType === 'UNITS_BAG'"
                         data-describe="最大列数为10">
                <div style="display: flex">
                  <InputNumber id="product_qrcode_edit_print_number" :min="1"
                               :max="10"
                               placeholder="请设置卷膜列数"
                               v-model="qrcode.printColumns"
                               style="flex: 1;margin-right: 8px"
                               size="large">
                  </InputNumber>
                  <Button @click="printPreviewNow = !printPreviewNow">
                    {{printPreviewNow ? '收起预览' : '点击预览'}}
                  </Button>
                </div>
                <transition name="print">
                  <div class="product-qrcode-edit-printPreview" v-show="printPreviewNow">
                    <div class="printContent">
                      <li v-for="row in printRow" class="printRow">
                      <span v-for="item in qrcode.printColumns" class="printItem">
                          {{(qrcode.printColumns * (row - 1)) + item}}
                      </span>
                      </li>

                      <li v-if="hasEllipsis" class="printRow">
                        <span v-for="item in qrcode.printColumns" class="printItem ellipsisItem">...</span>
                      </li>

                      <li v-if="qrcode.quantity % qrcode.printColumns" class="printRow">
                      <span v-for="item in (qrcode.quantity % qrcode.printColumns)"
                            class="printItem">{{(qrcode.quantity - qrcode.quantity % qrcode.printColumns) + item}}</span>
                      </li>

                      <li v-else-if="hasEllipsis || qrcode.quantity / qrcode.printColumns === 5"
                          class="printRow">
                      <span v-for="item in qrcode.printColumns"
                            class="printItem ellipsisItem">{{qrcode.quantity - qrcode.printColumns + item}}</span>
                      </li>
                    </div>
                  </div>
                </transition>
              </Form-item>

              <Form-item label="备注" prop="description">
                <Input v-model="qrcode.description" type="textarea" :rows="4" placeholder="备注。。。"></Input>
              </Form-item>
              <Alert type="error" v-show="updateQrcodeError">{{updateQrcodeError}}</Alert>
              <Form-item>
                <Button id="product_qrcode_edit_submit" type="primary" @click="qrcodeSubmit('qrcode')"
                        :loading="updateQrcodeNow">保存
                </Button>
                <Button @click="goBack">取消</Button>
              </Form-item>
            </Form>
          </Row>
        </div>
      </div>

      <error-view id="product_qrcode_edit_error_view" :error="editError" name="二维码"
                  @action="editErrorAction"
                  :loading="editRetryNow"></error-view>
    </Card>
  </div>
</template>

<script>
  import config from '@/config'

  export default {
    mounted () {
      this.routerChange(this.$route)
    },
    data () {
      const validateTxtQuantity = (rule, value, callback) => {
        let product = this.qrcode.txtQuantity * this.qrcode.txtMinCodes
        if (product > this.qrcode.quantity) {
          callback(new Error('二维码文件份数乘以每个文件最小数量应该小于等于生成二维码数量'))
        } else {
          callback()
        }
      }
      const validateTxtMinCodes = validateTxtQuantity

      return {
        edit: false,
        add: false,

        typeList: [
          {label: '全部', value: 'all'},
          {label: '箱码', value: 'UNITS_BOX'},
          {label: '袋码', value: 'UNITS_BAG'}
        ],
        search: {
          otherShow: false,
          qrcodeType: 'all',
          keywords: '',
          startDate: null,
          endDate: null,
          min: 1,
          max: 10000
        },
        pageWords: '',
        list: {
          total: 0,
          pageSize: 10,
          currentPage: 1,
          selected: null,
          data: [],
          columns: [
            {
              width: 120,
              title: '类型',
              render: (h, params) => {
                return h('span', params.row.qrcodeType === 'UNITS_BAG' ? '袋码' : '箱码')
              }
            },
            {
              title: '批次信息',
              key: 'batch',
              render: (h, params) => {
                return h('div', [
                  h('p', '批次号：' + params.row.batch),
                  h('p', {
                    style: {
                      marginTop: '12px'
                    }
                  }, [
                    h('span', {
                      style: {
                        marginRight: '16px'
                      }
                    }, '产品：' + params.row.productName),
                    h('span', '创建时间：' + new Date(params.row.createdTime).toLocaleString())
                  ])
                ])
              }
            },
            {
              width: 100,
              title: '数量',
              key: 'quantity'
            },
            {
              title: '状态',
              width: 140,
              render: (h, params) => {
                let status = [
                  {label: '等待生成', color: 'default'},
                  {label: '正在生成', color: 'blue'},
                  {label: '生成成功', color: 'green'},
                  {label: '生成失败', color: 'red'}
                ]
                let campProps = {
                  type: 'dot',
                  color: status[params.row.status].color
                }
                /* 发起请求，更新状态 */
                if (params.row.status === 1) {
                  /* 根据不同的数量查询间隔时间也不同 */
                  let intervalTime = 2000
                  if (params.row.quantity > 100000 && params.row.quantity <= 500000) {
                    intervalTime = 30000
                  } else if (params.row.quantity > 500000 && params.row.quantity <= 1000000) {
                    intervalTime = 120000
                  } else if (params.row.quantity > 1000000 && params.row.quantity <= 5000000) {
                    intervalTime = 600000
                  } else if (params.row.quantity > 5000000) {
                    intervalTime = 1200000
                  }

                  let interval = setInterval(() => {
                    this.$http.get(`/qrcodebatch/process/${params.row.batch}`).then(res => {
                      let qrcode = this.list.data.find(d => d.id === params.row.id)
                      if (qrcode) {
                        qrcode.status = res
                      }
                      if (res === 2 || res === 3) {
                        clearInterval(interval)
                      }
                    }).catch(error => {
                      console.error(error)
                      clearInterval(interval)
                    })
                  }, intervalTime)
                }

                return h('div', [
                  h('Tag', {
                    props: campProps,
                    class: {'product-qrcode-edit-tag': true}
                  }, status[params.row.status].label)
                ])
              }
            },
            {
              title: ' ',
              width: 250,
              render: (h, params) => {
                let buttonGroup = []
                buttonGroup.push(h('Button', {
                  props: {
                    disabled: params.row.qrcodeType !== 'UNITS_BOX' ? false : true
                  },
                  on: {
                    click: (evt) => {
                      this.$router.push({query: {type: 'edit', id: params.row.id}})
                    }
                  }
                }, '编辑'))

                buttonGroup.push(
                  h('Button', {
                    props: {
                      disabled: params.row.status < 2 ? true : false
                    },
                    style: {
                      width: '8em',
                      textAlign: 'center'
                    },
                    on: {
                      'click': () => {
                        if (params.row.status === 2) {
                          let download = document.createElement('a')
                          download.href = `${config.baseUrl}/qrcodebatch/download?batchId=${params.row.batch}`
                          download.download = true
                          download.click()
                          download = null
                        } else if (params.row.status === 3) {
                          params.row.status = 1
                          this.$http.get(`/qrcodebatch/redo?batchId=${params.row.batch}`)
                            .then(() => {

                            })
                            .catch(() => {
                              params.row.status = 3
                            })
                        }
                      }
                    }
                  }, params.row.status !== 3 ? '下载二维码' : '重新生成')
                )
                buttonGroup.push(h('Button', {
                  props: {
                    disabled: params.row.status === 2 && params.row.qrcodeType === 'UNITS_BAG' ? false : true,
                    type: 'primary'
                  },
                  on: {
                    'click': () => {
                      window.open(`${window.location.origin}/report/qrcodeapply/${params.row.id}`)
                    }
                  }
                }, '打印'))
                return h('Button-group', buttonGroup)
              }
            }
          ]
        },
        listShow: false,
        listError: null,
        getListNow: false,

        productList: [],
        remoteLoading: false,

        qrcode: {
          id: '',
          batch: '',
          qrcodeType: 'UNITS_BAG',
          productId: '',
          productName: '',
          quantity: 100,
          txtQuantity: 1,
          txtMinCodes: 1,
          printColumns: 3,
          description: ''
        },
        qrcodeRules: {
          productId: [
            {required: true, message: '请选择产品', trigger: 'blur'}
          ],
          txtQuantity: [
            {validator: validateTxtQuantity, trigger: 'blur'}
          ],
          txtMinCodes: [
            {validator: validateTxtMinCodes, trigger: 'blur'}
          ]
        },
        editError: null,
        addQrcodeNow: false,
        updateQrcodeNow: false,
        updateQrcodeError: '',
        editRetryNow: false,

        printPreviewNow: false
      }
    },
    computed: {
      /**
       * 预览二维码地址
       * @returns {string}
       */
      qrcontent () {
        return (config.host || '') + '/browse/p/qrcode/' + this.qrcode.id
      },
      printRow () {
        return Math.floor(this.qrcode.quantity / this.qrcode.printColumns) > 4 ? 4 : Math.floor(this.qrcode.quantity / this.qrcode.printColumns)
      },
      hasEllipsis () {
        return this.qrcode.quantity / this.qrcode.printColumns !== 5 && Math.ceil(this.qrcode.quantity / this.qrcode.printColumns) > 5 ? true : false
      }
    },
    methods: {
      /**
       * 处理部分数字输入框的change事件
       */
      handleTxtNumberChange () {
        this.$refs.qrcode.validateField('txtQuantity')
        this.$refs.qrcode.validateField('txtMinCodes')
      },
      /**
       * 设置显示的模块
       * @param view
       */
      viewCheck (view) {
        this.listShow = false
        this.edit = false
        this.add = false
        this.qrcodeDownload = false
        this.qrcodePreview = false
        this[view] = true
      },

      /**
       * 路由切换时数据初始化
       * @param to
       * @param from
       */
      routerChange (to, from) {
        this.updateQrcodeError = null
        this.editError = null
        this.listError = null
        this.resetLine()
        let query = to.query
        if (query.type === undefined || query.type === 'list') {
          this.viewCheck('listShow')
          // 获取列表
          this.getList()
        } else if (query.type === 'edit') {
          if (!this.qrcode.id && !query.id) {
            this.$router.push('/product/qrcode')
            return
          }
          this.getProductList()
          if (!this.qrcode.id && query.id) {
            this.getQrcodeById(query.id)
          }
          this.viewCheck('edit')
        } else if (query.type === 'add') {
          this.getProductList()
          this.viewCheck('add')
        } else {
          this.viewCheck('listShow')
          this.getList()
        }
      },

      productSelect (product) {
        if (product.label) {
          this.qrcode.productName = product.label
        }
      },
      getProductList (word) {
        var postData = {
          'page': 1,
          'size': 999,
          'orderBy': [
            {
              'property': 'productName',
              'order': 'desc'
            }
          ]
        }
        if (word) {
          postData.queryFilter = [{
            'property': 'productName',
            'op': 'like',
            'value': word
          }]
        }
        this.remoteLoading = true
        this.$http.post(`/products/search`, postData).then((res) => {
          this.productList = {...res.content}
        }).catch((err) => {
          console.error(err)
        }).finally(() => {
          this.remoteLoading = false
        })
      },

      /**
       * 点击搜索
       */
      searchQrcode () {
        this.pageWords = this.search.keywords
        this.$nextTick(() => {
          this.getList()
        })
      },

      /**
       * 获取二维码列表
       */
      getList (page) {
        this.list.currentPage = page || 1
        let options = {
          page: page || 1,
          size: this.list.pageSize,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        if (this.pageWords) {
          options.wd = this.pageWords
        }
        if (this.search.qrcodeType !== 'all') {
          options.queryFilter.push({
            'property': 'qrcodeType',
            'op': '=',
            'value': this.search.qrcodeType
          })
        }
        if (this.search.otherShow) {
          if (this.search.startDate) {
            let time = new Date(this.search.startDate.toLocaleDateString() + ' 00:00:00').getTime()
            options.queryFilter.push({
              'property': 'createdTime',
              'op': '>=',
              'value': time
            })
          }

          if (this.search.endDate) {
            let time = new Date(this.search.endDate.toLocaleDateString() + ' 23:59:59').getTime()
            options.queryFilter.push({
              'property': 'createdTime',
              'op': '<=',
              'value': time
            })
          }

          options.queryFilter.push({
            'property': 'quantity',
            'op': '>=',
            'value': this.search.min
          })
          options.queryFilter.push({
            'property': 'quantity',
            'op': '<=',
            'value': this.search.max
          })
        }

        this.$Loading.start();
        this.$http.post('/qrcodebatchs/search', options)
          .then((res) => {
            if (res && res.content && res.content.length === 0 || !res || res && !res.content) {
              this.listError = {
                ...(this.pageWords ? this.$Err.noResult(true) : this.$Err.noData(true)),
                title: '没有相关二维码',
                content: this.pageWords ? `没有找到和【${this.pageWords}】相关的二维码，您可以添加二维码或者换个关键词试试`
                  : `没有找到相关的二维码，您可以添加二维码或者换个关键词试试`
              }
            } else {
              this.listError = null
              this.list.total = res.totalCount
              this.list.data = res.content || []
            }
            this.$Loading.finish();
          })
          .catch((err) => {
            console.error(err)
            this.list.data = []
            this.listError = {...this.$Err.unhandled(true)}
            this.$Loading.error();
          })
          .finally(() => {
            this.getListNow = false
          })
      },

      /**
       * 获取二维码信息
       * @param id
       */
      getQrcodeById (id) {
        this.$Loading.start()
        if (!id && this.$route.query.id) id = this.$route.query.id
        if (!id) {
          this.$Message.error('获取二维码配置信息失败')
          console.error('function getQrcodeById need id')
          return
        }
        this.$http.get(`/qrcodebatch/${id}`)
          .then((data) => {
            if (!data) this.editError = {...this.$Err.notFound(false)}
            else this.editError = null
            if (data.qrcodeType === 'UNITS_BOX') {
              this.goBack()
            }
            this.qrcode = {...this.qrcode, ...data}
            this.$Loading.finish()
          })
          .catch((err) => {
            console.error(err)
            this.editError = {...this.$Err.unhandled(true)}
            this.$Loading.error()
          })
          .finally(() => {
            this.editRetryNow = false
          })
      },

      /**
       * 获取选中列表数据
       * @param selected 选中数据
       */
      selectChange (selected) {
        this.list.selected = selected
      },

      /**
       *获取列表出错后重试曹操作
       */
      listErrorAction () {
        if (this.listError.type === this.$ErrType.UNHANDLED) {
          this.getListNow = true
          this.getList(this.list.currentPage)
        } else {
          this.$router.push({query: {type: 'add'}})
        }
      },

      /**
       * 编辑界面获取数据出错后重试操作
       */
      editErrorAction () {
        this.editRetryNow = true
        this.getQrcodeById(this.qrcode.id)
      },

      /**
       * 重置qrcode 数据
       */
      resetLine () {
        this.$refs.qrcode.resetFields()
        this.qrcode = Object.assign({},
          this.qrcode, {
            id: '',
            batch: '',
            qrcodeType: 'UNITS_BAG',
            productId: '',
            productName: '',
            quantity: 100,
            printColumns: 3,
            description: ''
          })
      },

      /**
       * 添加qrcode
       */
      addLine () {
        this.$router.push({query: {type: 'add'}})
      },

      /**
       * 更新qrcode
       */
      qrcodeSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (!valid) {
            return
          }
          this.updateQrcodeError = ''
          this.updateQrcodeNow = true

          let data = Object.assign({}, this.qrcode)
          if (!data.id) delete data.id
          if (this.add) delete data.batch
          this.$http.post('/qrcodebatch', data)
            .then((res) => {
              if (this.add) {
                this.$Message.success('添加二维码成功')
                this.goBack()
              } else {
                this.$Message.success('修改二维码成功')
                this.goBack()
              }
            })
            .catch((err) => {
              this.updateQrcodeError = err.message || '二维码添加失败'
            })
            .finally(() => {
              this.updateQrcodeNow = false
            })
        })
      },

      /**
       * 返回上一个操作
       */
      goBack () {
        this.$router.back()
      }
    },
    watch: {
      $route (to, from) {
        this.routerChange(to)
      },
      'qrcode.qrcodeType': function (newVal, oldVal) {
        if (newVal === 'UNITS_BOX') {
          if (this.qrcode.quantity > 999999) {
            this.qrcode.quantity = 999999
          }
          if (this.qrcode.txtMinCodes > 999999) {
            this.qrcode.txtMinCodes = 999999
          }
        }
      }
    }
  }
</script>
