<template>
  <Row>
    <Row v-show="current === 'FORM'">
      <Row v-if="!error && goods">
        <Row style="padding-left: 90px;">
          <h3>商品规格</h3>
          <h5>设置商品的商品规格，在新增和修改商品规格后需要保存才能生效</h5>
          <br>
          <Button type="ghost" @click="addSku">新增规格</Button>
          <Table style="width: 700px;" 
            :columns="skuList.columns"
            :data="skuList.data"></Table>
          <h3>基础信息</h3>
          <h5>设置商品的基本信息</h5>
        </Row>
        <Form ref="FORM" :model="goods" :rules="goodsRules" label-position="left" :label-width="160">
          <Form-item label="商品名称" prop="goodsName"
            data-describe="商品名称最大长度为50">
            <Input v-model="goods.goodsName"
              placeholder="请输入活动名称"
              :maxlength="50"></Input>
          </Form-item>
          <Form-item label="商品分类"
            data-describe="必须选择到三级商品分类"
            prop="categoryThree">
            <CategoryCascader v-model="categoryCascader"></CategoryCascader>
          </Form-item>
          <Form-item label="是否上架">
            <RadioGroup v-model="goods.isOnShelf">
              <Radio :label="0">是</Radio>
              <Radio :label="1">否</Radio>
            </RadioGroup>
          </Form-item>
          <Form-item label="商品详情">
            <HtmlEditor v-model="goods.goodsInfo" :showCount="false"></HtmlEditor>
          </Form-item>
          <Alert type="error"
            style="width: 555px; margin-left: 90px;"
            show-icon 
            v-if="errorMsg">{{ errorMsg }}</Alert>
          <Form-item>
            <Row>
              <Button type="primary" @click="submit">保存</Button>
              <Button @click="back">取消</Button>
            </Row>
          </Form-item>
        </Form>
      </Row>
      <error-view v-if="error" :error="error" :loading="errorLoading" @action="init"></error-view>
    </Row>
    <SkuForm v-if="current === 'SKU_FORM'"
      :sku="skuList.selected"
      :sku-list-data="skuList.data"
      @on-save="handleSkuFormSave"
      @on-close="handleSkuFormClose"></SkuForm>
  </Row>
</template>

<script>
import HtmlEditor from '@/components/common/HtmlEditor'
import CategoryCascader from './CategoryCascader'
import SkuForm from './SkuForm'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))
const defaultGoods = {
  goodsName: null,
  categoryOne: null,
  categoryTwo: null,
  categoryThree: null,
  isOnShelf: 0,
  goodsInfo: '',
  status: 0  
}

