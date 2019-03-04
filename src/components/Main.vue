<template>
  <div class="layout" :class="{small: navigationType === 0}">
    <Row class="toolbar" :class="{'scroll-out': scrollTop > 0}" type="flex" justify="space-between" align="middle">
      <i-col></i-col>
      <i-col>
        <!-- <Tooltip content="系统消息">
          <Badge :count="msgNum">
            <Button @click="information" type="text" id="main_info" size="small">
              <Icon type="ios-email-outline" size="24"></Icon>
            </Button>
          </Badge>
        </Tooltip> -->
        <!-- <Tooltip content="切换语言">
          <Button @click="changeLanguage" type="text">
            EN
          </Button>
        </Tooltip> -->
        <Tooltip content="退出系统">
          <Button @click="signout" type="text" id="main_signout">
            <Icon type="power" size="16"></Icon>
          </Button>
        </Tooltip>
      </i-col>
    </Row>

    <div class="content">
      <router-view></router-view>
    </div>

    <nav>
      <div class="logo">
        <div class="logo-box"></div>
      </div>

      <Menu ref="navigation" :open-names="openMenu" :active-name="activeMenu" theme="dark" width="auto"
            class="navigation spec-scroll" :accordion="true"
            @on-select="navigation">
        <Submenu v-for="p in $privilege.current" v-if="p.pid == null" :key="p.id" :name="p.path">
          <template slot="title">
            <Icon :type="p.icon" :id="`main_navigation_${p.path.replace(/\//g, '_')}`"
                  style="width: 20px; text-align: center;"></Icon>
            {{ p.text }}
          </template>
          <Menu-item v-for="sp in $privilege.current" v-if="sp.pid === p.id" :key="sp.id" :name="`/${sp.path}`"
                     :id="`main_navigation_${sp.path.replace(/\//g, '_')}`" style="padding-left: 56px;">{{ sp.text }}
          </Menu-item>
        </Submenu>
      </Menu>

      <div class="expander" v-if="navigationType === 0"></div>
    </nav>
  </div>
</template>

<script>
  import {mapMutations} from 'vuex'

  export default {
    name: 'main',
    data () {
      return {
        msgNum: 0,
        openMenu: [],
        activeMenu: '',
        menuSpanLeft: 4,
        menuSpanRight: 20,
        navigationType: 1,
        navigationCollapsed: false,
        scrollTop: 0
      }
    },
    mounted: function () {
      window.addEventListener('resize', this.resize)
      window.addEventListener('scroll', this.scroll)
      this.resize()
      // this.getMsgNum()
      this.updateMenuState()
    },
    methods: {
      ...mapMutations('account', ['clearDetails']),
      navigation: function (name) {
        this.$router.push(name)
      },
      resize: function () {
        if (document.body.clientWidth <= 1200) {
          this.navigationType = 0
        } else {
          this.navigationType = 1
        }
      },
      scroll: function () {
        this.scrollTop = document.body.scrollTop
      },
      operate: function (tag) {
        switch (tag) {
          case 'exit':
            this.signout()
            break
        }
      },
      signout: function () {
        this.$http.delete('/system/user/session/').then((res) => {
          //          this.$router.push('/signin');
          this.clearDetails();
          window.location.href = '/signin'
        }).catch((res) => {
          this.$Message.error(res.msg || res.message || '退出登录失败，请稍候重试！')
        })
      },
      changeLanguage: function () {
        this.$i18n.change(this.$i18n.current === 'zh-cn' ? 'en-us' : 'zh-cn')
      },
      getMsgNum: function () {
        this.$http.get('/base/msg/UnReadNums').then(res => {
          this.msgNum = res;
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('消息数'))
        })
      },
      information: function () {
        this.$router.push('/system/message')
      },
      updateMenuState: function () {
        let ps = this.$route.path.split('/')
        if (ps.length > 2) {
          this.openMenu = [ps[1]]
          this.activeMenu = this.$route.path
          this.$nextTick(() => {
            this.$refs.navigation.updateOpened()
            this.$refs.navigation.updateActiveName()
          })
        }
      }
    },
    watch: {
      $route () {
        this.updateMenuState()
      }
    }
  };
</script>

