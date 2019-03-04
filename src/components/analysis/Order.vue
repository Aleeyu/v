<template>
  <Card>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>数据分析</BreadcrumbItem>
        <BreadcrumbItem>订单分析</BreadcrumbItem>
        <BreadcrumbItem>{{ current | format }}</BreadcrumbItem>
      </Breadcrumb>
    </p>
    <Tabs v-model="current">
      <TabPane label="产品分析" name="PRODUCT">
        <Product v-show="current === 'PRODUCT'"></Product>
      </TabPane>
      <TabPane label="经销商分析" name="DEALER">
        <Dealer v-show="current === 'DEALER'"></Dealer>
      </TabPane>
      <TabPane label="地区分析" name="AREA">
        <MArea v-show="current === 'AREA'"></MArea>
      </TabPane>
      <TabPane label="销售分析" name="SALES">
        <Sales v-show="current === 'SALES'"></Sales>
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
import Product from './order/Product'
import Dealer from './order/Dealer'
import Area from './order/Area'
import Sales from './order/Sales'

export default {
  components: { Product, Dealer, MArea: Area, Sales },
  data () {
    return {
      current: 'PRODUCT'
    }
  },
  filters: {
    format (value) {
      switch (value) {
        case 'PRODUCT':
          return '产品分析'
        case 'DEALER':
          return '经销商分析'
        case 'AREA':
          return '地区分析'
        case 'SALES':
          return '销售分析'
      }
    }
  }
}
</script>
