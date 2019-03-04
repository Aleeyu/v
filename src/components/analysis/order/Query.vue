<template>
  <Row type="flex" justify="end" align="middle">
    <Col class="condition" v-if="showOrder">
      <span>排序规则：</span>
      <Select class="input" :value="order.fieldName" @on-change="handleOrderChange">
        <Option v-for="option in order.options"
          :key="option.value"
          :value="option.value"
          :label="option.text">
        </Option>
      </Select>
    </Col>
    <Col class="condition" v-if="showDate">
      <span>时间范围：</span>
      <DatePicker type="daterange" placeholder="日期范围"
        placement="bottom-end"
        class="input"
        :editable="false"
        :value="defaultDateRange"
        @on-change="handleDateChange">
      </DatePicker>
    </Col>
    <Col class="condition" v-if="showMonth">
      <span>时间范围：</span>
      <DatePicker type="month" placeholder="起始月份"
        placement="bottom-end"
        class="month"
        :editable="false"
        :value="defaultMonthRange[0]"
        @on-change="handleStartMonthChange">
      </DatePicker>
      -
      <DatePicker type="month" placeholder="结束月份"
        placement="bottom-end"
        class="month"
        :editable="false"
        :value="defaultMonthRange[1]"
        @on-change="handleEndMonthChange">
      </DatePicker>
    </Col>
    <Col class="condition">
      <Button @click="handleQueryClick">搜索</Button>
    </Col>
    <Dropdown placement="bottom-end" class="condition" trigger="click">
      <Button>
        高级搜索
        <Icon type="arrow-down-b"></Icon>
      </Button>
      <DropdownMenu slot="list" class="dropdown">
        <Row class="dropdown-item" v-if="showAreaType">
          <span>汇总方式：</span>
          <Select class="input" :value="areaType.value" @on-change="handleAreaTypeChange">
            <Option v-for="option in areaType.options"
              :key="option.value"
              :value="option.value"
              :label="option.text">
            </Option>
          </Select>
        </Row>
        <Row class="dropdown-item" v-if="showArea">
          <span>地区：</span>
          <CityPicker class="input"
            placement="bottom-end"
            placeholder="请选择地区"
            :disableArea="true"
            :disableCity="disableCity"
            :multiple="false"
            :leafOnly="true"
            :fullPath="true"
            :province.sync="area.province"
            :city.sync="area.city"
            :area.sync="area.area"
            :provinceName.sync="area.provinceName"
            :cityName.sync="area.cityName"
            :areaName.sync="area.areaName">
          </CityPicker>
        </Row>
        <Row class="dropdown-item" v-if="showDealerLevel">
          <span>经销商级别：</span>
          <Select class="input"
            :value="dealerLevel"
            @on-change="handleDealerLevelChange">
            <Option v-for="option in dealerLevelOptions"
              :value="option.value"
              :key="option.value"
              :label="option.text">
            </Option>
          </Select>
        </Row>
        <Row class="dropdown-item" v-if="showDealer">
          <span>经销商：</span>
          <Select class="input" placeholder="输入关键字筛选"
            :label-in-value="true"
            :clearable="true"
            filterable
            remote
            :remote-method="queryDealer"
            :loading="dealer.loading"
            @on-change="handleDealerChange">
            <Option v-for="option in dealer.data"
              :value="option.id"
              :key="option.id"
              :label="option.name">
            </Option>
          </Select>
        </Row>
        <Row class="dropdown-item" v-if="showProduct">
          <span>产品：</span>
          <Select class="input" placeholder="输入关键字筛选"
            :label-in-value="true"
            :clearable="true"
            filterable
            remote
            :remote-method="queryProduct"
            :loading="product.loading"
            @on-change="handleProductChange">
            <Option v-for="option in product.data"
              :value="option.id"
              :key="option.id"
              :label="option.productName">
            </Option>
          </Select>
        </Row>
        <Row class="dropdown-item" type="flex" justify="end">
          <Button type="primary" @click="handleQueryClick">搜索</Button>
        </Row>
      </DropdownMenu>
    </Dropdown>
  </Row>
</template>

<script>
import CityPicker from '@/components/common/CityPicker'

