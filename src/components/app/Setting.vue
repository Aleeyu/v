<template>
  <div class="app-setting app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>系统设置</h1>
        <h4>选择您要查看的内容或要进行的操作</h4>
      </div>
    </div>

    <div class="app-body app-common-body">
      <div class="app-setting-button-group">
        <i class="bottom-border">个人</i>
        <!--<button class="bottom-border setable" @click="goto('profile')">
          <Icon type="ios-person"></Icon>
          <span>我的资料</span>
          <Icon type="chevron-right"></Icon>
        </button>-->
        <button class="bottom-border setable" @click="goto('resetpwd')">
          <Icon type="locked"></Icon>
          <span>修改密码</span>
          <Icon type="chevron-right"></Icon>
        </button>
      </div>

      <div class="app-setting-button-group">
        <i class="bottom-border">其他</i>
        <button @click="signout" class="bottom-border setable">
          <Icon type="android-exit"></Icon>
          <span>注销帐户</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    methods: {
      goto: function (action) {
        this.$router.push({
          path: '/app/' + action
        })
      },
      back: function () {
        this.$refs.pwdeditor.resetFields()
        this.$router.back()
      },
      signout: function () {
        this.$http.delete('/system/user/session/').then(this.signin).catch(this.signin)
      },
      signin: function () {
        this.$root.$children[0].cancelSignin()
        this.$parent.updateUser(null)
        this.$router.replace({
          path: '/app/signin'
        })
      }
    }
  }
</script>

<style lang="less">
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
      .ivu-form-item {
        margin: 5px 0;
        background-color: white;
      }

      .ivu-form-item-label {
        padding: 1rem 1rem 0rem 1rem;
        color: #80848f;
        font-size: .75rem;
      }

      input {
        border-radius: 0 !important;
        border: none !important;
        padding: 1.5rem 1rem .5rem 1rem !important;
        margin-top: -1rem !important;
        background-color: transparent !important;
        height: auto !important;
        font-size: 1rem;
        box-shadow: none !important;
      }

      .ivu-form-item-error-tip {
        display: block;
        position: relative;
        padding: .8rem 1rem;
        background-color: #ff9900;
        color: white;
        font-size: .75rem;
      }
    }
  }
</style>
