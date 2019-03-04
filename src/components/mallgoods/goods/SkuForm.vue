<template>
  <Row>
    <Row style="padding-left: 90px;">
      <h3>注意</h3>
      <h5>在保存规格信息后需要保存商品信息才能生效</h5>
    </Row>
    <Form ref="FORM" :model="model" :rules="rules" label-position="left" :label-width="160">
      <Form-item label="规格" prop="spec"
        data-describe="规格最大长度为100，同一商品不允许使用重复的规格">
        <Input placeholder="请输入规格"
          v-model="model.spec"
          :maxlength="100"></Input>
      </Form-item>
      <Form-item label="规格缩写" prop="specKey"
        data-describe="规格缩写最大长度为10">
        <Input placeholder="请输入规格缩写"
          v-model="model.specKey"
          :maxlength="10"></Input>
      </Form-item>
      <Form-item label="市场价（元）" prop="marketPrice"
        data-describe="市场价（元）将保留最多2位精度">
        <InputNumber style="width: 100%;"
          placeholder="请输入市场价（元）"
          v-model="model.marketPrice"
          :min="0"
          :max="100000"></InputNumber>
      </Form-item>
      <Form-item label="销售价（元）" prop="salesPrice"
        data-describe="销售价（元）将保留最多2位精度">
        <InputNumber style="width: 100%;"
          placeholder="请输入销售价（元）"
          v-model="model.salesPrice"
          :min="0"
          :max="100000"></InputNumber>
      </Form-item>
      <Form-item label="成本价（元）" prop="costPrice"
        data-describe="成本价（元）将保留最多2位精度">
        <InputNumber style="width: 100%;"
          placeholder="请输入成本价（元）"
          v-model="model.costPrice"
          :min="0"
          :max="100000"></InputNumber>
      </Form-item>
      <!-- 屏蔽积分价格 -->
      <!-- <Form-item label="积分价格" prop="pointPrice">
        <InputNumber style="width: 100%;"
          placeholder="请输入积分价格"
          v-model="model.pointPrice"
          :min="0"
          :max="100000"></InputNumber>
      </Form-item> -->
      <Form-item label="库存数量" prop="stocks">
        <InputNumber style="width: 100%;"
          placeholder="请输入库存数量"
          v-model="model.stocks"
          :min="0"
          :max="100000"
          :precision="0.1"></InputNumber>
      </Form-item>
      <Form-item label="规格图片">
        <FileUploader
          v-if="model.id"
          :immediate="true"
          :ent-id="model.id"
          type-key="goodspictures"
          accept="image/*"
          :maxFileCount="5"
          :multiple="true"
          @on-change="handleGoodsPicturesChange">
        </FileUploader>
      </Form-item>
      <Alert type="error"
        style="width: 555px; margin-left: 90px;"
        show-icon 
        v-if="errorMsg">{{ errorMsg }}</Alert>
      <Alert type="error"
        style="width: 555px; margin-left: 90px;"
        show-icon 
        v-if="picturesErrorMsg">{{ picturesErrorMsg }}</Alert>
      <Form-item>
        <Row>
          <Button type="primary" @click="submit">保存</Button>
          <Button @click="back">取消</Button>
        </Row>
      </Form-item>
    </Form>
  </Row>
</template>

<script>
/**
 * 传入的金额单位是分
 * 返回金额单位是分
 */
import FileUploader from '@/components/common/FileUploader'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))

export default {
  components: { FileUploader },
  data () {
    const validateSpec = (rule, value, callback) => {
      let sku = this.skuListData.find(d => d.spec === this.model.spec)
      if (sku && sku.id !== this.model.id) {
        callback(new Error('同一商品不允许使用重复的规格'))
      } else {
        callback()
      }
    }

    return {
      model: {
        id: null,
        spec: null,
        specKey: null,
        marketPrice: 0,
        salesPrice: 0,
        costPrice: 0,
        pointPrice: 0,
        stocks: 0,
        status: 0,
        pictures: null,
        __isNew__: true
      },
      rules: {
        spec: [
          { required: true },
          { validator: validateSpec }
        ],
        specKey: [
          { required: true }
        ]
      },
      errorMsg: null,
      picturesErrorMsg: null
    }
  },
  props: {
    sku: Object,
    skuListData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    'model.spec': {
      handler (val, oldVal) {
        this.errorMsg = null
      }
    },
    'model.pictures': {
      handler (val, oldVal) {
        if (val !== null) {
          this.picturesErrorMsg = null
        }
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
    handleGoodsPicturesChange (event) {
      let list = event.list.filter(d => d.startsWith('http'))
      if (list.length === 0) {
        this.model.pictures = null
      } else {
        this.model.pictures = list.join()
      }
    },
    init () {
      if (this.sku) {
        this.model = jsonCopy(this.sku)
        this.model.marketPrice = this.toYuan(this.model.marketPrice)
        this.model.salesPrice = this.toYuan(this.model.salesPrice)
        this.model.costPrice = this.toYuan(this.model.costPrice)
      } else {
        this.model.id = this.$uuid()
      }
    },
    submit () {
      if (this.model.pictures === null) {
        this.picturesErrorMsg = '请上传规格图片'
        return false
      }

      this.$refs.FORM.validateField('spec', validMsg => {
        if (validMsg) {
          this.errorMsg = validMsg
          return false
        }
      })

      this.$refs.FORM.validate(valid => {
        if (!valid) {
          return false
        }

        let data = jsonCopy(this.model)
        data.marketPrice = this.toFen(this.model.marketPrice)
        data.salesPrice = this.toFen(this.model.salesPrice)
        data.costPrice = this.toFen(this.model.costPrice)
        this.$emit('on-save', data)
      })
    },
    back () {
      this.$emit('on-close')
    }
  },
  mounted () {
    this.init()
  }
}
</script>
