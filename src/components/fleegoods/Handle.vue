<style lang="less">
.fleegoods-detail {
  .ivu-modal-body {
    background: #f7f7f7;
    max-height: 500px;
    overflow-y: auto;
  }
  .item {
    margin-bottom: 2px;
    background: #fff;
    padding: 10px;
    .header {
      margin-bottom: 8px;
      font-weight: bold;
      font-size: 0.7rem;
      color: #2d8cf0;
      background: #fff;
    }
  }
}
</style>

<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>窜货管理</BreadcrumbItem>
        <BreadcrumbItem>窜货处理</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <Row v-if="!error">
      <Row type="flex" justify="space-between" align="middle">
        <Button type="primary" @click="confirm()">处理</Button>
        <Row>
          <DatePicker @on-change="changeDate"
                      type="daterange" 
                      placement="bottom-end" 
                      placeholder="选择日期" 
                      format="yyyy/MM/dd" 
                      style="width:250px"></DatePicker>
          <Select v-model="queryFilter.dealer" 
                  filterable
                  clearable
                  :loading="dealer.loading"
                  style="width:250px" 
                  placeholder="选择经销商">
            <Option v-for="item in dealer.data" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Button type="default" @click="queryList(1)">搜索</Button>
        </Row>
      </Row>

      <Table :columns="handle.columns" 
             :data="handle.content"
             @on-select="selectOne"
             @on-select-cancel="cancelOne"
             @on-select-all="selectAll"></Table>

      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="handle.page"
          :page-size="handle.pageSize"
          :total="handle.totalCount"
          @on-change="queryList"></Page>
      </Row>
    </Row>

    <Modal v-model="showOneDetail" class="fleegoods-detail" :styles="{width:'600px'}" @on-ok="updateWarning([selectedOne])">
      <p slot="header">处理窜货信息复查</p>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">商品信息</Col>
        <Col><span>名称：</span><span >{{selectedOne.productName}}</span></Col>
        <Col><span>编号：</span><span >{{selectedOne.productNo}}</span></Col>
        <Col><span>规格：</span><span >{{selectedOne.qrcodeType | typeFilter}}</span></Col>
        <Col><span>数量：</span><span >{{selectedOne.unitNumber}}袋/瓶</span></Col>
      </Row>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">扫码信息</Col>
        <Col><span>扫码人：</span><span >{{selectedOne.nick}}</span></Col>
        <Col><span>扫码时间：</span><span >{{selectedOne.scanTime}}</span></Col>
        <Col><span>区域地址：</span><span >{{selectedOne.provinceName ? selectedOne.provinceName + selectedOne.cityName : '-'}}</span></Col>
      </Row>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">经销商信息</Col>
        <Col><span>经销商名称：</span><span >{{selectedOne.dealerName}}</span></Col>
        <Col><span>区域地址：</span><span >{{selectedOne.dealerProvinceName ? selectedOne.dealerProvinceName + selectedOne.dealerCityName : '-'}}</span></Col>
      </Row>
      <Row type="flex" justify="space-between" class="item">
        <Col class="header" span="24">确认信息</Col>
        <Col span="10"><span>确认人：</span><span >{{selectedOne.checker}}</span></Col>
        <Col span="10"><span>确认时间：</span><span >{{timeFilter(selectedOne.checkTime)}}</span></Col>
      </Row> 
    </Modal>

    <Modal v-model="showAllDetail" class="fleegoods-detail detail-list" :styles="{width:'600px'}" @on-ok="updateWarning(selectedList)">
      <p slot="header">处理窜货信息复查</p>
      <Row type="flex" justify="space-between" class="item" v-for="item in selectedList" :key="item.qrcodeId">
        <Col class="header" span="24">{{item.nick}}，{{item.scanTime}}扫码于：{{item.provinceName ? item.provinceName + item.cityName : '-'}}</Col>
        <Col><span>区域经销商：{{item.dealerName}}</span></Col>
        <Col><span>区域：{{item.dealerProvinceName ? item.dealerProvinceName + item.dealerCityName : '-'}}</span></Col>
        <Col><span>商品：{{item.productName}}</span>，<span>{{item.unitNumber}}袋/瓶</span></Col>
      </Row>
    </Modal>

    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoaing"></error-view>
  </Card>
</template>

