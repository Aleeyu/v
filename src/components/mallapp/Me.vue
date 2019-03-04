<template>
  <div class="app-me app-common-layout">
    <div ref="banner" class="app-banner bottom-border app-me-banner" :style="{backgroundColor: bannerBackground}">
      <v-touch class="app-banner-button">
        &nbsp;
      </v-touch>
      <div class="app-banner-title" :style="{opacity: opacity}">
        <h1>我的</h1>
      </div>
      <div class="app-banner-button right">
        <msg :foreground="bannerForeground"></msg>
      </div>

      <div class="app-me-banner-line" :style="{opacity: opacity}"></div>
    </div>

    <list-panel class="app-body app-common-body" :refreshable="!busy" @refresh="load" :pageable="false"
                @scroll="onScroll">
      <div class="app-me-header">
        <div class="app-me-image"
             :style="{backgroundImage: `url(${(user && user.headImgUrl) || '/static/images/default-image.png'})`}"></div>
        <div class="app-me-base">
          <h2>{{ (user && user.nickName) || '未登录' }}</h2>
          <h3>{{ (user && user.levelName) || '-' }}</h3>
        </div>
      </div>

      <div class="app-list-item app-me-items">
        <v-touch @tap="to('order')">
          <Icon type="ios-paper"></Icon>
          <span class="app-flex">我的订单</span>
          <Icon type="chevron-right"></Icon>
        </v-touch>

        <v-touch @tap="to('message')">
          <Icon type="chatbubble-working"></Icon>
          <span class="app-flex">我的消息</span>
          <Icon type="chevron-right"></Icon>
        </v-touch>

        <v-touch @tap="to('address', {action: 'edit'})">
          <Icon type="ios-navigate"></Icon>
          <span class="app-flex">地址管理</span>
          <Icon type="chevron-right"></Icon>
        </v-touch>
      </div>
    </list-panel>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'
  import Msg from '@/components/mallapp/Msg'

  export default {
    components: {ListPanel, Msg},
    data () {
      return {
        busy: false,
        user: null,
        opacity: 0
      }
    },
    methods: {
      shown: function () {
        this.load()
      },
      load: function (callback) {
        if (!this.busy) {
          this.busy = true
          this.$parent.getUserInfo().then(res => {
            this.user = res
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      },
      onScroll: function (e) {
        let t = e.target.scrollTop - this.$refs.banner.offsetHeight
        if (t > 100) t = 100;
        this.opacity = t / 100
      },
      to: function (comp, params) {
        this.$router.push({
          path: '/mallapp/' + comp,
          query: params || {}
        })
      }
    },
    computed: {
      bannerBackground () {
        return `rgba(255, 255, 255, ${this.opacity})`
      },
      bannerForeground () {
        let l = Math.round(255 - this.opacity * 200)
        return `rgb(${l}, ${l}, ${l})`
      }
    }
  }
</script>

<style lang="less">
  .app-me {
    &-banner {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;

      &-line {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 1px;
        width: 100%;
        background-color: rgba(0, 0, 0, .1);
        transform-origin: 0 100%;
        transform: scaleY(.33);
      }

      &:after {
        display: none;
      }
    }

    &-header {
      padding: 3rem 1rem;
      background: linear-gradient(to bottom, #2d8cf0, #5cadff);
      color: white;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &-image {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background-color: white;
      box-shadow: 0 0 0 .2rem rgba(0, 0, 0, .1);
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      margin-right: 1rem;
    }

    &-base {
      h2 {
        font-size: 1.3rem;
      }

      h3 {
        font-size: .8rem;
      }
    }

    &-items {
      > div {
        padding: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 1rem;
        line-height: 1rem;
        position: relative;

        > .ivu-icon {
          font-size: 1.2rem;

          &:first-child {
            margin-right: 1rem;
          }

          &:last-child {
            margin-left: 1rem;
            color: #bbbec4;
          }
        }

        &:after {
          position: absolute;
          bottom: 0;
          left: 1rem;
          height: 1px;
          width: 100%;
          content: '';
          background-color: rgba(0, 0, 0, .1);
          transform-origin: 0 100%;
          transform: scaleY(.33);
        }

        &:last-of-type:after {
          display: none;
        }
      }
    }
  }
</style>
