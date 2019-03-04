<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <Breadcrumb-item>经销商管理</Breadcrumb-item>
        <Breadcrumb-item v-for="(item, index) in breads" :value="item.id" :key="index" @click.native="native(item)"
                         :id="item.id">{{item.name}}
        </Breadcrumb-item>
      </Breadcrumb>
    </p>
    <div v-if="setType === 0">
      <!-- <Row type="flex" justify="space-between" v-if="$route.query.parentid">
        <i-col>
          <Button type="primary" @click="back" id="dealer_manage_back">返回</Button>
          <Button type="primary" @click="createSubDealer({id: $route.query.parentid, name: $route.query.name ,parentId: $route.query.parentid})" id="dealer_manage_create">新增经销商</Button>
        </i-col>
        <i-col></i-col>
        <i-col class="v-inline">
        </i-col>
      </Row> -->
      <Row type="flex" justify="space-between">
        <i-col>
          <Button v-if="!$route.query.parentid" type="primary" @click="create" id="dealer_manage_create">新增经销商</Button>
          <Button v-if="$route.query.parentid" type="primary" @click="back" id="dealer_manage_back">返回</Button>
          <Button v-if="$route.query.parentid" type="primary"
                  @click="createSubDealer({id: $route.query.parentid, name: $route.query.name ,parentId: $route.query.parentid})"
                  id="dealer_manage_create">新增经销商
          </Button>
        </i-col>
        <i-col></i-col>
        <i-col class="v-inline">
          <div class="state">
            <Select v-model="setter.status" placeholder="状态" style="width: 100px;" id="dealer_manage_status">
              <Option v-for="item in statusList" :value="item.code" :key="item.code">{{ item.name }}</Option>
            </Select>
          </div>
          <div>
            <Input id="dealer_manage_keyword" v-model.lazy.trim="setter.name" placeholder="请输入经销商名称"
                   @on-enter="queryByManual">
            <Button id="dealer_manage_query" slot="append" @click="queryByManual" :loading="busy">搜索</Button>
            </Input>
          </div>
        </i-col>
      </Row>
      <Table id="dealer_manage_list" stripe :columns="list.columns" :data="list.store" v-if="!error"></Table>

      <Row type="flex" justify="end" class="foot-pager" v-if="!error">
        <Page :total="list.total" :current="list.page" :page-size="list.size" size="small" :show-total="true"
              @on-change="queryByPage"></Page>
      </Row>
    </div>
    <div v-if="setType === 1">
      <Form v-if="model" ref="editor" :model="model" :rules="rules" label-position="left" :label-width="100">
        <Form-item label="经销商名称" prop="name" data-describe="不能和已有经销商名称相同">
          <div class="name">
            <Input size="large" id="dealer_manage_name" v-model.trim="model.name" placeholder="请输入经销商名称"
                   :maxlength="50"></Input>
          </div>
        </Form-item>
        <Form-item label="公司名称" prop="company">
          <div class="company">
            <Input size="large" id="dealer_manage_company" v-model.trim="model.company" placeholder="请输入公司名称"
                   :maxlength="50"></Input>
          </div>
        </Form-item>
        <Form-item label="代理区域">
          <Button @click="addDealerArea">添加代理区域</Button>
          <div v-for="(p, inx) in model.dealerAgentAreaList" class="dealer-agent-item" :key="p.id">
            <city-picker :multiple="false" :leafOnly="false" :city.sync="p.city" :province.sync="p.province"
                         :area.sync="p.area" :fullPath="true" :clearable="false" size="large"></city-picker>
            <Button type="warning" size="large" @click="removeDealerArea(inx)">删除</Button>
          </div>
        </Form-item>
        <Form-item label="经销商编号" prop="code">
          <div class="code">
            <Input size="large" id="dealer_manage_code" v-model.trim="model.code" placeholder="请输入经销商编号"
                   :maxlength="20"></Input>
          </div>
        </Form-item>
        <Form-item label="经销商描述" prop="info">
          <div class="info">
            <Input size="large" id="dealer_manage_info" v-model.trim="model.info" placeholder="请输入经销商描述"
                   :maxlength="100"></Input>
          </div>
        </Form-item>
        <Form-item label="注册用户名" prop="userName" data-describe="不能和已有用户名称相同，此项用于员工在微信公众号绑定经销商使用">
          <div class="userName">
            <Input size="large" id="dealer_manage_userName" v-model.trim="model.userName" placeholder="请输入注册用户名"
                   :maxlength="20"></Input>
          </div>
        </Form-item>
        <Form-item label="注册密码" prop="password" data-describe="此项用于员工在微信公众号绑定经销商使用，只能输入数字或者字母">
          <div class="password">
            <Input size="large" id="dealer_manage_password" v-model.trim="model.password" placeholder="请输入注册密码"
                   :maxlength="50"></Input>
          </div>
        </Form-item>
        <Form-item label="请选择地址" prop="province">
          <city-picker :multiple="false" :leafOnly="true" :province.sync="model.province"
                       :provinceName.sync="model.provinceName"
                       :city.sync="model.city" :cityName="model.cityName"
                       :area.sync="model.areaCode" :areaName.sync="model.areaName"
                       :fullPath="true" :clearable="false" size="large"></city-picker>
        </Form-item>
        <Form-item label="详细地址" prop="address">
          <div class="address">
            <Input size="large" id="dealer_manage_address" v-model.trim="model.address" placeholder="请输入详细地址"
                   :maxlength="100"></Input>
          </div>
        </Form-item>
        <Form-item label="联系人姓名" prop="contacter">
          <div class="contacter">
            <Input size="large" id="dealer_manage_contacter" v-model.trim="model.contacter" placeholder="请输入联系人姓名"
                   :maxlength="20"></Input>
          </div>
        </Form-item>
        <Form-item label="联系人电话" prop="phone" data-describe="手机号码或者座机号(xxx-xxxxxxx)">
          <div class="phone">
            <Input size="large" id="dealer_manage_phone" v-model.trim="model.phone" placeholder="请输入联系人电话"
                   :maxlength="20"></Input>
          </div>
        </Form-item>
      </Form>
      <Button type="primary" size="large" @click="save" :loading="busy" id="dealer_managed_save">保存</Button>
      <Button size="large" @click="back" id="dealer_managed_back">取消</Button>
    </div>
    <div v-show="setType === 2">
      <Row type="flex" justify="space-between">
        <i-col>
          <Button type="primary" @click="back" id="dealer_manage_staff_back">返回</Button>
        </i-col>
        <i-col></i-col>
        <i-col class="v-inline">
          <div>
            <Input id="dealer_staff_manage_keyword" v-model.lazy.trim="setterStaff.name" placeholder="请输入员工姓名"
                   @on-enter="queryStaffByManual">
            <Button id="dealer_staff_manage_query" slot="append" @click="queryStaffByManual" :loading="busy">搜索</Button>
            </Input>
          </div>
        </i-col>
      </Row>
      <Table id="staff_list" stripe :columns="staffList.columns" :data="staffList.store" v-if="!error"></Table>

      <Row type="flex" justify="end" class="foot-pager" v-if="!error">
        <Page :total="staffList.total" :current="staffList.page" :page-size="staffList.size" size="small"
              :show-total="true"
              @on-change="queryStaffByPage"></Page>
      </Row>
    </div>
    <div v-if="setType === 3">
      <Row type="flex" justify="space-between" style="marginBottom:10px;">
        <i-col>
          <Button type="primary" size="large" @click="back" id="dealer_manage_back">返回</Button>
        </i-col>
        <i-col></i-col>
        <i-col></i-col>
      </Row>
      <Form :model="staffModel" label-position="right">
        <Form-item label="员工姓名" prop="name">
          <Input id="staff_name" v-model="staffModel.name" readonly></Input>
        </Form-item>
        <Form-item label="员工编号" prop="code">
          <Input id="staff_code" v-model="staffModel.code" readonly></Input>
        </Form-item>
        <Form-item label="电话号码" prop="phone">
          <Input id="staff_phone" v-model="staffModel.phone" readonly></Input>
        </Form-item>
        <Form-item label="性别" prop="sex">
          <RadioGroup v-model="staffModel.sex">
            <Radio label="男" disabled>男</Radio>
            <Radio label="女" disabled>女</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="角色" prop="role" :disabled="staffModel.role == 0">
          <RadioGroup v-model="staffModel.role">
            <Radio label="0" disabled>普通员工</Radio>
            <Radio label="1" disabled>管理员</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </div>
    <error-view v-if="error && setType===0" :error="error" name="经销商" @action="errorAction" @cancel="errorCancel"
                :loading="busy" id="delear_error"></error-view>
    <error-view v-if="error && setType===2" :error="error" name="员工" @action="errorAction" @cancel="errorCancel"
                :loading="busy" id="staff_error"></error-view>
  </Card>
