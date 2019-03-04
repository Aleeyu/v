<template>
  <table class="list-table border">
    <thead>
      <tr>
        <th>编码</th>
        <th>商品名称</th>
        <th>二维码类型</th>
        <th>二维码编号</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="product in data">
        <tr v-for="code in product.storeDetailList" :key="code.code">
          <td>{{product.productNo}}</td>
          <td>{{product.productName}}</td>
          <td>{{code.type}}</td>
          <td>{{code.code}}</td>
        </tr>      
      </template>
    </tbody>
  </table>
</template>

<script>
  export default {
    props: {
      data: Array
    },
    data () {
      return {
        productList: []
      }
    },
    methods: {
      classifyType (data) {
        let arr = data.storeDetailList;
        let boxList = [];
        let caseList = [];
        
        const type = {
          'UNITS_CASE' (e) {
            caseList.push({
              type: '盒码',
              code: e.qrCodeInfoEntity.orderCode
            });
          },
          'UNITS_BOX' (e) {
            boxList.push({
              type: '箱码',
              code: +e.qrCodeInfoEntity.orderCode
            });
          }
        }

        arr.forEach(e => {
          type[e.qrcodeType](e);
        })

        boxList.sort((a, b) => {
          return a.code - b.code
        });

        boxList = this.sortBoxCode(boxList);
        boxList = this.arrTostr(boxList);
        
        data.storeDetailList = [...boxList, ...caseList];
        return data;
      },
      sortBoxCode (arr) {
        let first = null;
        let dif = 1;
        let index = 0;
        let res = [];

        arr.forEach(e => {
          first 
          ? (e.code - first) === dif
            ? (
              dif++,
              res[index].push(e)
            )
            : (
              first = e.code,
              dif = 1,
              index++,
              res.push([e])
            )
          : (
            first = e.code,
            res.push([e])
          )
        })

        return res;
      },
      sortCaseCode (arr) {
        let first = null;
        let dif = 1;
        let index = 0;
        let res = [];

        arr.forEach(e => {
          first 
          ? (e.code - first) === dif
            ? (
              dif++,
              res[index].push(e)
            )
            : (
              first = e.code,
              dif = 1,
              index++,
              res.push([e])
            )
          : (
            first = e.code,
            res.push([e])
          )
        })

        return res;
      },
      arrTostr (arr) {
        return arr.map(e => {
          return e.length > 1
            ? {
              type: e[0].type,
              code: `${e[0].code} - ${e[e.length - 1].code}`
            }
            : {
              type: e[0].type,
              code: e[0].code
            }
        })
      }
    },
    mounted () {
      this.productList = this.data.map(e => {
        return this.classifyType(e);
      })
    }
  }
</script>
