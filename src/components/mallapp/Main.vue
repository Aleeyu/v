<template>
  <div class="app-layout">
    <div class="app-body app-body-top" :data-comp="comp">
      <div v-for="p in pages" :key="p.name" class="app-page" :class="{'app-page-notrans-fix': p.name === 'Signin'}"
           :ref="p.name + 'Element'" :data-comp-name="p.name">
        <component :ref="p.name" :is="p.component" :class="['app-page-inner']"></component>
      </div>
    </div>
    <div class="app-menus" v-if="navigable">
      <button @click="goto('index')" :class="{selected: $route.params.comp === 'index'}">
        <Icon type="ios-home"></Icon>
        <span>首页</span>
      </button>
      <button @click="goto('category')" :class="{selected: $route.params.comp === 'category'}">
        <Icon type="ios-list"></Icon>
        <span>分类</span>
      </button>
      <button @click="goto('cart')" :class="{selected: $route.params.comp === 'cart'}">
        <Icon type="ios-cart"></Icon>
        <span>购物车</span>
      </button>
      <button @click="goto('me')" :class="{selected: $route.params.comp === 'me'}">
        <Icon type="ios-person"></Icon>
        <span>我的</span>
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
  import config from '@/config'

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
        msgCount: 0,
        pages: {},
        user: null,
        receivingAddress: null,
        busy: false,
        navigable: true,
        editable: false,
        editConfig: null,
        modal: null,
        busyMessage: '',
        currentComp: null,
        previousComp: null,
        comp: null,
        broadcasts: {},
        history: [],
        anticlockwise: false,
        modaling: false,
        modelCompleteFn: null,
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
      checkBroadcast: function (key) {
        return this.broadcasts.hasOwnProperty(key) && typeof this.broadcasts[key] === 'function'
      },
      executeBroadcast: function (key, ...args) {
        if (this.broadcasts.hasOwnProperty(key) && typeof this.broadcasts[key] === 'function') {
          return this.broadcasts[key](...args)
        } else {
          return null
        }
      },
      modalIncepter: function (complete) {
        if (!this.modaling) {
          this.modaling = true
          let state = {
            title: 'title',
            url: '#'
          }
          window.history.pushState(state, 'title', '#')
          this.modelCompleteFn = complete
        }
      },
      shunt: function () {
        window.localStorage.removeItem('popup-opened')
        let compName = this.$route.params.comp.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
        this.createComp(compName)
        this.checkNavigable(compName, this.$route.query.action)
      },
      createComp: function (name) {
        this.historyLength = window.history.length
        if (name !== this.comp) {
          this.fireComponentEvent(this.comp, 'hidden')
          if (!this.pages.hasOwnProperty(name)) {
            require([`@/components/mallapp/${name}`], (componentObj) => {
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
            }, err => {
              console.log(err)
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
      copy: function (data) {
        let textArea = document.createElement('textarea')
        textArea.style.background = 'transparent'
        textArea.value = String(data)
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          this.$Message.success('复制内容成功')
        } catch (err) {
          this.$Message.error('复制内容失败')
        }
        document.body.removeChild(textArea)
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
        this.navigable = true
        let unNavComps = ['Detail', 'Product', 'Statement', 'Statementitems', 'Address', 'Addressedit', 'Message', 'Order', 'Orderdetail', 'Service']
        if (unNavComps.indexOf(compName) >= 0) {
          this.navigable = false
        }
      },
      goto: function (comp) {
        this.$router.push({
          path: '/mallapp/' + comp
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
      /**
       * 获取用户信息
       * @param autoSignin 是否自动登录
       */
      getUserInfo: function (autoSignin = true) {
        return new Promise((resolve, reject) => {
          if (this.$isPlainObject(this.user)) {
            resolve(this.user)
          } else {
            this.$http.get('/wechat/customer/user/session', true).then(res => {
              if (res === 'COMM_WECHAT_NOT_LOGIN') {
                let code = this.$route.query.code
                if (code != null && code !== '') {
                  this.busy = true
                  this.$http.post('/wechat/customer/user/session', {
                    code: code,
                    latitude: 0,
                    longitude: 0,
                    _loading: true
                  }).then(res => {
                    this.user = res
                    resolve(this.user)
                  }).catch(err => {
                    this.$Message.error('获取用户信息失败')
                    reject(err)
                  }).finally(() => {
                    this.busy = false
                  })
                } else if (autoSignin === true) {
                  window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.customerAppId}&redirect_uri=${encodeURIComponent(window.location.href)}&response_type=code&scope=snsapi_userinfo&state=first#wechat_redirect`
                } else {
                  resolve(null)
                }
              } else {
                this.user = res
                resolve(this.user)
              }
            }).catch(err => {
              this.$Message.error('获取用户信息失败')
              reject(err)
            }).finally(() => {
              this.busy = false
            })
          }
        })
      },
      /**
       * 获取推送信息
       * @param
       */
      getMessCount: function () {
        this.$http.get('/wechat/customer/mobile/msg/UnReadNums').then(res => {
          this.msgCount = res
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('获取未读消息数失败'))
        }).finally(() => {
          this.busy = false
        })
      },
      /**
       * 检查用户的收货地址
       * @param to 检测后的目标页（如果无收货地址，强行跳至收货地址管理页面，并为管理页面传递该参数的值供其使用）
       * @param callback 检测后的回调方法（用于调用者处理后续事务）
       */
      checkReceivingAddress: function (to, callback) {
        this.getUserInfo().then(res => {
          this.$http.post('/wechat/customer/address/search', {
            page: 1,
            size: 10,
            _loading: true,
            queryFilter: [{property: 'selected', op: '=', value: 1}]
          }).then(res => {
            if (this.$isPlainObject(res) && this.$isArray(res.content, true)) {
              this.receivingAddress = res.content[0]
              this.$router.push({
                path: '/mallapp/' + to
              })
            } else {
              this.$router.push({
                path: '/mallapp/address',
                query: {
                  cUrl: to
                }
              })
            }
          }).catch(err => {
            this.$Message.error(err.message || err.msg || err)
          }).finally(() => {
            if (typeof callback === 'function') {
              callback()
            }
          })
        });
      },
      confirm: function (content, okText = '确定', cancelText = '取消') {
        this.modaling = true
        let state = {
          title: 'title',
          url: '#'
        }
        window.history.pushState(state, 'title', '#')

        return new Promise((resolve, reject) => {
          let o = {
            okText: okText,
            cancelText: cancelText,
            onOk: () => {
              window.history.back()
              resolve()
            },
            onCancel: () => {
              window.history.back()
            }
          }

          if (typeof content === 'function') {
            o.render = content
          } else {
            o.content = content
          }

          this.$Modal.confirm(o)
        })
      },
      eventBackButton: function (e) {
        if (!this.keyboardOpened) {
          if (this.modaling === true) {
            if (typeof this.modelCompleteFn === 'function') {
              this.modelCompleteFn()
              this.modelCompleteFn = null
            } else {
              this.$Modal.remove()
            }
            this.modaling = false
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
            e.stopPropagation()
          } else {
            this.removeTouchEvents()
          }
        } else {
          this.removeTouchEvents()
        }
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
      },
      onRootTouchMove: function (e) {
        let po = window.localStorage.getItem('popup-opened')
        if (po !== 'true') {
          e.preventDefault()
        }
      },
      cancelBubble: function () {
        return false
      }
    },
    beforeCreate () {
      this.$Install(require('vue-touch'), 'v-touch')
      if (!window.cordova) {
        // this.$ScriptLinker('/static/lib/cordova.js')
      }
    },
    mounted: function () {
      // document.removeEventListener('touchstart', this.onTouchStart, true)
      // document.addEventListener('touchstart', this.onTouchStart, true)
      window.removeEventListener('popstate', this.eventBackButton, false)
      window.addEventListener('popstate', this.eventBackButton, false)
      document.removeEventListener('touchmove', this.onRootTouchMove, false)
      document.addEventListener('touchmove', this.onRootTouchMove, false)

      document.oncontextmenu = this.cancelBubble
      document.body.classList.add('mark-as-app')
      // this.getUserInfo().then(this.shunt)
      this.shunt()
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
    -webkit-tap-highlight-color: transparent;
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
      background-color: rgba(0, 0, 0, .25);
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

  .app-flex {
    flex-grow: 1 !important;
    flex-shrink: 1 !important;
  }

  .app-no-flex {
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
  }

  .app-banner {
    display: flex;
    flex-direction: row;
    background-color: white;
    z-index: 10;

    &-title {
      padding: .8rem 0;
      flex-grow: 1;
      flex-shrink: 1;
      text-align: center;

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
      width: 30%;
      flex-grow: 0;
      flex-shrink: 0;

      &.right {
        justify-content: flex-end;
      }

      button {
        padding: 0 1rem;
        min-width: 3.6rem;
        font-size: 1rem;
        background-color: transparent;
        border: none;
        line-height: normal;

        i {
          font-size: 1.5rem;
        }
      }
    }
  }

  .app-search {
    display: flex;
    flex-direction: row;
    align-items: center;
    // background-color: #f8f8f9;

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
      border-radius: 20px !important;
      box-shadow: none !important;
      // background-color: transparent;
      background-color: #f8f8f9;
      border-radius: 20px;
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

  .app-block {
    display: block !important;
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
    position: relative;
    background-color: white;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      transform-origin: 0 0;
      transform: scaleY(.33);
      background-color: rgba(0, 0, 0, .25);
    }

    label {
      align-self: center;
      padding: 0 1rem;
      font-size: 1rem;
      line-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .ivu-icon {
        font-size: 1.5rem;
        margin-right: .2rem;
      }
    }

    button {
      flex-shrink: 1;
      flex-grow: 1;
      border-radius: 0;
      border: none;
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

      &.horizontal {
        flex-direction: row;
        justify-content: center;
        font-size: 1rem;
        padding: 1rem;
        line-height: 1rem;

        > span {
          font-size: 1rem;
          line-height: 1rem;
        }
      }

      &.big {
        font-size: 1.3rem;
        padding: .8rem 1.5rem;

        > span {
          font-size: 1.3rem;
        }

        em {
          font-style: normal;
          font-size: .75rem;
        }
      }
      &.long {
        font-size: 1.3rem;
        padding: .8rem 5rem;
      }
      > span {
        font-size: .8rem;
      }

      &:disabled {
        background-color: #e9eaec !important;
        color: #bbbec4;
      }

      &.selected {
        color: #2d8cf0;
      }
    }
    .category {
      button {
        padding: 0;
      }
    }
  }

  .app-item-menus {
    display: flex;
    align-items: center;
    justify-content: center;

    button {
      border: none;
      border-radius: 50rem;
      font-size: 1rem;
      width: 4rem;
      height: 4rem;
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

  .app-setting {
    &-button-group {
      display: flex;
      flex-direction: column;

      > i {
        font-size: .75rem;
        color: #80848f;
        padding: 1.5rem 1rem .5rem 1rem;
        background-color: #f8f8f9;
        font-style: normal;
      }

      > button {
        background-color: white;
        border: none;
        border-radius: 0;
        font-size: 1rem;
        display: flex;
        flex-direction: row;
        padding: .8rem 1rem;
        align-items: center;

        &.primary {
          background-color: #2d8cf0;
          color: white;
        }

        &.center > span {
          text-align: center;
        }

        &:disabled {
          color: #bbbec4;
        }

        > .ivu-icon {
          color: #bbbec4;

          &:first-child {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 2.1rem;
            width: 2.1rem;
            overflow: hidden;
            color: white;
            margin-right: .5rem;
            font-size: 1rem;
            background-color: #bbbec4;
            border-radius: 2rem;
          }
        }

        > span {
          flex-grow: 1;
          flex-shrink: 1;
          text-align: left;
        }
      }
    }

    &-form {
      background-color: white;

      .ivu-form-item {
        margin: 0;
      }

      .ivu-form-item-label {
        padding: 1rem 1rem 0 1rem;
        color: #80848f;
        font-size: .8rem;
      }

      input, textarea, .ivu-select-selection {
        border-radius: 0 !important;
        border: none !important;
        padding: 1.5rem 1rem 1rem 1rem !important;
        margin-top: -1rem !important;
        background-color: transparent !important;
        height: auto !important;
        font-size: 1rem;
        box-shadow: none !important;
      }

      .ivu-select-placeholder,
      .ivu-select-selected-value {
        padding-left: 0 !important;
        line-height: normal !important;
        height: auto !important;
        font-size: 1rem !important;
      }

      .ivu-form-item-error-tip {
        display: block;
        position: relative;
        padding: 1rem;
        background-color: #ff9900;
        color: white;
        font-size: 1rem;
      }
    }
  }

  body.mark-as-app {
    .ivu-badge {
      display: flex;
      flex-direction: row;

      &-count {
        top: .7rem;
        right: .5rem;
        height: auto;
        min-width: 0;
        line-height: 1.2rem;
        font-size: 1rem;
        transform-origin: 100% 0;
        transform: scale(.75);
      }
    }

    .ivu-modal {
      margin: 0 2rem;

      &-content {
        padding: 0;
        overflow: hidden;
        box-shadow: 0 0 1rem rgba(0, 0, 0, .2);
      }

      &-body {
        padding: 0;
      }

      &-confirm {
        padding: 0;
        border-radius: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &-head {
          display: none;
        }

        &-body {
          padding: 1rem;
          font-size: 1.2rem;
          color: #80848f;
          min-height: 6rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
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

            span {
              font-size: 1rem;
            }

            &.ivu-btn-text {
              background-color: #f8f8f9;
            }
          }
        }

        button {
          font-size: 1rem;
        }
      }
    }

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

<style lang="less">
  .app-cart {
    &-item {
      display: flex;
      flex-direction: row;

      &-coll {
        padding: 1rem 0;

        &:last-of-type:after {
          display: none;
        }
      }
    }

    &-checkbox {
      font-size: 1.5rem;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-image {
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      position: relative;
      width: 7rem;
      height: 7rem;
      margin-right: 1rem;
      align-self: center;
    }

    &-menus {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .2);
      opacity: 0;
      pointer-events: none;
      transition: opacity 275ms;

      &-show {
        opacity: 1;
        pointer-events: auto;
      }
    }

    &-info {
      flex-grow: 1;
      flex-shrink: 1;
      display: flex;
      flex-direction: column;
      padding: .2rem 1rem 0 0;

      h1 {
        white-space: normal;
        word-break: break-all;
        font-size: 1rem;
        line-height: 1.35rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      h3 {
        flex-grow: 1;
        flex-shrink: 1;
        min-height: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #80848f;
        font-size: .8rem;
        margin: .3rem 0;
      }
    }

    &-sale {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }

    &-price {
      font-size: 1.2rem;
      line-height: 1.2rem;
      color: #ed3f14;

      &:before {
        content: '¥ ';
        font-size: .8rem;
      }
    }

    &-sum {
      align-self: center;
      font-size: 1.3rem;

      &:before {
        content: '合计: ¥';
      }
    }
  }

  .app-statement {
    &-address {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      font-size: 1rem;
      padding: 0 1rem 1rem 0;

      .ivu-icon {
        display: block;
        width: 2.5rem;
        padding-right: .5rem;
        text-align: right;
        line-height: 1.5rem;
        color: #80848f;
      }

      span {
        line-height: 1.5rem;
        flex-grow: 1;
        flex-shrink: 1;
        color: #80848f;
      }

      &-panel {
        display: flex;
        flex-direction: row;
        background-color: white;
        position: relative;

        &.simple:after {
          display: none;
        }

        &:after {
          position: absolute;
          content: '';
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjkwcHgiIGhlaWdodD0iM3B4Ij48cGF0aCBkPSJNMCwwIEwyMCwwIDE3LDMgMCwzeiIgZmlsbD0iIzJiODVlNCIgLz48cGF0aCBkPSJNMzAsMCBMNTAsMCA0NywzIDI3LDN6IiBmaWxsPSIjZmY5OTAwIiAvPjxwYXRoIGQ9Ik02MCwwIEw4MCwwIDc3LDMgNTcsM3oiIGZpbGw9IiNlZDNmMTQiIC8+PHBhdGggZD0iTTkwLDAgTDkwLDMgODcsM3oiIGZpbGw9IiMyYjg1ZTQiIC8+PC9zdmc+');
          /* height: 2px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjkwcHgiIGhlaWdodD0iMnB4Ij48cGF0aCBkPSJNMCwwIEwyMCwwIDE4LDIgMCwyeiIgZmlsbD0iIzJiODVlNCIgLz48cGF0aCBkPSJNMzAsMCBMNTAsMCA0OCwyIDI4LDJ6IiBmaWxsPSIjZmY5OTAwIiAvPjxwYXRoIGQ9Ik02MCwwIEw4MCwwIDc4LDIgNTgsMnoiIGZpbGw9IiNlZDNmMTQiIC8+PHBhdGggZD0iTTkwLDAgTDkwLDIgODgsMnoiIGZpbGw9IiMyYjg1ZTQiIC8+PC9zdmc+'); */
          background-repeat: repeat-x;
          background-position: 0 0;
          background-size: 90px 3px;
        }
      }
    }

    &-receiver {
      padding: 1rem 1rem 0 2.5rem;

      b {
        font-size: 1.2rem;
        font-weight: normal;
        color: #1c2438;

        &:last-of-type {
          margin: 0 1rem;
        }
      }
    }

    &-chevron {
      font-size: 2rem;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #80848f;
    }

    &-products {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &-quantity {
      font-size: 1rem;
      color: #80848f;
      padding-left: 1rem;
    }

    &-images {
      display: flex;
      flex-direction: row;
      overflow-y: auto;
      flex-grow: 1;
      flex-shrink: 1;

      .app-cart-image {
        width: 5rem;
        height: 5rem;
        margin: .5rem;
      }
    }

    &-item {
      padding: 1rem;
      display: flex;
      flex-direction: row;
      align-items: flex-start;

      h2 {
        font-size: 1rem;
        font-weight: normal;
        line-height: 1.5rem;
        color: #1c2438;
      }

      h3 {
        flex-grow: 1;
        flex-shrink: 1;
        font-size: 1rem;
        text-align: right;
        line-height: 1.5rem;
      }

      em {
        font-style: normal;
        color: #80848f;
      }
    }

    &-price {
      color: #1c2438;
      font-style: normal;

      &:before {
        content: '¥';
        font-size: .8rem;
      }

      &-big {
        font-size: 1.3rem;
        color: #ed3f14;

        &:before {
          font-size: 1rem;
        }
      }

      &-large {
        font-size: 1.8rem;

        &:before {
          font-size: 1.5rem;
        }
      }
    }

    &-message > input {
      background-color: transparent;
      border: none;
      font-size: 1rem;
      color: #495060;
      padding: .5rem 1rem;
      line-height: 1rem;
      width: 100%;
    }

    &-price-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      font-size: 1rem;
      color: #1c2438;
      line-height: 1.5rem;
    }

    &-summary {
      color: #ed3f14;
      justify-content: flex-end !important;
    }
  }

  .app-order {
    &-status {
      display: flex;
      background-color: white;
      position: relative;

      button {
        width: 20%;
        font-size: 1rem;
        padding: .8rem 0;
        border-radius: 0;
        border: solid transparent;
        border-width: 0 0 2px 0;
        line-height: normal;

        &.selected {
          color: #3399ff;
          border-color: #3399ff;
        }
      }
    }

    &-title {
      margin: 0 1rem;
      padding: .5rem 0 .8rem 0;
      line-height: normal;
      display: flex;
      align-items: center;
      font-size: 1rem;

      button {
        font-size: 1.3rem;
        line-height: 1rem;
        height: auto;
        align-self: stretch;
        padding: 0 1rem;
      }
    }

    &-sub {
      color: #80848f;
      font-size: .8rem;
      padding: 1rem;
    }

    &-name {
      white-space: normal;
      word-break: break-all;
      font-size: 1rem;
      line-height: 1.35rem;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-base {
      display: flex;
      flex-direction: row;
      padding: 1rem 0 1rem 1rem;
      background-color: #fcfcfc;
    }

    &-summary {
      font-size: 1rem;
      padding: .8rem 1rem .5rem 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;

      b {
        margin-left: .5rem;

        &:before {
          content: '¥';
        }
      }
    }

    &-image {
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      position: relative;
      width: 5rem;
      height: 5rem;
      margin-right: 1rem;
      align-self: center;
    }

    &-record {
      padding: .5rem 1rem;
      font-size: 1rem;

      &.tight {
        padding: .2rem 1rem;
      }

      button {
        padding: 0 1rem;
        font-size: 1rem;
        height: auto;
      }

      em {
        font-style: normal;
        color: #80848f;

        &:after {
          content: '： ';
        }
      }

      &-vertical {
        display: flex;
        flex-direction: column;

        em {
          color: #1c2438;
          margin-bottom: .5rem;

          &:after {
            content: '';
          }
        }
      }
    }

    &-sep {
      margin: .5rem 1rem;
      height: 1px;
      background-color: rgba(0, 0, 0, .1);
      transform: scaleY(.33);
    }

    &-detail-status {
      padding: 1rem;
      color: white;
      font-size: 1rem;

      &:before {
        content: '订单状态: ';
      }
    }
  }


  .app-address {
    &-empty {
      flex-direction: column;
      align-items: center;
      justify-content: center;

      h3 {
        font-size: 1rem;
      }

      button {
        margin: 1rem;
        padding: 1rem 2rem;
        font-size: 1rem;
        height: auto;
      }
    }

    &-item {
      display: flex;
      flex-direction: row;
    }

    &-selected {
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #2d8cf0;
      color: white
    }

    &-base {
      padding: 1rem;
      align-self: center;
      margin-bottom: .5rem;

      b {
        font-size: 1.2rem;
        margin-right: 1rem;
        font-weight: normal;
        color: #1c2438;
      }

      span {
        font-size: 1rem;
        color: #80848f;
      }
    }

    &-opera {
      display: flex;
      flex-direction: row;
      position: relative;

      &:before {
        position: absolute;
        content: '';
        left: 1rem;
        right: 1rem;
        top: 0;
        height: 1px;
        background-color: rgba(0, 0, 0, .1);
        transform-origin: 0 0;
        transform: scaleY(.33);
      }

      button {
        padding: 1rem 1rem .8rem 1rem;
        font-size: 1rem;
        line-height: 1.3rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #495060 !important;

        .ivu-icon {
          font-size: 1.3rem;
          line-height: 1.3rem;
        }
      }
    }

    &-opera1 {
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;

      &:before {
        position: absolute;
        content: '';
        left: 0;
        top: 0;
        width: 1px;
        height: 100%;
        background-color: rgba(0, 0, 0, .1);
        transform-origin: 0 0;
        transform: scaleX(.33);
      }

      button {
        padding: .3rem 1rem;
        height: auto;
        font-size: 1.3rem;
      }
    }

    &-edit {
      background-color: white;
    }

    &-edit-item {

    }
  }
</style>