</template>

<script>
  export default {
    data () {
      const validatePassword = (rule, value, callback) => {
        const reg = /^[0-9a-zA-Z]*$/g;
        if (!reg.test(value)) {
          callback(new Error('密码输入不合法'));
        } else {
          callback();
        }
      };
      const validateMobile = (rule, value, callback) => {
        const mobile = /^1[3|5|8|7]\d{9}$/;
        const phone = /^0\d{2,3}-\d{7,8}$/;
        if (!(mobile.test(value) || phone.test(value))) {
          callback(new Error('请输入正确的手机号码'));
        } else {
          callback();
        }
      };
      const checkname = (rule, value, callback) => {
        // 是否是编辑
        if (this.$route.query.method === 'edit') {
          // 编辑
          if (this.model.name !== this.oldName) {
            this.busy = true;
            this.$http.post(`/system/dealer/checkname`, {property: 'name', value: value}).then(res => {
              if (!res) {
                callback(new Error('该经销商名称已存在！'));
                // this.$Message.error('该经销商名称已存在！')
              } else {
                callback();
              }
            }).catch(res => {
              this.$Message.error('检查异常')
            }).finally(() => {
              this.busy = false
            })
          } else {
            callback();
          }
        } else if (this.$route.query.method === 'add') {
          // 新增
          this.busy = true;
          this.$http.post(`/system/dealer/checkname`, {property: 'name', value: value}).then(res => {
            if (!res) {
              callback(new Error('该经销商名称已存在！'));
              // this.$Message.error('该经销商名称已存在！')
            } else {
              callback();
            }
          }).catch(res => {
            this.$Message.error('检查异常')
          }).finally(() => {
            this.busy = false
          })
        }
      };
      const checkusername = (rule, value, callback) => {
        if (this.$route.query.id && !this.$route.query.parentid) {
          if (this.model.userName !== this.oldUserName) {
            this.busy = true;
            this.$http.post(`/system/dealer/checkname`, {property: 'userName', value: value}).then(res => {
              if (!res) {
                callback(new Error('该注册用户名已存在！'));
                // this.$Message.error('该注册用户名已存在！')
              } else {
                callback();
              }
            }).catch(res => {
              this.$Message.error('检查异常')
            }).finally(() => {
              this.busy = false
            })
          } else {
            callback();
          }
        } else if (!this.$route.query.id && !this.$route.query.parentid || this.$route.query.id && this.$route.query.parentid) {
          this.busy = true;
          this.$http.post(`/system/dealer/checkname`, {property: 'userName', value: value}).then(res => {
            if (!res) {
              callback(new Error('该注册用户名已存在！'));
              // this.$Message.error('该注册用户名已存在！')
            } else {
              callback();
            }
          }).catch(res => {
            this.$Message.error('检查异常')
          }).finally(() => {
            this.busy = false
          })
        }
      };
      return {
        comfirmId: '',
        isSubset: false,
        deep: {},
        allBreads: [],
        id: '',
        breads: JSON.parse(window.sessionStorage.getItem('breads')) || [{id: 'isnull', name: '经销商信息维护'}],
        hasdata: false,
        cityList: [],
        oldName: '',
        oldUserName: '',
        dealers: [],
        dealerselect: [],
        provinceList: [],
        streetList: [],
        treedata: [],
        dealearProList: [],
        dealearCityList: [],
        rules: {
          name: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: checkname, trigger: 'blur'}
          ],
          company: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          info: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          province: [
            {required: true, message: '不能为空', trigger: 'change'}
          ],
          city: [
            {required: true, message: '不能为空', trigger: 'change'}
          ],
          areaCode: [
            {required: true, message: '不能为空', trigger: 'change'}
          ],
          password: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: validatePassword, trigger: 'blur'}
          ],
          userName: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: checkusername, trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: validateMobile, trigger: 'blur'}
          ],
          contacter: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ]
        },
        error: null,
        busy: false,
        setType: 0,
        statusList: [
          {code: '0', name: '正常'},
          {code: '1', name: '停用'},
          {code: '', name: '全部'}
        ],
        model: {},
        setter: {
          name: '',
          status: ''
        },
        setterStaff: {
          name: ''
        },
        staffModel: {},
        staffList: {
          name: '',
          page: 1,
          size: 10,
          total: 0,
          status: '',
          columns: [{
            title: '编号',
            key: 'code',
            width: 80
          }, {
            title: '角色',
            key: 'code',
            width: 90,
            render: (h, p) => {
              return h('div', [
                h('p', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.role === '0' ? '普通员工' : '管理员')
              ])
            }
          }, {
            title: '员工信息',
            render: (h, p) => {
              return h('div', [
                h('p', {style: {marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis'}}, p.row.name),
                h('span', {style: {paddingRight: '12px'}}, p.row.sex),
                h('Icon', {props: {type: 'iphone'}}),
                h('span', {style: {paddingRight: '12px'}}, p.row.phone),
                h('Icon', {props: {type: 'clock'}}),
                h('span', ` ${new Date(p.row.createdTime).toLocaleString()}`)
              ])
            }
          }, {
            title: ' ',
            width: 200,
            render: (h, p) => {
              return h('Button-group', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.staffDetail(p.row)
                    }
                  }
                }, '详细'),
                h('Button', {
                  props: {
                    disabled: p.row.role === '1',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.setRole(p.row)
                    }
                  }
                }, '设为管理员'),
                h('Button', {
                  props: {
                    disabled: p.row.role === '1',
                    type: 'warning',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.removeStaff(p.row)
                    }
                  }
                }, '删除')
              ])
            }
          }],
          store: []
        },
        list: {
          name: '',
          page: 1,
          size: 10,
          total: 0,
          status: '',
          columns: [{
            title: '经销商名称',
            key: 'name',
            width: 160
          }, {
            title: '联系人',
            key: 'contacter',
            width: 80
          }, {
            title: '状态',
            width: 80,
            render: (h, p) => {
              return h('div', [
                h('span', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.status === '0' ? '正常' : '停用')
              ])
            }
          }, {
            title: '信息',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', {
                  style: {
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.provinceName + p.row.cityName + p.row.areaName + p.row.address),
                h('Icon', {props: {type: 'iphone'}}),
                h('span', {style: {paddingRight: '12px'}}, p.row.phone),
                h('Icon', {props: {type: 'clock'}}),
                h('span', ` ${new Date(p.row.createdTime).toLocaleString()}`),
                h('p', {
                  style: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, p.row.company || '无公司信息')
              ])
            }
          }, {
            title: '员工信息',
            width: 90,
            render: (h, p) => {
              return h('Button-group', [
                h('Button', {
                  props: {
                    size: 'small',
                    disabled: p.row.status !== '0'
                  },
                  on: {
                    click: () => {
                      this.staffManage(p.row)
                    }
                  }
                }, '员工管理')
              ])
            }
          }, {
            title: '下级经销商',
            width: 140,
            render: (h, p) => {
              return h('Button-group', [
                h('Button', {
                  props: {
                    size: 'small',
                    disabled: p.row.dealerLevel === 3 || p.row.status !== '0'
                  },
                  on: {
                    click: () => {
                      this.createSubDealer(p.row)
                    }
                  }
                }, '新增'),
                h('Button', {
                  props: {
                    size: 'small',
                    disabled: p.row.dealerLevel === 3
                  },
                  on: {
                    click: () => {
                      this.querySubDealer(p.row)
                    }
                  }
                }, '查看')
              ])
            }
          }, {
            title: '操作',
            width: 180,
            render: (h, p) => {
              return h('Button-group', [
                h('Button', {
                  props: {
                    disabled: p.row.status === 1,
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.toggleStatus(p.row)
                    }
                  }
                }, p.row.status === '0' ? '停用' : '启用'),
                h('Button', {
                  props: {
                    size: 'small',
                    disabled: p.row.status !== '0'
                  },
                  on: {
                    click: () => {
                      this.editDaeler(p.row)
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(p.row)
                    }
                  }
                }, '删除')
              ])
            }
          }],
          store: []
        }
      }
    },
    methods: {
      arrRepeat: function (arr1) {
        if (arr1.length === 2) {
          for (let i = 0; i < arr1.length; i++) {
            for (let j = 1; j < arr1.length; j++) {
              if (arr1[i].x === arr1[j].x) {
                arr1.splice(j, 1)
              }
            }
          }
        } else {
          for (let i = 0; i < arr1.length; i++) {
            for (let j = 1; j < arr1.length - 1; j++) {
              if (arr1[i].x === arr1[j].x) {
                arr1.splice(j, 1)
              }
            }
          }
        }
      },
      addDealerArea: function () {
        this.model.dealerAgentAreaList.push({
          id: this.$uuid(),
          province: '110000',
          city: '110100',
          area: '110101'
        })
      },
      removeDealerArea: function (inx) {
        this.model.dealerAgentAreaList.splice(inx, 1)
      },
      native: function (r) {
        if (this.setType === 0) {
          this.$router.push({
            path: this.$route.path,
            query: {
              parentid: r.id,
              name: r.name
            }
          })
        }
      },
      setRole: function (r) {
        if (r && r.id) {
          this.$Modal.confirm({
            title: '设置管理员',
            content: `您正在设置【${r.name || '未命名'}】员工为管理员，旧管理员将要被替换，确定吗？`,
            onOk: () => {
              this.$http.put(`/system/employee/${r.id}`).then(res => {
                this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('管理员'))
                this.queryStaff()
              }).catch(res => {
                this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('管理员'))
              })
            }
          })
        }
      },
      staffDetail: function (r) {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 3,
            staffid: r.id,
            dealerid: r.dealerId,
            name: r.name
          }
        })
      },
      querySubDealer: function (r) {
        this.list.page = 1;
        this.$router.push({
          path: this.$route.path,
          query: {
            parentid: r.id,
            name: r.name
          }
        })
      },
      createSubDealer: function (r) {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 1,
            parentid: r.id,
            id: r.id,
            name: r.name,
            method: 'add'
          }
        })
      },
      staffManage: function (r) {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 2,
            id: r.id,
            name: r.name
          }
        })
      },
      genTreeData: function (source, target, parentId = null, level = 0) {
        for (let s of source) {
          if (s.parentId === parentId) {
            let o = Object.assign({}, s, {children: [], level: level, title: s.name})
            target.push(o)
            this.genTreeData(source, o.children, s.id, level + 1)
          }
        }
      },
      initTreeData: function () {
        this.$http.post(`/system/dealers/list`, {wd: ''}).then((res) => {
          if (res.length === 0) {
            this.error = this.$Err.noData()
          } else {
            let ds = []
            this.genTreeData(res, ds)
            this.dealers = ds
          }
        }).catch((res) => {
          this.error = this.$Err.unhandled()
        })
      },
      getdealers: function (q) {
        let o = {
          _loading: true,
          page: 1,
          size: 20,
          orderBy: [{property: 'name', order: 'desc'}],
          queryFilter: []
        }
        o.queryFilter.push({property: 'name', op: 'like', value: q})
        this.$http.post(`/system/dealers`, o).then((res) => {
          if (res.length === 0) {
            // this.error = this.$Err.noData()
          } else {
            this.dealerselect = res.content
          }
        }).catch((res) => {
          this.$Message.error('获取经销商失败')
        })
      },
      /**
       * 对当前路由进行分析，然后进行分流处理
       */
      shunt: function () {
        let qs = this.$route.query
        let st = qs ? (parseInt(qs.st) || 0) : 0
        this.setType = st
        if (this.setType === 0) {
          if (this.$route.query.parentid === 'isnull') {
            this.$router.push({
              path: '/dealer/manage'
            })
          } else {
            this.setterStaff = {}
            this.setter = {}
            this.query()
          }
        } else if (this.setType === 1 && this.$route.query.id && !this.$route.query.parentid) {
          // 编辑
          this.queryByid()
        } else if (this.setType === 1 && !this.$route.query.id) {
          // 新增一级
          this.model = {
            dealerAgentAreaList: [{
              id: this.$uuid(),
              province: '110000',
              city: '110100',
              area: '110101'
            }]
          }

          this.breads.push({
            id: '',
            name: '新增一级经销商'
          })
        } else if (this.setType === 1 && this.$route.query.parentid) {
          // 新增下级
          this.model = {
            dealerAgentAreaList: [{
              province: '110000',
              city: '110100',
              area: '110101'
            }]
          }
          this.model.parentId = this.$route.query.parentid
          if (this.$route.query.parentid) {
            let inx = this.breads.findIndex(breads => breads.id === this.$route.query.parentid);
            if (inx === -1) {
              this.breads.push({
                id: this.$route.query.parentid,
                name: this.$route.query.name
              })
              this.breads.push({
                id: 'add',
                name: '新增下级经销商'
              })
            } else {
              this.breads.splice(inx + 1, 1)
            }
          } else if (!this.$route.query.parentid) {
            this.breads = [{
              id: 'isnull',
              name: '经销商信息维护'
            }]
          }
          window.sessionStorage.setItem('breads', JSON.stringify(this.breads))
        } else if (this.setType === 2) {
          if (this.$route.query.id) {
            let inx = this.breads.findIndex(breads => breads.id === this.$route.query.id);
            if (inx === -1) {
              this.breads.push({
                id: this.$route.query.id,
                name: this.$route.query.name
              })
              this.breads.push({
                id: 'sta',
                name: '员工管理'
              })
            } else {
              this.breads.splice(inx + 2, 1)
            }
          }
          this.queryStaff()
        } else if (this.setType === 3) {
          if (this.$route.query.staffid) {
            this.breads.push({
              id: this.$route.query.staffid,
              name: this.$route.query.name
            })
          } else {

          }
          this.queryStaffById()
        }
      },
      queryStaffById: function () {
        this.$http.get(`/system/employee/${this.$route.query.staffid}`).then(res => {
          if (res.id) {
            this.staffModel = res;
          } else {
            this.error = this.$Err.noData()
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
        })
      },
      queryByid: function () {
        this.model = null
        this.$http.get(`/system/dealer/${this.$route.query.id}`).then(res => {
          if (res.id) {
            this.error = null
            this.model = res;
            this.oldUserName = res.userName;
            this.oldName = res.name;
            this.breads.push({
              id: this.model.id,
              name: this.model.name
            })
            this.breads.push({
              id: 'edit',
              name: '编辑经销商'
            })
          } else {
            this.error = this.$Err.noData()
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
        })
      },
      create: function () {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 1,
            method: 'add'
          }
        })
      },
      toggleStatus: function (r) {
        let o = {
          txt: r.status === '0' ? '停用' : '启用',
          status: r.status === '0' ? '1' : '0'
        }
        if (r && r.id) {
          var id = this.$uuid()
          this.comfirmId = id;
          this.$Modal.confirm({
            title: `${o.txt}销商`,
            content: `您正在${o.txt}【${r.name || '未命名'}】经销商，确定要${o.txt}吗？${(r.dealerLevel === 1 || r.dealerLevel === 2) ? `</br><input id="${id}"style="position:relative;top:2px" type="checkbox"/>${o.txt}所有下级经销商` : ''}`,
            onOk: () => {
              this.$http.put(`/system/dealer/${r.id}/status`, {
                status: o.status,
                isSubset: r.dealerLevel === 3 ? false : document.getElementById(id).checked
              }).then(res => {
                this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('经销商'))
                this.query()
              }).catch(res => {
                if (res.code === 'DEALER_STATUS_FAILED') {
                  this.$Message.error(res.message)
                } else {
                  this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('经销商'))
                }
              })
            }
          })
        }
      },
      removeStaff: function (r) {
        if (r && r.id) {
          this.$Modal.confirm({
            title: '删除员工',
            content: `您正在删除【${r.name || '未命名'}】员工，删除后无法恢复，确定要删除吗？`,
            onOk: () => {
              this.$http.delete(`/system/employee/${r.id}/status`).then(res => {
                this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('员工'))
                this.staffList.store = [];
                this.staffList.page = 1;
                this.queryStaff()
              }).catch(res => {
                this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('员工'))
              })
            }
          })
        }
      },
      remove: function (r) {
        if (r && r.id) {
          this.$Modal.confirm({
            title: '删除销商',
            content: `您正在删除【${r.name || '未命名'}】经销商，${(r.dealerLevel === 1 || r.dealerLevel === 2) ? `所有下级经销商也会被删除,` : ''}删除后无法恢复，确定要删除吗？`,
            onOk: () => {
              this.$http.put(`/system/dealer/${r.id}/status`, {status: 2, isSubset: false}).then(res => {
                this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('经销商'))
                this.query()
              }).catch(res => {
                this.$Message.error(res.message)
                if (res.code === 'DEALER_STATUS_FAILED' || res.code === 'DEALER_DELETE_FAILED') {
                  this.$Message.error(res.message)
                } else {
                  this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('经销商'))
                }
              })
            }
          })
        }
      },
      errorAction: function () {
        this.shunt()
      },
      errorCancel: function () {
        this.$router.go(-1)
      },
      queryByManual: function () {
        this.list.name = this.setter.name
        this.list.status = this.setter.status
        this.list.page = 1
        if (!this.setter.name) {
          this.query()
          let inx = this.breads.findIndex(breads => 'query');
          if (inx !== -1) {
            this.breads.splice(inx + 1)
          }
        } else if (this.setter.name && this.$route.query.parentid) {
          this.query()
          let inx = this.breads.findIndex(breads => 'query');
          if (inx === -1) {

          } else {
            this.breads.splice(inx + 1)
          }
        } else if (this.setter.name && !this.$route.query.parentid) {
          this.queryAll()
        }
      },
      queryStaffByManual: function () {
        this.staffList.name = this.setterStaff.name
        this.page = 1
        this.queryStaff()
      },
      queryStaffByPage: function (page) {
        this.staffList.page = page
        this.queryStaff()
      },
      queryByPage: function (page) {
        this.list.page = page
        this.query()
      },
      queryStaff: function (page) {
        this.busy = true
        let o = {
          _loading: true,
          page: this.staffList.page,
          size: this.staffList.size,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        let hasCondition = false
        if (this.setterStaff.name) {
          hasCondition = true
          o.queryFilter.push({property: 'name', op: 'like', value: this.setterStaff.name})
        }
        o.queryFilter.push({property: 'dealerId', op: '=', value: this.$route.query.id})
        this.$http.post('/system/employees', o).then(res => {
          this.staffList.total = res.totalCount
          if (res.hasOwnProperty('content') && this.$isArray(res.content) && res.content.length !== 0) {
            for (let c of res.content) {
              c.loading = false
            }
            this.error = false
            this.staffList.store = res.content
          } else {
            if (hasCondition) {
              this.error = {
                title: '未能找到员工',
                content: '我们找不到您要搜索的员工，更改搜索条件后再试一次'
              }
            } else {
              this.error = {
                title: '未能找到员工',
                content: '赶快让员工去微信公众号绑定吧'
              }
            }
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
        })
      },
      queryAll: function () {
        this.busy = true
        let o = {
          _loading: true,
          page: this.list.page,
          size: this.list.size,
          orderBy: [{property: 'dealerLevel', order: 'asc'}, {property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        let hasCondition = false
        if (this.setter.name) {
          hasCondition = true
          o.queryFilter.push({property: 'name', op: 'like', value: this.setter.name})
        }
        if (this.setter.status) {
          hasCondition = true
          o.queryFilter.push({property: 'status', op: '=', value: this.setter.status})
        }
        if (this.$route.query.parentid) {
          o.queryFilter.push({property: 'parentId', op: '=', value: this.$route.query.parentid})
        }
        this.$http.post('/system/dealers', o).then(res => {
          this.list.total = res.totalCount
          if (res.hasOwnProperty('content') && this.$isArray(res.content) && res.content.length !== 0) {
            for (let c of res.content) {
              c.loading = false
            }
            this.error = false
            this.list.store = res.content
          } else {
            if (hasCondition) {
              this.error = {
                title: '未能找到经销商',
                content: '我们找不到您要搜索的经销商，更改搜索条件后再试一次'
              }
            } else {
              if (this.$route.query.id) {
                this.error = {
                  title: '未能找到下级经销商',
                  content: '您可以返回去新增经销商'
                }
              } else {
                this.error = {
                  title: '还没有经销商',
                  content: '目前好像还没有经销商，现在就去新增'
                }
              }
            }
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
        })
      },
      query: function () {
        this.busy = true
        let o = {
          _loading: true,
          page: this.list.page,
          size: this.list.size,
          orderBy: [{property: 'dealerLevel', order: 'asc'}, {property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        let hasCondition = false
        if (this.setter.name) {
          hasCondition = true
          o.queryFilter.push({property: 'name', op: 'like', value: this.setter.name})
        }
        if (this.setter.status) {
          hasCondition = true
          o.queryFilter.push({property: 'status', op: '=', value: this.setter.status})
        }
        if (this.$route.query.parentid && this.$route.query.parentid !== 'isnull') {
          o.queryFilter.push({property: 'parentId', op: '=', value: this.$route.query.parentid})
        }
        this.$http.post('/system/dealers', o).then(res => {
          this.list.total = res.totalCount
          if (res.hasOwnProperty('content') && this.$isArray(res.content) && res.content.length !== 0) {
            for (let c of res.content) {
              c.loading = false
            }
            this.error = false
            this.list.store = res.content
            // alert(1)
            // console.log(res.content[0].path)
            this.allBreads = res.content[0].path;
            if (this.$route.query.parentid) {
              this.breads = [];
              this.breads = [{
                id: 'isnull',
                name: '经销商信息维护'
              }]
              this.breads = this.breads.concat(this.allBreads)
              window.sessionStorage.setItem('breads', JSON.stringify(this.breads))
            } else if (!this.$route.query.parentid) {
              this.breads = [{
                id: 'isnull',
                name: '经销商信息维护'
              }]
              window.sessionStorage.setItem('breads', JSON.stringify(this.breads))
            }
          } else {
            if (hasCondition) {
              this.error = {
                title: '未能找到经销商',
                content: '我们找不到您要搜索的经销商，更改搜索条件后再试一次'
              }
            } else {
              if (this.$route.query.id) {
                this.error = {
                  title: '未能找到下级经销商',
                  content: '您可以返回去新增经销商'
                }
              } else {
                this.error = {
                  title: '还没有经销商',
                  content: '目前好像还没有经销商，现在就去新增'
                }
              }
            }
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
        })
      },
      back: function () {
        this.$router.go(-1)
      },
      editDaeler: function (r) {
        this.$router.push({
          path: this.$route.path,
          query: {
            id: r.id,
            st: 1,
            method: 'edit'
          }
        })
      },
      save: function () {
        this.submit()
      },
      deDuplicate: function (item) {
        let found = false
        for (let a of this.model.dealerAgentAreaList) {
          if (a.id !== item.id) {
            if ((item.area && item.city && item.province && a.area === item.area && a.city === item.city && a.province === item.province) ||
              (item.area == null && item.city && item.province && a.city === item.city && a.province === item.province) ||
              (item.area == null && item.city == null && item.province && a.province === item.province)) {
              found = true
              break
            }
          }
        }
        return found
      },
      submit: function () {
        if (this.$refs.editor) {
          if (!this.$isArray(this.model.dealerAgentAreaList)) {
            this.$Message.error('请选择代理区域')
            return
          } else {
            let found
            for (let a of this.model.dealerAgentAreaList) {
              found = this.deDuplicate(a)
              if (found) {
                break
              }
            }

            if (found) {
              this.$Message.error('代理区域中存在相同的区域或者有包含关系，请检查！')
              return
            }
          }

          this.$refs.editor.validate((valid) => {
            if (valid) {
              this.busy = true
              if (this.$route.query.method === 'edit') {
                this.model.id = this.$route.query.id;
                this.model.area = this.model.areaCode;
                this.$http.put(`/system/dealer/${this.$route.query.id}`, this.model).then(res => {
                  if (res) {
                    this.$Message.success('修改经销商成功,即将跳转')
                    setTimeout(() => {
                      this.back()
                    }, 2000)
                  } else {
                    this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('经销商'))
                  }
                }).catch(res => {
                  this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('经销商'))
                }).finally(() => {
                  this.busy = false
                  delete this.model.id;
                })
              } else if (this.$route.query.method === 'add') {
                this.model.area = this.model.areaCode;
                if (this.$route.query.parentid) {
                  this.model.parentId = this.$route.query.parentid;
                }
                this.$http.post(`/system/dealer`, this.model).then(res => {
                  if (res) {
                    this.list.page = 1;
                    this.$Message.success('新增经销商成功,即将跳转')
                    setTimeout(() => {
                      this.back()
                    }, 2000)
                  } else {
                    this.$Message.error('新增经销商失败')
                  }
                }).catch(res => {
                  this.$Message.error('新增经销商失败')
                }).finally(() => {
                  this.busy = false
                })
              }
            }
          })
        }
      }
    },
    mounted: function () {
      this.shunt()
    },
    watch: {
      $route: 'shunt'
    }
  }
</script>

<style lang="less">
  .ivu-breadcrumb-item-link {
    cursor: pointer;
  }

  .dealer-agent-item {
    display: flex;
    margin-top: 10px;

    .ivu-select {
      margin-right: 5px;
      flex-grow: 1;
      flex-shrink: 1;
    }
  }
</style>
