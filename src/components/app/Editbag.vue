<template>
  <div class="app-edit-bag app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title" v-if="$route.query.sid == null">
        <h1>添加袋码</h1>
        <h4>为当前箱码添加新的袋码段，袋码段包括起始码和结束码，请按照提示进行扫码</h4>
      </div>
      <div class="app-banner-title" v-else>
        <h1>查看袋码</h1>
        <h4>查看选择的袋码段，袋码段包括起始码和结束码，如果未完成，请按照提示进行扫码</h4>
      </div>
    </div>

    <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息" @action="getBoxInfo"
                :loading="busy"></error-view>

    <div class="app-base-info" v-if="!error && box.model">
      <div class="app-list-info-group">
        <div class="app-list-info">
          <i>箱码</i>
          <h2 class="app-production-box-code">{{ box.model.qrcodeOrderCode }}</h2>
        </div>
        <div class="app-list-info flex">
          <i>产品名称</i>
          <h2>{{ box.model.productName }}</h2>
        </div>
        <div class="app-list-info">
          <i>状态</i>
          <h2 :class="[`app-production-status-${box.model.isend}`]">{{ box.status[box.model.isend] }}</h2>
        </div>
      </div>
    </div>
    <div v-else-if="!error" class="app-body app-common-body app-list-empty">
      正在加载数据，请稍候...
    </div>

    <div class="app-body app-common-body app-edit-bag-body" v-if="model">
      <h3>起始码</h3>
      <h1 v-if="model.beginCode">{{ formatCode(model.beginOrderCode) }}</h1>
      <div v-if="model.beginCode"></div>
      <h3 v-if="model.beginCode">结束码</h3>
      <h1 v-if="model.endCode">{{ formatCode(model.endOrderCode) }}</h1>
      <h4 v-if="model.beginCode == null || model.endCode == null">还没有绑定，请点击“扫描二维码”进行绑定</h4>
    </div>

    <div class="app-menus">
      <button @click="scan" :disabled="!model || (model.beginCode && model.endCode)">
        <Icon type="android-expand"></Icon>
        <span>扫描二维码</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>返回列表</span>
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        busy: false,
        error: null,
        box: {
          status: ['装箱中', '已完成'],
          model: null
        },
        model: null
      }
    },
    methods: {
      shown: function () {
        if (this.$route.query.id) {
          this.getBoxInfo()
        }
      },
      back: function () {
        this.$router.back()
      },
      formatCode: function (code) {
        return ('00000000000000' + String(code)).substr(-10)
      },
      getBoxInfo: function () {
        if (this.box.model == null || this.box.model.id !== this.$route.query.id) {
          this.busy = true
          this.$http.get(`/scanitem/box/${this.$route.query.id}`, true).then(res => {
            this.error = null
            this.box.model = res
          }).catch(res => {
            this.error = this.$Err.notFound(false, true)
          }).finally(() => {
            this.busy = false
            if (this.box.model) {
              this.getBagsInfo()
            }
          })
        }
      },
      getBagsInfo: function () {
        if (this.model == null || this.model.id !== this.$route.query.sid) {
          if (this.$route.query.sid) {
            this.busy = true
            this.$http.get(`/scanitem/bagitem/${this.$route.query.sid}`, true).then(res => {
              if (res) {
                this.model = res
              } else {
                this.$Message.error(this.$C.DETAIL_COMM_NOTFOUND_CONTENT.format('袋码段信息'))
                this.back()
              }
            }).catch(res => {
              this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('袋码段信息'))
            }).finally(() => {
              this.busy = false
            })
          } else {
            this.model = {
              id: this.$uuid(),
              scanId: this.box.model.id,
              beginCode: null,
              endCode: null,
              codeItems: null
            }
          }
        }
      },
      scan: function () {
        let scanFailed = (msg) => {
          this.busy = false
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scan()
          })
        }

        this.$parent.scan().then(res => {
          if (res.type === 'UNITS_BAG') {
            this.busy = true
            this.$http.get(`/scanitem/bag?id=${res.code}&productionId=${this.box.model.productionId}`, true).then(res1 => {
              if (this.$isPlainObject(res1) && res1.orderCode) {
                let o = {
                  scanId: this.box.model.id,
                  id: this.model.id,
                  _loading: true
                }
                if (this.model.beginCode == null) {
                  o.beginCode = res1.id
                  o.beginOrderCode = res1.orderCode
                } else if (this.model.endCode == null) {
                  o.beginCode = this.model.beginCode
                  o.beginOrderCode = this.model.beginOrderCode
                  o.endCode = res1.id
                  o.endOrderCode = res1.orderCode
                }

                this.$http.post('/scanitem/bag', o).then(res2 => {
                  this.model.beginCode = res2.beginCode
                  this.model.endCode = res2.endCode
                  this.model.beginOrderCode = res2.beginOrderCode
                  this.model.endOrderCode = res2.endOrderCode
                  this.busy = false
                }).catch(res1 => {
                  let msg = res1.message || res1.msg || '扫码失败，请稍候重试'
                  scanFailed(msg)
                })
              } else {
                scanFailed('扫码失败，请稍候重试')
              }
            }).catch(res => {
              let msg = res.message || res.msg || '扫码失败，请稍候重试'
              if (res.code === 'COMM_BIZ_NOT_EXISTS') {
                msg = '错误的袋码，请重新扫描'
              }
              scanFailed(msg)
            })
          } else {
            scanFailed('错误的袋码，请重新扫描')
          }
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      }
    }
  }
</script>

<style lang="less">
  .app-edit-bag-body {
    padding: 1rem;
    text-align: center;

    > div {
      height: 1px;
      background: #e9eaec;
      margin: 1rem;
    }

    h4 {
      font-weight: normal;
      font-size: .75rem;
      color: #80848f;
    }

    h3 {
      font-weight: normal;
      font-size: 1rem;
      color: #495060;
    }

    h1 {
      font-weight: normal;
      font-size: 2rem;
      color: #2d8cf0;
    }
  }
</style>
