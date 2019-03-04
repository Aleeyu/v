<style lang="less" scoped>
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
</style>
<template>
  <Row type="flex" justify="center">
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
        <!-- <FormItem>
          <Button type="primary" @click="handleSubmit('signinform')">提交</Button>
          <Button type="ghost" @click="handleReset('signinform')">重置</Button>
        </FormItem> -->
      </Form>
    </Col>
  </Row>

</template>
<script>
  import {mapMutations, mapState} from 'vuex'

  export default {
    data () {
      return {
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
    computed: {
      ...mapState('wechat', ['userInfo'])
    },
    methods: {
      ...mapMutations('wechat', ['updateisLogin', 'updateUserInfo']),
      handleSubmit (name) {
        const self = this;
        self.$refs[name].validate((valid) => {
          if (valid) {
            self.signinform.openid = self.userInfo.openid;
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
                self.$router.replace({
                  path: '/mobile/personal'
                })
              }
            }).catch(err => {
              self.$Message.error(err.message);
            })
          } else {
            self.$Message.error('表单验证失败!');
          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields();
      }
    }
  }
</script>
