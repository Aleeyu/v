<template>
  <div class="content-inner">
    <Modal
      id="member_information_modal_set"
      v-model="labelModal">
      <p slot="header" style="text-align:center">
        <Icon type="wrench"></Icon>
        <span>调整等级</span>
      </p>
      <div style="text-align:left">
        <p v-if="levelsBtnList.length === 0">暂无会员等级，是否前往设置？</p>
        <Button v-for="item in levelsBtnList" style="margin: 1px; min-width: 120px" :key="item.id" @click="setUser(item.id)">{{item.levelName}}</Button>
      </div>
      <div slot="footer">
        <Page :total=levelNum :page-size="12" show-total @on-change="levelPage"></Page>
      </div>


    </Modal>
    <card v-if="!$route.query.st" dis-hover style="padding-bottom: 35px;">
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>会员管理</Breadcrumb-item>
          <Breadcrumb-item>会员列表</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <div style="float:left">
        <Dropdown trigger="click" @on-click="downloadOperation" id="member_information_dropdown_operate">
          <Button :disabled=moreOperation>
            更多操作
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <Dropdown-menu slot="list">
            <Dropdown-item name="0">锁定</Dropdown-item>
            <Dropdown-item name="1">解锁</Dropdown-item>
            <Dropdown-item name="2">删除</Dropdown-item>
            <Dropdown-item name="3">调整等级</Dropdown-item>
            <Dropdown-item name="4">清除等级</Dropdown-item>
          </Dropdown-menu>
        </Dropdown>
        <Button v-if="$route.query.name" id="member_information_btn_showAll" @click="showAll" type="primary">查看所有</Button>
      </div>

      <div style="float: right; margin:0 0 10px 0">
        <Input id="member_information_input_search_member" v-model.trim="searchConfig.keywords"
               @on-enter="getUserList(1, searchConfig.keywords)" style="width: 220px; float: left"
               placeholder="昵称/手机号">
        <Button id="member_information_btn_search_member" slot="append" @click="getUserList(1, searchConfig.keywords)">
          搜索
        </Button>
        </Input>

        <Dropdown trigger="click" style="margin-left: 4px;; line-height: 32px;margin-top: -1px" placement="bottom-end"
                  id="member_information_dropdown_seniorsearch">
          <Button @click="searchConfig.keywords = ''">
            高级查询
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <DropdownMenu slot="list" style="width: 380px; padding: 10px" id="member_information_dropdown_seniorsearch">
            <Form :model="searchConfig" :label-width="80">
              <FormItem label="会员状态" id="member_information_select_status">
                <Select v-model="searchConfig.status">
                  <Option value="0">正常</Option>
                  <Option value="1">锁定</Option>
                </Select>
              </FormItem>
              <FormItem label="会员等级" id="member_information_form_seniorsearch">
                <Select v-model="searchConfig.level" size="small" id="member_information_select_mblevel">
                  <Option v-for="item in levelsList" :value="item.levelName" :key="item.levelName">{{ item.levelName
                    }}
                  </Option>
                </Select>
              </FormItem>
              <FormItem label="省份">
                <Select v-model="searchConfig.province" @on-change="getCity" size="small"
                        id="member_information_select_mbprovince">
                  <Option v-for="item in provinceList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <FormItem v-if="searchConfig.province" label="市（区）">
                <Select v-model="searchConfig.city" size="small" id="member_information_select_mbcity">
                  <Option v-for="item in cityList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
              <Form-item style="margin: 0; float: right">
                <Button type="primary" @click="seniorSearchFuc" id="member_information_btn_seniorsearch">搜索</Button>
                <Button id="member_information_btn_seniorreset"
                        @click="resetSearch">
                  重置
                </Button>
              </Form-item>
            </Form>
          </DropdownMenu>
        </Dropdown>

      </div>

      <div v-if="loadedSuccess">
        <Table id="member_information_table_memberlist" stripe :columns="userListTitle" :data="userListData"
               @on-selection-change="batchOperation"
               style="clear: both"></Table>
        <Page id="member_information_page_memberlist" :total="page.total_num" show-elevator show-total
              style="float: right;margin:10px 0 10px 0;" :current="page.current_page"
              @on-change="page_change" :page-size="10" size="small"></Page>
      </div>
      <error-view id="member_information_list_error" :error="listError" name="会员" @action="errorAction"
                  :loading="loadingList"></error-view>
    </card>
    <!--详细资料-->
    <card v-if="$route.query.st == 1" dis-hover>
      <p slot="title">
        <Breadcrumb>
          <Breadcrumb-item>会员管理</Breadcrumb-item>
          <Breadcrumb-item>会员列表</Breadcrumb-item>
          <Breadcrumb-item>详细资料</Breadcrumb-item>
        </Breadcrumb>
      </p>
      <row>
        <iCol style="margin-bottom: 20px">
          <Button id="member_information_btn_back_list" @click="backList" type="primary">
            返回
          </Button>
        </iCol>
        <iCol :xs="24" :sm="20" :md="16" :lg="10">
          <Form ref="userItem" :model="userItem" :label-width="80">
            <Form-item label="微信昵称">
              <Input id="member_information_input_nickname"
                     :value="userItem.nickName ? userItem.nickName : ' -'"
                     readonly></Input>
            </Form-item>
            <Form-item label="会员等级">
              <Input id="member_information_input_roleName" :maxlength="20"
                     :value="userItem.levelName ? userItem.levelName : ' -'"
                     readonly></Input>
            </Form-item>

            <Form-item label="生日">
              <Input id="member_information_input_birthday" :maxlength="20"
                     :value="userItem.birthday ? new Date(userItem.birthday).toLocaleDateString() : ' -'"
                     readonly></Input>
            </Form-item>
          </Form>
        </iCol>
      </row>
      <p class="title">更多信息</p>
      <row>
        <iCol :xs="24" :sm="20" :md="16" :lg="10">
          <Form ref="userItem" :model="userItem" :label-width="80">
            <Form-item label="性别">
              <Input v-if="userItem.sex == 0" id="member_information_input_sex_unknow" :maxlength="20"
                     value="未知"
                     readonly></Input>
              <Input v-if="userItem.sex == 1" id="member_information_input_sex_male" :maxlength="20"
                     value="男"
                     readonly></Input>
              <Input v-if="userItem.sex == 2" id="member_information_input_sex_female" :maxlength="20"
                     value="女"
                     readonly></Input>
            </Form-item>

            <Form-item label="邮箱">
              <Input id="member_information_input_mail"
                     :value="userItem.email ? userItem.email : ' -'"
                     readonly></Input>
            </Form-item>

            <Form-item label="QQ">
              <Input id="member_information_input_qq" :maxlength="20"
                     :value="userItem.qq ? userItem.qq : ' -'"
                     readonly></Input>
            </Form-item>

            <Form-item label="备注">
              <Input id="member_information_input_remarks"
                     :value="userItem.remarks ? userItem.remarks : ' -'"
                     readonly></Input>
            </Form-item>
          </Form>
        </iCol>
      </row>
    </card>
  </div>
