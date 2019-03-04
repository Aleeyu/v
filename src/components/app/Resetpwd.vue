<template>
  <div class="app-resetpwd app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>修改密码</h1>
        <h4>重置您的登录密码</h4>
      </div>
    </div>

    <div class="app-body app-setting-body app-common-body">
      <Form label-position="top" ref="pwdeditor" :model="model" class="app-setting-form" :rules="rules" size="large">
        <Form-item label="原密码" prop="oldPassword" class="bottom-border">
          <Input type="password" :maxlength="16" placeholder="请输入当前登录密码"
                 v-model="model.oldPassword"/>
        </Form-item>
        <Form-item label="新的密码" prop="password" class="bottom-border">
          <Input type="password" :maxlength="16"
                 placeholder="密码由6-16位组成，建议包含数字和大小写字母"
                 v-model="model.password"/>
        </Form-item>
        <Form-item label="确认密码" prop="confirmPassword" class="bottom-border">
          <Input type="password" :maxlength="16"
                 placeholder="再次输入登录密码，以确保您的密码输入正确"
                 v-model="model.confirmPassword"/>
        </Form-item>
      </Form>
    </div>


    <div class="app-menus">
      <button @click="setPassword" :disabled="busy" class="primary">
        <Icon type="checkmark"></Icon>
        <span>确认</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>取消</span>
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      const validatePwd = (rule, value, callback) => {
        if (this.model.confirmPassword !== '') {
          this.$refs.pwdeditor.validateField('confirmPassword');
        }
        callback();
      };

      const validateSameWithNew = (rule, value, callback) => {
        if (this.model.password === this.model.oldPassword) {
          callback(new Error('新密码不能和旧密码一样，请重新输入'));
        } else {
          callback()
        }
      }

      const validateConfirmPwd = (rule, value, callback) => {
        if (value !== this.model.password) {
          callback(new Error('两次输入密码不一致，请重新输入'));
        } else {
          callback();
        }
      };

      return {
        busy: false,
        model: {
          oldPassword: '',
          password: '',
          confirmPassword: ''
        },
        rules: {
          oldPassword: [
            {required: true, message: '请填写原密码', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请填写新的密码', trigger: 'blur'},
            {type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur'},
            {validator: validatePwd, trigger: 'blur'},
            {validator: validateSameWithNew, trigger: 'blur'}
          ],
          confirmPassword: [
            {required: true, message: '请填写确认密码', trigger: 'blur'},
            {validator: validateConfirmPwd, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      back: function () {
        this.$refs.pwdeditor.resetFields()
        this.$router.back()
      },
      setPassword: function () {
        if (this.$refs.pwdeditor) {
          this.$refs.pwdeditor.validate(valid => {
            if (valid) {
              this.busy = true;
              this.$http.put('/system/user/current/password', {
                oldPassword: this.model.oldPassword,
                newPassword: this.model.password
              }).then(res => {
                this.back()
                this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('密码'))
              }).catch(err => {
                this.$Message.error(err.message || this.$C.MSG_COMM_UPDATE_FAIL.format('密码'))
              }).finally(() => {
                this.busy = false;
              })
            }
          })
        }
      }
    }
  }
</script>
