<style lang="less" scoped>
  .container {
    header {
      height: 4rem;
      background: #2d8cf0;
      font-size: 1.2rem;
      line-height: 4rem;
      padding: 0 0.5rem;
      color: #fff;
      position: relative;
    }
    .filter {
      height: 3rem;
      padding: 0.2rem;
      display: flex;
    }
  }
</style>

<template>
  <Row justify="center">
    <Col span="24" class="container">
      <header>
        库存
      </header>
      <section class="filter">
        <Input v-model="searchOption.productName" style="margin:auto">
          <span slot="prepend">商品名称</span>
          <Button slot="append" icon="ios-search" @click="search"></Button>
        </Input>
      </section>
      <section class="inventory-table">
        <Table class="list-table" :height="devHeight-112" :columns="colOption" :data="inventoryList" style="margin:0"></Table>
      </section>
    </Col>
  </Row>
</template>

<script>
export default {
  data () {
    return {
      searchOption: {
        productName: ''
      },
      colOption: [{
        title: '商品名称',
        key: 'productName'
      }, {
        title: '商品库存数量',
        key: 'amountInfo'
      }, {
        title: '商品库存总数',
        key: 'amount'
      }],
      inventoryList: []
    }
  },
  computed: {
    devHeight () {
      return document.documentElement.clientHeight;
    }
  },
  methods: {
    getInventoryList () {
      const self = this;
      self.$http.post(`/system/wechat/dealermg/storeProducts/search`, {
        _loading: true,
        page: 1,
        size: 10000,
        queryFilter: [
          {
            property: 'productName',
            op: 'like',
            value: self.searchOption.productName
          }
        ]
      }).then(res => {
        this.inventoryList = res.content;
      }).catch(err => {
        this.$Message.error(err.message);
      })
    },
    search () {
      this.searchOption.productName && this.getInventoryList();
    }
  },
  mounted () {
    this.getInventoryList();
  }
}
</script>