export default {
  components: { HtmlEditor, CategoryCascader, SkuForm },
  data () {
    return {
      current: 'FORM',
      error: null,
      errorLoading: false,
      goods: jsonCopy(defaultGoods),
      goodsRules: {
        goodsName: [
          { required: true }
        ],
        categoryThree: [
          { required: true }
        ]
      },
      skuList: {
        selected: null,
        data: [],
        columns: [
          {
            title: '规格信息',
            render: (h, p) => <row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>规格：{ p.row.spec }</span>
                </i-col>
                <i-col span="12">
                  <span>规格缩写：{ p.row.specKey }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>市场价（元）：{ this.toYuan(p.row.marketPrice) }</span>
                </i-col>
                <i-col span="12">
                  <span>销售价（元）：{ this.toYuan(p.row.salesPrice) }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>成本价（元）：{ this.toYuan(p.row.costPrice) }</span>
                </i-col>
                <i-col span="12">
                  <span>库存数量：{ p.row.stocks }</span>
                </i-col>
              </row>
            </row>
          },
          {
            title: '操作',
            width: 150,
            align: 'center',
            render: (h, p) => <button-group>
              <i-button type="ghost" onClick={ () => this.editSku(p.row) }>编辑</i-button>
              <i-button type="warning" onClick={ () => this.deleteSku(p.row.id, p.row.__isNew__) }>删除</i-button>
            </button-group>
          }
        ]
      },
      breadcrumbList: [],
      errorMsg: null
    }
  },
  props: {
    id: [String, Object],
    method: [String, Object]
  },
  computed: {
    categoryCascader: {
      set (value) {
        this.goods.categoryOne = value[0]
        this.goods.categoryTwo = value[1]
        this.goods.categoryThree = value[2]
      },
      get () {
        return [this.goods.categoryOne, this.goods.categoryTwo, this.goods.categoryThree]
      }
    }
  },
  methods: {
    toYuan (val) {
      return val / 100
    },
    toFen (val) {
      return parseInt(val * 100)
    },
    handleSkuFormSave (sku) {
      let data = this.skuList.data.find(d => d.id === sku.id)
      if (data) {
        data.spec = sku.spec
        data.specKey = sku.specKey
        data.marketPrice = sku.marketPrice
        data.salesPrice = sku.salesPrice
        data.costPrice = sku.costPrice
        data.pointPrice = sku.pointPrice
        data.stocks = sku.stocks
        data.status = sku.status
        data.pictures = sku.pictures
      } else {
        this.skuList.data.push(sku)
      }
      this.current = 'FORM'
    },
    handleSkuFormClose () {
      this.current = 'FORM'
    },
    init () {
      if (!this.id) {
        this.breadcrumbList.push({ text: '新增商品' })
        return
      }

      if (this.error) this.errorLoading = true
      this.goods = null
      this.$http.get(`/market/goods/${this.id}`, true)
      .then(res => {
        res.goodsInfo = res.goodsInfo !== null ? res.goodsInfo : ''
        this.goods = res.goods

        this.skuList.data = res.goodsSku

        this.breadcrumbList = [
          { text: res.goods.goodsName },
          { text: '编辑' }
        ]
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    addSku () {
      this.skuList.selected = null
      this.current = 'SKU_FORM'
    },
    editSku (sku) {
      this.skuList.selected = sku
      this.current = 'SKU_FORM'
    },
    deleteSku (id, isNew = false) {
      let p
      if (isNew) {
        p = Promise.resolve(true)
      } else {
        p = this.$http.delete(`/market/goods/sku/${id}`, true)
      }
      
      p.then(res => {
        let i = this.skuList.data.findIndex(d => d.id === id)
        if (i !== -1) {
          this.skuList.data.splice(i, 1)
        }
        this.$Message.success('删除商品规格成功！')
      }).catch(error => {
        console.error(error)
        this.$Message.error('删除商品规格失败，请稍候重试！')
      })
    },
    submit () {
      if (this.skuList.data.length === 0) {
        this.errorMsg = '请先设置商品的规格'
        return false
      }

      this.$refs.FORM.validate(valid => {
        if (!valid) {
          return false
        }

        let data = {
          _loading: true,
          goods: jsonCopy(this.goods),
          skus: jsonCopy(this.skuList.data)
        }

        let url = this.goods.id ? `/market/goods/${this.goods.id}` : '/market/goods'
        let method = this.goods.id ? 'PUT' : 'POST'

        this.$http({
          url,
          method,
          data
        }).then(res => {
          this.$Message.success('商品保存成功！')
          this.$emit('on-breadcrumbchange', [])
          this.$emit('on-close', true)
        }).catch(error => {
          console.error(error)
          if (error.code === 'COMM_BIZ_EXISTS' || error.code === 'COMM_BIZ_ERROR') {
            this.errorMsg = error.message
          }
          this.$Message.error('商品保存失败，请稍后重试！')
        })
      })
    },
    back () {
      this.$emit('on-breadcrumbchange', [])
      this.$emit('on-close')
    }
  },
  watch: {
    'skuList.data': {
      deep: true,
      handler (val, oldVal) {
        if (val.length > 0) {
          this.errorMsg = null
        }
      }
    },
    breadcrumbList: {
      deep: true,
      handler (val, oldVal) {
        this.$emit('on-breadcrumbchange', this.breadcrumbList)
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
