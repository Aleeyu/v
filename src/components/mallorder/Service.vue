<style lang="less">
  .service-detail {
    margin-top: 10px;
    .ivu-modal-body {
      background: #f7f7f7;
      max-height: 500px;
      overflow-y: auto;
    }
    .item {
      background: #fff;
      padding: 10px;
      font-size: 0.7rem;
      .header {
        margin-bottom: 8px;
        font-weight: bold;
        font-size: 0.9rem;
        color: #2d8cf0;
        background: #fff;
      }
      textarea {
        font-size: 12px;
      }
    }
  }
</style>

<template>
  <Card class="mallorder-service">
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>商城订单管理</BreadcrumbItem>
        <BreadcrumbItem>客服工单</BreadcrumbItem>
        <BreadcrumbItem v-show="displayDetail">客服工单</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <Row type="flex" justify="end" align="middle" v-show="!displayDetail">
      <DatePicker type="daterange"
        @on-change="changeDate" 
        :options="service.dateOptions" 
        placement="bottom-end" 
        placeholder="选择更新时间段" 
        style="width: 250px;margin-right: 10px"></DatePicker>
      <Input v-model="queryFilter.ticketNo" 
             placeholder="关键字：工单号"
             style="width: 250px;margin-right: 10px" @on-enter="queryList(1)"></Input>
      <Button type="default" @click="queryList(1)">搜索</Button>
    </Row>

    <Row v-show="!displayDetail">
      <Table :columns="service.columns" :data="service.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
            show-elevator
            show-total
            :current="service.page"
            :page-size="service.pageSize"
            :total="service.totalCount"
            @on-change="queryList"></Page>      
      </Row> 
    </Row>

    <Row type="flex" justify="start" align="middle" v-show="displayDetail">
      <Button type="primary" @click="displayDetail=false">返回</Button>
    </Row>

    <Row v-show="displayDetail" class="service-detail">
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">客户信息</Col>
        <Col span="24" style="margin-bottom:10px">
          <span style="min-width: 70px;display:inline-block">用户名：</span>
          <span >{{detail.data.nickName}}</span>
        </Col>
        <Col span="24" style="margin-bottom:10px">
          <span style="min-width: 70px;display:inline-block">工单类型：</span>
          <span >{{detail.data.typeName}}</span>
        </Col>
        <Col span="24" style="margin-bottom:10px">
          <span style="min-width: 70px;display:inline-block">提交时间：</span>
          <span >{{detail.data.createdTime ? new Date(detail.data.createdTime).toLocaleString() : '-'}}</span>
        </Col>
      </Row>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">工单内容</Col>
        <!-- <Col span="24" style="margin-bottom:5px"><span>标题：</span><span >请给我退货</span></Col> -->
        <Col span="24">
          <!-- <span>内容：</span> -->
          <div>
            “{{detail.data.ticketContent}}”
          </div>
        </Col>
      </Row>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">工单图片</Col>
        <Col span="12">
          <file-uploader typeKey="mallappserviceimages" 
            :entId="detail.data.ticketId || ''" 
            :disabled="true" 
            :showToolBar="false"></file-uploader>
        </Col>
      </Row>
    </Row>

  </Card>
</template>

<script>
import FileUploader from '@/components/common/FileUploader'

export default {
  components: {FileUploader},  
  data () {
    return {
      displayDetail: false,
      service: {
        wd: null,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: [],
        columns: [
          {
            title: '工单号',
            key: 'ticketNo'
          },
          {
            title: '工单分类',
            key: 'typeName'
          },
          {
            title: '申请人',
            key: 'nickName'
          },
          {
            title: '创建时间',
            render: (h, p) => {
              return h('span', p.row.createdTime ? new Date(p.row.createdTime).format() : '-')
            }
          },
          {
            title: '更新时间',
            render: (h, p) => {
              return h('span', p.row.updatedTime ? new Date(p.row.updatedTime).format() : '-')
            }
          },
          {
            title: '状态',
            render: (h, p) => {
              return h('span', this.filterStatus(p.row.status))
            }
          },
          {
            title: '操作',
            width: 223,
            render: (h, p) => {
              return h('ButtonGroup', [
                h('Button', {
                  props: {
                    type: 'default'
                  },
                  on: {
                    click: () => {
                      this.showDetail(p.row.ticketId)
                    }
                  }
                }, '查看'),
                h('Button', {
                  props: {
                    type: 'primary',
                    disabled: p.row.status === 1 ? true : false
                  },
                  on: {
                    click: () => {
                      this.handle(p.row.ticketId)
                    }
                  }
                }, '处理')    
              ])
            }
          }
        ],
        dateOptions: {
          shortcuts: [
            {
              text: '一周内',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start, end];
              }
            },
            {
              text: '一月内',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
              }
            },
            {
              text: '一季内',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        }
      },
      detail: {
        ticketId: null,
        data: {}
      },
      queryFilter: {
        pickTime: [],
        ticketNo: null
      }
    }
  },
  methods: {
    initPage () {
      this.queryList();
    },
    filterStatus (s) {
      let status = ['待处理', '已处理'];
      return status[s];
    },
    queryList (page = 1) {
      let data = {
        page,
        size: this.service.pageSize,
        orderBy: [
          {property: 'status', order: 'asc'},
          {property: 'createdTime', order: 'desc'}
        ],
        queryFilter: []
      };
      
      this.error ? this.errorLoading = true : data._loading = true;

      this.$http.post(`/market/ticket/search`, this.formatSearch(data)).then(res => {
        ({content: this.service.data, page: this.service.page, totalCount: this.service.totalCount} = res);
      }).catch(err => {
        console.log(err);
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    formatSearch (query) {
      if (this.queryFilter.pickTime && 
          this.queryFilter.pickTime[0] && 
          this.queryFilter.pickTime[1]) {
        query.queryFilter.push(
          {property: 'updatedTime', op: '>=', value: this.queryFilter.pickTime[0]},
          {property: 'updatedTime', op: '<=', value: this.queryFilter.pickTime[1] + 24 * 60 * 60 * 1000 - 1}
        )
      }

      if (this.queryFilter.ticketNo) {
        query.queryFilter.push({
          property: 'ticketNo', op: 'like', value: this.queryFilter.ticketNo
        })
      }

      return query;
    },
    showDetail (id) {
      this.$http.get(`/market/ticket/${id}`).then(res => {
        this.detail.data = res;
        if (res.status === 1) this.detail.disabled = true;
        this.displayDetail = true;
      }).catch(err => {
        console.log(err);
        this.error = this.$Err.unhandled();
      })
    },
    changeDate (v) {
      this.queryFilter.pickTime = v.map(e => new Date(e).getTime());
    },
    handle (id) {
      if (this.detail.disabled) return this.$Message.error('工单已处理');
      if (this.error) {
        this.errorLoading = true;
      }

      this.$Modal.confirm({
        title: '订单处理提醒',
        content: '确定处理该订单吗？',
        onOk: () => {
          this.$http.put(`/market/ticket/${id}`, {
            status: 1
          }).then(res => {
            this.error = null;
            res ? this.$Message.info('处理成功') : this.$Message.error('处理失败');
            this.initPage();
          }).catch(err => {
            console.log(err);
            this.error = this.$Err.unhandled();
          }).finally(() => {
            this.errorLoading = false
          })
        }
      })
    }
  },
  mounted () {
    this.initPage();
  }
}
</script>

