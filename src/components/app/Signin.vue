<template>
  <div class="app-signin" :style="{paddingBottom: `${slideUp}px`}" :data-slide-up="slideUp">
    <div class="app-logo">
      <img src="/static/images/app-logo.png"/>
    </div>
    <Form ref="form" class="app-form" :model="user" :rules="rules">
      <Form-item prop="mobile">
        <Input v-model="user.mobile" :maxlength="11" placeholder="请输入手机号码" :disabled="busy || checking">
        <Icon type="ios-telephone" slot="prepend"></Icon>
        </Input>
      </Form-item>
      <Form-item prop="password">
        <Input type="password" v-model="user.password" placeholder="请输入密码" :disabled="busy || checking">
        <Icon type="locked" slot="prepend"></Icon>
        </Input>
      </Form-item>

      <Button size="large" type="primary" @click="submit" :disabled="busy || checking">{{ checking ? '正在验证您的登录信息' : loginText }}</Button>
    </Form>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        busy: false,
        checking: false,
        slideUp: 0,
        enable: true,
        loginText: '登录',
        user: {
          mobile: '',
          password: '',
          _loading: true
        },
        roleMap: {
          OPERATOR: 'OPERATOR',
          PRODUCTION_MANAGER: 'PRODUCTION_MANAGER',
          STOREHOUSE_MANAGER: 'PRODUCTION_MANAGER'
        },
        rules: {
          account: [
            {required: true, message: '请填写手机号', trigger: 'blur'},
            {pattern: /^1\d{10}$/, message: '请输入正确的手机号码', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请填写密码', trigger: 'blur'},
            {type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      check: function () {
        this.checking = true
        this.$http.get('/system/app/user/current').then(res => {
          if (res) {
            this.updateUser(res)
          }
        }).finally(() => {
          this.checking = false
        })
      },
      submit: function () {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.slideUp = 0
            this.busy = true
            this.loginText = '正在登录...'
            if (this.enable) {
              this.$http.post(`/system/app/user/session`, this.user).then(res => {
                this.updateUser(res)
              }).catch(res => {
                this.$Message.error(res.message || res.msg || '用户名或密码不正确')
              }).finally(() => {
                this.busy = false
                this.loginText = '登录'
              })
            }
          } else {
            this.$Message.error('请填写正确的手机号码和密码')
          }
        })
      },
      updateUser: function (user) {
        let comp = null
        user.appRole = this.roleMap[user.roleName]
        switch (user.appRole) {
          case 'OPERATOR':
            comp = 'production'
            break
          case 'PRODUCTION_MANAGER':
            comp = 'stockin'
            break
        }
        this.$parent.updateUser(user)
        this.$parent.replaceRoute({
          path: '/app/' + comp
        })
      },
      shown: function () {
        this.check()
      },
      keyboardStateChanged: function (shown, e) {
        if (shown) {
          this.slideUp = e.keyboardHeight
        } else {
          this.slideUp = 0
        }
      }
    }
  }
</script>
<style lang="less">
  body, html, #app {
    height: 100%;
    overflow: hidden;
  }

  .app-signin {
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-image: url('/static/images/app-background.jpg');
    background-position: top center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .app-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 3rem;

    img {
      height: 5rem;
    }
  }

  .app-form {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;

    .ivu-form-item {
      margin: 0 !important;
    }
    .ivu-input-wrapper {
      width: auto;
      display: flex;
      flex-direction: row;
      overflow: hidden;
      margin: .5rem 2rem;
      background-color: rgba(255, 255, 255, .6);
      border-radius: .2rem;
      box-shadow: 0 0 .2rem rgba(0, 0, 0, .1);
      border: none;

      .ivu-input-group-prepend {
        width: 3rem;
        text-align: center;
        font-size: 1.2rem;
        background-color: transparent;
        border: none;
        position: relative;
        line-height: 3rem;
        padding: 0;

        &:after {
          position: absolute;
          top: 10%;
          right: 0;
          height: 80%;
          width: 1px;
          content: '';
          transform-origin: 1 0;
          transform: scaleX(.33);
          background-color: rgba(0, 0, 0, .2);
        }
      }

      + .ivu-form-item-error-tip {
        display: none;
      }

      input {
        height: auto;
        font-size: 1rem;
        border: none !important;
        padding: 0 1rem;
        flex-grow: 1;
        flex-shrink: 1;
        border-radius: 0;
        height: auto;
        box-shadow: none !important;
        background-color: transparent;
        color: #495060;

        &::placeholder {
          color: #495060;
        }

        &:focus {
          outline: none;
        }
      }
    }
    button {
      margin: .5rem 2rem 0 2rem;
      padding: .8rem;
      height: auto;
      font-size: 1rem;
      border: none;
      background-color: rgba(73, 80, 96, 0.9) !important;
      color: white !important;
      box-shadow: 0 0 .2rem rgba(0, 0, 0, .1);
      letter-spacing: .2rem;

      &:disabled {
        background-color: rgba(73, 80, 96, 0.3) !important;
      }
    }
  }
</style>
