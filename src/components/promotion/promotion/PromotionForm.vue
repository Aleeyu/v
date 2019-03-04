<template>
  <Row>
    <Row>
      <Button type="primary" @click="back" v-if="disabled || error">返回</Button>
    </Row>
    <Row v-if="!error">
      <Row style="padding-left: 90px;">
        <h3>批次设置</h3>
        <h5>设置参与本次活动的产品及其批次</h5>
        <BatchSelect
          style="width: 555px; padding-top: 10px;"
          :batch-list="promotion.batchList"
          :disabled="disabled"
          @on-change="handleBatchListChange"></BatchSelect>
        <Alert type="error"
          style="width: 555px;"
          show-icon 
          v-if="errorMsg">{{ errorMsg }}</Alert>
        <h3>区域设置</h3>
        <h5>设置此次活动的地理区域，只能设置到省份/直辖市</h5>
        <RegionSetter style="width: 555px; padding-top: 10px;"
          :region-list="promotion.regionList"
          :disabled="disabled"
          @on-change="handleRegionListChange"></RegionSetter>
        <Alert type="error"
          style="width: 555px;"
          show-icon 
          v-if="regionErrorMsg">{{ regionErrorMsg }}</Alert>
        <h3>基础信息</h3>
        <h5>设置本次活动的基础信息</h5>
      </Row>
      <Form ref="FORM" :model="promotion" :rules="promotionRules" label-position="left" :label-width="160">
        <Form-item label="活动名称" prop="eventName"
          data-describe="活动名称最大长度为20">
          <Input placeholder="请输入活动名称"
            v-model="promotion.eventName"
            :disabled="disabled"
            :maxlength="20"></Input>
        </Form-item>
        <Form-item label="最大中奖人数" prop="maxNumber"
          data-describe="最大中奖人数的范围为1 ~ 10000000">
          <InputNumber placeholder="最大中奖人数"
            v-model="promotion.maxNumber"
            :min="1"
            :max="10000000"
            :precision="0.1"
            :disabled="disabled"
            style="width: 100%;"></InputNumber>
        </Form-item>
        <Form-item label="奖池总金额（元）" prop="totalPrize"
          data-describe="奖池总金额（元）的范围为1 ~ 10000，将最多保留两位小数">
          <InputNumber placeholder="奖池总金额（元）"
            v-model="promotion.totalPrize"
            :min="1"
            :max="10000"
            :disabled="disabled"
            style="width: 100%;"></InputNumber>
        </Form-item>
        <Form-item label="红包最小金额（元）" prop="redpackBegin"
          data-describe="红包最小金额（元）的范围为1 ~ 10000，且应该小于等于奖池总金额（元），将最多保留两位小数">
          <InputNumber placeholder="红包最小金额（元）"
            v-model="promotion.redpackBegin"
            :min="1"
            :max="10000"
            :disabled="disabled"
            style="width: 100%;"></InputNumber>
        </Form-item>
        <Form-item label="红包最大金额（元）" prop="redpackEnd"
          data-describe="红包最大金额（元）的范围为1 ~ 10000，且应该大于等于红包最小金额（元），将最多保留两位小数">
          <InputNumber placeholder="红包最大金额（元）"
            v-model="promotion.redpackEnd"
            :min="1"
            :max="10000"
            :disabled="disabled"
            style="width: 100%;"></InputNumber>
        </Form-item>
        <Form-item label="活动开始时间" prop="beginTime">
          <DatePicker style="display: block;" :editable="false"
            :options="dateOption"
            @on-change="handleBeginTimeChange"
            @on-clear="handleBeginTimeChange"
            :disabled="disabled"
            :value="promotion.beginTime" size="large"></DatePicker>
        </Form-item>
        <Form-item label="活动结束时间" prop="endTime"
          data-describe="活动结束时间应该大于等于活动开始时间">
          <DatePicker style="display: block;" :editable="false"
            :options="dateOption"
            @on-change="handleEndTimeChange"
            @on-clear="handleEndTimeChange"
            :disabled="disabled"
            :value="promotion.endTime" size="large"></DatePicker>
        </Form-item>
        <Form-item label="活动描述" prop="eventDescribe">
          <Input type="textarea" placeholder="活动描述，最大长度为100"
            v-model="promotion.eventDescribe"
            :disabled="disabled"
            :maxlength="100"></Input>
        </Form-item>
        <Form-item>
          <Row v-if="!disabled">
            <Button type="primary" @click="submit">保存</Button>
            <Button @click="back">取消</Button>
          </Row>
        </Form-item>
      </Form>
    </Row>
    <error-view v-if="error" :error="error" :loading="errorLoading" @action="init"></error-view>
  </Row>
</template>

<script>
import BatchSelect from '@/components/promotion/promotion/BatchSelect'
import RegionSetter from '@/components/promotion/promotion/RegionSetter'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))
const defaultPromotion = {
  id: null,
  eventName: null,
  eventDescribe: null,
  beginTime: null,
  endTime: null,
  maxNumber: 1,
  totalPrize: 1,
  redpackBegin: 1,
  redpackEnd: 1,
  batchList: [],
  regionList: [
    { province: '110000' }
  ],
  status: null
}

