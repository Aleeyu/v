<template>
<div class="per">
   <div v-if="!error" class="card_warp">
  <Form ref="editor" :model="model" label-position="right" :rules="rules">
    <Form-item label="经销商名称" prop="dealerName">
        <Input class="per_input" size="large" id="dealer_name" v-model.trim="model.dealerName" placeholder="请输入经销商名称" disabled></Input>
    </Form-item>
    <Form-item label="员工姓名" prop="name">
        <Input class="per_input" size="large" id="dealer_name" v-model.trim="model.name" placeholder="请输入员工姓名"></Input>
    </Form-item>
    <Form-item label="员工编号" prop="code">
        <Input class="per_input" size="large" id="dealer_code" v-model.trim="model.code" placeholder="请输入员工编号"></Input>
    </Form-item>
    <Form-item label="电话号码" prop="phone">
        <Input class="per_input" size="large" id="dealer_phone" v-model.trim="model.phone" placeholder="请输入电话号码"></Input>
    </Form-item>

    <Form-item label="性别" prop="sex">
        <RadioGroup v-model="model.sex" id="dealer_sex">
                <Radio label="男">男</Radio>
                <Radio label="女">女</Radio>
            </RadioGroup>
    </Form-item>
    <div>角色: {{model.role === '0' ? '普通员工' : '管理员'}}</div>
  </Form>
  </div>
  <Button size="large" type="success" long @click="save" id="dealer_save" class="per_save">保存</Button>
      <error-view v-if="error" :error="error" name="个人信息" @action="errorAction"
                :loading="busy" id="per_error"></error-view>
</div>
</template>

<script>
  export default {
    name: 'Personal',
    data () {
      const validateMobile = (rule, value, callback) => {
        const reg = /^1\d{10}$/;
        if (!reg.test(value)) {
          callback(new Error('请输入正确的手机号码'));
        } else {
          callback();
        }
      };
      return {
        rules: {
          name: [
              { required: true, message: '不能为空', trigger: 'blur' }
          ],
          // code: [
          //     { required: true, message: '不能为空', trigger: 'blur' }
          // ],
          phone: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: validateMobile, trigger: 'blur'}
          ]
        },
        id: '',
        busy: false,
        error: null,
        model: {
          sex: '男',
          role: '0'
        }
      }
    },
    // metaInfo () {
    //   return {
    //     meta: [
    //       {name: 'viewport', content: 'width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no'},
    //       {name: 'apple-mobile-web-app-capable', content: 'yes'},
    //       {'http-equiv': 'Cache-Control', content: 'no-siteapp'},
    //       {name: 'format-detection', content: 'telephone=no'},
    //       {'http-equiv': 'x-rim-auto-match', content: 'none'}
    //     ]
    //   }
    // },
    mounted: function () {
      document.title = '碧护-个人信息'
      this.id = this.$store.state.wechat.userInfo.id
      this.getStaff();
    },
    methods: {
      getStaff: function (id) {
        this.busy = true
        this.$http.get(`/system/wechat/dealermg/employee/${this.id}`).then(res => {
          if (res) {
            this.model = res;
          } else {
            this.error = {
              title: '您还没有绑定',
              content: '立即去绑定吧'
            }
          }
        }).catch((res) => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false;
        })
      },
      save: function () {
        this.$refs.editor.validate((valid) => {
          if (valid) {
            this.busy = true
            this.$http.put(`/system/wechat/dealermg/employee/${this.id}`, this.model).then(res => {
              this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('个人信息'))
            }).catch(res => {
              if (res.code === 'COMM_BIZ_EXISTS' || res.code === 'COMM_BIZ_NOT_EXISTS' || res.code === 'COMM_PARAM_EMPTY') {
                this.$Message.error(res.message)
              } else {
                this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('个人信息'))
              }
            }).finally(() => {
              this.busy = false
            })
          }
        })
      },
      bindStaff: function () {
        this.$router.push({
          path: this.$route.path
        })
      },
      errorAction: function () {
        if (this.error.type === this.$ErrType.UNHANDLED) {
          this.getStaff()
        } else {
          this.bindStaff()
        }
      }
    }
  }
</script>

<style lang="less">
.per{
  .per_save{
    position: fixed;
      bottom: 0;
  }
  .card_warp{
    padding:16px;
  }
  .ivu-btn{
  border-radius: 0;
}
}
</style>
