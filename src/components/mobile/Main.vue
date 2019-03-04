<style lang="less">
  select, input, select {
    -webkit-appearance: none;
    height: 2rem;
    width: 100%;
    border-style: solid;
    border-color: #DDDEE1;
    border-width: 1px;
    padding-left: 0.5rem;
    border-radius: 0;
  }
  .main-signin {
    .ivu-input-wrapper {
      margin: 0.5rem 0;
    }
    button {
      width: 100%;
      margin: 0.6rem 0;
    }
    header {
      height: 4rem;
      background: #2d8cf0;
      font-size: 1.2rem;
      line-height: 4rem;
      padding: 0 0.5rem;
      color: #fff;
      position: relative;
      .save {
        position: absolute;
        right: 1rem;
        top: 0rem;
        font-size: 1.5rem;
      }
      .back {
        position: absolute;
        right: 4rem;
        top: 0rem;
        font-size: 1.5rem;
      }
    }
    .form-content {
      background: #fff;
      padding: 1rem 1rem 0 1rem;
      border-radius: 0.2rem;
    }
  }

</style>
<template>
  <Row type="flex" justify="center" class="content">
    <Col span="24">
      <component :is="comp" v-if="comp && !isSignIn"></component>

      <Row type="flex" justify="center" v-if="isSignIn" class="main-signin">
        <Col span="24">
          <header>
            绑定经销商
            <div class="save" @click="handleSubmit('signinform')"><Icon type="checkmark-round" ></Icon></div>
            <div class="back" @click="handleReset('signinform')"><Icon type="ios-loop-strong" style="font-weight:bold"></Icon></div>
          </header>
        </Col>
        <Col span="24" class="form-content">
          <Form ref="signinform" :model="signinform" :rules="rulesignin" label-position="left" :label-width="0">
            <FormItem label="" prop="userName">
              <Input v-model="signinform.userName" placeholder="输入用户名（上级经销商提供）"></Input>
            </FormItem>
            <FormItem label="" prop="password">
              <Input type="password" v-model.trim="signinform.password" placeholder="输入密码（上级经销商提供）"></Input>
            </FormItem>
            <FormItem label="" prop="name">
              <Input v-model="signinform.name" placeholder="输入真实姓名"></Input>
            </FormItem>
            <FormItem label="" prop="code">
              <Input v-model.trim="signinform.code" placeholder="输入员工编号"></Input>
            </FormItem>
            <FormItem label="请选择性别" prop="sex">
              <RadioGroup v-model="signinform.sex">
                <Radio label="男"></Radio>
                <Radio label="女"></Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="" prop="phone">
              <Input v-model.trim="signinform.phone" placeholder="输入电话号码"></Input>
            </FormItem>
          </Form>
        </Col>
      </Row>

      <error-view v-if="!comp" :error="error" name="经销商员工登录" :loading="false"></error-view>

    </Col>
  </Row>
</template>
<script>
  import config from '@/config'
  import {mapMutations, mapState} from 'vuex'

  export default {
    name: 'mobile',
    data () {
      return {
        error: null,
        comp: null,
        isSignIn: false,
        openid: null,
        signinform: {
          userName: '',
          password: '',
          name: '',
          code: '',
          sex: '',
          phone: '',
          openid: ''
        },
        rulesignin: {
          userName: [
            {required: true, message: '用户名不能为空', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '密码不能为空', trigger: 'blur'},
            {type: 'string', max: 50, message: '密码长度不能超过50位', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '真实姓名不能为空', trigger: 'blur'}
          ],
          sex: [
            {required: true, message: '请选择性别', trigger: 'change'}
          ],
          phone: [
            {required: true, message: '请填写手机号', trigger: 'blur'},
            {pattern: /^1\d{10}$/, message: '请输入正确的手机号码', trigger: 'blur'}
          ],
          code: [
            {required: false}
          ]
        }
      }
    },
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
    computed: {
      ...mapState('wechat', ['userInfo'])
    },
    methods: {
      ...mapMutations('wechat', ['updateUserInfo']),
      checkLogin () {
        this.$http.get(
          `/wechat/dealermg/user/session`
        ).then(res => {
          /**
           * 已登录 res === 用户信息
           * 未登录 res === 'COMM_WECHAT_NOT_LOGIN'
           */
          if (res === 'COMM_WECHAT_NOT_LOGIN') {
            // 未登录 检查是否绑定
            this.checkSignUp();
          } else if (res.id) {
            // 已登录 正常跳转
            this.shunt(res);
          } else {
            throw { message: '登录状态错误，请联系后台管理员' }
          }
        }).catch(err => {
          this.error = {
            title: '验证登录状态错误',
            content: err.message || JSON.stringify(err) 
          };
        }) 
      },

      checkSignUp () {
        if (!this.$route.query.code) {
          window.location.href = this.wxRedirectTo(window.location.href);
          return;
        }

        this.$http.post(
          `/wechat/dealermg/user/session`, 
          { code: this.$route.query.code }
        ).then(res => {
          if (res.id) {
            this.shunt(res);
          } else {
            this.openid = res.openid;
            this.isSignIn = true;
          }
        }).catch(err => {
          this.error = {
            title: '查找经销商出现错误',
            content: err.message || JSON.stringify(err) 
          };
        })
      },
 
      // 动态路由分流
      shunt (info) {
        const self = this;
        self.updateUserInfo(info);
        let compName = self.$route.params.comp.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        require([`@/components/mobile/${compName}`], (comp) => {
          self.comp = comp;
          return info;
        }, () => {
          self.$Message.error('路由错误，请检查url地址');
        });
      },
      wxRedirectTo (url) {
        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechat.appId}&redirect_uri=${encodeURIComponent(url)}&response_type=code&scope=snsapi_base&state=first#wechat_redirect`
      },
      handleSubmit (name) {
        const self = this;

        self.$refs[name].validate((valid) => {
          if (valid) {
            self.signinform.openid = self.openid;
            self.$http.post(
              `/system/wechat/dealermg/employee`,
              self.signinform
            ).then(res => {
              if (res.code === 'COMM_BIZ_EXISTS') {
                self.$Message.error('该用户已存在')
              } else if (res.code === 'COMM_PARAM_ERROR') {
                self.$Message.error('用户名或密码错误')
              } else if (res.code === 'COMM_PARAM_EMPTY') {
                self.$Message.error('用户名或密码不能为空')
              } else {
                self.updateUserInfo(res);

                self.isSignIn = false;
                
                self.$router.replace({
                  path: '/mobile/personal'
                })
              }
            }).catch(err => {
              self.$Message.error(err.message);
            })
          } else {
            self.$Message.error('表单验证失败，请检查输入项');
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields();
      }
    },
    mounted () {
      console.log('---------- Start To CheckLogin ----------');
      document.body.classList.add('mark-as-app')
      this.checkLogin();
    },
    watch: {
      $route: 'checkLogin'
    }
  }
</script>