<script>
export default {
  data () {
    return {
      showOneDetail: false,
      showAllDetail: false,
      dealer: {
        page: 1,
        pageSize: 1000,
        data: [],
        loading: true
      },
      handle: {
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '订单号',
            key: 'orderNo'
          },
          {
            title: '时间',
            key: 'scanTime',
            sortable: true
          },
          {
            title: '产品',
            key: 'productName'
          },
          {
            title: '数量（袋/瓶）',
            key: 'unitNumber',
            sortable: true
          },
          {
            title: '扫码人',
            key: 'nick'
          },
          {
            title: '扫码人所在区域',
            render: (h, p) => {
              return h('span', p.row.provinceName ? p.row.provinceName + p.row.cityName : '-')
            }
          },
          {
            title: '窜货经销商',
            key: 'dealerName'
          },
          {
            title: '供货区域',
            render: (h, p) => {
              return h('span', p.row.dealerProvinceName ? p.row.dealerProvinceName + p.row.dealerCityName : '-')
            }
          },
          {
            title: '状态',
            render: (h, p) => {
              return h('span', this.statusFilter(p.row.status))
            }
          },
          {
            title: '操作',
            render: (h, p) => {
              return h('Button', {
                props: {
                  type: 'primary'
                },
                on: {
                  click: () => {
                    this.confirm(p.row)
                  }
                }
              }, '处理')
            }
          }
        ],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: []
      },
      queryFilter: {
        dealer: null,
        startTime: null,
        endTime: null,
        pickTime: []
      },
      selectedOne: {},
      selectedList: [],
      error: null,
      errorLoaing: false
    }
  },
  filters: {
    typeFilter (type) {
      const typeName = {
        'UNITS_CASE': '盒',
        'UNITS_BAG': '袋/瓶',
        'UNITS_BOX': '箱'
      }
      return typeName[type] || '未定义';
    }
  },
  methods: {
    initPage () {
      this.queryList();
      this.queryDealer();
    },
    // for methods function
    timeFilter (time) {
      time = new Date(time);
      let year = time.getFullYear();
      let month = time.getMonth() + 1;
      month = month >= 10 ? month : 0 + month.toString();
      let day = time.getDate() >= 10 ? time.getDate() : 0 + time.getDate().toString();
      return `${year}/${month}/${day}`;
    },
    statusFilter (status) {
      const statusName = ['待确认', '待处理', '已处理'];
      return statusName[status] || '忽略';
    },
    queryDealer (query) {
      let data = {
        page: this.dealer.page,
        size: this.dealer.pageSize,
        orderBy: [
          { property: 'dealerLevel', order: 'asc' },
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (query) {
        data.queryFilter.push({ property: 'name', op: 'like', value: query })
      }

      // this.error ? this.errorLoading = true : data._loading = true;

      this.$http.post('/system/dealers', data).then(res => {
        this.dealer.data = res.content
      }).catch(err => {
        console.log(err)
        this.error = this.$Err.unhandled();
      }).finally(() => {
        this.dealer.loading = false;
        this.errorLoaing = false;
      })
    },
    queryList (page = this.handle.page) {
      let data = {
        page,
        size: this.handle.pageSize,
        orderBy: [
          {property: 'scanTime', order: 'desc'}
        ],
        queryFilter: [
          {property: 'status', op: '=', value: 1}
        ]
      };

      data = this.getSearch(data);

      this.error ? this.errorLoading = true : data._loading = true;

      this.$http.post(`/system/fleeingWarning/search`, data).then(res => {
        res.content && res.content.forEach(e => {
          e.scanTime = this.timeFilter(new Date(e.scanTime));
        });

        ({
          content: this.handle.content,
          page: this.handle.page,
          pageSize: this.handle.pageSize,
          totalCount: this.handle.totalCount
        } = res);
      }).catch(err => {
        console.log(err)
        this.error = this.$Err.unhandled();
      }).finally(() => {
        this.errorLoaing = false;
      })
    },
    getSearch (query) {
      if (this.queryFilter.pickTime && 
          this.queryFilter.pickTime[0] && 
          this.queryFilter.pickTime[1]) {
        query.queryFilter.push(
          {property: 'scanTime', op: '>=', value: this.queryFilter.pickTime[0]},
          {property: 'scanTime', op: '<=', value: this.queryFilter.pickTime[1]}
        )
      }

      if (this.queryFilter.dealer) {
        query.queryFilter.push(
          {property: 'dealerId', op: '=', value: this.queryFilter.dealer}
        )
      }
      return query;
    },
    changeDate (v) {
      this.queryFilter.pickTime = v.map(e => new Date(e).getTime());
    },
    confirm (one) {
      if (one) {
        this.selectedOne = one;
        this.showOneDetail = true;
      } else if (!one && this.selectedList.length > 0) {
        this.showAllDetail = true;
      }
    },
    selectOne (s, r) {
      this.selectedList = s;
    },
    cancelOne (s, r) {
      this.selectedList = s;
    },
    selectAll (s) {
      this.selectedList = s;
    },
    updateWarning (arr) {
      let data = [];
      arr.forEach(e => {
        data.push({
          qrcodeId: e.qrcodeId,
          status: 2
        })
      })
      this.$http.put(`/system/fleeingWarning/items`, {
        fleeWarningList: data
      }).then(res => {
        res ? this.initPage() : '';
      }).catch(err => {
        console.log(err);
        this.error = this.$Err.unhandled();
      }).finally(() => {
        this.errorLoaing = false;
      })
    }
  },
  mounted () {
    this.initPage();
  }
}
</script>

