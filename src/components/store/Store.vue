<style lang="less">
  .store-container {
    .ivu-select-dropdown {
      width: 180px!important;
    }
  }
</style>

<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>库存管理</BreadcrumbItem>
        <BreadcrumbItem>库存信息管理</BreadcrumbItem>
        <BreadcrumbItem v-if="displayOperation">操作记录列表</BreadcrumbItem>
        <BreadcrumbItem v-if="displayInventory">出/入库信息列表</BreadcrumbItem>
      </Breadcrumb>
    </p>

    <!-- 库存信息列表 -->
    <Row v-show="displayStore">
      <!-- 搜索功能 -->
      <Row type="flex" justify="end" align="middle" class="store-container">
        <Input v-model="store.wd" style="width: 350px;" placeholder="产品名称" @on-enter="queryStore(1)">
          <Select v-model="dealer.selectedDealer" 
            filterable
            clearable
            :loading="dealer.loading"
            slot="prepend"
            style="width:120px"
            placeholder="选择经销商">
            <Option v-for="item in dealer.data" :value="item.name" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Button slot="append" @click="queryStore(1)">搜索</Button>
        </Input>
      </Row>
      <Table stripe :columns="store.columns" :data="store.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="store.page"
          :page-size="store.pageSize"
          :total="store.totalCount"
          @on-change="queryStore"></Page>
      </Row>
    </Row>

    <!-- 操作记录列表 -->
    <Row v-show="displayOperation">
      <!-- 搜索功能 -->
      <Row type="flex" justify="space-between" align="middle">
        <Button type="primary" @click="goBack">返回</Button>
        <RadioGroup v-model="operation.ivtStatus" type="button" @on-change="queryOperation(1)">
          <Radio label="出库"></Radio>
          <Radio label="入库"></Radio>
        </RadioGroup>
        <Input v-model="operation.wd" style="width: 220px;" placeholder="单号" @on-enter="queryOperation(1)">
          <Button slot="append" @click="queryOperation(1)">搜索</Button>
        </Input>
      </Row>
      <Table stripe :columns="operation.columns" :data="operation.data"></Table>
      <Row type="flex" justify="end">
        <Page size="small"
          show-elevator
          show-total
          :current="operation.page"
          :page-size="operation.pageSize"
          :total="operation.totalCount"
          @on-change="queryOperation"></Page>
      </Row>
    </Row>

    <!-- 出/入库信息列表 -->
    <Row v-if="displayInventory">
      <!-- 搜索功能 -->
      <Row type="flex" justify="space-between" align="middle">
        <Button type="primary" @click="goBack">返回</Button>
      </Row>
      <Table stripe :columns="inventory.columns" :data="inventory.data"></Table>
    </Row>

    <!-- 异常界面 -->
    <error-view v-if="error" :error="error" @action="initPage" :loading="errorLoaing"></error-view>
  </Card>
</template>

