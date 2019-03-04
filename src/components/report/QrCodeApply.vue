<!-- 用于显示【产品管理-二维码申请】的打印页面-->

<style lang="less">
  .report-qrcodeapply-printPreview {
    display: flex;
    justify-content: center;
    /*height: 6em;*/
    padding: .6em 2em;
    background-color: #f8f8f9;
    .printContent {
      display: inline-block;
      height: 100%;
      background-color: white;
      padding: 1em;
      overflow: auto;

      .printRow {
        list-style: none;
        white-space: nowrap;
        text-align: left;
        padding-bottom: .5em;
        .printItem {
          display: inline-block;
          width: 2em;
          height: 2em;
          margin-right: 6px;
          background-color: #5cadff;
          text-align: center;
          line-height: 2em;
          color: white;
          &:nth-last-child(1) {
            margin-right: 0;
          }
        }
        .printEllipsis {

        }
      }
    }
  }
</style>

<template>
  <container>
    <div slot="content" class="page" v-if="!error">
      <table class="head-table">
        <thead>
        <tr>
          <th>二维码印刷确认单</th>
        </tr>
        </thead>
      </table>
      <table class="list-table border">
        <thead>
        <tr>
          <th>日期</th>
          <th>批次号</th>
          <th>产品名称</th>
          <th>打印数量</th>
          <th>卷膜列数</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="qrcode">
          <td>{{qrcode.batch.substr(0, 8)}}</td>
          <td>{{qrcode.batch}}</td>
          <td>{{qrcode.productName}}</td>
          <td>{{qrcode.quantity}}</td>
          <td><strong style="color:red;font-size: 1.6em">{{qrcode.printColumns}}</strong></td>
        </tr>
        </tbody>
        <thead>
        <tr>
          <th colspan="4">预览图</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="qrcode">
          <td colspan="4">
            <div class="report-qrcodeapply-printPreview">
              <div class="printContent">
                <li v-for="row in printRow" class="printRow">
                      <span v-for="item in qrcode.printColumns" class="printItem">
                          {{(qrcode.printColumns * (row - 1)) + item}}
                      </span>
                </li>

                <li v-if="hasEllipsis" class="printRow">
                  <span v-for="item in qrcode.printColumns" class="printItem ellipsisItem">...</span>
                </li>

                <li v-if="qrcode.quantity % qrcode.printColumns" class="printRow">
                      <span v-for="item in (qrcode.quantity % qrcode.printColumns)"
                            class="printItem">{{(qrcode.quantity - qrcode.quantity % qrcode.printColumns) + item}}</span>
                </li>

                <li v-else-if="hasEllipsis || qrcode.quantity / qrcode.printColumns === 5"
                    class="printRow">
                      <span v-for="item in qrcode.printColumns"
                            class="printItem ellipsisItem">{{qrcode.quantity - qrcode.printColumns + item}}</span>
                </li>
              </div>
            </div>
          </td>
          <td>
            <strong style="color:red;font-size: 1.6em">待确认</strong>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div slot="content" v-else>
      <error-view :error="error" @action="getRecordById" :loading="errorLoading"></error-view>
    </div>
  </container>
</template>

<script>
  import container from '@/components/report/Container'
  export default {
    mounted () {
      this.getRecordById(this.$route.params.id)
    },
    data () {
      return {
        qrcode: null,
        error: null,
        errorLoading: false
      }
    },
    computed: {
      printRow () {
        if (!this.qrcode) return false
        return Math.floor(this.qrcode.quantity / this.qrcode.printColumns) > 4 ? 4 : Math.floor(this.qrcode.quantity / this.qrcode.printColumns)
      },
      hasEllipsis () {
        if (!this.qrcode) return false
        return this.qrcode.quantity / this.qrcode.printColumns !== 5 && Math.ceil(this.qrcode.quantity / this.qrcode.printColumns) > 5 ? true : false
      }
    },
    components: {
      container
    },
    methods: {
      getRecordById (id) {
        this.$Loading.start()
        this.errorLoading = true
        if (!id && this.$route.params.id) id = this.$route.params.id
        if (!id) {
          this.$Message.error('获取二维码配置信息失败')
          this.$Loading.error()
          console.error('function getQrcodeById need id')
          return
        }
        this.$http.get(`/qrcodebatch/${id}`)
          .then((data) => {
            if (!data) this.error = {...this.$Err.notFound(false)}
            else this.error = null
            if (data.qrcodeType === 'UNITS_BOX') {
              this.$router.back()
            }
            this.qrcode = {...this.qrcode, ...data}
            this.$Loading.finish()
          })
          .catch((err) => {
            console.error(err)
            this.error = {...this.$Err.unhandled(true)}
            this.$Loading.error()
          })
          .finally(() => {
            this.errorLoading = false
          })
      }
    }
  }
</script>
