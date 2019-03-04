<template>
  <div class="staff">
    <div v-if="setType === 0">
      <div size="large" v-if="(!error || error && error.type !== $ErrType.UNHANDLED) && $store.state.wechat.userInfo.role === '1'">
        <Input id="staff_keyword" v-model.lazy.trim="setter.name" placeholder="请输入员工姓名">
        <Button id="staff_query" slot="append" @click="queryByManual" :loading="busy">搜索</Button>
        </Input>
      </div>
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
      <Form :model="model" label-position="right" class="myForm">
      <Form-item label="经销商名称" prop="dealerName">
          <Input class="per_input" size="large" id="dealer_name" v-model.trim="model.dealerName" readonly></Input>
      </Form-item>
        <Form-item label="员工姓名" prop="name">
          <Input size="large" id="staff_name" v-model.trim="model.name" readonly></Input>
        </Form-item>
        <Form-item label="员工编号" prop="code">
          <Input size="large" id="staff_code" v-model.trim="model.code" readonly></Input>
        </Form-item>
        <Form-item label="电话号码" prop="phone">
          <Input size="large" id="staff_phone" v-model.trim="model.phone" readonly></Input>
        </Form-item>
        <div>性别: {{model.sex}}</div>
        <div>角色: {{model.role === '0' ? '普通员工' : '管理员'}}</div>
      </Form>
    </div>
      <Button v-if="setType === 1" size="large" type="success" long @click="back" class="mybutngroup">返回</Button>
    <error-view v-if="error" :error="error" name="员工信息" @action="errorAction" :loading="busy" id="staff_error"></error-view>
  </div>
</template>


<script>
  export default {
    name: 'Staff',
    data () {
      return {
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
            title: '姓名',
            key: 'name',
            width: 80
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
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small',
                    disabled: p.row.role === '1' || this.$store.state.wechat.userInfo.dealerStatus !== '0'
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
          this.list.store = []
          this.query()
        } else if (this.setType === 1) {
          this.error = null;
          this.getStaff()
        }
      },
      back: function () {
        this.$router.go(-1)
      },
      remove: function (r) {
        if (r && r.id) {
          this.$Modal.confirm({
            title: '删除员工',
            content: `您正在删除【${r.name || '未命名'}】员工，删除后无法恢复，确定要删除吗？`,
            onOk: () => {
              this.$http.delete(`/system/wechat/dealermg/employee/${r.id}/status`).then(res => {
                this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('员工'))
                this.list.store = [];
                this.list.page = 1;
                this.query()
              }).catch(res => {
                this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('员工'))
              })
            }
          })
        }
      },
      getStaff: function () {
        this.busy = true
        this.$http.get(`/system/wechat/dealermg/employee/${this.$route.query.id}`).then(res => {
          if (res) {
            this.model = res;
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
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: []
        }
        let hasCondition = false
        if (this.list.name) {
          hasCondition = true
          o.queryFilter.push({property: 'name', op: 'like', value: this.list.name})
        }
        this.$http.post('/system/wechat/dealermg/employees', o).then(res => {
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
                title: '未能找到员工',
                content: '我们找不到您要搜索的员工，更改搜索条件后再试一次'
              }
            } else {
              this.error = this.$Err.noData()
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
      document.title = '碧护-员工管理'
      if (this.$store.state.wechat.userInfo.role === '1') {
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
.staff{
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
  margin:0;
}
.ivu-input-group-append, .ivu-input-group-prepend{
  border-radius: 0;
  border: none;
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
.myForm{
  padding:16px;
}
.ivu-btn{
  border-radius: 0;
}
.mybutngroup{
  position: fixed;
  bottom:0;
  width:100%;
}
}
</style>
