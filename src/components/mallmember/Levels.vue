<template>
  <div class="content-inner">
    <Modal
      id="member_level_modal_set"
      v-model="levelModal"
      title="重算范围"
      @on-ok="setUserLevel">
      <RadioGroup v-model="setAllLevel">
        <Radio label=1>所有会员</Radio>
        <Radio label=0>自动（不包含手动调级会员）</Radio>
      </RadioGroup>
    </Modal>
    <card dis-hover v-if="!$route.query.st">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>会员管理</Breadcrumb-item>
          <Breadcrumb-item>会员等级</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <Row type="flex" justify="space-between" class="card-header">
        <i-col span="24" class="product-line-desc">
          <strong>会员等级(Level)</strong>
          <p>
            一个会员只能属于一个会员等级，计算时根据等级优先级进行计算（优先从属于优先级高的会员等级）,
            如果重新设置了会员等级规则，需要执行等级初始化。
          </p>
        </i-col>
      </Row>
      <div v-if="!errorType">
        <Button @click="creatLevel" id="member_levels_btn_add">添加</Button>
        <Button @click="levelModal = true" type="warning" v-if="!listError" id="member_levels_btn_resetlevels">重算会员等级
        </Button>
        <div style="width: 219px;float: right">
          <Input id="member_levels_input_search_member" v-model.trim="keywords"
                 @on-enter="getLevelsList(1, keywords)"
                 placeholder="输入等级名称查询...">
          <Button id="member_levels_btn_search_member" slot="append" @click="getLevelsList(1, keywords)">搜索</Button>
          </Input>
        </div>
      </div>
      <div v-if="loadedSuccess">
        <Table id="member_levels_table_memberlist" stripe :columns="levelsListTitle" :data="levelsListData"></Table>
        <Page id="member_levels_page_memberlist" :total="totalNum" show-elevator show-total
              style="float: right;margin:10px 0 10px 0;" :current="current_page"
              @on-change="page_change" :page-size="10" size="small"></Page>
      </div>
      <error-view id="product_product_list_error" :error="listError" name="等级" @action="errorAction"
                  :loading="loadingList"></error-view>
      <div style="clear: both;"></div>
    </card>
    <card dis-hover v-if="$route.query.st == 1">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>会员管理</Breadcrumb-item>
          <Breadcrumb-item>会员等级</Breadcrumb-item>
          <Breadcrumb-item>{{$route.query.q ? '编辑' : '添加'}}</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <row>
        <iCol style="margin-bottom: 20px">
          <Button id="member_member_btn_back_list" @click="$router.go(-1)" type="primary">
            返回
          </Button>
        </iCol>
        <iCol :xs="24" :sm="20" :md="16" :lg="8">
          <Form ref="levelsItem" :model="levelsItem" :label-width="90" :rules="levelsRules">
            <Form-item label="等级名称" prop="levelName">
              <Input id="member_levels_input_name" :maxlength="20" v-model="levelsItem.levelName">
              </Input>
            </Form-item>
            <Form-item label="默认等级">
              <Radio-group v-model="levelsItem.defaultLevel" id="member_levels_radio_default">
                <Radio label="1">是</Radio>
                <Radio label="0">否</Radio>
              </Radio-group>
            </Form-item>
            <div v-if="levelsItem.defaultLevel == 0">
              <Form-item label="消费次数">
                <Radio-group v-model="timeType" id="member_levels_timeType">
                  <Radio label="0">不限制</Radio>
                  <Radio label="1">范围</Radio>
                </Radio-group>
                <div v-if="timeType === '1'">大于等于
                  <Input size="small" id="member_levels_numinput_timemin" @on-blur="integer_timesLowerLimit"
                         @on-focus="savetimesLowerLimit"
                         v-model="levelsItem.timesLowerLimit" style="width: 75px"></Input>
                  小于
                  <Input size="small" id="member_levels_numinput_timemax" @on-blur="integer_timesUpperLimit"
                         @on-focus="savetimesUpperLimit"
                         v-model="levelsItem.timesUpperLimit" style="width: 75px"></Input>
                </div>
              </Form-item>
              <Form-item label="消费金额">
                <Radio-group v-model="amountType" id="member_levels_amountType">
                  <Radio label="0">不限制</Radio>
                  <Radio label="1">范围</Radio>
                </Radio-group>
                <div v-if="amountType === '1'">大于等于
                  <Input size="small" id="member_levels_numinput_mountmin" @on-blur="integer_amountLowerLimit"
                         @on-focus="saveamountLowerLimit"
                         v-model="levelsItem.amountLowerLimit" style="width: 75px"></Input>
                  小于
                  <Input size="small" id="member_levels_numinput_mountmax" @on-blur="integer_amountUpperLimit"
                         @on-focus="saveamountUpperLimit"
                         v-model="levelsItem.amountUpperLimit" style="width: 75px"></Input>
                </div>
              </Form-item>
              <Form-item label="计算逻辑">
                <Radio-group v-model="levelsItem.connector" id="member_levels_radio_connector">
                  <Radio label="or">或</Radio>
                  <Radio label="and">且</Radio>
                </Radio-group>
              </Form-item>
              <Form-item label="优先级" prop="priority">
                <Input-number :min="1" size="small" id="member_levels_input_priority"
                              v-model="levelsItem.priority"></Input-number>
              </Form-item>
            </div>
          </Form>
          <Alert v-if="errorText !== ''" type="error" id="product_product_alert_error">
            {{errorText}}
          </Alert>
          <Button id="member_levels_btn_savelevel" type="primary" @click="saveLevel('levelsItem')">保存
          </Button>
          <p style="font-size: 12px; line-height: 14px; color: #808080; padding-top: 20px; padding-bottom: 5px">
            编辑会员等级后，请到“会员管理 / 会员等级”点击“重算所有会员等级”按钮重新计算会员等级</p>
        </iCol>
      </row>
      <div style="clear: both;"></div>
    </card>
  </div>