export default {
  components: { BatchSelect, RegionSetter },
  data () {
    const validateEndTime = (rule, value, callback) => {
      if (this.promotion.beginTime > this.promotion.endTime) {
        callback(new Error('活动结束时间应该大于等于活动开始时间'))
      } else {
        callback()
      }
    }

    const validateRedpackBegin = (rule, value, callback) => {
      if (this.promotion.totalPrize < this.promotion.redpackBegin) {
        callback(new Error('红包最小金额（元）应该小于等于奖池总金额（元）'))
      } else {
        callback()
      }
    }

    const validateRedpackEnd = (rule, value, callback) => {
      if (this.promotion.redpackEnd < this.promotion.redpackBegin) {
        callback(new Error('红包最小金额（元）应该小于等于红包最大金额（元）'))
      } else {
        callback()
      }
    }

    return {
      error: null,
      errorLoading: false,
      promotion: jsonCopy(defaultPromotion),
      promotionRules: {
        eventName: [
          { required: true }
        ],
        beginTime: [
          { required: true }
        ],
        endTime: [
          { required: true },
          { validator: validateEndTime }
        ],
        maxNumber: [],
        totalPrize: [],
        redpackBegin: [
          { validator: validateRedpackBegin }
        ],
        redpackEnd: [
          { validator: validateRedpackEnd }
        ]
      },
      dateOption: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      errorMsg: null,
      regionErrorMsg: null
    }
  },
  props: {
    id: [String, Object]
  },
  watch: {
    'promotion.batchList': {
      deep: true,
      handler (val, oldVal) {
        if (val.length > 0) {
          this.errorMsg = null
        }
      }
    },
    'prmotion.regionList': {
      deep: true,
      handler (val, oldVal) {
        if (val.length > 0) {
          this.regionErrorMsg = null
        }
      }
    }
  },
  computed: {
    disabled () {
      return this.promotion.id && (this.promotion.status === 1 || this.promotion.status === 2)
    }
  },
  methods: {
    handleBeginTimeChange: function (date) {
      if (date) {
        this.promotion.beginTime = new Date(date + ' 00:00:00').getTime()
      } else {
        this.promotion.beginTime = null
      }
    },
    handleEndTimeChange: function (date) {
      if (date) {
        this.promotion.endTime = new Date(date + ' 23:59:59').getTime()
      } else {
        this.promotion.endTime = null
      }
    },
    init () {
      if (!this.id) return

      if (this.error) {
        this.errorLoading = true
      }

      this.$http.get(`/promo/getById?id=${this.id}`, true).then(res => {
        this.promotion.id = res.id
        this.promotion.eventName = res.eventName
        this.promotion.eventDescribe = res.eventDescribe
        this.promotion.beginTime = res.beginTime
        this.promotion.endTime = res.endTime
        this.promotion.maxNumber = res.maxNumber
        this.promotion.totalPrize = res.totalPrize / 100
        this.promotion.redpackBegin = res.redpackBegin / 100
        this.promotion.redpackEnd = res.redpackEnd / 100
        this.promotion.status = res.status

        res.promEventItems = res.promEventItems || []
        res.promEventItems.forEach(d => {
          this.promotion.batchList.push({
            batch: d.batchNo,
            id: d.batchId,
            quantity: d.amount,
            productName: d.productName
          })
        })

        res.promEventAreas = res.promEventAreas || []
        this.promotion.regionList = []
        res.promEventAreas.forEach(d => {
          this.promotion.regionList.push({
            province: d.areaId
          })
        })

        this.error = null
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    handleBatchListChange (batchList) {
      this.promotion.batchList = batchList
    },
    handleRegionListChange (regionList) {
      this.promotion.regionList = regionList
    },
    submit () {
      if (this.promotion.batchList.length === 0) {
        this.errorMsg = '请设置参加此次活动的产品以及批次'
        return false
      }

      if (this.promotion.regionList.length === 0) {
        this.regionErrorMsg = '请设置此次活动的地理区域'
        return false
      }

      this.$refs.FORM.validate(valid => {
        if (!valid) {
          return false
        }

        let data = {
          _loading: true,
          eventName: this.promotion.eventName,
          eventDescribe: this.promotion.eventDescribe,
          beginTime: this.promotion.beginTime,
          endTime: this.promotion.endTime,
          maxNumber: this.promotion.maxNumber,
          totalPrize: Math.round(this.promotion.totalPrize * 100),
          redpackBegin: Math.round(this.promotion.redpackBegin * 100),
          redpackEnd: Math.round(this.promotion.redpackEnd * 100),
          promEventItems: [],
          promEventAreas: []
        }

        if (this.promotion.id) {
          data.id = this.promotion.id
        }

        this.promotion.batchList.forEach(d => {
          data.promEventItems.push({
            batchNo: d.batch,
            amount: d.quantity
          })
        })

        this.promotion.regionList.forEach(d => {
          data.promEventAreas.push({
            areaId: d.province
          })
        })

        this.$http.post('/promo/saveProm', data).then(res => {
          res && this.$emit('on-success')
        }).catch(error => {
          console.error(error)
          this.$Message.error(error.message || '活动保存失败，请稍后再试！')
        })
      })
    },
    back () {
      this.$emit('on-back')
    }
  },
  mounted () {
    this.init()
  }
}
</script>
