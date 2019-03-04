<style lang="less" scoped>
  .title {
    background: #f8f8f9;
    padding: .5em 1em;
    margin: 0 -16px 10px -16px;
  }

  .product-usual-specification {
    display: flex;
    > li {
      flex: 1;
      &:first-child {
        margin-right: 32px;
      }
    }
  }
</style>

<template>
  <div class="content-inner">
    <card v-show="!this.$route.query.current" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>产品管理</Breadcrumb-item>
          <Breadcrumb-item>产品定义</Breadcrumb-item>
          <Breadcrumb-item>列表</Breadcrumb-item>
        </Breadcrumb>
      </p>

      <div>
        <Row type="flex" justify="space-between" class="card-header">
          <i-col span="24" class="product-line-desc">
            <strong>产品(Product)</strong>
            <p>
              产品是销售的最小单位
            </p>
          </i-col>
        </Row>
        <Row>
          <i-col>
            <iCol v-if="!listError" style="float: left; margin-bottom: 20px;">
              <Button id="product_product_btn_addproduct" @click="addProduct">
                添加
              </Button>
              <Button id="product_product_btn_delete" @click="deleteProduct('Batch')">删除选中</Button>
              <!--<Button id="product_product_btn_import" @click="">导入</Button>-->
              <!--<Button id="product_product_btn_output" @click="">导出</Button>-->
            </iCol>
            <div style="width: 219px;float: right">
              <Input v-model.trim="keywords" @on-enter="getProductList(1, keywords)" placeholder="名称、登记证号">
              <Button slot="append" id="product_product_btn_search" @click="getProductList(1, keywords)">搜索</Button>
              </Input>
            </div>
          </i-col>
        </Row>
      </div>

      <Row>
        <i-col span="24">
          <div v-if="loadedSuccess" style="padding-bottom: 10px;width: 100%">
            <div style="clear: both" v-if="!this.$route.query.q">
              <Table id="product_product_table_productlist" stripe :columns="titleData" :data="detailData"
                     style="clear: both; margin: 0 0 20px 0" @on-selection-change="choiseItem"></Table>
              <Page id="product_product_page_productlist" :total="total_num" show-elevator show-total
                    style="float:right;margin:10px 0 0 0;" :current="current_page"
                    @on-change="pageChange" :page-size="10" size="small"></Page>
            </div>
            <div style="clear: both"></div>
          </div>
          <error-view id="product_product_list_error" :error="listError" name="产品" @action="errorAction"
                      :loading="loadingList"></error-view>
        </i-col>
      </Row>
    </card>
    <card v-show="this.$route.query.current" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>产品</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current && !this.$route.query.id">添加</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.id">编辑</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <div v-show="!editError">
        <row>
          <Form label-position="left" :label-width="160" ref="productItem" :model="productItem" :rules="accountRules">
            <Form-item label="产品编码" prop="productNo">
              <Input :maxlength="20" v-model.trim="productItem.productNo"
                     placeholder="请输入产品编码" size="large">
              </Input>
            </Form-item>
            <Form-item label="产品名称" prop="productName">
              <Input id="product_addproduct_input_name" :maxlength="100" v-model="productItem.productName"
                     placeholder="请输入产品名称" size="large">
              </Input>
            </Form-item>
            <Form-item label="包装单位" prop="units">
              <Select v-model="productItem.units" size="large">
                <Option v-for="option in unitsOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </Option>
              </Select>
            </Form-item>
            <Form-item label="常用包装规格(盒)" prop="caseBag">
              <Input id="product_addproduct_input_usual_specification_package"
                         v-model="productItem.caseBag" size="large">
                <span slot="append">袋（瓶） / 盒</span>
              </Input>
            </Form-item>
            <Form-item label="常用包装规格(箱)" prop="boxCase">
              <Input id="product_addproduct_input_usual_specification_box"
                     v-model="productItem.boxCase" size="large">
              <span slot="append">盒 / 箱</span>
              </Input>
            </Form-item>
            <Form-item label="冗余数量" prop="extraCase" data-describe="冗余数量只针对盒码，不针对箱码和袋/瓶码，数量不能超过常用包装规格(箱)">
              <Input v-model="productItem.extraCase" size="large">
              </Input>
            </Form-item>

            <Form-item label="农药登记类别" prop="registerType">
              <Select v-model="productItem.registerType" id="product_addproduct_input_registerType" size="large">
                <Option v-for="option in registerTypeOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </Option>
              </Select>
            </Form-item>

            <Form-item label="农药登记证号" prop="registerNo"  data-describe="填写农药登记证号后6位">
              <Input id="product_addproduct_input_register_no" :maxlength="6" v-model="productItem.registerNo"
                     placeholder="请输入农药登记证号" size="large">
              </Input>
            </Form-item>
            
            <Form-item label="农药登记证持有人" prop="registerBy">
              <Input id="product_addproduct_input_register_by" :maxlength="50" v-model="productItem.registerBy"
                     placeholder="请输入农药登记证持有人" size="large">
              </Input>
            </Form-item>
            
            <Form-item label="生产类型" prop="produceTypeCode">
              <Select id="product_addproduct_input_produceType" v-model="productItem.produceTypeCode"
                      @on-change="produceTypeNameChange"
                      :label-in-value="true" size="large">
                <Option v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Form-item>

            <Form-item label="袋/瓶规格码" prop="specCodeBag" data-describe="填写3位袋/瓶规格码">
              <Input :maxlength="3" v-model="productItem.specCodeBag"
                     placeholder="请输入袋/瓶规格码" id="product_addproduct_input_specCodeBag" size="large">
              </Input>
            </Form-item>

            <Form-item label="袋/瓶规格" prop="specBag">
              <Input :maxlength="20" v-model="productItem.specBag"
                     placeholder="请输入袋/瓶规格" id="product_addproduct_input_specBag" size="large">
              </Input>
            </Form-item>
            
            <Form-item label="箱规格码" prop="specCodeBox" data-describe="填写3位箱规格码">
              <Input :maxlength="3" v-model="productItem.specCodeBox"
                     placeholder="请输入箱规格码" id="product_addproduct_input_specCodeBox" size="large">
              </Input>
            </Form-item>

            <Form-item label="箱规格" prop="specBox">
              <Input :maxlength="20" v-model="productItem.specBox"
                     placeholder="请输入箱规格" id="product_addproduct_input_specBox" size="large">
              </Input>
            </Form-item>

            <Form-item label="盒规格码" prop="specCodeCase" data-describe="填写3位盒规格码">
              <Input :maxlength="3" v-model="productItem.specCodeCase"
                     placeholder="请输入盒规格码" id="product_addproduct_input_specCodeCase" size="large">
              </Input>
            </Form-item>

            <Form-item label="盒规格" prop="specCase">
              <Input :maxlength="20" v-model="productItem.specCase"
                     placeholder="请输入盒规格码" id="product_addproduct_input_specCase" size="large">
              </Input>
            </Form-item>
            
            <Form-item label="使用方法" prop="usageMethod ">
              <Input id="product_addproduct_input_usageMethod" type="textarea" :rows="4" :maxlength="500"
                     v-model="productItem.usageMethod"
                     placeholder="请输入使用方法" size="large"/>
            </Form-item>
            <Form-item label="使用范围" prop="usageRange">
              <Input id="product_addproduct_input_usageRange" :maxlength="100" v-model="productItem.usageRange"
                     placeholder="请输入使用范围" size="large">
              </Input>
            </Form-item>
            <Form-item label="溯源地址" prop="infoUrl">
              <Input id="product_addproduct_input_infoUrl" :maxlength="100" v-model="productItem.infoUrl"
                     placeholder="请输入溯源地址" size="large">
              </Input>
            </Form-item>

            <Form-item label="生产企业" prop="company">
              <Input :maxlength="50" v-model="productItem.company"
                     placeholder="请输入生产企业" size="large">
              </Input>
            </Form-item>

            <Form-item label="国内代理机构" prop="agentDept">
              <Input :maxlength="50" v-model="productItem.agentDept"
                     placeholder="请输入国内代理机构" size="large">
              </Input>
            </Form-item>

            <Form-item label="分装企业" prop="packDept">
              <Input :maxlength="50" v-model="productItem.packDept"
                     placeholder="请输入分装企业" size="large">
              </Input>
            </Form-item>

            <Form-item label="备注">
              <Input id="product_addproduct_input_description" v-model="productItem.description" type="textarea"
                     :rows="4" placeholder="备注。。。" size="large" :maxlength="200"></Input>
            </Form-item>
            <Form-item label="生产包装">
              <FileUploader
                v-if="productItem.id"
                item-size="240"
                :max-size="2046"
                :ent-id="productItem.id"
                type-key="package"
                :immediate="true"
                :multiple="false"
                accept="image/*"
                id="product_addproduct_input_package">
              </FileUploader>
            </Form-item>

            <Alert type="error" id="product_product_alert_error" v-show="errorMessage.saveProduce">
              {{errorMessage.saveProduce}}
            </Alert>
            <Form-item>
              <Button id="product_addproduct_btn_save" type="primary"
                      @click="saveProduct('productItem')">保存
              </Button>
              <Button id="product_addproduct_btn_back"@click="goBack">
                取消
              </Button>
            </Form-item>
          </Form>
        </row>
      </div>
      <error-view id="product_product_edit_error" :error="editError" name="产品" @action="getProductById($route.query.id)"
                  :loading="editNow"></error-view>
    </card>
  </div>
