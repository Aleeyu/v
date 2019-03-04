<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>窜货管理</BreadcrumbItem>
        <BreadcrumbItem>窜货分析</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.level">{{dealerArray[$route.query.level]}}窜货分析</BreadcrumbItem>
        <BreadcrumbItem v-if="$route.query.current === 'TABLE'">{{dealerArray[$route.query.level]}}窜货详情</BreadcrumbItem>
      </Breadcrumb>
    </p>
    <Row>
      <levelChart v-if="current === 'LEVEL'"></levelChart>
      <dealerChart v-if="current === 'DEALER'"></dealerChart>
      <detailTable v-if="current === 'TABLE'" :dealerId = "$route.query.dealerId"></detailTable>
    </Row>
  </Card>
</template>
<script>
  import levelChart from './analysis/LevelChart'
  import detailTable from './analysis/DetailTable'
  import dealerChart from './analysis/DealerChart'

  export default {
    components: {levelChart, detailTable, dealerChart},
    data () {
      return {
        dealerArray: ['', '一级经销商', '二级经销商', '三级经销商']
      }
    },
    methods: {},
    computed: {
      current () {
        return this.$route.query.current || 'LEVEL'
      }
    }
  }
</script>