</template>
<script type="text/ecmascript-6">
  export default {
    data () {
      return {
        listError: null,               // 列表加载错误类型
        loadingList: false,
        loadedSuccess: false,         // 是否加载成功
        labelModal: false,
        moreOperation: true,
        seniorSearch: '',          // 是否是高级查询
        page: {
          current_page: 1,
          total_num: 0
        },
        currentIndex: 0,
        currentItem: {},
        provinceList: [],
        cityList: [],
        labels: [],
        level: '',
        searchConfig: {
          keywords: '',
          level: '',
          city: '',
          province: '',
          provinceId: ''
        },
        levelsList: [],
        levelsBtnList: [],
        levelNum: 0,
        loading: false,
        updatedata: {},
        search_time: ['2016-01-01', '2016-02-15'],
        userListTitle: [
          {
            type: 'selection',
            width: 55,
            align: 'center'
          },
          {
            ellipsis: true,
            title: '微信昵称',
            width: 320,
            render: (h, params) => {
              return h('div', [
                h('a', {
                  style: {marginBottom: '8px', whiteSpace: 'normal'},
                  on: {
                    click: () => {
                      this.showInfo(params.row)
                    }
                  }
                }, params.row.nickName),
                h('br'),
                h('Icon', {props: {type: 'clock'}, style: {'padding-left': '5px'}}),
                h('span', `${params.row.createdTime ? new Date(params.row.createdTime).toLocaleString() : ' -'}`)
              ])
            }
          },
          {
            title: '地区',
            width: 250,
            render: function (h, params) {
              return h('p', ` ${params.row.address || '-'}`)
            },
            align: 'left'
          },
          {
            title: '状态',
            align: 'left',
            render: (h, p) => {
              return h('span', `${p.row.status === 0 ? '正常' : '锁定'}`)
            }
          },
          {
            title: '消费',
            render: (h, p) => {
              return h('div', [
                h('div', [
                  h('span', '次数：'),
                  h('span', `${p.row.purchaseTimes || '-'}`)
                ]),
                h('div', [
                  h('span', '金额：'),
                  h('span', `${p.row.purchaseAmount ? (p.row.purchaseAmount / 100).toFixed(2) : '-'}`)
                ])
              ])
            }
          },
          {
            title: '等级',
            align: 'left',
            render: (h, p) => {
              return h('span', p.row.levelName || '-')
            }
          },
          {
            title: ' ',
            width: 100,
            align: 'left',
            render: (h, params) => {
              return h('Button-group', [
                h('Button', {
                  on: {
                    click: (evt) => {
                      this.showInfo(params.row)
                      evt.stopPropagation()
                    }
                  }
                }, '详情')
              ])
            }
          }
        ],
        userListData: [],
        userItem: {}
      }
    },
    methods: {
      downloadOperation: function (name) {
        let idArray = []
        let nameArray = []
        for (let i in this.currentItem) {
          idArray.push(this.currentItem[i].id)
          nameArray.push(this.currentItem[i].nickName)
        }
        name = parseFloat(name)
        switch (name) {
          case 0:
            this.$http.put(`/crm/customer/status`, {
              ids: idArray,
              status: 1
            }).then((res) => {
              this.$Message.success('批量锁定成功')
              this.getUserList(this.page.current_page, this.searchConfig.keywords)
            }).catch((res) => {
              this.$Message.error(res.message)
            })
            break;
          case 1:
            this.$http.put(`/crm/customer/status`, {
              ids: idArray,
              status: 0
            }).then((res) => {
              this.$Message.success('批量解锁成功')
              this.getUserList(this.page.current_page, this.searchConfig.keywords)
            }).catch((res) => {
              this.$Message.error(res.message)
            })
            break;
          case 2:
            this.$router.push({
              path: this.$route.path
            })
            this.$Modal.confirm({
              title: '删除会员',
              content: this.$C.MSG_COMM_DELETE_CONFIRM.format('会员', nameArray),
              onOk: () => {
                this.loading = true
                this.$http.put(`/crm/customer/delete`, {
                  ids: idArray
                }).then(() => {
                  this.$Message.success('删除成功')
                  this.getUserList(this.page.current_page, this.searchConfig.keywords)
                }).catch((res) => {
                  this.$Message.error(res.message)
                })
              }
            })
            break;
          case 3:
            this.level = []
            this.$router.push({
              path: this.$route.path,
              query: {
                modal: '3'
              }
            })
            this.labelModal = true
            break;
          default:
            this.$http.put('/crm/customer/level', {
              ids: idArray
            }).then((res) => {
              this.$Message.success('清除等级成功')
              this.getUserList(this.page.current_page, this.searchConfig.keywords)
            }).catch((res) => {
              this.$Message.error(res.message)
            })
        }
      },
      page_change: function (index) {
        this.page.current_page = index
        this.getUserList(this.page.current_page, this.searchConfig.keywords)
      },
      batchOperation: function (data) {
        this.currentItem = data
        if (data.length > 0) {
          this.moreOperation = false
        } else {
          this.moreOperation = true
        }
      },
      setUser: function (id) {
        let idArray = []
        for (let i in this.currentItem) {
          idArray.push(this.currentItem[i].id)
        }
        if (this.levelsList.length !== 0) {
          this.$http.put('/crm/customer/level', {
            ids: idArray,
            levelId: id
          }).then((res) => {
            this.$Message.success('操作成功')
            this.getUserList(this.page.current_page, this.searchConfig.keywords)
          }).catch((res) => {
            this.$Message.error(res.message)
          }).finally((mes) => {
            this.labelModal = false
          })
        }
      },
      seniorSearchFuc: function () {
        this.seniorSearch = 'seniorSearch'
        this.getUserList(this.page.current_page)
      },
      resetSearch: function () {
        this.searchConfig = {
          keywords: '',
          level: '',
          label: '',
          city: '',
          min: null,
          max: null,
          province: '',
          provinceId: ''
        }
        this.getUserList(1)
      },
      getUserList: function (page, word) {
        this.page.current_page = page
        this.loadingList = true
        this.moreOperation = true  // 更多操作按钮置灰
        if (this.seniorSearch === 'seniorSearch') {
          this.updatedata = {
            'page': 1,
            'size': 10,
            'queryFilter': [
              {property: 'levelName', op: '=', value: this.searchConfig.level},
              {property: 'provinceCode', op: '=', value: this.searchConfig.province},
              {property: 'cityCode', op: '=', value: this.searchConfig.city},
              {property: 'status', op: '=', value: this.searchConfig.status}
            ]
          }
          // 清除数组中空元素
          let filterData = []
          for (let i in this.updatedata.queryFilter) {
            if (this.updatedata.queryFilter[i].value || this.updatedata.queryFilter[i].value === 0) {
              filterData.push(this.updatedata.queryFilter[i])
            }
          }
          this.updatedata.queryFilter = filterData
        } else {
          this.updatedata = {
            '_loading': true,
            'page': page,
            'size': 10,
            'orderBy': [
              {
                property: 'createdTime',
                'order': 'desc'
              }
            ]
          }
          if (word) {
            this.updatedata.wd = word
          }
        }
        if (this.$route.query.levelId) {
          if (this.updatedata.queryFilter) {
            this.updatedata.queryFilter.push({property: 'levelId', op: 'like', value: this.$route.query.levelId})
          } else {
            this.updatedata.queryFilter = [{property: 'levelId', op: 'like', value: this.$route.query.levelId}]
          }
        }
        this.$http.post(`/crm/customers/search`, this.updatedata).then((res) => {
          this.loadedSuccess = true
          this.listError = null
          this.page.total_num = res.totalCount
          if (!res.totalCount) {
            if (this.seniorSearch) {
              this.listError = {title: '没有相关会员', content: `系统中还没有符合查询条件的会员，您可以注册一个！`}
            } else if (this.searchConfig.keywords) {
              this.listError = {title: '没有相关会员', content: `没有找到和【${this.searchConfig.keywords}】相关的会员，您可以注册或者换个关键词试试！`}
            } else {
              this.listError = {title: '没有会员', content: `系统中还没有会员，您可以注册一个！`}
            }
            if (this.$route.query.levelId) {
              this.listError = {title: '没有相关会员', content: `<b>【${this.$route.query.name}】</b>等级下没有找到相关的会员，您可以注册或者换个关键词试试！`}
            }
            this.loadedSuccess = false
            this.page.total_num = 0
          }
          this.userListData = res.content
        }).catch((res) => {
          this.loadedSuccess = false
          this.listError = {...this.$Err.unhandled()}
        }).finally(() => {
          this.seniorSearch = ''
          this.loadingList = false
        })
      },
      backList: function () {
        this.getUserList(this.page.current_page)
        this.$router.go(-1)
      },
      showInfo: function (item) {
        this.userItem = item
        this.$router.push({
          path: this.$route.path,
          query: {
            q: item.id,
            st: 1
          }
        })
      },
      getCity: function () {
        this.$http.get(`/system/dict/region/${this.searchConfig.province}/subs`).then((location) => {
          this.cityList = location
        }).catch((res) => {
          this.$Message.error('获取城市信息失败')
          console.log(res)
        })
      },
      errorAction: function () {
        this.getUserList(this.page.current_page, this.searchConfig.keywords)
      },
      getUserById: function (id) {
        this.$http.get(`crm/member/${id}`).then((res) => {
          this.userItem = res
        }).catch((res) => {
          this.$Message.error('获取当前编辑会员信息失败')
        })
      },
      levelPage: function (page) {
        this.getLevelList(page)
      },
      getLevelList: function (page, size) {
        this.$http.post('/crm/levels/search', {
          page: page,
          size: size || 12
        }).then((res) => {
          // 判断是初始化还是翻页操作
          if (size) {
            this.levelsList = res.content
            this.levelsBtnList = res.content.slice(0, 12)
          } else {
            this.levelsBtnList = res.content
          }
          this.levelNum = res.totalCount
        }).catch((location) => {
          this.$Message.error('获取等级列表失败')
        })
      },
      showAll: function () {
        this.$router.push({
          path: this.$route.path
        })
        this.getUserList(1, this.searchConfig.keywords)
      }
    },
    mounted: function () {
//      if (this.$http.defaults.baseURL.indexOf(':8182') !== -1) {
//        console.log('已经切换到http://192.168.1.188:8183/cbc/v1')
//        this.$http.defaults.baseURL = 'http://192.168.1.188:8183/cbc/v1';
//      }
      if (this.$route.query.q) {
        this.getUserById(this.$route.query.q)
        this.getUserList(this.page.current_page)
      } else {
        this.getUserList(this.page.current_page)
      }
      this.$http.get('/system/dict/region/_/subs').then((location) => {
        this.provinceList = location
      }).catch((location) => {
        this.$Message.error('获取省份信息失败')
      })
      this.getLevelList(1, 999)
    }
  }
</script>

<style>
  .title {
    background: #f8f8f9;
    padding: .5em 1em;
    margin: 0 -16px 10px -16px;
  }

  #member_information_dropdown_seniorsearch .ivu-select-dropdown-list {
    max-height: 350px !important;
    overflow: auto;
  }
</style>