export default {
  components: { CityPicker },
  data () {
    return {
      area: {
        province: null,
        city: null,
        area: null,
        provinceName: null,
        cityName: null,
        areaName: null
      },
      areaType: {
        value: 'city',
        options: [
          { text: '按市划分', value: 'city' },
          { text: '按省份划分', value: 'province' }
        ]
      },
      date: {
        start: null,
        end: null
      },
      month: {
        start: null,
        end: null
      },
      dealer: {
        loading: false,
        page: 1,
        pageSize: 999,
        data: [],
        selected: null
      },
      product: {
        loading: false,
        page: 1,
        pageSize: 999,
        data: [],
        selected: null
      },
      dealerLevel: -1,
      dealerLevelOptions: [
        { value: -1, text: '全部' },
        { value: 1, text: '一级经销商' },
        { value: 2, text: '二级经销商' },
        { value: 3, text: '三级经销商' }
      ],
      order: {
        fieldName: 'default',
        orderRule: 'DESC',
        options: [
          { value: 'default', text: '默认排序' },
          { value: 'totalAmount', text: '按销售量排序' },
          { value: 'totalMoney', text: '按销售金额排序' }
        ]
      }
    }
  },
  props: {
    showArea: {
      type: Boolean,
      default: true
    },
    disableCity: {
      type: Boolean,
      default: false
    },
    showAreaType: {
      type: Boolean,
      default: true
    },
    showDealerLevel: {
      type: Boolean,
      default: false
    },
    showDealer: {
      type: Boolean,
      default: true
    },
    showProduct: {
      type: Boolean,
      default: true
    },
    defaultDateRange: {
      type: Array,
      default: () => {
        return []
      }
    },
    defaultMonthRange: {
      type: Array,
      default: () => {
        return []
      }
    },
    showOrder: {
      type: Boolean,
      default: false
    },
    showDate: {
      type: Boolean,
      default: true
    },
    showMonth: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    jsonCopy (obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    queryDealer (query) {
      let data = {
        page: this.dealer.page,
        size: this.dealer.pageSize,
        orderBy: [
          { property: 'dealerLevel', order: 'asc' },
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (query) {
        data.queryFilter.push({ property: 'name', op: 'like', value: query })
      }

      this.dealer.loading = true
      this.$http.post('/system/dealers', data).then(res => {
        this.dealer.data = res.content
      }).catch(error => {
        console.error(error)
        this.dealer.data = []
      }).finally(() => {
        this.dealer.loading = false
      })
    },
    queryProduct (query) {
      let data = {
        page: this.product.page,
        size: this.product.pageSize,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (query) {
        data.queryFilter.push({ property: 'productName', op: 'like', value: query })
      }

      this.product.loading = true
      this.$http.post('/products/search', data).then(res => {
        this.product.data = res.content
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        this.product.loading = false
      })
    },
    handleQueryClick () {
      let data = {
        area: this.jsonCopy(this.area),
        date: this.jsonCopy(this.date),
        dealer: this.jsonCopy(this.dealer.selected),
        product: this.jsonCopy(this.product.selected),
        areaType: this.areaType.value,
        dealerLevel: this.dealerLevel === -1 ? null : this.dealerLevel,
        order: {
          fieldName: this.order.fieldName,
          orderRule: this.order.orderRule
        },
        month: this.jsonCopy(this.month)
      }
      this.$emit('on-query', data)
    },
    handleDateChange (params) {
      if (!params[0]) {
        this.date.start = this.date.end = null
      } else {
        this.date.start = params[0]
        this.date.end = params[1]
      }
      this.$emitChange()
    },
    handleStartMonthChange (value) {
      this.month.start = value ? value : null
      this.$emitChange()
    },
    handleEndMonthChange (value) {
      this.month.end = value ? value : null
      this.$emitChange()
    },
    handleDealerLevelChange (selected) {
      this.dealerLevel = selected
      this.$emitChange()
    },
    handleDealerChange (selected) {
      if (selected.value === '' && selected.label === '') {
        this.dealer.selected = null
      } else {
        this.dealer.selected = {
          id: selected.value,
          name: selected.label
        }
      }
      this.$emitChange()
    },
    handleProductChange (selected) {
      if (selected.value === '' && selected.label === '') {
        this.product.selected = null
      } else {
        this.product.selected = {
          id: selected.value,
          productName: selected.label
        }
      }
      this.$emitChange()
    },
    handleAreaTypeChange (selected) {
      this.areaType.value = selected
      this.$emitChange()
    },
    handleOrderChange (selected) {
      this.order.fieldName = selected
      this.$emitChange()
    },
    $emitChange () {
      let data = {
        area: this.jsonCopy(this.area),
        date: this.jsonCopy(this.date),
        dealer: this.jsonCopy(this.dealer.selected),
        product: this.jsonCopy(this.product.selected),
        areaType: this.areaType.value,
        dealerLevel: this.dealerLevel === -1 ? null : this.dealerLevel,
        order: {
          fieldName: this.order.fieldName,
          orderRule: this.order.orderRule
        },
        month: this.jsonCopy(this.month)
      }
      this.$emit('on-change', data)
    }
  },
  watch: {
    /* 没有on-change事件，采用watch替代 */
    area: {
      deep: true,
      handler (oldVal, newVal) {
        this.$emitChange()
      }
    }
  },
  mounted () {
    this.queryDealer()
    this.queryProduct()
    this.handleDateChange(this.defaultDateRange)
    this.handleStartMonthChange(this.defaultMonthRange[0])
    this.handleEndMonthChange(this.defaultMonthRange[1])
  }
}
</script>

<style scoped>
.condition {
  margin-right: 5px;
}

.condition .input {
  width: 180px;
}

.condition .month {
  width: 150px;
}

.dropdown {
  width: 330px;
  padding: 10px;
  padding-bottom: 0;
}

.dropdown-item {
  margin-bottom: 10px;
}

.dropdown-item .input {
  width: 215px;
}

.dropdown-item span {
  display: inline-block;
  width: 90px;
  text-align: right;
}

.dropdown-item >>> .ivu-select-city-panel {
  max-height: 300px;
}

.dropdown-item >>> .ivu-select-dropdown {
  max-height: 200px;
  overflow: auto;
}
</style>
