<template>
  <div class="mobile_dealer">
    <div v-if="setType === 0">
      <Row type="flex" justify="space-between" v-if="(!error || error && error.type !== $ErrType.UNHANDLED) && $store.state.wechat.userInfo.role === '1'">
        <i-col>
          <Input size="large" id="distributor_keyword" v-model.lazy.trim="setter.name" placeholder="请输入,名称,电话">
            <Button type='primary' :class="disAdd ? 'dis': 'pray'" id="distributor_create" slot="prepend" @click="create" :disabled="disAdd">新增经销商</Button>
            <Button id="distributor_query" slot="append" @click="queryByManual" :loading="busy">搜索</Button>
          </Input>
        </i-col>
      </Row>
      <Table id="staff_list" stripe :columns="list.columns" :data="list.store" v-if="!error"></Table>
      <div class="queryMore" @click="queryByPage" v-if="list.store.length !== list.total && loading ===false && !error">查看更多</div>
      <div class="queryMore" v-if="list.store.length === list.total && loading ===false && !error">没有更多了</div>
      <Row v-if="loading">
        <Col class="demo-spin-col">
        <Spin fix>
          <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
          <div>加载中...</div>
        </Spin>
        </Col>
      </Row>
    </div>
    <div v-if="setType === 1">
        <Form ref="editor" :model="model" label-position="top" :rules="rules" class="myForm">
          <Form-item label="经销商名称" prop="name">
            <div class="name">
              <Input size="large" id="distributor_name" v-model.trim="model.name" placeholder="请输入经销商名称" :maxlength="50"></Input>
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
            <city-picker :mobile="true" :multiple="false" :leafOnly="false" :city.sync="p.city" :area.sync="p.area" :province.sync="p.province" :fullPath="true" :clearable="false" size="large"></city-picker>
            <Button type="warning" size="large" @click="removeDealerArea(inx)">删除</Button>
          </div>
        </Form-item>
          <Form-item label="经销商编号" prop="code">
            <div class="code">
              <Input size="large" id="distributor_code" v-model.trim="model.code" placeholder="请输入经销商编号" :maxlength="20"></Input>
            </div>
          </Form-item>
          <Form-item label="经销商描述" prop="info">
            <div class="info">
              <Input size="large" id="distributor_info" v-model.trim="model.info" placeholder="请输入经销商描述" :maxlength="100"></Input>
            </div>
          </Form-item>
          <Form-item label="注册用户名" prop="userName">
            <div class="userName">
              <Input size="large" id="distributor_userName" v-model.trim="model.userName" placeholder="请输入注册用户名" :maxlength="20"></Input>
            </div>
          </Form-item>
          <Form-item label="注册密码" prop="password">
            <div class="password">
              <Input size="large" id="distributor_password" v-model.trim="model.password" placeholder="请输入注册密码" :maxlength="50"></Input>
            </div>
          </Form-item>
        <Form-item label="请选择地址" prop="province">
          <city-picker :mobile="true" :multiple="false" :leafOnly="true" :province.sync="model.province" :provinceName.sync="model.provinceName"
                       :city.sync="model.city" :cityName="model.cityName"
                       :area.sync="model.areaCode" :areaName.sync="model.areaName"
                       :fullPath="true" :clearable="false" size="large"></city-picker>
        </Form-item>
          <Form-item label="详细地址" prop="address">
            <div class="address">
              <Input size="large" id="distributor_address" v-model.trim="model.address" placeholder="请输入详细地址" :maxlength="100"></Input>
            </div>
          </Form-item>
          <Form-item label="联系人姓名" prop="contacter">
            <div class="contacter">
              <Input size="large" id="distributor_contacter" v-model.trim="model.contacter" placeholder="请输入联系人姓名" :maxlength="20"></Input>
            </div>
          </Form-item>
          <Form-item label="联系人电话" prop="phone">
            <div class="phone">
              <Input size="large" id="distributor_phone" v-model.trim="model.phone" placeholder="请输入联系人电话" :maxlength="20"></Input>
            </div>
          </Form-item>
        </Form>
    </div>
      <Row class="mybutngroup" v-if="setType === 1">
        <i-col span="12" style="width:50%">
          <Button size="large" type="success" long @click="save">保存</Button>
        </i-col>
        <i-col span="12" style="width:50%">
          <Button size="large" type="primary" long @click="back">返回</Button>
        </i-col>
      </Row>
    <error-view v-if="error" :error="error" name="经销商" @action="errorAction" :loading="busy" id="staff_error"></error-view>

  </div>
</template>


