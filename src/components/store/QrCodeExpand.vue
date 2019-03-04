<style scoped>
  .title {
    font-weight: bold;
    margin: 5px 0;
  }
  .item {
    margin: 5px 0;
  }
</style>
<template>
  <Row type="flex">
    <Col span="24" v-if="boxList.length > 0">
      <span style="font-weight:bold">箱码：</span>
      <span v-for="(value, key) in boxList" :key="key">
        {{value.length > 1 ? `${value[0]} - ${value[value.length - 1]}` : value[0]}}{{key === (boxList.length - 1) ? '' : '，'}}
      </span>
    </Col>
    <Col span="24" v-if="caseList.length > 0">
      <span style="font-weight: bold">盒码：</span>
      <span v-for="(value, key) in caseList" :key="key">
        <!-- {{value.length > 1 ? `${value[0]} - ${value[value.length - 1]}` : value[0]}}{{key === (caseList.length - 1) ? '' : '，'}} -->
        {{value}}{{key === (caseList.length - 1) ? '' : '，'}}
      </span>
    </Col>
    <Col span="24" v-if="otherList.length > 0">
      其他：
      <span v-for="(value, key) in otherList" :key="key">
        <!-- {{value.length > 1 ? `${value[0]} - ${value[value.length - 1]}` : value[0]}}{{key === (otherList.length - 1) ? '' : '，'}} -->
        {{value}}{{key === (otherList.length - 1) ? '' : '，'}}
      </span>
    </Col>
  </Row>
</template>
<script>
  export default {
    data () {
      return {
        boxList: [],
        caseList: [],
        otherList: []
      }
    },
    props: {
      row: Array
    },
    filters: {
      typeFilter (v) {
        const typeName = {
          'UNITS_CASE': '盒',
          'UNITS_BAG': '袋',
          'UNITS_BOX': '箱'
        }
        return typeName[v] || '-';
      }
    },
    methods: {
      typeClassify (arr) {
        arr.forEach(e => {
          if (e.qrcodeType === 'UNITS_BOX') {
            this.boxList.push(+e.qrCodeInfoEntity.orderCode);
          } else if (e.qrcodeType === 'UNITS_CASE') {
            this.caseList.push(e.qrCodeInfoEntity.orderCode);
          } else {
            this.otherList.push(e.qrCodeInfoEntity.orderCode);
          }
        })
        this.boxList.sort((a, b) => a - b);
        // this.caseList.sort((a, b) => a - b);
        // this.otherList.sort((a, b) => a - b);
      },
      sortCode (arr) {
        let first = null;
        let dif = 1;
        let index = 0;
        let res = [];

        arr.forEach(e => {
          first 
          ? (e - first) === dif
            ? (
              dif++,
              res[index].push(e)
            )
            : (
              first = e,
              dif = 1,
              index++,
              res.push([e])
            )
          : (
            first = e,
            res.push([e])
          )
        })

        return res;
      }
    },
    mounted () {
      this.typeClassify(this.row);
      this.boxList = this.sortCode(this.boxList);
      // this.caseList = this.sortCode(this.caseList);
      // this.otherList = this.sortCode(this.otherList);
    }
  };
</script>
