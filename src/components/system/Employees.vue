<template>
  <div class="content-inner">
    <card dis-hover v-if="!this.$route.query.current">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>系统管理</Breadcrumb-item>
          <Breadcrumb-item>员工管理</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <Row type="flex" justify="space-between" align="middle">
        <Button id="system_employeesetting_btn_adduser" type="primary" @click="showAddUser">新增用户
        </Button>
        <Col>
          <Row type="flex">
            <Col style="margin-right: 10px;">
              <span>角色：</span>
              <Select style="width: 120px;" v-model="roleId" :clearable="true">
                <Option v-for="item in rolesList" :value="item.id" :key="item.name">{{ item.descr }}</Option>
              </Select>
            </Col>
            <Col style="margin-right: 10px;">
              <span>状态：</span>
              <Select style="width: 120px;" v-model="statusOptionValue">
                <Option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.text }}</Option>
              </Select>
            </Col>
            <Col style="margin-right: 10px;">
              <span>姓名/电话：</span>
              <Input v-model.trim="keywords" style="width: 120px;" placeholder="姓名/电话" @on-enter="getListFunc(1, keywords)"></Input>
            </Col>
            <Col>
              <Button @click="getListFunc(1, keywords)">搜索</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <div v-if="loadedSuccess" style="padding-bottom: 10px;width: 100%">
        <Table id="system_employeesetting_table_userlist" stripe :columns="titleData" :data="detailData"
               style="clear: both"></Table>
        <Page id="system_employeesetting_page_userlist" :total="total_num" show-elevator show-total
              style="float:right;margin:10px 0 0 0;"
              @on-change="pageChange" :page-size="10" size="small"></Page>
      </div>

      <error-view id="system_employeesetting_list_error" :error="listError" name="员工" @action="errorAction"
                  :loading="loadingList"></error-view>
      <div style="clear: both"></div>
    </card>
    <card dis-hover v-if="this.$route.query.current == 'edit-employee'">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>员工设置</Breadcrumb-item>
          <Breadcrumb-item>{{titleEdit}}</Breadcrumb-item>
        </Breadcrumb>
      </p>

      <row>
        <Form ref="userItem" :model="userItem" label-position="left" label-width="100" :rules="accountRules">
          <Form-item label="姓名" prop="name">
            <Input id="system_employeesetting_input_name" :maxlength="20" v-model.trim="userItem.name"
                    placeholder="请输入真实姓名">
            </Input>
          </Form-item>
          <Form-item label="性别" prop="sex">
            <Select id="system_employeesetting_input_sex" v-model="userItem.sex" placeholder="请选择性别">
              <Option value="0">男</Option>
              <Option value="1">女</Option>
            </Select>
          </Form-item>

          <Form-item label="角色" prop="roleId" v-if="userItem.id !== entUserID">
            <Select id="system_employeesetting_input_roleid" v-model.trim="userItem.roleId" placeholder="请选择">
              <Option v-for="item in rolesList" :value="item.id" :key="item.name">{{ item.descr }}</Option>
            </Select>
          </Form-item>

          <Form-item label="手机号" prop="mobile">
            <Input id="system_employeesetting_input_mobile" v-model.trim="userItem.mobile" :maxlength="11"
                    placeholder="请输入手机号码">
            </Input>
          </Form-item>

          <Form-item label="工号">
            <Input id="system_employeesetting_input_employeecode" :maxlength="20" v-model.trim="userItem.employeeCode"
                    placeholder="请输入工号">
            </Input>
          </Form-item>

          <Form-item label="邮箱" prop="email">
            <Input id="system_employeesetting_input_email" v-model.trim="userItem.email" placeholder="请填写邮箱地址">
            </Input>
          </Form-item>
          <div v-show="this.$route.query.st == 1">
            <Alert type="error" v-show="errorMessage.sub">{{errorMessage.sub}}</Alert>
            <Form-item>
              <Button id="system_employeesetting_btn_submit" type="primary" @click="editEmployee('userItem')"
                      :loading="employsetting.saving.submit">
                <span v-if="employsetting.saving.submit">正在保存</span>
                <span v-else>保存</span>
              </Button>
              <Button id="system_employeesetting_btn_editBack" style="margin-left: 8px"
                      @click="backList">取消
              </Button>
            </Form-item>
          </div>
          <div v-show="this.$route.query.st ==2">
            <Form-item label="密码" prop="passWord">
              <Input id="system_employeesetting_input_password" v-model.trim="userItem.passWord" :maxlength="16" style="width: 78%"
                      :placeholder="placeHolder">
              </Input>
              <Button style="float: left; width: 20%;position: absolute; right: 0; top: 1px" @click="resetPsw">重置
              </Button>
            </Form-item>
            <Alert type="error" v-show="errorMessage.sub">{{errorMessage.sub}}</Alert>
            <Alert type="error" v-show="errorMessage.psw">{{errorMessage.psw}}</Alert>
            <Form-item>
              <Button id="system_employeesetting_btn_send_pwd" type="primary" @click="passwordEdit('userItem')"
                    :loading="employsetting.saving.psw">
                <span v-if="employsetting.saving.psw">正在保存</span>
                <span v-else>保存</span>
              </Button>
              <Button id="system_employeesetting_btn_addBack" style="margin-left: 8px"
                    @click="backList">取消
              </Button>
            </Form-item>
          </div>
        </Form>
      </row>

      <div style="clear: both"></div>
    </card>
    <card dis-hover v-if="this.$route.query.current == 'change-password'">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>员工设置</Breadcrumb-item>
          <Breadcrumb-item>{{titleEdit}}</Breadcrumb-item>
        </Breadcrumb>
      </p>

      <row>
        <Form ref="userItem" :model="userItem" label-position="left"  :label-width="100" :rules="accountRules">
          <Form-item label="密码" prop="passWord" data-describe="点击重置按钮将为你生成并填写6位随机密码">
            <Row type="flex" justify="space-between">
              <Col>
                <Input id="system_employeesetting_input_password1" v-model.trim="userItem.passWord" :maxlength="16"
                   style="width: 410px;"
                   :placeholder="placeHolder" size="large">
                </Input>
              </Col>
              <Col>
                <Button @click="resetPsw" size="large">重置
                </Button>
              </Col>
            </Row>
          </Form-item>

          <div v-show="this.$route.query.current.st == 2">
            <Alert type="error" v-show="errorMessage.sub">{{errorMessage.sub}}</Alert>
            <Alert type="error" v-show="errorMessage.psw">{{errorMessage.psw}}</Alert>
          </div>
          <Form-item>
            <Button id="system_employeesetting_btn_send_changePwd" type="primary" @click="passwordEdit('userItem')"
                    :loading="employsetting.saving.psw">
              <span v-if="employsetting.saving.psw">正在保存</span>
              <span v-else>保存</span>
            </Button>
            <Button id="system_employeesetting_btn_changeBack" style="margin-left: 8px"
                    @click="backList">取消
            </Button>
          </Form-item>
        </Form>
      </row>

      <div style="clear: both"></div>
    </card>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        entUserID: '',
        listError: null,
        loadingList: true,
        loadedSuccess: false,
        keywords: '',
        rolesList: [],             // 角色列表
        errorMessage: {          // 短信和提交按钮错误显示
          psw: '',
          sub: ''
        },
        placeHolder: '',
        total_num: 0,        // 总条数
        titleEdit: '新增用户',
        LbuttonName: [],   // 根据返回数据确认按钮名是激活还是禁用
        RbuttonShow: [],   // 根据返回数据确认解锁按钮显示或隐藏
        selfShow: [],       // 为自己时隐藏禁用按钮
        employsetting: {    // 按钮loading
          saving: {
            psw: false,
            submit: false
          }
        },
        userItem: {
          name: '',
          sex: '',
          SEX: '',
          roleName: '',
          roleNAME: '',
          mobile: '',
          passWord: '',
          send_pwd: false,
          employeeCode: '',
          title: '',
          locked: false,
          lastLogin: null,
          status: 0,
          STATUS: '启用',
          openid: null,
          id: '',
          email: ''
        },
        accountRules: {
          name: [
            {required: true, message: '请填写员工姓名', trigger: 'blur'}
          ],
          roleId: [
            {required: true, message: '请选择用户角色', trigger: 'blur'}
          ],
          sex: [
            {required: true, message: '请选择性别', trigger: 'blur'}
          ],
          passWord: [
            {required: true, message: '请填写密码', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入联系人电话', trigger: 'blur'},
            {pattern: /^1\d{10}$/, message: '手机号码格式不正确，请重新输入', trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ]
        },
        titleData: [
          {
            title: '基础信息',
            render: (h, p) => {
              return h('div', [
                h('p', {style: {marginBottom: '8px'}}, `姓名：${p.row.name || '-'}`),
                h('span', '性别：'),
                h('span', ` ${p.row.SEX || '-'}`),

                h('span', {style: {width: '115px', display: 'inline-block'}}, [
                  h('span', {style: {marginLeft: '15px'}}, '角色：'),
                  h('span', p.row.roleNAME)
                ]),

                h('span', {style: {width: '100px', display: 'inline-block'}}, [
                  h('Icon', {props: {type: 'ios-telephone'}, style: {marginLeft: '10px'}}),
                  h('span', p.row.mobile)
                ]),

                h('span', {style: {}}, [
                  h('span', {style: {marginLeft: '8px'}}, ' 最近登录：'),
                  h('span', ` ${p.row.lastLogin || '-'}`)
                ])
              ])
            }
          },
          {
            title: '状态',
            width: 70,
            key: 'STATUS'
          },
          {
            title: '锁定',
            width: 80,
            key: 'locked'
          },
          {
            title: ' ',
            key: 'action',
            width: 260,
            align: 'right',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  on: {
                    click: () => {
                      this.showEditUser(params.row)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  on: {
                    click: () => {
                      this.changePassword(params.row)
                    }
                  }
                }, '密码'),
                h('Button', {
                  style: {
                    display: this.RbuttonShow[params.index]
                  },
                  on: {
                    click: (evt) => {
                      var RbuttonShow = this.RbuttonShow.slice(0)
                      if (RbuttonShow[params.index] === 'inline-block') {
                        this.$http.put('/system/user/' + params.row.id + '/locked', {locked: 0}).then((res) => {
                          this.$Message.success('解锁用户成功')
                          RbuttonShow[params.index] = 'none'
                          this.RbuttonShow = RbuttonShow
                          var testArray = this.detailData.slice(0)
                          testArray[params.index].locked = '正常'
                          this.detailData = testArray
                        }).catch((res) => {
                          this.$Message.error(res.message)
                        })
                      } else {
                        RbuttonShow[params.index] = 'inline-block'
                      }
                      evt.stopPropagation()
                    }
                  }
                }, '解锁'),
                h('Button', {
                  style: {
                    display: this.selfShow[params.index]
                  },
                  on: {
                    click: (evt) => {
//                      深拷贝
                      var LbuttonName = this.LbuttonName.slice(0)
                      if (LbuttonName[params.index] === '激活') {
                        this.$http.put('/system/user/' + params.row.id + '/status', {status: 1}).then((res) => {
                          this.$Message.success('激活员工账户成功')
                          LbuttonName[params.index] = '禁用'
                          this.LbuttonName = LbuttonName.slice(0)
                          var testArray = this.detailData.slice(0)
                          testArray[params.index].STATUS = '启用'
                          this.detailData = testArray
                        }).catch((res) => {
                          this.$Message.error(res.message)
                        })
                      } else {
                        this.$http.put('/system/user/' + params.row.id + '/status', {status: 0}).then((res) => {
                          this.$Message.success('禁用员工账户成功')
                          LbuttonName[params.index] = '激活'
                          this.LbuttonName = LbuttonName.slice(0)
                          var testArray = this.detailData.slice(0)
                          testArray[params.index].STATUS = '禁用'
                          this.detailData = testArray
                        }).catch((res) => {
                          this.$Message.error(res.message)
                        })
                      }
                      evt.stopPropagation()
                    }
                  }
                }, this.LbuttonName[params.index])
              ]);
            }
          }
        ],
        detailData: [],
        statusOptions: [
          { value: -1, text: '全部' },
          { value: 0, text: '禁用' },
          { value: 1, text: '启用' }
        ],
        statusOptionValue: -1,
        roleId: null
      }
    },
    methods: {
      showAddUser: function () {
        this.listError = null
        this.loadedSuccess = true
        this.titleEdit = '新增用户'
        this.placeHolder = '填入初始密码'
        this.userItem = {
          name: '',
          sex: '0',
          roleId: '',
          mobile: '',
          employeeCode: '',
          title: '',
          locked: false,
          lastLogin: null,
          status: 1,
          openid: null,
          id: '',
          email: '',
          passWord: Math.random().toString(16).split('.')[1].slice(0, 6),
          send_pwd: false
        }
        this.errorMessage = {                               //  清空之前的alert提示
          psw: '',
          sub: ''
        }
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'edit-employee',
            st: 2
          }
        })
      },
      showEditUser: function (item) {
        this.titleEdit = '编辑用户'
        this.placeHolder = '请填入新密码'
        this.errorMessage = {                               //  清空之前的alert提示
          psw: '',
          sub: ''
        }
        this.userItem = item
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'edit-employee',
            st: 1,
            id: item.id
          }
        })
      },
      changePassword: function (item) {
        this.titleEdit = '修改密码'
        this.placeHolder = '请填入新密码'
        this.errorMessage = {                               //  清空之前的alert提示
          psw: '',
          sub: ''
        }
        this.userItem = item
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'change-password',
            id: item.id
          }
        })
      },
      editEmployee: function (name) {
        this.errorMessage = {                               //  清空之前的alert提示
          psw: '',
          sub: ''
        }
        // 编辑用户时逐项验证
        var rulesArray = ['name', 'roleId', 'mobile', 'sex', 'email']
        if (this.userItem.id === this.entUserID) {
          rulesArray = ['name', 'mobile', 'sex', 'email']
        }
        var editValid = true
        for (var i in rulesArray) {
          this.$refs[name].validateField(rulesArray[i], (valid) => {
            if (valid) {
              editValid = false
            }
          })
        }
        if (editValid) {
          this.employsetting = {    // 按钮loading
            saving: {
              psw: false,
              submit: true
            }
          }
          var updateData = {}
          updateData.name = this.userItem.name
          updateData.sex = this.userItem.sex
          updateData.mobile = this.userItem.mobile
          updateData.employeeCode = this.userItem.employeeCode
          updateData.title = this.userItem.title
          updateData.email = this.userItem.email
          updateData.roleId = this.userItem.roleId
          this.$http.put('/system/user/' + this.userItem.id, updateData).then((res) => {
            this.$Message.success('编辑用户信息成功')
            this.getListFunc(1)
            this.backList()
          }).catch((res) => {
//            this.errorMessage.sub = res.message
            this.errorMessage = {                               //  清空之前的alert提示
              psw: '',
              sub: res.message
            }
//            this.$Message.error(res.message)
          }).finally(() => {
            this.employsetting = {    // 按钮loading
              saving: {
                psw: false,
                submit: false
              }
            }
          })
        }
      },
      passwordEdit: function (name) {
//        this.errorMessage.psw = false
        this.errorMessage = {                               //  清空之前的alert提示
          psw: '',
          sub: ''
        }
        if (this.$route.query.st === 2) {
          // 添加用户时全部验证
          this.$refs[name].validate((valid) => {
            if (valid) {
              this.employsetting = {    // 按钮loading
                saving: {
                  psw: false,
                  submit: true
                }
              }
              var updateData = {}
              updateData.name = this.userItem.name
              updateData.sex = this.userItem.sex
              updateData.mobile = this.userItem.mobile
              updateData.employeeCode = this.userItem.employeeCode
              updateData.title = this.userItem.title
              updateData.email = this.userItem.email
              updateData.roleId = this.userItem.roleId
              updateData.send_pwd = (() => this.userItem.send_pwd ? '1' : '0')()
              updateData.password = this.userItem.passWord
              updateData.mobile = this.userItem.mobile
              this.$http.post('/system/user', updateData).then((res) => {
                this.$Message.success('添加用户成功')
                this.getListFunc(1)
                this.backList()
              }).catch((res) => {
//                this.errorMessage.sub = res.message
                this.errorMessage = {                               //  清空之前的alert提示
                  psw: res.message,
                  sub: ''
                }
              }).finally(() => {
                this.employsetting = {    // 按钮loading
                  saving: {
                    psw: false,
                    submit: false
                  }
                }
              })
            }
          })
        } else {
          // 修改密码时单独验证
          this.$refs[name].validateField('passWord', (valid) => {
            if (!valid) {
              this.employsetting = {    // 按钮loading
                saving: {
                  psw: true,
                  submit: false
                }
              }
              this.$http.put('/system/user/' + this.userItem.id + '/password', {
                password: this.userItem.passWord,
                mobile: this.userItem.mobile,
                send_pwd: (() => this.userItem.send_pwd ? '1' : '0')()
              }).then((res) => {
                this.$Message.success('修改用户密码成功')
                this.backList()
              }).catch((res) => {
                this.errorMessage.psw = res.message
//                this.$Message.error(res.message)
              }).finally(() => {
                this.employsetting = {    // 按钮loading
                  saving: {
                    psw: false,
                    submit: false
                  }
                }
              })
            }
          })
        }
      },
      backList: function () {
        this.errorMessage = {
          psw: '',
          sub: ''
        }
        this.$router.push({
          path: this.$route.path
        })
      },
      errorAction: function () {
        if (this.listError.type === this.$ErrType.UNHANDLED) {
          this.getListFunc(1)
        } else {
          this.showAddUser()
        }
      },
      getListFunc: function (page, word) {
        this.loadingList = true
        let postData = {
          _loading: true,
          'page': page,
          'size': 10,
          'orderBy': [
            {
              'property': 'createdTime',
              'order': 'desc'
            }
          ],
          queryFilter: []
        }
        if (word) {
          postData.wd = word
        }

        if (this.statusOptionValue !== -1) {
          postData.queryFilter.push({
            property: 'status',
            op: '=',
            value: this.statusOptionValue
          })
        }

        if (this.roleId) {
          postData.queryFilter.push({
            property: 'roleId',
            op: '=',
            value: this.roleId
          })
        }

        this.$http.post(`/system/user/search`, postData).then((res) => {
          this.listError = null
          this.loadedSuccess = true
          this.detailData = res.content
          if (res.content.length < 1) {
            this.loadedSuccess = false
            this.listError = {title: '没有相关员工', content: `没有找到相关的员工，您可以添加员工或者换个关键词试试`}
            return
          }
          var showBtn = []
          var banBtn = []
          var selfBtn = []
          for (var i in this.detailData) {
            if (this.detailData[i].sex === '0') {
              this.detailData[i].SEX = '男'
            } else if (this.detailData[i].sex === '1') {
              this.detailData[i].SEX = '女'
            } else {
              this.detailData[i].SEX = '-'
            }
            if (this.detailData[i].openid === null) {
              this.detailData[i].openid = ' 未绑定'
            } else {
              this.detailData[i].openid = ' 已绑定'
            }
            if (this.detailData[i].locked === false) {
              this.detailData[i].locked = '正常'
              showBtn.push('none')
            } else {
              showBtn.push('inline-block')
              this.detailData[i].locked = '已锁'
            }
            if (this.detailData[i].status === 1) {
              this.detailData[i].STATUS = '启用'
              banBtn.push('禁用')
            } else {
              this.detailData[i].STATUS = '禁用'
              banBtn.push('激活')
            }

            // 从用户权限映射到用户名称
            for (let m in this.rolesList) {
              if (this.detailData[i].roleId === this.rolesList[m].id) {
                this.detailData[i].roleNAME = this.rolesList[m].descr
              }
            }

            if (this.detailData[i].id === this.entUserID) {    // 当用户为自己时隐藏按钮
              selfBtn.push('none')
            } else {
              selfBtn.push('inline-block')
            }

            this.detailData[i].lastLogin = this.timeFormat(this.detailData[i].lastLogin)
          }
          this.LbuttonName = banBtn
          this.RbuttonShow = showBtn
          this.selfShow = selfBtn
          this.total_num = res.totalCount
        }).catch((res) => {
          this.listError = {...this.$Err.unhandled()}
          this.loadedSuccess = false
        }).finally(() => {
          this.loadingList = false
        })
      },
      pageChange: function (page) {
        this.getListFunc(page)
      },
      timeFormat: function (time) {
        if (time) {
          let newDate = new Date(time);
          return newDate.toLocaleString()
        } else {
          return null
        }
      },
      resetPsw: function () {
        var copyUserItem = {...this.userItem}
        copyUserItem.passWord = Math.random().toString(16).split('.')[1].slice(0, 6)
        this.userItem = copyUserItem
      }
    },
    mounted: function () {
      this.$http.get(`/system/user/roles`).then((res) => {
        this.rolesList = res
        this.getListFunc(1)
      }).catch((res) => {
        this.$Message.error('获取角色列表失败')
      })
      this.$http.get(`system/user/current`).then((res) => {
        this.entUserID = res.id
      }).catch((res) => {
//        this.$Message.error('获取entid失败')
      })

      if (this.$route.query.id) {
        this.titleEdit = '编辑用户';
        this.$http.get(`system/user/${this.$route.query.id}`).then((res) => {
          this.userItem = res
        }).catch((res) => {
          this.$Message.error('获取编辑用户信息失败')
        })
      }
    }
  }
</script>

<style scoped>
</style>>
