<style lang="less" scoped>
  .title {
    background: #f8f8f9;
    padding: .5em 1em;
    margin: 0 -16px 10px -16px;
  }

  .msgForm h4 {
    padding-top: 2px;
  }

  .msg-usual-specification {
    display: flex;
    li {
      flex: 1;
      & :first-child {
        margin-right: 32px;
      }
    }
  }

  .main {
    display: flex;
    align-items: center;
  }

  .dropdown {
    width: 330px;
    padding: 10px;
    padding-bottom: 0;
  }

  .dropdown-item {
    margin-bottom: 10px;
  }

</style>

<template>
  <div class="content-inner">
    <card v-if="!this.$route.query.current" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>会员管理</Breadcrumb-item>
          <Breadcrumb-item>消息推送</Breadcrumb-item>
        </Breadcrumb>
      </p>

      <div v-if="!listError">
        <Row>
          <i-col style="float: left; margin-bottom: 20px;">
            <Button id="mallMember_marketing_btn_addMsg" @click="addMsg">
              新建消息
            </Button>
          </i-col>
        </Row>

        <Row>
          <i-col span="24">
            <div v-if="loadedSuccess" style="padding-bottom: 10px;width: 100%">
              <div style="clear: both">
                <Table id="mallMember_marketing_table_msgList" stripe :columns="titleData" :data="detailData"
                       style="clear: both; margin: 0 0 20px 0"></Table>
                <Page id="mallMember_marketing_page_msgList" :total="total_num" show-elevator show-total
                      style="float:right;margin:10px 0 0 0;" :current="current_page"
                      @on-change="pageChange" :page-size="10" size="small"></Page>
              </div>
              <div style="clear: both"></div>
            </div>
          </i-col>
        </Row>
      </div>
      <error-view :error="listError" name="消息" @action="errorAction" :loading="loadingList"></error-view>
    </card>

    <card v-if="this.$route.query.current" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>消息推送</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current && !this.$route.query.id">新建消息</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current === 'show-msg'">查看消息</Breadcrumb-item>
          <Breadcrumb-item v-if="this.$route.query.current === 'edit-msg'">编辑消息</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <div v-show="!editError">
        <Row v-if="this.$route.query.current === 'show-msg'">
          <Button id="mallMember_marketing_btn_back" @click="goBack" type="primary">返回</Button>
        </Row>
        <Row>
          <Form label-position="left" :label-width="100" size="large" ref="currentItem" :model="currentItem"
                class="msgForm" :rules="msgRules">
            <Form-item label="消息标题" prop="title">
              <Input :readonly="this.$route.query.current === 'show-msg'" id="mallMember_marketing_input_msgTitle" :maxlength="20" v-model="currentItem.title">
              </Input>
            </Form-item>
            <Form-item label="消息内容" prop="content">
              <Input :readonly="this.$route.query.current === 'show-msg'" id="mallMember_marketing_input_msgContent" type="textarea" :maxlength="200" v-model="currentItem.content">
              </Input>
            </Form-item>
            <Form-item label="目标群体" prop="defaultTarget">
              <Radio-group id="mallMember_marketing_radio_target" v-model="currentItem.defaultTarget" @on-change="selectType">
                <Radio label="0" :disabled="this.$route.query.current === 'show-msg'">会员区域</Radio>
                <Radio label="1" :disabled="this.$route.query.current === 'show-msg'">会员等级</Radio>
              </Radio-group>
              <Row class="dropdown-item">
                <!--<CityPicker v-if="this.currentItem.defaultTarget === '0'" v-model="currentItem.targetArea"
                            placement="bottom-end"
                            placeholder="请选择会员区域"
                            :multiple="true"
                            :leafOnly="true"
                            :fullPath="true">
                </CityPicker>-->
                <CheckPicker v-if="this.currentItem.defaultTarget === '0' && this.$route.query.current !== 'show-msg'" @on-change="onChange" :data="currentItem.targetArea"></CheckPicker>
                <Select v-if="this.currentItem.defaultTarget === '1' && this.$route.query.current !== 'show-msg'" v-model="currentItem.targetLevel" multiple filterable
                        placeholder="请选择会员等级" id="mallMember_marketing_select_targetLevel" @on-change="levelChange">
                  <Option v-for="item in levelList" :value="item.id" :key="item.id">{{ item.levelName}}
                  </Option>
                </Select>
              </Row>
            </Form-item>
          </Form>
          <!--<p>{{currentItem.targetArea}}</p>-->
          <Alert v-if="errorText" type="error" id="mallMember_marketing_alert_error">
            {{errorText}}
          </Alert>
        </Row>
        <Row v-if="this.$route.query.current !== 'show-msg'">
          <Button id="mallMember_marketing_btn_save" type="primary" :disabled="this.saveBtn" @click="saveMsg('currentItem')">保存
          </Button>
          <Button id="mallMember_marketing_btn_addBack" @click="goBack">取消
          </Button>
        </Row>
      </div>
      <error-view :error="editError" @action="getMsgById($route.query.id)" :loading="editNow"></error-view>
    </card>
  </div>
