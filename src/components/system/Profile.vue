<template>
  <div>
    <div v-show="!error">
      <!--个人资料-->
      <Card>
        <p slot="title">
          <Breadcrumb>
            <Breadcrumb-item>系统管理</Breadcrumb-item>
            <Breadcrumb-item>个人资料</Breadcrumb-item>
          </Breadcrumb>
        </p>
        <h4>下面是您的帐户个人资料，请保证信息的正确性，如果对角色信息有疑问请与管理员联系！</h4><br/>

        <Form ref="profile" :model="account" :rules="accountRules" label-position="left" :label-width="100">
          <Form-item label="角色" data-describe="不同角色可以使用的功能不同，通常由管理员进行分配">
            <Input id="userprofile_basic_role" type="text" readonly :value="account.roleDescr"
                   size="large" placeholder="请联系管理员设置"></Input>
          </Form-item>
          <Form-item label="真实姓名" prop="name">
            <Input id="userprofile_info_name" type="text" :maxlength="10" size="large" v-model.trim="account.name"/>
          </Form-item>
          <Form-item label="性别" prop="sex">
            <Select id="userprofile_sex" placeholder="请选择" size="large" v-model="account.sex">
              <Option id="userprofile_sex_man" value="0">男</Option>
              <Option id="userprofile_sex_woman" value="1">女</Option>
            </Select>
          </Form-item>
          <Alert type="error" v-if="profileError" show-icon closable>{{profileError}}</Alert>
          <Form-item class="opera-btn">
            <Button id="userprofile_info_save" type="primary" @click="saveProfile()" :loading="saving.profile">
              <span v-if="saving.profile">正在保存...</span>
              <span v-else>保存</span>
            </Button>
          </Form-item>
        </Form>
      </Card>
      <!--密码管理-->
      <Card>
        <p slot="title">
          <Breadcrumb>
            <Breadcrumb-item>系统管理</Breadcrumb-item>
            <Breadcrumb-item>密码管理</Breadcrumb-item>
            <Breadcrumb-item v-if="password.modify === true">修改密码</Breadcrumb-item>
          </Breadcrumb>
        </p>
        <h4>为了您的密码安全，请尽可能保证您的密码安全级别为高，并且定期更换密码。</h4>
        <br/>
        <Form label-position="left" :label-width="100" size="large" v-if="password.modify === false">
          <Form-item label="密码安全级别">
            <Rate disabled :value="5" :count="10"></Rate>
          </Form-item>
          <Form-item class="opera-btn">
            <Button id="userprofile_password_change" type="primary" @click="modifyPassword()">修改密码</Button>
          </Form-item>
        </Form>
        <div v-show="password.modify === true">
          <Form label-position="left" :label-width="100" ref="pwdeditor" :model="password.params" :rules="password.rules" size="large">
            <Form-item label="原密码" prop="oldPassword" data-describe="修改密码需要验证当前登录密码，忘记密码请通知管理员进行重置">
              <Input id="userprofile_password_change_old" type="password" :maxlength="16"
                     placeholder="输入原密码"
                     v-model="password.params.oldPassword"/>
            </Form-item>
            <Form-item label="新的密码" prop="password" data-describe="密码由6-16位组成，建议包含数字和大小写字母，不能与原密码重复">
              <Input id="userprofile_password_change_new" type="password" :maxlength="16"
                     placeholder="请输入新的登录登录"
                     v-model="password.params.password"/>
            </Form-item>
            <Form-item label="确认密码" prop="confirmPassword">
              <Input id="userprofile_password_change_new_confirm" type="password" :maxlength="16"
                     placeholder="再次输入登录密码，以确保您的密码输入正确"
                     v-model="password.params.confirmPassword"/>
            </Form-item>
            <Alert type="error" v-if="password.modifyPwdError" show-icon closable>{{password.modifyPwdError}}
            </Alert>
            <Form-item class="opera-btn">
              <Button id="userprofile_password_change_save" type="primary" @click="savePwd()" :loading="saving.pwd">
                <span v-if="saving.pwd">正在设置密码...</span>
                <span v-else>确定</span>
              </Button>
              <Button id="userprofile_password_change_cancel" @click="modifyPassword()">取消</Button>
            </Form-item>
          </Form>
        </div>
      </Card>
    </div>

    <Card v-if="error">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>系统设置</Breadcrumb-item>
          <Breadcrumb-item>个人信息</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <error-view id="userprofile_error_view" :error="error" name="个人信息" @action="get"
                  :loading="busy"></error-view>
    </Card>

  </div>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'main',
    data () {
      const validatePwd = (rule, value, callback) => {
        if (this.password.params.confirmPassword !== '') {
          this.$refs.pwdeditor.validateField('confirmPassword');
        }
        callback();
      };

      const validateSameWithNew = (rule, value, callback) => {
        if (this.password.params.password === this.password.params.oldPassword) {
          callback(new Error('新密码不能和旧密码一样，请重新输入'));
        } else {
          callback()
        }
      }

      const validateConfirmPwd = (rule, value, callback) => {
        if (value !== this.password.params.password) {
          callback(new Error('两次输入密码不一致，请重新输入'));
        } else {
          callback();
        }
      };

      return {
        busy: false,
        autoLoad: false,
        loader: null,
        saving: {
          profile: false,
          pwd: false,
          phone: false,
          checkCurrentMobile: false
        },
        account: {
          id: '',
          entId: '',
          employeeCode: '',
          mobile: '',
          name: '',
          sex: '',
          wxInfo: null,
          roleName: ''
        },
        profileError: '',
        accountRules: {
          name: [
            {required: true, message: '请填写真实姓名', trigger: 'blur'}
          ],
          sex: [
            {required: true, message: '请选择性别', trigger: 'blur'}
          ]
        },
        password: {
          modifyPwdError: '',
          modify: false,
          params: {
            oldPassword: '',
            password: '',
            confirmPassword: ''
          },
          rules: {
            oldPassword: [
              {required: true, message: '请填写原密码', trigger: 'blur'}
            ],
            password: [
              {required: true, message: '请填写真实姓名', trigger: 'blur'},
              {type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur'},
              {validator: validatePwd, trigger: 'blur'},
              {validator: validateSameWithNew, trigger: 'blur'}
            ],
            confirmPassword: [
              {required: true, message: '请填写确认密码', trigger: 'blur'},
              {validator: validateConfirmPwd, trigger: 'blur'}
            ]
          }
        },
        error: null
      }
    },
    computed: {
      ...mapState('account', {
        details: state => state.details
      })
    },
    mounted: function () {
      this.autoLoad = true
      this.account = {...this.account, ...this.details}
      if (!this.account.id) this.get()
    },
    methods: {
      ...mapMutations('account', ['updateDetails']),
      get: function () {
        this.removeLoader()
        this.busy = true
        this.$Loading.start()
        this.$http.get('/system/user/current').then(res => {
          this.error = null
          this.updateDetails(res)
          this.busy = false
        }).catch(() => {
          if (!this.error) this.error = {...this.$Err.notFound(false)}
        }).finally(() => {
          this.busy = false
          this.$Loading.finish()
        })
      },
      removeLoader: function () {
        if (this.loader != null) {
          clearTimeout(this.loader)
        }
      },
      modifyPassword: function () {
        this.password.modify = !this.password.modify
      },
      saveProfile: function () {
        if (this.$refs.profile) {
          this.profileError = ''
          this.$refs.profile.validate((valid) => {
            if (valid) {
              this.saving.profile = true
              this.$http.put('/system/user/current', {
                name: this.account.name,
                sex: this.account.sex
              }).then(res => {
                this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('个人资料'))
                this.updateDetails({name: res.name, sex: res.sex})
              }).catch((err) => {
                this.profileError = err.message || this.$C.MSG_COMM_UPDATE_FAIL.format('个人资料')
              }).finally(() => {
                this.saving.profile = false;
              })
            }
          })
        }
      },
      savePwd: function () {
        this.password.modifyPwdError = ''
        if (this.$refs.pwdeditor && this.password.modify === true) {
          this.$refs.pwdeditor.validate((valid) => {
            if (valid) {
              this.saving.pwd = true
              if (!this.account.id) this.$Message.error('用户信息获取失败，无法进行信息修改！')
              else {
                this.$http.put('/system/user/current/password', {
                  oldPassword: this.password.params.oldPassword,
                  newPassword: this.password.params.password
                }).then(res => {
                  this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('账户密码'))
                  this.password.modify = false
                }).catch(err => {
                  this.password.modifyPwdError = err.message || this.$C.MSG_COMM_UPDATE_FAIL.format('账户密码')
                }).finally(() => {
                  this.saving.pwd = false;
                })
              }
            }
          })
        }
      }
    },
    watch: {
      details (newv, oldv) {
        this.account = {...this.account, ...newv}
      }
    },
    beforeRouteLeave (to, from, next) {
      // stop your requests here
      // ...
      this.removeLoader()
      this.autoLoad = false
      next()
    }
  }
</script>

<style lang="less">
</style>
