<template>
  <div class="app-layout">
    <div class="app-body app-body-top" :data-comp="comp">
      <div v-for="p in pages" :key="p.name" class="app-page" :class="{'app-page-notrans-fix': p.name === 'Signin'}"
           :ref="p.name + 'Element'" :data-comp-name="p.name">
        <component :ref="p.name" :is="p.component" :class="['app-page-inner']"></component>
      </div>
    </div>
    <div class="app-menus" v-if="navigable && user"><!--  v-if="user" -->
      <button @click="goto('production')" :class="{selected: $route.params.comp === 'production'}"
              v-if="user.appRole === 'OPERATOR'">
        <Icon type="ios-color-filter"></Icon>
        <span>生产管理</span>
      </button>
      <button @click="mainScan" v-if="user.appRole === 'OPERATOR'">
        <Icon type="android-expand"></Icon>
        <span>扫描二维码</span>
      </button>

      <button @click="goto('stockin')" :class="{selected: $route.params.comp === 'stockin'}"
              v-if="user.appRole === 'PRODUCTION_MANAGER'">
        <Icon type="ios-box"></Icon>
        <span>入库管理</span>
      </button>
      <button @click="goto('stockout')" :class="{selected: $route.params.comp === 'stockout'}"
              v-if="user.appRole === 'PRODUCTION_MANAGER'">
        <Icon type="social-dropbox"></Icon>
        <span>出库管理</span>
      </button>


      <button @click="trackScan" :class="{selected: $route.params.comp === 'track'}">
        <Icon type="ios-paw"></Icon>
        <span>货物跟踪</span>
      </button>

      <button @click="goto('setting')" :class="{selected: $route.params.comp === 'setting'}">
        <Icon type="ios-gear"></Icon>
        <span>系统设置</span>
      </button>
    </div>
    <div style="position: absolute; top: -100rem; z-index: 10000;">{{msg}}</div>
    <transition name="fade">
      <div class="app-loading" v-show="busy">
        <Spin size="large"></Spin>
        <h4>{{busyMessage}}</h4>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    metaInfo () {
      return {
        meta: [
          {name: 'viewport', content: 'width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no'},
          {name: 'apple-mobile-web-app-capable', content: 'yes'},
          {'http-equiv': 'Cache-Control', content: 'no-siteapp'},
          {name: 'format-detection', content: 'telephone=no'},
          {'http-equiv': 'x-rim-auto-match', content: 'none'}
        ]
      }
    },
    data () {
      return {
        msg: null,
        pages: {},
        user: null,
        busy: false,
        navigable: true,
        editable: false,
        editConfig: null,
        modal: false,
        busyMessage: '',
        currentComp: null,
        previousComp: null,
        comp: null,
        broadcasts: {},
        history: [],
        anticlockwise: false,
        modaling: false,
        keyboardOpened: false,
        pageZIndex: 1,
        slider: {
          target: null,
          distance: 0,
          startX: 0,
          startY: 0
        },
        pageIndex: 1,
        exitCounter: 0
      }
    },
    methods: {
      registerBroadcast: function (key, event) {
        if (key && typeof event === 'function') {
          this.broadcasts[key] = event
        }
      },
      executeBroadcast: function (key, args) {
        if (this.broadcasts.hasOwnProperty(key) && typeof this.broadcasts[key] === 'function') {
          this.broadcasts[key](args)
        }
      },
      shunt: function () {
        let compName = this.$route.params.comp.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
        if (this.user == null && compName !== 'Signin') {
          this.navigable = false
          this.$router.replace({
            path: '/app/signin'
          })
        } else {
          this.createComp(compName)
          this.checkNavigable(compName, this.$route.query.action)
        }
      },
      createComp: function (name) {
        if (name === 'Signin') {
          this.history = []
        }
        this.historyLength = window.history.length
        if (name !== this.comp) {
          this.fireComponentEvent(this.comp, 'hidden')
          if (!this.pages.hasOwnProperty(name)) {
            require([`@/components/app/${name}`], (componentObj) => {
              this.previousComp = this.comp
              this.pages[name] = {
                name: name,
                component: componentObj
              }
              this.anticlockwise = false
              this.history.push(name)
              this.comp = name
              setTimeout(() => {
                this.switchPage()
                this.fireComponentEvent(this.comp, 'shown', this.anticlockwise)
              }, 0)
            }, () => {
              this.$Message.error('加载页面失败，请稍候重试！')
            })
          } else {
            let len = this.history.length
            if (len > 1 && this.history[len - 2] === name) {
              this.anticlockwise = true
              this.history.splice(len - 1, 1)
            } else {
              this.anticlockwise = false
              this.history.push(name)
            }
            this.previousComp = this.comp
            this.comp = name
            this.switchPage()
            this.fireComponentEvent(this.comp, 'shown', this.anticlockwise)
          }
        }
      },
      replaceRoute: function (o) {
        if (this.history.length > 0) {
          let len = this.history.length - 1
          let name = this.history[len]
          let target = this.$refs[name + 'Element'][0]
          target.classList.remove('app-page-notrans')
          target.style.transform = 'translateX(100%)'

          this.history.splice(len, 1)
        }
        this.$router.replace(o)
      },
      fireComponentEvent: function (comp, eventName, args) {
        if (comp && this.$refs[comp] && this.$refs[comp].length > 0) {
          let cur = this.$refs[comp][0]
          if (typeof cur[eventName] === 'function') {
            setTimeout(() => {
              cur[eventName](args)
            }, 200)
          }
        }
      },
      switchPage: function () {
        if (this.comp) {
          let prevEl = null
          let curEl = this.$refs[this.comp + 'Element'][0]

          if (this.previousComp) {
            prevEl = this.$refs[this.previousComp + 'Element'][0]
          }

          if (this.anticlockwise) {
            // 如果是后退, prevEl为当前显示中的页面，需要从右侧滑出，但curEl为当前应显示的页面，但不应有动画
            this.pageZIndex++
            curEl.classList.add('app-page-notrans')
            curEl.style.zIndex = this.pageZIndex
            curEl.style.transform = 'translateX(0)'

            this.pageZIndex++
            prevEl.classList.remove('app-page-notrans')
            prevEl.style.zIndex = this.pageZIndex
            setTimeout(() => {
              curEl.classList.remove('app-page-notrans')
              prevEl.style.transform = 'translateX(100%)'
            }, 0)
          } else {
            // 如果不是后退，prevEl为当前被隐藏的页面，curEl为要显示的页面
            this.pageZIndex++
            curEl.classList.add('app-page-notrans')
            curEl.style.zIndex = this.pageZIndex
            curEl.style.transform = 'translateX(100%)'
            setTimeout(() => {
              curEl.classList.remove('app-page-notrans')
              curEl.style.transform = 'translateX(0)'
            }, 0)
          }
        }
      },
      checkNavigable: function (compName, action) {
        this.navigable = false
        if (compName === 'Production' || compName === 'Setting') {
          if (action == null) {
            this.navigable = true
          }
        } else if (compName === 'Stockout') {
          if (action == null) {
            this.navigable = true
          }
        } else if (compName === 'Stockin') {
          if (action == null) {
            this.navigable = true
          }
        } else {

        }
      },
      goto: function (comp) {
        this.$router.push({
          path: '/app/' + comp
        })
      },
      setBusy: function (message = null) {
        if (message === true) {
          this.busy = true
          this.busyMessage = ''
        } else {
          this.busy = message
          this.busyMessage = message
        }
      },
      updateUser: function (user) {
        this.user = user
        if (user == null) {
          for (let k in this.pages) {
            if (this.pages.hasOwnProperty(k)) {
              let comp = this.$refs[k][0]
              if (comp.hasOwnProperty('inited')) {
                comp.inited = false
              }
              let el = this.$refs[k + 'Element']
              if (el && el.length > 0) {
                el[0].classList.remove('app-page-notrans')
                el[0].style.transform = 'translateX(100%)'
              }
            }
          }
        }
      },
      scan: function () {
        return new Promise((resolve, reject) => {
          if (window.cordova && window.cordova.plugins) {
            window.cordova.plugins.barcodeScanner.scan((result) => {
              if (!result.cancelled) {
                let txts = result.text.replace(/(http|https):\/\//ig, '').split('/')
                let o = null
                if (txts.length === 3) {
                  if (['UNITS_BAG', 'UNITS_BOX', 'UNITS_CASE'].indexOf(txts[1]) >= 0 && txts[2]) {
                    o = {
                      type: txts[1],
                      code: txts[2]
                    }
                  }
                }
                if (this.$isPlainObject(o)) {
                  resolve(o)
                } else {
                  reject(new Error('扫描的二维码不符合要求，请重新扫描'))
                }
              }
            }, (error) => {
              reject(error)
            }, {'SCAN_MODE': 'QR_CODE_MODE'})
          } else {
            reject(new Error('初始化失败，无法进行扫描'))
          }
        })
      },
      mainScan: function () {
        let scanFailed = (msg) => {
          this.busy = false
          this.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.mainScan()
          })
        }

        this.scan().then(res => {
          if (res.type === 'UNITS_BOX') {
            this.$router.push({
              path: '/app/editbox',
              query: {
                id: res.code
              }
            })
          } else {
            scanFailed('错误的箱码，请重新扫描箱码')
          }
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      trackScan: function () {
        let scanFailed = (msg) => {
          this.busy = false
          this.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.trackScan()
          })
        }

        this.scan().then(res => {
          this.$router.push({
            path: '/app/track',
            query: {
              id: res.code
            }
          })
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      confirm: function (title, content, okText = '确定', cancelText = '取消') {
        this.modaling = true
        return new Promise((resolve, reject) => {
          this.$Modal.confirm({
            title: title,
            content: content,
            okText: okText,
            cancelText: cancelText,
            onOk: () => {
              this.modaling = false
              resolve()
            },
            onCancel: () => {
              this.modaling = false
            }
          })
        })
      },
      eventBackButton: function (e) {
        if (!this.keyboardOpened) {
          if (this.modaling === true) {
            this.$Modal.remove()
            this.modaling = false
          } else if (window.localStorage.getItem('globalNeedSignin') !== 'true') {
            if (this.comp === 'Signin' || this.history.length <= 1) {
              if (this.exitCounter === 0) {
                this.exitCounter = 1
                setTimeout(() => {
                  this.exitCounter = 0
                }, 2000)
                this.$Message.info('再点击一次“后退”键退出系统')
              } else {
                window.navigator.app.exitApp()
              }
            } else {
              this.exitCounter = 0
              this.$router.back()
            }
          }
        }
        e.preventDefault()
      },
      onDeviceReady: function () {
        window.removeEventListener('native.keyboardshow', this.onKeyboardShow)
        window.removeEventListener('native.keyboardhide', this.onKeyboardHide)
        window.addEventListener('native.keyboardshow', this.onKeyboardShow)
        window.addEventListener('native.keyboardhide', this.onKeyboardHide)

        document.removeEventListener('touchstart', this.onTouchStart, true)
        document.removeEventListener('backbutton', this.eventBackButton, false)
        document.addEventListener('touchstart', this.onTouchStart, true)
        document.addEventListener('backbutton', this.eventBackButton, false)

        document.body.classList.add('mark-as-app')
        this.shunt()
      },
      onKeyboardShow: function (e) {
        this.keyboardOpened = true
        if (this.comp && this.$refs.hasOwnProperty(this.comp)) {
          let c = this.$refs[this.comp][0]
          if (typeof c.keyboardStateChanged === 'function') {
            c.keyboardStateChanged(true, e)
          }
        }
      },
      onKeyboardHide: function (e) {
        this.keyboardOpened = false
        if (this.comp && this.$refs.hasOwnProperty(this.comp)) {
          let c = this.$refs[this.comp][0]
          if (typeof c.keyboardStateChanged === 'function') {
            c.keyboardStateChanged(false, e)
          }
        }
      },
      onTouchStart: function (e) {
        this.slider.target = null
        this.removeTouchEvents(false)
        if (e.touches.length === 1 && this.comp && this.previousComp && this.previousComp !== 'Signin' && this.history.length > 1) {
          let w = window.innerWidth
          if (e.touches[0].clientX < w / 2) {
            this.slider.startX = e.touches[0].clientX
            this.slider.startY = e.touches[0].clientY

            document.addEventListener('touchmove', this.onTouchMove, true)
            document.addEventListener('touchend', this.onTouchEnd, true)
          }
        }
      },
      onTouchMove: function (e) {
        if (e.touches.length === 1) {
          let distanceX = e.touches[0].clientX - this.slider.startX
          let distanceY = e.touches[0].clientY - this.slider.startY
          let absY = distanceX * 0.6
          if (absY < 20) absY = 20
          if (Math.abs(distanceY) < absY) {
            this.slider.target = this.$refs[this.comp + 'Element'][0]
            if (distanceX > 30) {
              this.slider.target.classList.add('app-page-notrans')
              this.slider.target.style.transform = `translateX(${(distanceX - 30)}px)`
              this.slider.distance = distanceX
            } else {
              this.slider.distance = 0
              this.slider.target.classList.remove('app-page-notrans')
              this.slider.target.style.transform = `translateX(0px)`
            }
          } else {
            this.removeTouchEvents()
          }
        } else {
          this.removeTouchEvents()
        }
        e.stopPropagation()
      },
      onTouchEnd: function (e) {
        let revert = true
        if (this.slider.target && this.slider.distance >= window.innerWidth / 4) {
          revert = false
          this.slider.target.classList.remove('app-page-notrans')
          this.slider.target = null
          this.$router.back()
        }
        this.removeTouchEvents(revert)
      },
      removeTouchEvents: function (revert) {
        if (revert !== false && this.slider.target) {
          this.slider.target.classList.remove('app-page-notrans')
          this.slider.target.style.transform = 'translateX(0px)'
        }
        this.slider.target = null
        document.removeEventListener('touchmove', this.onTouchMove, true)
        document.removeEventListener('touchend', this.onTouchEnd, true)
      }
    },
    beforeCreate () {
      this.$Install(require('vue-touch'), 'v-touch')
      if (!window.cordova) {
        this.$ScriptLinker('/static/lib/cordova.js')
      }
    },
    mounted () {
      document.removeEventListener('deviceready', this.onDeviceReady, false)
      document.addEventListener('deviceready', this.onDeviceReady, false)
    },
    watch: {
      $route: 'shunt'
    }
  }
</script>

<style lang="less">
  html, body, .app-layout, #app {
    height: 100%;
    user-select: none;
  }

  body {
    background-color: #f5f5f5;
  }

  * {
    outline: none;
    -webkit-tap-highlight-color: none;
    flex-grow: 0;
    flex-shrink: 0;
  }

  h1, h2, h3, h4, h5 {
    font-weight: normal;
  }

  .bottom-border {
    position: relative;

    &:after {
      visibility: visible;
      content: '';
      position: absolute;
      bottom: 0;
      height: 1px;
      width: 100%;
      left: 0;
      background-color: rgba(0, 0, 0, .1);
      transform-origin: 0 100%;
      transform: scaleY(0.33);
    }
  }

  .app-layout {
    display: flex;
    flex-direction: column;
  }

  @keyframes kf-app-show {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes kf-app-hide {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .app-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    transition: transform 275ms;
    transform: translateX(100%);
    overflow: hidden;

    &-inner {
      position: relative;
      width: 100%;
      height: 100%;
    }

    &-notrans {
      transition: none;
      box-shadow: 0 0 .5rem rgba(0, 0, 0, .2);

      &-fix {
        transition: none;
        transform: none !important;
      }
    }
  }

  .app-banner {
    padding: .8rem 1rem;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    background-color: #5cadff;
    color: white;
    z-index: 10;

    &-title {
      flex-grow: 1;
      flex-shrink: 1;

      h1 {
        font-size: 1.2rem;
      }

      h4 {
        font-size: .8rem;
        opacity: .75;
      }
    }

    &-button {
      display: flex;
      justify-content: center;
      align-items: center;

      button {
        height: 3rem;
        font-size: 3rem;
        background-color: transparent;
        border: none;
        line-height: normal;
        color: white;
      }
    }
  }

  .app-search {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #f8f8f9;

    &-group {
      box-shadow: 0 0rem .5rem rgba(0, 0, 0, .1);
      z-index: 9;
    }

    > label {
      font-size: .8rem;
      line-height: normal;
      color: #80848f;
    }

    > button {
      padding: .5rem 1.2rem;
      border-radius: 0;
      border: none;
      height: auto;
      font-size: 1rem;
      z-index: 2;
      align-self: stretch;
    }

    .flex {
      flex-grow: 1;
      flex-shrink: 1;
    }

    > .ivu-icon {
      padding: .5rem 1rem;
      font-size: 1rem;
      color: #80848f;
      align-self: center;
    }

    .ivu-input-wrapper {
      flex-grow: 1;
      flex-shrink: 1;
      z-index: 1;
    }

    input {
      flex-grow: 1;
      flex-shrink: 1;
      position: relative;
      padding: .8rem 1rem .8rem 1rem !important;
      height: auto !important;
      line-height: normal !important;
      font-size: .8rem;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background-color: transparent;

      &[type=date]:before {
        color: #A9A9A9;
        content: attr(placeholder);
      }

      &.hasVal[type=date]:before {
        content: '';
      }
    }
  }

  button {
    position: relative;
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 20rem;
      background-color: rgba(0, 0, 0, .1);
      transform: scaleX(0);
      opacity: 0;
      top: 0;
      left: 0;
      transition: all 175ms ease-in-out;
    }

    &:active:before {
      border-radius: 0;
      transform: scaleX(1);
      opacity: 1;
    }
  }

  .app-body {
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .app-common-layout {
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
  }

  .app-common-body {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .app-base-info {
    background-color: white;
    padding: .5rem 0 1rem 0;
    box-shadow: 0 0 .5rem rgba(0, 0, 0, .1);
    z-index: 9;
  }

  .ivu-message {
    font-size: 1rem;
  }

  .app-menus {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    background-color: white;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform-origin: 0% 0%;
      transform: scaleY(.33);
      background-color: #dddee1;
    }

    button {
      flex-shrink: 1;
      flex-grow: 1;
      border-radius: 0;
      border: none;
      color: white;
      font-size: 2rem;
      transition: all 275ms;
      background-color: transparent;
      color: #80848f;
      padding: .5rem;
      height: auto;
      box-shadow: none !important;
      display: flex;
      flex-direction: column;
      align-items: center;

      &.primary {
        background-color: #2d8cf0;
        color: white;
      }

      > span {
        font-size: .8rem;
      }

      &:disabled {
        color: #dddee1;
      }

      &.selected {
        color: #2d8cf0;
      }
    }
  }

  .app-float-button {
    position: fixed;
    bottom: 5rem;
    right: .5rem;
    z-index: 19;

    button {
      background-color: white;
      font-size: 2rem;
      width: 4rem;
      height: 4rem;
      border: none;
      border-radius: 50%;
      margin: .5rem;
      box-shadow: 0 0 .5rem rgba(0, 0, 0, .2);
    }
  }

  .app-list {
    &-info-group {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: 0.5rem 0 0 0;
    }

    &-info-sep {
      font-size: 1rem;
      color: #bbbec4;
    }

    &-item {
      padding: .5rem 0;
      margin: 5px 0;
      background-color: white;
      position: relative;
      overflow: hidden;

      &-arrow:before {
        position: absolute;
        top: 0;
        left: 0;
        content: '';
        border-top: .5rem solid rgba(0, 0, 0, .2);
        border-right: .5rem solid transparent;
      }
    }

    &-info {
      padding: 0 1rem;

      i {
        font-size: .8rem;
        color: #bbbec4;
        font-style: normal;
      }

      h2 {
        font-weight: normal;
        font-size: 1rem;
      }

      &.flex {
        flex-grow: 1;
        flex-shrink: 1;
      }
    }

    &-button {
      position: relative;
      overflow: hidden;

      &:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 20rem;
        background-color: rgba(0, 0, 0, .1);
        transform: scaleX(0);
        opacity: 0;
        top: 0;
        left: 0;
        transition: all 175ms ease-in-out;
      }

      &:active:after {
        border-radius: 0;
        transform: scaleX(1);
        opacity: 1;
      }
    }

    &-empty {
      font-size: 1rem;
      padding: 1rem;
      text-align: center;
      color: #80848f;
    }

    .selected {
      background-color: #5cadff !important;
      color: white;
      transition: all 275ms;

      .app-list-info i {
        color: white;
        opacity: .75;
      }
    }
  }

  .ivu-modal-body {
    padding: 0;
    box-shadow: 0 0 1rem rgba(0, 0, 0, .2);
  }

  .ivu-modal-confirm {
    padding: 0;
    border-radius: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &-head {
      padding: .8rem 1rem;
      background-color: #f8f8f9;
      position: relative;

      &:after {
        visibility: visible;
        content: '';
        position: absolute;
        bottom: 0;
        height: 1px;
        width: 100%;
        left: 0;
        background-color: rgba(0, 0, 0, .1);
        transform-origin: 0 100%;
        transform: scaleY(0.33);
      }

      &-title {
        font-size: 1rem;
      }
    }

    &-body {
      padding: .5rem 1rem;
      font-size: 1rem;
      color: #80848f;
      min-height: 5rem;
    }

    &-body-icon {
      display: none;
    }

    &-footer {
      margin: 0;
      position: relative;
      display: flex;
      flex-direction: row;

      &:after {
        visibility: visible;
        content: '';
        position: absolute;
        top: 0;
        height: 1px;
        width: 100%;
        left: 0;
        background-color: rgba(0, 0, 0, .1);
        transform-origin: 0 0;
        transform: scaleY(0.33);
      }

      button {
        width: 50%;
        border-radius: 0;
        height: auto;
        padding: .8rem 1rem;
        margin: 0 !important;

        &.ivu-btn-text {
          background-color: #f8f8f9;
        }
      }
    }

    button {
      font-size: 1rem;
    }
  }

  .app-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h4 {
      margin-top: 1rem;
      color: #9ea7b4;
    }
  }

  body.mark-as-app {
    #app-signinpanel-mini .ivu-modal {
      top: 0 !important;
      margin: 0 !important;
    }

    .form-panel-mini {
      background-color: #f8f8f9;
      padding: 0;
      margin: 0;
      overflow: hidden;

      h1 {
        padding: .8rem 1rem 0 1rem;
        font-size: 1.2rem;
      }

      h4 {
        font-size: .8rem;
        padding: .2rem 1rem 0 1rem;
      }

      .ivu-alert {
        border-radius: 0;
        border: none;
        padding: 1rem;
        margin: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: .8rem;

        .ivu-alert-icon {
          display: block;
          position: relative;
          top: 0;
          left: 0;
          margin-right: .5rem;
        }
      }

      .ivu-form-item {
        margin: 0;
        position: relative;

        &:after {
          visibility: visible;
          content: '';
          position: absolute;
          bottom: 0;
          height: 1px;
          width: 100%;
          left: 0;
          background-color: rgba(0, 0, 0, .1);
          transform-origin: 0 100%;
          transform: scaleY(0.33);
        }

        .ivu-input-wrapper > .ivu-icon {
          position: absolute;
          bottom: .5rem;
          right: 1rem;
        }

        input {
          border: 0;
          border-radius: 0;
          background-color: white;
          padding: 2.4rem 3rem .8rem 1rem;
          font-size: 1rem;
          height: auto;
          box-shadow: none !important;
        }

        button {
          padding: .8rem;
          border: 0;
          border-radius: 0;
          font-size: 1rem;
        }

        > label {
          position: absolute;
          color: #80848f;
          top: .5rem;
          left: 1rem;
          z-index: 2;
          font-size: .8rem;
        }
      }
    }

    .ivu-table-wrapper {
      margin: .5rem 0;
      border-width: 0;

      .ivu-table:before,
      .ivu-table:after {
        display: none;
      }

      .ivu-table td,
      .ivu-table th {
        border: none;
        position: relative;
        height: auto;

        &:after {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: rgba(0, 0, 0, .1);
          content: '';
          transform-origin: 0 0;
          transform: scaleY(.33);
        }
      }

      .ivu-table-cell {
        margin: 0;
        padding: .8rem 1rem;
        font-weight: normal;

        * {
          font-size: 1rem;
        }
      }

      th .ivu-table-cell * {
        font-size: .8rem;
        color: #bbbec4;
      }
    }
  }

  @media screen and (max-device-width: 1600px) {
    html {
      font-size: 16px;
    }
  }

  @media screen and (max-device-width: 720px) {
    html {
      font-size: 14px;
    }
  }
</style>