</template>
<script type="text/ecmascript-6">
  export default {
    data () {
      const validatePass = (rule, value, callback) => {
        if (!value) {
          callback(new Error('优先级不能为空'));
        } else {
          callback();
        }
      }
      return {
        loadedSuccess: true,
        keywords: '',
        totalNum: 0,
        levelModal: false,
        current_page: 1,
        currentItem: {},
        amountType: '0',
        timeType: '0',
        setAllLevel: 1,
        levelsItem: {
          levelName: '',
          defaultLevel: '0',
          timesLowerLimit: 0,
          timesUpperLimit: 1,
          amountLowerLimit: 0,
          amountUpperLimit: 1,
          connector: 'and',
          priority: 1
        },
        levelsCopy: {},
        levelsRules: {
          levelName: [
            {required: true, message: '等级名称不能为空', trigger: 'blur'}
          ],
          priority: [
            {validator: validatePass, trigger: 'blur'}      //   应用自定义规则验证
          ]
        },
        errorText: '',
        listError: null,
        errorType: '',
        loadingList: false,
        levelsListTitle: [
          {
            title: '等级名称',
            render: (h, p) => {
              return h('div', [
                h('p', p.row.levelName),
                h('Icon', {props: {type: 'clock'}, style: {'padding-right': '5px'}}),
                h('span', `${new Date(p.row.updatedTime).toLocaleString()}`)
              ])
            }
          }, {
            title: '会员数量',
            render: (h, params) => {
              return h('div', [
                h('a', {
                  style: {padding: '10px', textDecoration: 'underline'},
                  on: {
                    click: (event) => {
                      this.$router.push({
                        path: '/mallmember/Member',
                        query: {
                          levelId: params.row.id,
                          name: params.row.levelName
                        }
                      })
                    }
                  }
                }, params.row.mbCount)
              ])
            }
          },
          {
            title: '消费',
            render: (h, p) => {
              return h('div', [
                h('div', [
                  h('span', '次数：'),
                  h('span', `${p.row.timesLowerLimit === -1 ? '不限' : p.row.timesLowerLimit}~${p.row.timesUpperLimit === -1 ? '不限' : p.row.timesUpperLimit}`)
                ]),
                h('div', [
                  h('span', '金额：'),
                  h('span', `${p.row.amountLowerLimit === -1 ? '不限' : p.row.amountLowerLimit}~${p.row.amountUpperLimit === -1 ? '不限' : p.row.amountUpperLimit}`)
                ])
              ])
            }
          },
          {
            title: '计算逻辑',
            align: 'center',
            render: (h, p) => {
              return h('div', [
                h('div', [
                  h('span', `${p.row.connector === 'and' ? '且' : '或'}`)
                ])
              ])
            }
          },
          {
            title: '默认等级',
            align: 'center',
            render: (h, p) => {
              return h('span', `${p.row.defaultLevel === 0 ? '否' : '是'}`)
            }
          },
          {
            title: '等级优先级',
            align: 'center',
            key: 'priority'
          },
          {
            title: '状态',
            width: 80,
            render: (h, p) => {
              return h('span', `${p.row.status === '0' ? '正常' : '禁用'}`)
            }
          },
          {
            title: ' ',
            width: 210,
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  on: {
                    click: (evt) => {
                      this.errorText = ''
                      this.levelsItem = params.row
                      if (this.levelsItem.timesLowerLimit === -1 && this.levelsItem.timesUpperLimit === -1) {
                        this.timeType = '0'
                      } else {
                        this.timeType = '1'
                      }
                      if (this.levelsItem.amountLowerLimit === -1 && this.levelsItem.amountUpperLimit === -1) {
                        this.amountType = '0'
                      } else {
                        this.amountType = '1'
                      }
                      this.levelsItem.amountLowerLimit = this.levelsItem.amountLowerLimit.toFixed(2)
                      this.levelsItem.amountUpperLimit = this.levelsItem.amountUpperLimit.toFixed(2)
                      this.$router.push({
                        path: this.$route.path,
                        query: {
                          q: params.row.id,
                          st: 1
                        }
                      })
                      evt.stopPropagation()
                    }
                  }
                }, '编辑'),
                h('Button', {
                  on: {
                    click: (evt) => {
                      this.levelsItem = params.row
                      this.banLevel(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, `${params.row.status === '0' ? '禁用' : '启用'}`),
                h('Button', {
                  props: {
                    type: 'warning'
                  },
                  on: {
                    click: (evt) => {
                      this.levelsItem = params.row
                      this.deleteLevel(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '删除')
              ])
            }
          }
        ],
        levelsListData: []
      }
    },
    methods: {
      page_change: function (index) {
        this.current_page = index
        this.getLevelsList(this.current_page, this.keywords)
      },
      creatLevel: function () {
        this.errorText = ''
        this.amountType = '0'
        this.timeType = '0'
        this.levelsItem = {
          levelName: '',
          defaultLevel: '0',
          timesLowerLimit: -1,
          timesUpperLimit: -1,
          amountLowerLimit: -1,
          amountUpperLimit: -1,
          connector: 'and',
          priority: 1
        }
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 1
          }
        })
      },
      deleteLevel: function (item) {
        this.$Modal.confirm({
          id: 'testModal',
          title: '会员等级',
          content: this.$C.MSG_COMM_DELETE_CONFIRM.format('会员等级', item.levelName),
          onOk: () => {
            this.loadingList = true
            this.$http.put(`/crm/level/delete`, {
              levelIds: [item.id]
            }).then(() => {
              this.$Message.success('删除成功')
              this.getLevelsList(this.current_page, this.keywords)
            }).catch((res) => {
              this.$Message.error(res.message)
            }).finally((res) => {
              this.loadingList = false
            })
          }
        })
      },
      saveLevel: function (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
//            如果是范围不限制或者默认等级，手动赋值
            if (this.amountType === '0' || this.levelsItem.defaultLevel === '1') {
              this.levelsItem.amountLowerLimit = -1
              this.levelsItem.amountUpperLimit = -1
            }
            if (this.timeType === '0' || this.levelsItem.defaultLevel === '1') {
              this.levelsItem.timesLowerLimit = -1
              this.levelsItem.timesUpperLimit = -1
            }
            this.levelsItem.amountLowerLimit = parseFloat(this.levelsItem.amountLowerLimit)
            this.levelsItem.amountUpperLimit = parseFloat(this.levelsItem.amountUpperLimit)
            if (this.$route.query.q) {
              this.$http.put(`/crm/level/${this.levelsItem.id}`, this.levelsItem).then((res) => {
                this.errorText = ''
                this.$Message.success('保存成功')
                this.$router.push({
                  path: this.$route.path
                })
                this.getLevelsList(this.current_page, this.keywords)
              }).catch((res) => {
                this.errorText = res.message
              })
            } else {
              this.$http.post(`/crm/level`, this.levelsItem).then((res) => {
                this.errorText = ''
                this.$Message.success('添加成功')
                this.$router.push({
                  path: this.$route.path
                })
                this.getLevelsList(this.current_page, this.keywords)
              }).catch((res) => {
                this.errorText = res.message
              })
            }
          }
        })
      },
      banLevel: function (data) {
        this.$http.put('/crm/level/status', {
          levelIds: [data.id],
          status: data.status === '0' ? '1' : '0'
        }).then((res) => {
          this.$Message.success('操作成功')
          this.getLevelsList(this.current_page, this.keywords)
        }).catch((res) => {
          this.$Message.error('操作失败')
        })
      },
      getLevelsList: function (page, word) {
        this.current_page = page
        this.loadingList = true
        var updatedata = {
          '_loading': true,
          'page': page,
          'size': 10,
          'orderBy': [
            {
              'property': 'priority',
              'order': 'asc'
            }
          ]
        }
        if (word) {
          updatedata.wd = word
        }
        this.$http.post(`/crm/levels/search`, updatedata).then((res) => {
          this.errorType = ''
          this.loadedSuccess = true
          this.listError = null
          this.totalNum = res.totalCount
          if (!res.totalCount) {
            if (this.keywords) {
              this.listError = {title: '没有相关会员等级', content: `没有找到和【${this.keywords}】相关的会员等级，您可以创建或者换个关键词试试`}
            } else {
              this.errorType = 'noData'
              this.listError = {...this.$Err.noData()}
            }
            this.loadedSuccess = false
            this.totalNum = 0
          }
          this.levelsListData = res.content
        }).catch((res) => {
          this.loadedSuccess = false
          this.listError = {...this.$Err.unhandled()}
          this.errorType = 'unhandled'
        }).finally(() => {
          this.loadingList = false
        })
      },
      errorAction: function () {
        if (this.errorType === 'unhandled') {
//           noData FindNone
          this.getLevelsList(this.current_page, this.keywords)
        } else {
          this.creatLevel()
        }
      },
      setUserLevel: function () {
        this.$http.post('crm/level/compute', {
          isAll: this.setAllLevel === 1 ? true : false
        }).then((res) => {
          this.$Message.success('会员等级重算成功')
          this.getLevelsList(this.current_page, this.keywords)
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      saveamountLowerLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        this.levelsCopy.amountLowerLimit = val
      },
      saveamountUpperLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        this.levelsCopy.amountUpperLimit = val
      },
      integer_amountLowerLimit: function (v) {
        let val = parseFloat(v.srcElement.value)
        if (val >= -1 && (val === -1 || val < this.levelsItem.amountUpperLimit || this.levelsItem.amountUpperLimit === -1)) {
          this.levelsItem.amountLowerLimit = val.toFixed(2)
        } else {
          this.levelsItem.amountLowerLimit = this.levelsCopy.amountLowerLimit
        }
      },
      integer_amountUpperLimit: function (v) {
        let val = parseFloat(v.srcElement.value)
        if (val >= -1 && (val === -1 || val > this.levelsItem.amountLowerLimit || this.levelsItem.amountLowerLimit === -1)) {
          this.levelsItem.amountUpperLimit = val.toFixed(2)
        } else {
          this.levelsItem.amountUpperLimit = this.levelsCopy.amountUpperLimit
        }
      },
      savetimesLowerLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        this.levelsCopy.timesLowerLimit = val
      },
      savetimesUpperLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        this.levelsCopy.timesUpperLimit = val
      },
      integer_timesLowerLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        if (val >= -1 && (val === -1 || val < this.levelsItem.timesUpperLimit || this.levelsItem.timesUpperLimit === -1)) {
          this.levelsItem.timesLowerLimit = val
        } else {
          this.levelsItem.timesLowerLimit = this.levelsCopy.timesLowerLimit
        }
      },
      integer_timesUpperLimit: function (v) {
        let val = parseInt(v.srcElement.value)
        if (val >= -1 && (val === -1 || val > this.levelsItem.timesLowerLimit || this.levelsItem.timesLowerLimit === -1)) {
          this.levelsItem.timesUpperLimit = val
        } else {
          this.levelsItem.timesUpperLimit = this.levelsCopy.timesUpperLimit
        }
      }
    },
    mounted: function () {
//      this.$http.defaults.baseURL = 'http://192.168.1.174:8183/cbc/v1';
      this.getLevelsList(this.current_page)
    }
  }
</script>

<style scoped>

</style>