<script>
  /**
   * 通过url界定状态
   * 未匹配的状态将会进入默认界面
   * 默认界面：没有
   * 操作记录列表：st=operation&pdid=?&dlid=?
   * 出/入库信息列表：st=inventory&ivid=?
   */
  export default {
    data () {
      return {
        selectedOption: {
          productId: '',
          dealerId: ''
        },
        dealer: {
          page: 1,
          pageSize: 10000,
          data: [],
          loading: true,
          selectedDealer: null
        },
        store: {
          wd: null,
          columns: [
            {
              title: '产品名称',
              key: 'productName'
            },
            {
              title: '库存数量（盒）',
              key: 'amount'
            },
            {
              title: '库存数量备注',
              key: 'amountInfo'
            },
            {
              title: '备货数量（盒）',
              key: 'reserveAmount'
            },
            {
              title: '备货数量备注',
              key: 'reserveAmountInfo'
            },
            {
              title: '经销商',
              render (h, p) {
                return h('span', p.row.dealerName || '厂商')
              }
            },
            {
              title: ' ',
              align: 'right',
              render: (h, p) => {
                return h('Button', {
                  on: {
                    click: () => {
                      // p.row.dealerId
                      // ? (this.operation.isVendor = false, this.operation.ivtStatus = '收货')
                      // : (this.operation.isVendor = true, this.operation.ivtStatus = '出库');
                      this.selectedOption.productId = p.row.productId;
                      this.selectedOption.dealerId = p.row.dealerId;
                      this.showOperation();
                    }
                  }
                }, '详细信息')
              }
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: []
        },
        operation: {
          ivtStatus: '出库',
          wd: null,
          columns: [
            {
              title: '单号',
              key: 'code'
            },
            {
              title: '发货人',
              render (h, p) {
                return h('span', p.row.sendBy || '厂商')
              }
            },
            {
              title: '发货经销商',
              render (h, p) {
                return h('span', p.row.sendDepName || '厂商')
              }
            },
            {
              title: '发货时间',
              render (h, p) {
                return h('span', new Date(p.row.sendTime).toLocaleString())
              }
            },
            {
              title: '收货人',
              render (h, p) {
                return h('span', p.row.receivedBy || '无')
              }
            },
            {
              title: '收货经销商',
              render (h, p) {
                return h('span', p.row.receivedDepName || '厂商')
              }
            },
            {
              title: '收货时间',
              render (h, p) {
                return h('span', p.row.receivedTime ? new Date(p.row.receivedTime).toLocaleString() : '暂未收货')
              }
            },
            {
              title: ' ',
              align: 'right',
              render: (h, p) => {
                return h('Button', {
                  on: {
                    click: () => {
                      this.showInventory(p.row.id)
                    }
                  }
                }, '详细信息')
              }
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: []
        },
        inventory: {
          wd: null,
          columns: [
            {
              title: '产品名称',
              key: 'productName'
            },
            {
              title: '产品数量',
              key: 'amount'
            },
            {
              title: '产品数量备注',
              key: 'amountInfo'
            }
          ],
          page: 1,
          pageSize: 10,
          totalCount: 0,
          data: []
        },
        error: null,
        errorLoaing: false,
        firstLoading: true
      }
    },
    methods: {
      /* 根据url界定状态，用于进入页面时的初始化 */
      initPage () {
        let st = this.$route.query.st;
        if (st === 'inventory') {
          this.queryInventory();
        } else if (st === 'operation') {
          this.queryOperation();
        }
        this.queryStore();
        this.queryDealer();
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

        this.$http.post('/system/dealers', data).then(res => {
          this.dealer.data = res.content;
          this.dealer.data.unshift({
            name: '厂商',
            id: '0001'
          })
        }).catch(err => {
          console.log(err)
          this.error = this.$Err.unhandled();
        }).finally(() => {
          this.dealer.loading = false;
          this.errorLoaing = false;
        })
      },
      queryStore (page = this.store.page) {
        let data = {
          _loading: true,
          page: page,
          size: this.store.pageSize,
          orderBy: [
            { property: 'dealerName', order: 'asc' }
          ],
          queryFilter: [
            {property: 'productName', op: 'like', value: this.store.wd || ''}
          ]
        }

        if (this.dealer.selectedDealer) {
          data.queryFilter.push({
            property: 'dealerName',
            op: '=',
            value: this.dealer.selectedDealer === '厂商' ? '' : this.dealer.selectedDealer
          })
        }

        this.error ? this.errorLoading = true : data._loading = true;

        this.$http.post(`/store/storeProducts/search`, data).then(res => {
          this.store.data = res.content
          this.store.page = res.page
          this.store.totalCount = res.totalCount

          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoaing = false
          this.firstLoading = false
        })
      },
      showOperation () {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 'operation',
            pdid: this.selectedOption.productId,
            dlid: this.selectedOption.dealerId
          }
        })
        this.queryOperation()
      },
      showInventory (id) {
        this.$router.push({
          path: this.$route.path,
          query: {
            st: 'inventory',
            ivid: id
          }
        })
        this.queryInventory()
      },
      queryOperation (page = this.operation.page) {
        const isInStore = this.operation.ivtStatus === '入库';

        let data = {
          _loading: true,
          page: page,
          size: this.operation.pageSize,
          orderBy: [
            {property: 'sendTime', order: 'desc'}
          ],
          queryFilter: [
            {property: isInStore ? 'receivedDep' : 'sendDep', op: '=', value: this.$route.query.dlid},
            {property: 'code', op: 'like', value: this.operation.wd || ''}
          ]
        }

        this.error ? this.errorLoading = true : data._loading = true;

        this.$http.post(`/store/invoiceReceipt/product/${this.$route.query.pdid}/search`, data).then(res => {
          ({content: this.operation.data, page: this.operation.page, totalCount: this.operation.totalCount} = res);
          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      queryInventory () {
        const isVendor = !this.selectedOption.dealerId && this.operation.ivtStatus === '入库';

        this.$http.get(`/store/${isVendor ? 'receiptItems' : 'invoiceItems'}/${this.$route.query.ivid}`, true).then(res => {
          ({
            storeInfo: this.inventory.info,
            storeItems: this.inventory.data
            } = res);
          this.error = null
        }).catch(error => {
          console.error(error)
          this.error = this.$Err.unhandled()
        }).finally(() => {
          this.errorLoading = false
          this.firstLoading = false
        })
      },
      goBack () {
        let query = this.$route.query.st === 'inventory'
          ? {
            st: 'operation',
            pdid: this.selectedOption.productId,
            dlid: this.selectedOption.dealerId
          }
          : {};
        this.$router.push({
          path: this.$route.path,
          query
        })
      }
    },
    computed: {
      displayStore () {
        return !this.displayOperation &&
          !this.displayInventory &&
          !this.error && !this.firstLoading
      },
      displayOperation () {
        return !this.error && !this.firstLoading &&
          this.$route.query.pdid &&
          this.$route.query.st === 'operation'
      },
      displayInventory () {
        return !this.error && !this.firstLoading &&
          this.$route.query.ivid &&
          this.$route.query.st === 'inventory'
      }
    },
    mounted () {
      this.initPage()
    }
  }
</script>
