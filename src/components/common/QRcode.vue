<!--
使用方法
<qrcode :content="content" :config="config" ></qrcode>
config为可选配置对象
content为必选字符串类型
content的值改变时触发二维码生成事件
,-->
<template>
  <div>
    <div :id="codeId"></div>
  </div>
</template>
<script type="text/ecmascript-6">
  import config from '@/config'

  export default {
    props: {
      /**
       * 文本内容
       */
      content: {
        type: String,
        required: true
      },
      /**
       * 是否使用短地址
       */
      short: {
        type: Boolean,
        default: false
      },
      config: {
        type: Object
      }
    },
    data () {
      return {
        defaultConfig: {
          codeId: this.$uuid(),                        // 二维码id
          type: 'img',                                 // 输出类型 支持img和svg
          size: '200px',                               // 显示尺寸
          ecclevel: 'H',
          fillcolor: 'transparent',                      // 背景色
          textcolor: '#373737',                      // 二维码颜色
          margin: 0,
          modulesize: 16
        },
        qrconfig: {},
        codeId: ''
      }
    },
    methods: {
      check: function () {
        if (this.short) {
          this.$http.get(`/system/shorturl/url?longurl=` + this.content).then((res) => {
            this.creatQR(config.host + res)
          }).catch((res) => {
            this.$Message.error(res.message)
          })
        } else if (this.$route.query.q) {
          this.$http.get(`/qrcode/statics/${this.$route.query.q}`).then((res) => {
            this.creatQR(res.content)
          }).catch((res) => {
            this.$Message.error(res.message)
          })
        } else {
          this.creatQR(this.content)
        }
      },
      creatQR: function (content) {
        var container = document.getElementById(this.qrconfig.codeId)
        container.innerHTML = ''
        if (!this.content) {
          return
        }
        if (this.qrconfig.type === 'svg') {
          var svgElement = document.createElement('div')
          svgElement.style.width = svgElement.style.height = this.qrconfig.size
          var svgConfig = QRCode.generateSVG(content, this.qrconfig)
          svgElement.appendChild(svgConfig)
          container.appendChild(svgElement)
        } else {
          var dataUriPngImage = document.createElement('img')
          dataUriPngImage.style.width = dataUriPngImage.style.height = this.qrconfig.size
          var imgConfig = QRCode.generatePNG(content, this.qrconfig)
          dataUriPngImage.src = imgConfig
          container.appendChild(dataUriPngImage)
        }
        this.$emit('completed', content)
      }
    },
    watch: {
      content: function () {
        this.check()
      }
    },
    mounted: function () {
      this.qrconfig = Object.assign({}, this.qrconfig, this.defaultConfig, this.config)
      this.codeId = this.qrconfig.codeId
      this.$nextTick(() => {
        this.check()
      })
    }
  }
</script>