</template>

<script>
  import FileUploader from '@/components/common/FileUploader'

  export default {
    components: { FileUploader },
    data () {
      const validateNumber = (rule, value, callback) => {
        if (typeof value === 'number') {
          callback()
          return
        }
        if (!value.match(/^\+?[1-9][0-9]*$/)) {
          callback(new Error('只能为数字，且必须大于0'));
        }
        callback();
      }

      const validateNumber4SpecCode = (rule, value, callback) => {
        if (typeof value === 'number') {
          callback()
          return
        }
        if (!value.match(/^\+?[0-9]*$/)) {
          callback(new Error('只能为数字'));
        }
        callback();
      }

      const validateExtraCase = (rule, value, callback) => {
        if (typeof value !== 'number' && value !== '0' && !value.match(/^\+?[1-9][0-9]*$/)) {
          return callback(new Error('只能为有效数字'))
        }
        value = parseInt(value)
        if (value > this.productItem.boxCase) {
          return callback(new Error('冗余数量不能超过常用包装规格(箱)'))
        }
        return callback()
      }

      return {
        keywords: '',
        listError: null,
        loadingList: null,               // 列表加载中
        loading: true,                   // 加载中
        loadedSuccess: true,            //  加载成功
        total_num: 0,                    //  总条数
        choisedItem: [],              // 已选的条目
        current_page: 1,              // 当前页
        errorMessage: {               // 错误信息
          saveProduce: ''
        },
        titleData: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '产品名称',
            ellipsis: true,
            key: 'productName'
          },
          {
            ellipsis: true,
            title: '农药登记证号',
            render: (h, p) => {
              return h('span', p.row.registerNo || '-')
            }
          },
          {
            ellipsis: true,
            title: '生产类型',
            key: 'produceTypeName'
          },
          {
            title: '创建时间',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('span', ` ${new Date(p.row.createdTime).toLocaleString()}`)
              ])
            }
          },
          {
            title: ' ',
            key: 'action',
            width: 160,
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  on: {
                    click: (evt) => {
                      this.editProduct(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {type: 'warning'},
                  on: {
                    click: (evt) => {
                      this.deleteProduct(params.index)
                      evt.stopPropagation()
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        detailData: [],
        accountRules: {
          productNo: [
            { required: true, message: '请填写产品编码', trigger: 'blur' }
          ],
          productName: [
            {required: true, message: '请填写产品名称', trigger: 'blur'}
          ],
          units: [
            {required: true, message: '请输入包装单位', trigger: 'blur'}
          ],
          caseBag: [
            {required: true, message: '请输入每盒的袋数', trigger: 'blur'},
            {validator: validateNumber, trigger: 'blur'}
          ],
          boxCase: [
            {required: true, message: '请输入每箱的盒数', trigger: 'blur'},
            {validator: validateNumber, trigger: 'blur'}
          ],
          registerNo: [
            {required: true, message: '请填写农药登记证号', trigger: 'blur'},
            { validator: validateNumber4SpecCode, trigger: 'blur' },
            { type: 'string', min: 6, message: '农药登记证号长度为6', trigger: 'blur' }
          ],
          registerBy: [
            {required: true, message: '请填写农药登记证持有人', trigger: 'blur'}
          ],
          specCodeBag: [
            { required: true, message: '请填写袋规格码', trigger: 'blur' },
            { validator: validateNumber4SpecCode, trigger: 'blur' },
            { type: 'string', min: 3, message: '袋规格码长度为3', trigger: 'blur' }
          ],
          specCodeBox: [
            { required: true, message: '请填写箱规格码', trigger: 'blur' },
            { validator: validateNumber4SpecCode, trigger: 'blur' },
            { type: 'string', min: 3, message: '箱规格码长度为3', trigger: 'blur' }
          ],
          specCodeCase: [
            { required: true, message: '请填写盒规格码', trigger: 'blur' },
            { validator: validateNumber4SpecCode, trigger: 'blur' },
            { type: 'string', min: 3, message: '盒规格码长度为3', trigger: 'blur' }
          ],
          extraCase: [
            { validator: validateExtraCase, trigger: 'blur' }
          ]
        },
        registerTypeOptions: [
          { text: 'PD登记', value: '1' },
          { text: 'WP登记', value: '2' },
          { text: '临时登记', value: '3' }
        ],
        typeList: [
          {label: '农药登记证持有人生产', value: 1},
          {label: '委托加工', value: 2},
          {label: '委托分装', value: 3}
        ],
        productItem: {
          productNo: '',
          productName: '',
          units: 'UNITS_BAG',
          caseBag: '1',
          boxCase: '10',
          registerType: '1',
          registerNo: '',
          registerBy: '',
          produceTypeName: '农药登记证持有人生产',
          produceTypeCode: 1,
          specCodeBag: null,
          specBag: null,
          specCodeBox: null,
          specBox: null,
          specCodeCase: null,
          specCase: null,
          usageMethod: '',
          usageRange: '',
          infoUrl: '',
          description: '',
          company: '德国阿格福莱农林环境生物技术股份有限公司',
          agentDept: '北京诚禾佳信咨询服务有限公司',
          packDept: '广东省佛山市盈辉作物科学有限公司',
          extraCase: 0
        },
        unitsOptions: [
          { value: 'UNITS_BAG', text: '袋' },
          { value: 'UNITS_BOTTLE', text: '瓶' }
        ],
        editError: null,
        editNow: false      
      }
    },
    methods: {
      addProduct () {
        this.resetProduct()
        this.$router.push({
          query: { current: 'add-product' }
        })
      },
      produceTypeNameChange (produce) {
        this.productItem.produceTypeName = produce.label
      },
      editProduct (data) {
        this.$router.push({
          query: {
            current: 'edit-product',
            id: data.id
          }
        })
        this.productItem = data
        this.productItem.caseBag = String(this.productItem.caseBag)
        this.productItem.boxCase = String(this.productItem.boxCase)
      },
      saveProduct (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Loading.start()
            let data = {...this.productItem}
            data.boxCase = parseInt(data.boxCase)
            data.caseBag = parseInt(data.caseBag)
            this.$http.post(`/product/save`, data).then((res) => {
              if (this.$route.query.current === 'add-product') {
                this.$Message.success('添加成功')
                this.goBack()
              } else {
                this.$Message.success('编辑成功')
                this.goBack()
              }
              this.productItem = {...this.productItem, ...res}
              this.errorMessage.saveProduce = ''
              this.$Loading.finish()
            }).catch((res) => {
              this.errorMessage.saveProduce = res.message
              this.$Loading.error()
            })
          }
        })
      },
      deleteProduct (item) {
        let content = ''
        if (item === 'Batch') {
          if (this.choisedItem.length < 1) {
            this.$Message.warning('还未选中产品')
            return
          }
          content = this.$C.MSG_COMM_DELETE_BATCH_CONFIRM.format('产品')
        } else {
          this.choisedItem = []
          this.choisedItem[0] = this.detailData[item]
          content = this.$C.MSG_COMM_DELETE_CONFIRM.format('产品', this.choisedItem[0].productName)
        }
        this.$Modal.confirm({
          title: '删除产品',
          content: content,
          onOk: () => {
            var deleteId = []
            for (let i in this.choisedItem) {
              deleteId.push(this.choisedItem[i].id)
            }
            this.$http.post(`/products/delete`, deleteId).then((res) => {
              this.$Message.success('删除产品成功')
              if (this.current_page === parseInt((this.total_num - 1) / 10 + 1)) {                    //  判断当前页是不是最后一页
                this.current_page = parseInt((this.total_num - 2) / 10 + 1)                         //   该页最后一条被删后更新页码
                if (this.current_page < 1) {
                  this.current_page = 1
                }
              }
              this.total_num--
              this.getProductList(this.current_page, this.keywords)
              this.choisedItem = []
            }).catch((res) => {
              this.$Message.error(res.message)
            }).finally(() => {
              //              console.log({productIds: deleteId})
            })
          },
          onCancel: () => {
            this.choisedItem = []
          }
        })
      },
      goBack () {
        this.$router.back()
        this.resetProduct()
      },
      pageChange (page) {
        this.getProductList(page, this.keywords)
        this.current_page = page
      },
      choiseItem (item) {
        this.choisedItem = item
      },
      errorAction () {
        if (this.listError.type === 'noData') {
          this.loadedSuccess = true
          this.listError = null
          this.addProduct()
        } else {
          this.getProductList(1)
        }
      },
      getProductById (id) {
        if (id) {
          this.editNow = true
          this.$http.get(`/product/${id}`)
            .then((data) => {
              if (!data) this.editError = {...this.$Err.notFound()}
              else this.editError = null
              this.productItem = data
              this.productItem.caseBag = String(this.productItem.caseBag)
              this.productItem.boxCase = String(this.productItem.boxCase)
            })
            .catch((err) => {
              console.error(err)
              this.editError = {...this.$Err.unhandled(true)}
            })
            .finally(() => {
              this.editNow = false
            })
        }
      },
      getProductList (page, word) {
        this.current_page = page
        this.loadingList = true
        var postData = {
          '_loading': true,
          'page': page,
          'size': 10,
          'orderBy': [
            {
              'property': 'createdTime',
              'order': 'desc'
            }
          ]
        }
        if (word) {
          postData.wd = word
        }
        this.$http.post(`/products/search`, postData).then((res) => {
          var listData = res.content
          if (listData.length > 0) {
            this.total_num = res.totalCount
            this.loadedSuccess = true
            this.listError = null
          } else {
            if (this.keywords) {
              this.listError = {title: '没有相关产品', content: `没有找到和【${this.keywords}】相关的产品，您可以添加产品或者换个关键词试试`}
            } else {
              this.listError = {...this.$Err.noData()}
            }
            this.listError.type = 'noData'
            this.loadedSuccess = false
            listData = []
            this.total_num = 0
          }
          this.detailData = listData
        }).catch((res) => {
          this.loadedSuccess = false
          this.listError = {...this.$Err.unhandled()}
        }).finally(() => {
          this.loadingList = false
        })
      },
      resetProduct () {
        this.$refs.productItem.resetFields()
        this.productItem = {
          id: this.$uuid(),
          productName: '',
          units: 'UNITS_BAG',
          caseBag: '1',
          boxCase: '10',
          registerType: 1,
          registerNo: '',
          registerBy: '',
          produceTypeName: '农药登记证持有人生产',
          produceTypeCode: 1,
          specCodeBag: null,
          specBag: null,
          specCodeBox: null,
          specBox: null,
          specCodeCase: null,
          specCase: null,
          usageMethod: '',
          usageRange: '',
          infoUrl: '',
          description: '',
          company: '德国阿格福莱农林环境生物技术股份有限公司',
          agentDept: '北京诚禾佳信咨询服务有限公司',
          packDept: '广东省佛山市盈辉作物科学有限公司',
          extraCase: 0
        }
      }
    },
    mounted () {
      if (['edit-product', 'add-product'].indexOf(this.$route.query.current) > -1) {
        if (this.$route.query.id && this.$route.query.current === 'edit-product') {
          this.getProductById(this.$route.query.id)
        } else if (this.$route.query.current === 'add-product') {
          this.resetProduct()
        }
      } else this.getProductList(1)
    },
    watch: {
      $route (to, from) {
        if (!to.query.current) this.getProductList(this.current_page, this.keywords)
      }
    }
  }
</script>
