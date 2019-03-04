<template>
  <div class="ivu-article" :class="[mini ? 'form-panel-mini' : 'form-panel']">
    <h1>用户登录</h1>
    <h4>使用您的手机号码、登录密码进行登录：</h4>

    <br/>
    <Form ref="model" :model="model" :rules="rule">
      <Form-item label="手机号码" prop="account">
        <Input id="signin_account" type="text" size="large" v-model.trim="model.account" placeholder="请输入您的手机号码"
               icon="ios-telephone"
               @on-enter="signin"
               :maxlength="11"/>
      </Form-item>
      <Form-item label="登录密码" prop="password">
        <Input id="signin_password" type="password" size="large" v-model="model.password" placeholder="请输入登录密码"
               icon="locked"
               @on-enter="signin"
               :maxlength="16"/>
      </Form-item>
      <Alert type="error" show-icon v-if="errorMsg !== ''">{{errorMsg}}</Alert>
      <Form-item>
        <Button id="signin_btn" long size="large" type="primary" @click="signin()" :loading="loading">
          <span v-if="!loading">登录</span>
          <span v-else>正在登录...</span>
        </Button>
      </Form-item>
    </Form>
  </div>
</template>

<script>
  import {mapMutations} from 'vuex'

  export default {
    data () {
      return {
        errorMsg: '',
        loading: false,
        model: {
          account: '',
          password: ''
        },
        rule: {
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
    props: {
      mini: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      ...mapMutations('account', ['updateDetails']),
      getLoginUrl: function () {
        let url = '/system/user/session'
        if (document.body.classList.contains('mark-as-app')) {
          url = '/system/app/user/session'
        }
        return url
      },
      signinCompleted: function () {
        if (document.body.classList.contains('mark-as-app')) {
          this.$emit('signed')
          this.$router.replace({
            path: '/app/check'
          })
        } else {
          if (this.mini === true) {
            this.$emit('signed')
          } else {
            this.$router.replace({path: '/system/profile'})
          }
        }
      },
      signin: function () {
        this.errorMsg = '';
        let validResult = false;
        this.$refs['model'].validate((valid) => {
          validResult = valid
        });
        if (!validResult) {
          return false;
        }

        this.loading = true;
        this.$http.post(this.getLoginUrl(), {
          mobile: this.model.account,
          password: this.model.password
        }).then((res) => {
          this.updateDetails(res)
          this.signinCompleted()
        }).catch((err) => {
          this.errorMsg = err.message || '用户名或密码错误，请检查'
        }).finally(() => {
          this.loading = false;
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .form-panel {
    position: absolute;
    top: 16px;
    right: 0;
    box-shadow: 0 0px 5px rgba(0, 0, 0, .2);
    border-radius: 5px;
    background-color: #f9f9f9;
    padding: 20px;
    overflow: hidden;
  }

  .form-panel-mini {
    position: relative;
    margin: -16px;
    padding: 20px;
    overflow: hidden;
  }
</style>