<style lang="less">
  body {
    background-image: url('/static/images/background.mask.svg'), linear-gradient(to bottom, #0b96ff, #4f4ac8);
    // background-image: url('/static/images/background.jpg');
    background-size: cover;
    background-attachment: fixed, fixed;
  }

  .spec-scroll::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }

  .spec-scroll::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .spec-scroll::-webkit-scrollbar-thumb:horizontal {
    background-color: transparent;
    border-radius: 10px;
    min-width: 30px;
    background-clip: padding-box;
  }

  .spec-scroll::-webkit-scrollbar-thumb:vertical {
    background-color: transparent;
    border-radius: 10px;
    min-height: 30px;
    background-clip: padding-box;
  }

  .spec-scroll:hover::-webkit-scrollbar-thumb:horizontal,
  .spec-scroll:hover::-webkit-scrollbar-thumb:vertical {
    background-color: rgba(0, 0, 0, .1);
  }

  .toolbar {
    position: fixed;
    top: 0;
    left: 270px;
    right: 0;
    height: 64px;
    padding: 0 30px;
    z-index: 102;
    transition: all 275ms;
    background-color: rgba(11, 150, 255, 0.9);

    button {
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 36px;
      padding: 0;

      &:hover, &:active {
        color: white;
        background-color: rgba(0, 0, 0, .1);
      }
    }
  }

  nav {
    z-index: 104;
    width: 270px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;

    display: -webkit-box; /* 老版本语法: Safari, iOS, Android browser, older WebKit browsers. */
    display: -moz-box; /* 老版本语法: Firefox (buggy) */
    display: -ms-flexbox; /* 混合版本语法: IE 10 */
    display: -webkit-flex; /* 新版本语法: Chrome 21+ */
    display: flex; /* 新版本语法: Opera 12.1, Firefox 22+ */
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-box-direction: column;
    -webkit-box-orient: vertical;
    -moz-flex-direction: column;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: stretch;
    -moz-align-items: stretch;
    -ms-flex-align: stretch;

    transform: translateX(0);
    transition: all 275ms;
  }

  .logo {
    -moz-flex-grow: 0;
    -webkit-flex-grow: 0;
    flex-grow: 0;
    -moz-flex-shrink: 0;
    -webkit-flex-shrink: 0;
    flex-shrink: 0;

    .logo-box {
      margin: 10px 20px;
      height: 48px;
      background: url("../../static/images/logo.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: top left;
    }
  }

  .navigation {
    -moz-flex-grow: 1;
    -webkit-flex-grow: 1;
    flex-grow: 1;
    -moz-flex-shrink: 1;
    -webkit-flex-shrink: 1;
    flex-shrink: 1;
    background: transparent;
    overflow-y: auto;
    overflow-x: hidden;

    .ivu-menu, .ivu-menu-submenu, .ivu-menu-submenu-title {
      outline: none !important;
      background-color: transparent !important;
      border: none !important;
    }

    .ivu-menu-submenu-title > i {
      font-size: 16px !important;
    }

    &.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item-active,
    &.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item-active:hover,
    &.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu),
    &.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title-active:not(.ivu-menu-submenu) {
      background: linear-gradient(to right, rgba(0, 0, 0, .2), transparent) !important;
    }

    .ivu-menu-item-active .ivu-menu-submenu-title .ivu-menu-submenu-title-icon:before {
      content: '\F10D';
    }
  }

  .content {
    z-index: 101;
    margin: 64px 0 0 270px;
    min-width: 900px;

    > .no-min-width {
      min-width: 0 !important;
    }
  }

  .global-dialog {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    transform: translateY(100%);
    transition: opacity 275ms;
    opacity: 0;
    z-index: 200;
    overflow: hidden;

    &:before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background-color: rgba(73, 80, 96, 0.8);
    }

    .global-dialog-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      max-height: 80%;
      background-color: white;
      box-shadow: 0 0 30px 20px rgba(0, 0, 0, .2);
      transform: translateY(100%);
      transition: all 275ms;
    }

    &.open {
      transform: translateY(0);
      opacity: 1;

      .global-dialog-content {
        transform: translateY(0);
      }
    }
  }

  .small {
    .navigation-expander {
      display: block;
    }

    nav {
      transform: translateX(-100%);
      background: linear-gradient(to bottom, #0b96ff, #4f4ac8);
      box-shadow: 0 0 10px rgba(0, 0, 0, .3);

      .expander {
        position: absolute;
        right: -94px;
        top: 0;
        height: 64px;
        line-height: 64px;
        text-align: center;
        color: white;
        font-family: Ionicons;
        font-size: 32px;
        width: 94px;
        padding-left: 30px;
        cursor: pointer;
        background-color: transparent;
        opacity: 1;
        transition: opacity 275ms;

        &:after {
          content: '\F20E';
        }

        &:hover:after {
          color: #1c2438;
        }
      }

      &:hover {
        transform: translateX(0);

        .expander {
          opacity: 0;
        }
      }
    }

    .toolbar {
      left: 0;

      &.scroll-out {
        box-shadow: 0 0 5px rgba(0, 0, 0, .15)
      }
    }

    .content {
      margin-left: 0;
    }
  }

  .ivu-card {
    margin: 30px;

    .card-header {
      border-bottom: #f8f8f9 solid 1px;
      background-color: #fafafa;
      padding: 16px;
      margin: -16px -16px 24px -16px;
      white-space: normal;

      .infos {
        text-align: center;
        margin-top: 10px;

        > span {
          padding-right: 10px;
        }

        a {
          padding: 0 10px 0 12px;
          border-left: #e9eaec solid 1px;
        }

        > a:first-child,
        > *:first-child a {
          border-left: none;
        }

        .color_tip {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 6px;
          background-color: transparent;
        }
      }

      h1 {
        font-weight: normal;
        text-align: center;
      }
      h4 {
        color: #80848f;
        text-align: center;
        font-weight: normal;
        margin: 10px 0 0 0;
      }
      .back {
        padding: 0;
        line-height: normal;
      }
    }

    h4, h5, h6, h7 {
      font-weight: normal;
    }

    h5 {
      color: #80848f;
    }

    h6 {
      color: #bbbec4;
    }
  }

  .ivu-input-group {
    top: 0;
  }

  .ivu-btn-group-dark {
    button {
      color: #bbbec4;
      padding: 0;
      margin: 10px;

      &:hover, &:active {
        color: #f8f8f9;
      }
    }
  }

  .ivu-card-head {
    background-color: #f8f8f9;
  }

  .ivu-form-item {
    margin: 0 -16px;
    padding: 10px 16px;
    clear: both;

    &:not(.opera-btn):hover {
      background-color: #f8f8f9;
    }

    > .ivu-form-item-content {
      max-width: 480px;
    }

    > .ivu-form-item-label {
      line-height: 17px;
      text-align: right;
      font-size: 14px;

      &:after {
        content: ': ';
      }
    }

    &-required > .ivu-form-item-label:before {
      display: inline-block !important;
      content: '*';
      height: auto;
      color: red;
    }

    .ivu-form-item-error-tip {
      display: none;
    }

    &:after {
      padding-top: 5px;
      clear: none;
      content: attr(data-describe);
      height: auto;
      font-size: 12px;
      visibility: visible;
      color: #80848f;
    }
  }
</style>