<script>
  export default {
    name: 'Dealer',
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
        if (this.$route.query.id) {
          if (this.model.name !== this.oldName) {
            this.busy = true;
            this.$http.post(`/system/wechat/dealermg/dealer/checkname`, {property: 'name', value: value}).then(res => {
              if (!res) {
                callback(new Error('该用户名已存在！'));
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
        } else {
          this.busy = true;
          this.$http.post(`/system/wechat/dealermg/dealer/checkname`, {property: 'name', value: value}).then(res => {
            if (!res) {
              callback(new Error('该用户名已存在！'));
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
        if (this.$route.query.id) {
          if (this.model.userName !== this.oldUserName) {
            this.busy = true;
            this.$http.post(`/system/wechat/dealermg/dealer/checkname`, {property: 'userName', value: value}).then(res => {
              if (!res) {
                callback(new Error('该用户名已存在！'));
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
        } else {
          this.busy = true;
          this.$http.post(`/system/wechat/dealermg/dealer/checkname`, {property: 'userName', value: value}).then(res => {
            if (!res) {
              callback(new Error('该用户名已存在！'));
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
        disAdd: false,
        oldName: '',
        oldUserName: '',
        statusList: [
          {code: '0', name: '正常'},
          {code: '1', name: '停用'},
          {code: '', name: '全部'}
        ],
        rules: {
          name: [
            {required: true, message: '不能为空', trigger: 'blur'},
            {validator: checkname, trigger: 'blur'}
          ],
          company: [
            {required: true, message: '不能为空', trigger: 'blur'}
          ],
          code: [
              { required: true, message: '不能为空', trigger: 'blur' }
          ],
          info: [
              { required: true, message: '不能为空', trigger: 'blur' }
          ],
          address: [
              { required: true, message: '不能为空', trigger: 'blur' }
          ],
          province: [
              { required: true, message: '不能为空', trigger: 'change' }
          ],
          city: [
              { required: true, message: '不能为空', trigger: 'change' }
          ],
          areaCode: [
              { required: true, message: '不能为空', trigger: 'change' }
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
        cityList: [],
        provinceList: [],
        streetList: [],
        loading: false,
        setType: 0,
        busy: false,
        error: null,
        model: {
          sex: '男',
          role: '0'
        },
        setter: {
          name: ''
        },
        list: {
          name: '',
          page: 1,
          size: 10,
          total: 0,
          status: '',
          columns: [ {
            title: '经销商名称',
            key: 'name',
            width: 100
          }, {
            title: '电话',
            key: 'phone'
          }, {
            title: ' ',
            width: 120,
            render: (h, p) => {
              return h('Button-group', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.detail(p.row)
                    }
                  }
                }, '详情'),
                // h('Button', {
                //   props: {
                //     disabled: p.row.status === 1
                //   },
                //   on: {
                //     click: () => {
                //       this.toggleStatus(p.row)
                //     }
                //   }
                // }, p.row.status === '0' ? '停用' : '启用'),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small',
                    disabled: this.$store.state.wechat.userInfo.dealerStatus !== '0'
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
          store: [
          ]
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
    methods: {
      addDealerArea: function () {
        this.model.dealerAgentAreaList.push({
          id: this.$uuid(),
          province: '110000',
          city: '110100'
        })
      },
      removeDealerArea: function (inx) {
        this.model.dealerAgentAreaList.splice(inx, 1)
      },
      create: function () {
        this.model = {};
        this.error = null;
        // this.setType = 1;
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 1
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
              if (this.$route.query.id) {
                this.model.area = this.model.areaCode;
                this.model.parentId = this.$store.state.wechat.userInfo.dealerId;
                this.$http.put(`/system/wechat/dealermg/dealer/${this.$route.query.id}`, this.model).then(res => {
                  if (res) {
                    this.$Message.success(this.$C.MSG_COMM_UPDATE_SUCCESS.format('经销商'))
                  } else {
                    this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('经销商'))
                  }
                }).catch(res => {
                  this.$Message.error(this.$C.MSG_COMM_UPDATE_FAIL.format('经销商'))
                }).finally(() => {
                  this.busy = false
                  delete this.model.id;
                })
              } else {
                this.model.area = this.model.areaCode;
                this.model.parentId = this.$store.state.wechat.userInfo.dealerId;
                this.$http.post(`/system/wechat/dealermg/dealer`, this.model).then(res => {
                  if (res) {
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
      },
      detail: function (r) {
        if (this.$isPlainObject(r) && r.id) {
          this.$router.push({
            path: this.$route.path,
            query: {
              id: r.id,
              st: 1
            }
          })
        }
      },
      shunt: function () {
        let qs = this.$route.query
        let st = qs ? (parseInt(qs.st) || 0) : 0
        this.setType = st
        if (this.setType === 0) {
          this.list.page = 1
          this.list.store = [];
          this.query()
        } else if (this.setType === 1 && this.$route.query.id) {
          this.error = null;
          this.getDealer()
        } else if (this.setType === 1 && !this.$route.query.id) {
          this.model = {
            dealerAgentAreaList: [{
              id: this.$uuid(),
              province: '110000',
              city: '110100'
            }]
          }
        }
      },
      back: function () {
        this.$router.go(-1)
      },
      remove: function (r) {
        if (r && r.id) {
          this.$Modal.confirm({
            title: '删除销商',
            content: `您正在删除【${r.name || '未命名'}】经销商，${(r.dealerLevel === 1 || r.dealerLevel === 2) ? `所有下级经销商也会被删除,` : ''}删除后无法恢复，确定要删除吗？`,
            onOk: () => {
              this.$http.put(`/system/wechat/dealermg/dealer/${r.id}/status`, {status: 2, isSubset: false}).then(res => {
                this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('经销商'))
                this.list.page = 1;
                this.list.store = [];
                this.query()
              }).catch(res => {
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
      getDealer: function () {
        this.busy = true
        this.model = null;
        this.$http.get(`/system/wechat/dealermg/dealer/${this.$route.query.id}`).then(res => {
          if (res) {
            this.model = res;
            this.oldUserName = res.userName;
            this.oldName = res.name;
          }
        }).catch((res) => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false;
        })
      },
      query: function () {
        this.busy = true
        let o = {
          _loading: true,
          page: this.list.page,
          size: this.list.size,
          orderBy: [{property: 'status', order: 'asc'}, {property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        let hasCondition = false
        if (this.setter.name) {
          hasCondition = true
          o.wd = this.setter.name
         // o.queryFilter.push({property: 'name', op: 'like', value: this.list.name})
        }
        // if (this.list.status) {
        //   hasCondition = true
        //   o.queryFilter.push({property: 'status', op: '=', value: this.list.status})
        // }
        // o.queryFilter.push({property: 'status', op: '=', value: '0'})
        o.queryFilter.push({property: 'parentId', op: '=', value: this.$store.state.wechat.userInfo.dealerId})
        this.$http.post('/system/wechat/dealermg/dealers', o).then(res => {
          this.list.total = res.totalCount
          if (res.hasOwnProperty('content') && this.$isArray(res.content) && res.content.length !== 0) {
            for (let c of res.content) {
              c.loading = false
            }
            this.error = false
            this.list.store = this.list.store.concat(res.content)
          } else {
            if (hasCondition) {
              this.error = {
                title: '未能找到经销商',
                content: '我们找不到您要搜索的经销商，更改搜索条件后再试一次'
              }
            } else {
              this.error = {
                title: '还没有经销商',
                content: '目前好像还没有经销商，赶快去新增吧！'
              }
            }
          }
        }).catch(res => {
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.busy = false
          this.loading = false;
        })
      },
      queryByManual: function () {
        this.list.page = 1
        this.list.name = this.setter.name
        this.list.sattus = ''
        this.list.store = [];
        this.query()
      },
      queryByPage: function () {
        this.list.page += 1
        this.loading = true;
        this.query()
      },
      errorAction: function () {
        if (this.error.type === this.$ErrType.UNHANDLED) {
          this.shunt()
        } else {
          this.create()
        }
      }
    },
    mounted: function () {
      document.title = '碧护-下级经销商管理'
      if (this.$store.state.wechat.userInfo.role === '1') {
        if (this.$store.state.wechat.userInfo.dealerEntity.parent !== null && this.$store.state.wechat.userInfo.dealerEntity.parent.parentId) {
          this.disAdd = true
        } else {
          this.disAdd = false
        }
        if (this.$store.state.wechat.userInfo.dealerEntity.dealerLevel === 3 || this.$store.state.wechat.userInfo.dealerStatus !== '0') {
          this.disAdd = true
        }
        this.shunt()
      } else {
        this.error = {
          title: '您无权访问该页面',
          content: '您不是管理员，请联系你的经销商'
        }
      }
    },
    watch: {
      $route: 'shunt'
    }
  }
</script>
<style lang="less">
.mobile_dealer {
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
.queryMore{
  text-align: center
}
.ivu-table-wrapper{
  border: none;
    margin: 0;
}
.ivu-table:after, .ivu-table:before {
    background-color: transparent;
}
.ivu-col{
  width:100%;
}
.ivu-input-group-append, .ivu-input-group-prepend{
  border-radius: 0;
  border: none;
}
.ivu-input-group .ivu-input {
    z-index: 0;
}
.ivu-btn{
  border-radius: 0;
}
.mybutngroup{
  position: fixed;
  bottom:0;
  width:100%;
}
.myForm{
  padding:16px;
  padding-bottom: 40px;
}
.pray{
  background-color: #2d8cf0;
  color: white;
}
}
</style>
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