</template>

<script type="text/ecmascript-6">
  import CheckPicker from '@/components/common/CheckPicker'

  export default {
    components: { CheckPicker },
    data () {
      return {
        listError: null,
        loadingList: null,               // 列表加载中
        loading: true,                   // 加载中
        editError: null,
        editNow: false,
        loadedSuccess: true,           //  加载成功
        saveBtn: false,
        current_page: 1,
        total_num: 0,
        errorText: '',
        statusArray: ['创建中', '已发布'],
        levelList: [],
        msgRules: {
          title: [
            {required: true, message: '消息标题不能为空', trigger: 'blur'}
          ],
          content: [
            {required: true, message: '消息内容不能为空', trigger: 'blur'}
          ]
        },
        currentItem: {
          title: '',
          content: '',
          defaultTarget: '0',
          targetLevel: [],
          targetArea: []
        },
        titleData: [
          {
            title: '消息标题',
            render: (h, p) => {
              return h('div', [
                h('p', p.row.title || '-')
              ])
            }
          },
          {
            title: '消息内容',
            ellipsis: true,
            render: (h, p) => {
              return h('div', [
                h('p', p.row.content || '-')
              ])
            }
          },
          {
            ellipsis: true,
            title: '阅读详情',
            render: (h, p) => {
              return h('div', [
                h('p', `已读： ${p.row.readCount || '0'}`),
                h('p', `未读： ${p.row.unreadCount || '0'}`),
                h('p', `合计： ${p.row.allCount || '0'}`)
              ])
            }
          },
          {
            ellipsis: true,
            title: '状态',
            render: (h, p) => {
              return h('div', [
                h('p', this.statusArray[p.row.status])
              ])
            }
          },
          {
            title: '操作',
            key: 'action',
            width: 220,
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.$http.put(`crm/msg/status`, {status: 1, ids: [params.row.id]}).then(() => {
                        this.$Message.success('发布成功')
                        this.getMsgList(this.current_page)
                      }).catch((res) => {
                        this.$Message.error(res.message)
                      })
                      evt.stopPropagation()
                    }
                  }
                }, '发布'),
                h('Button', {
                  style: {display: (params.row.status === 1) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.showMsg(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '查看'),
                h('Button', {
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.editMsg(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {type: 'warning'},
                  style: {display: (params.row.status === 0) ? 'block' : 'none'},
                  on: {
                    click: (evt) => {
                      this.deleteMsg(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        detailData: []
      }
    },
    methods: {
      onChange: function (data) {
        console.log(data)
      },
      targetArea: function (v) {
        // console.log(v)
        this.currentItem.targetArea.splice(v, 1)
        console.log(this.currentItem.targetArea)
      },
      levelChange: function (v) {
        console.log(v)
      },
      selectType: function (val) {
        this.currentItem.targetArea = []
        this.currentItem.targetLevel = []
      },
      setData (data) {
        let jsonArea = JSON.parse('{"data":' + data.targetArea + '}')
        let jsonLevel = JSON.parse('{"data":' + data.targetLevel + '}')
        this.currentItem = data
        if (jsonLevel.data.length) {
          this.currentItem.defaultTarget = '1'
          this.currentItem.targetLevel = []
          for (let i = 0; i < jsonLevel.data.length; i++) {
            console.log(jsonLevel.data[i].id)
            this.currentItem.targetLevel.push(jsonLevel.data[i].id)
          }
        } else if (jsonArea.data.length) {
          this.currentItem.defaultTarget = '0'
          this.currentItem.targetArea = jsonArea.data
        }
      },
      addMsg () {
        this.resetMsg()
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'add-msg'
          }
        })
      },
      showMsg (data) {
        this.setData(data)
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'show-msg',
            id: data.id
          }
        })
      },
      editMsg (data) {
        console.log(data)
        this.setData(data)
        this.$router.push({
          path: this.$route.path,
          query: {
            current: 'edit-msg',
            id: data.id
          }
        })
      },
      deleteMsg (item) {
        this.$Modal.confirm({
          title: '删除订单',
          content: this.$C.MSG_COMM_DELETE_CONFIRM.format('消息', item.title),
          onOk: () => {
            this.$http.delete(`/crm/msg/${item.id}`).then((res) => {
              this.$Message.success('删除消息成功')
              if (this.current_page === parseInt((this.total_num - 1) / 10 + 1)) {                    //  判断当前页是不是最后一页
                this.current_page = parseInt((this.total_num - 2) / 10 + 1)                         //   该页最后一条被删后更新页码
                if (this.current_page < 1) {
                  this.current_page = 1
                }
              }
              this.total_num--
              this.getMsgList(this.current_page)
            }).catch((res) => {
              this.$Message.error(res.message)
            }).finally(() => {
            })
          },
          onCancel: () => {
            this.currentItem = []
          }
        })
      },
      resetMsg () {
        this.currentItem = {
          title: '',
          content: '',
          defaultTarget: '0',
          targetLevel: [],
          targetArea: []
        }
        this.saveBtn = false
      },
      errorAction () {
        if (this.listError.type === 'noData') {
          this.loadedSuccess = true
          this.listError = null
          this.addMsg()
        } else {
          this.getMsgList(1)
        }
      },
      pageChange (page) {
        this.getMsgList(page)
        this.current_page = page
      },
      goBack () {
        this.$router.back()
        this.resetMsg()
        this.getMsgList(this.current_page)
        this.errorText = null
      },
      saveMsg (name) {
        var rulesArray = ['title', 'content']
        var editValid = true
        for (var i in rulesArray) {
          this.$refs[name].validateField(rulesArray[i], (valid) => {
            if (valid) {
              editValid = false
            }
          })
        }
        if (editValid) {
          var updateWarn = ''
          if (this.currentItem.defaultTarget === '0' && this.currentItem.targetArea.length === 0) {
            updateWarn = `请选择会员区域`
          } else if (this.currentItem.defaultTarget === '1' && this.currentItem.targetLevel.length === 0) {
            updateWarn = `请选择会员等级`
          }
          if (updateWarn) {
            this.errorText = updateWarn
          } else {
            this.savebtn = true
            let message = '编辑消息成功'
            let updatedata = {
              title: this.currentItem.title,
              content: this.currentItem.content
            }
            if (this.currentItem.targetLevel === '[]') {
              updatedata.targetArea = this.currentItem.targetArea
              updatedata.targetLevel = []
            } else if (this.currentItem.targetArea === '[]') {
              var levelArray = []
              for (let i = 0; i < this.currentItem.targetLevel.length; i++) {
                levelArray.push({id: this.currentItem.targetLevel[i]})
              }
              updatedata.targetLevel = levelArray
              updatedata.targetArea = []
            } else if (this.currentItem.targetArea.length !== 0) {
              updatedata.targetArea = this.currentItem.targetArea
              updatedata.targetLevel = []
            } else if (this.currentItem.targetLevel.length !== 0) {
              levelArray = []
              for (let i = 0; i < this.currentItem.targetLevel.length; i++) {
                levelArray.push({id: this.currentItem.targetLevel[i]})
              }
              updatedata.targetLevel = levelArray
              updatedata.targetArea = []
            }
            if (this.$route.query.current === 'add-msg') {
              message = '添加消息成功'
              this.$http.post('/crm/msg', updatedata).then((res) => {
                this.$Message.success(message)
                this.goBack()
                this.errorText = ''
              }).catch((res) => {
                this.errorText = res.message
                this.savebtn = false
              })
            } else if (this.$route.query.current === 'edit-msg') {
              this.$http.put(`/crm/msg/${this.currentItem.id}`, updatedata).then((res) => {
                this.$Message.success(message)
                this.goBack()
                this.errorText = ''
              }).catch((res) => {
                this.errorText = res.message
                this.savebtn = false
              })
            }
          }
        }
      },
      getMsgList (page) {
        this.loadingList = true
        this.current_page = page
        let updateData = {
          _loading: true,
          'page': page,
          'size': 10,
          orderBy: [
            {
              property: 'createdTime',
              order: 'desc'
            }
          ]
        }
        this.$http.post('/crm/msgs/search', updateData).then((res) => {
          var listData = res.content
          if (listData.length > 0) {
            this.total_num = res.totalCount
            this.loadedSuccess = true
            this.listError = null
          } else {
            this.listError = {...this.$Err.noData()}
            this.listError.type = 'noData'
            this.loadedSuccess = false
            listData = []
            this.total_num = 0
          }
          this.detailData = res.content
        }).catch((res) => {
          this.loadedSuccess = false
          this.listError = {...this.$Err.unhandled()}
        }).finally(() => {
          this.loadingList = false
        })
      },
      getMsgById (id) {
        if (id) {
          this.editNow = true
          this.$http.get(`/crm/msg/${id}`).then((data) => {
            if (data) {
              this.editError = null
              this.setData(data)
            } else {
              this.editError = {...this.$Err.notFound()}
            }
          }).catch((res) => {
            this.$Message.error(res.message)
            this.editError = {...this.$Err.unhandled(true)}
          }).finally(() => {
            this.editNow = false
          })
        }
      },
      getLevelList (callback, parameter) {
        this.$http.get(`/crm/levels`, {
          _loading: true,
          page: 1,
          size: 99999,
          queryFilter: [
            {property: 'status', op: '=', value: 0}
          ]
        }).then((res) => {
          this.levelList = res
          if (typeof callback === 'function') {
            callback(parameter)
          }
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      }
    },
    mounted: function () {
      if (this.$route.query.id) {
        this.getLevelList()
        this.getMsgById(this.$route.query.id)
      } else {
        this.getLevelList()
        this.getMsgList(1)
      }
    }
  }
</script>
