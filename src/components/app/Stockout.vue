<template>
  <div class="app-stock">
    <div v-if="$route.query.action == null" class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>出库列表</h1>
      </div>
    </div>
    <div v-if="$route.query.action == null" class="app-search bottom-border">
      <input type="date" placeholder="开始时间" :max="orders.endTime" v-model="orders.beginTime" @change="searchFunc" class="flex" />
      <input type="date" placeholder="结束时间" :min="orders.beginTime" v-model="orders.endTime" @change="searchFunc" class="flex" />
    </div>
    <div v-if="$route.query.action == null" class="app-search bottom-border">
      <input type="text" v-model="orders.keyword" placeholder="订单号/经销商查询" @keyup.enter="searchFunc" style=" flex-grow: 1;">
      <Button icon="search" type="primary" @click="searchFunc" :loading="orders.busy"></Button>
    </div>
    <list-panel ref="productionList" class="app-body app-production-body" :pageable="loadMore" @scroll="scroll"
                @nextpage="nextpage" @refresh="refresh">
      <div v-if="$route.query.action == null" slot="items" class="app-list app-production-list">
        <div class="app-production-group" v-for="d in store" :class="{'app-production-group-collapsed': showShore[d.key]}"
             :key="d.key" :data-date="d.key">
          <div class="app-production-date" @click="collapseGroup(d.key)" v-if="d.items.length"> {{ d.date }}</div>

          <v-touch class="app-production-list-item app-list-button" v-for="(item, inx) in d.items" :key="inx"
                   @tap="showDetal(item)" @press="openDetailList(item.id)">
            <div class="app-production-item"
                 :class="{'app-production-item-selected': editItems.indexOf(item.id) >= 0}">
              <div class="app-list-info-group">
                <div class="app-list-info">
                  <i>订单号</i>
                  <h2>{{ item.orderNo }}</h2>
                  <i>经销商</i>
                  <h2 style="display: block; max-width: 10em">{{ item.dealerName }}</h2>
                </div>
                <div class="app-list-info-sep">&nbsp;&nbsp;</div>
                <div class="app-list-info flex">
                  <i>生产状态</i><br>
                  <h2 :class="[`app-stock-status-${item.status}`]" v-if="item.status === 3" style="color: #19be6b">{{ statusName[item.status] }}</h2>
                  <h2 :class="[`app-stock-status-${item.status}`]" v-else>{{ statusName[item.status] }}</h2>
                  <i>紧急程度</i><br>
                  <h2 :class="[`app-stock-status-${item.status}`]" v-if="item.urgentLevel === 1" style="color: #ff7980; font-weight: bold">加急</h2>
                  <h2 :class="[`app-stock-status-${item.status}`]" v-else>常规</h2>
                </div>
                <div class="app-list-info-sep">&nbsp;&nbsp;</div>
                <div class="app-list-info">
                  <i>创建时间</i>
                  <h2>{{ new Date(item.createdTime).toLocaleDateString() || '-' }}</h2>
                </div>
              </div>
            </div>
          </v-touch>
        </div>
      </div>
      <div slot="anchor" class="app-production-date app-production-date-float" v-show="currentKey"  @click="collapseGroup(currentKey)">
        {{ currentDate }}
      </div>
      <div slot="items" class="app-list-empty" v-if="orders.length === 0 && !loadingList">
        没有找到符合条件的入库单
      </div>
      <div slot="items" class="app-list-empty" v-if="loadingList">
        正在加载中...
      </div>
    </list-panel>

  </div>
</template>

<script>
  import ListPanel from '@/components/app/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        editable: false,
        editItems: [],
        busy: false,
        loadMore: false,
        scanDo: true,
        pageSize: 10,
        updateList: {
          _loading: true,
          page: 1,
          size: 10,
          orderBy: [
            {
              property: 'urgentLevel',
              order: 'desc'
            },
            {
              property: 'createdTime',
              order: 'desc'
            }
          ],
          queryFilter: [
            {
              property: 'status',
              op: 'in',
              value: '2,3'
            }
          ]
        },    // 获取出库列表得参数
        updateData: {
          _loading: true
        },
        loadingList: true,
        currentDate: null,
        currentItem: {
          orderNo: ''
        },
        scanDetal: {},
        statusName: ['待确认', '已下发', '生产中', '已生产', '已发货', '已接收'],
        orders: [],
        stockList: [],
        store: [],
        currentKey: null,
        showShore: {}
      }
    },
    methods: {
      nextpage: function (callback) {
        this.pageSize += this.pageSize
        this.updateList.size = this.pageSize
        this.getStockoutList(callback, this.updateList)
        this.cancel()
      },
      showDetal: function (item) {
        this.stockList = []
        if (item.id) {
          this.$router.push({
            path: '/app/stockoutitem',
            query: {
              action: 'item',
              id: item.id
            }
          })
        }
      },
      openDetailList: function (id) {
        if (id) {
          this.$router.push({
            path: '/app/stockoutdetail',
            query: {
              id: id
            }
          })
        }
      },
      searchFunc: function () {
        this.pageSize = 10
        this.updateList = {
          _loading: true,
          page: 1,
          size: this.pageSize,
          orderBy: [
            {
              property: 'urgentLevel',
              order: 'desc'
            },
            {
              property: 'createdTime',
              order: 'desc'
            }
          ],
          queryFilter: [
            {
              property: 'status',
              op: 'in',
              value: '2,3'
            }
          ]
        }
        // TODO 过滤条件待定
        if (this.orders.beginTime) {
          var startTime = Date.parse(this.orders.beginTime.replace(/-/g, '/'))
          this.updateList.queryFilter.push(
            {
              property: 'createdTime',
              op: '>=',
              value: startTime
            })
        }
        if (this.orders.endTime) {
          var endTime = Date.parse(this.orders.endTime.replace(/-/g, '/') + ' 23:59:59')
          this.updateList.queryFilter.push(
            {
              property: 'createdTime',
              op: '<=',
              value: endTime
            })
        }
        if (this.orders.keyword) {
          this.updateList.wd = this.orders.keyword
        }
        this.getStockoutList(null, this.updateList)
      },
      collapseGroup: function (key) {
        this.showShore[key] = !this.showShore[key]
        let Array = this.store
        this.store = []
        for (let i = 0; i < Array.length; i++) {
          this.store.push(JSON.parse(JSON.stringify(Array[i])))
        }
      },
      scroll: function (event) {
        this.currentKey = null
        this.currentDate = null
        let box = event.target
        let top = box.scrollTop
        if (top > 0) {
          let h = 0
          let nodes = box.children[0].children
          let current = null
          for (let i = 0, ii = nodes.length; i < ii; i++) {
            let node = nodes[i]
            if (h + node.offsetHeight > top) {
              current = node
              break;
            }
            h += node.offsetHeight
          }
          if (current) {
            this.currentKey = current.dataset.date
            if (this.currentKey === 'urgent') {
              this.currentDate = '加急出库单'
            } else {
              this.currentDate = new Date(parseInt(this.currentKey)).toLocaleDateString()
            }
          }
        }
        this.scrollTo = top
      },
      refresh: function (callback) {
        this.cancel()
        this.pageSize = 10
        this.updateList.size = this.pageSize
        this.getStockoutList(callback, this.updateList)
      },
      cancel: function () {
        this.editable = false
        this.$emit('edit', false)
        if (this.$route.query.action === 'add') {
          this.$router.back()
        }
      },
      getStockoutList (callback, updateData) {
        this.stockList = []
        if (!updateData) {
          updateData = {
            _loading: true,
            page: 1,
            size: this.pageSize,
            orderBy: [
              {
                property: 'urgentLevel',
                order: 'desc'
              },
              {
                property: 'createdTime',
                order: 'desc'
              }
            ],
            queryFilter: [
              {
                property: 'status',
                op: 'in',
                value: '2,3'
              }
            ]
          }
        }
        this.loadingList = true
        this.$http.post(`/app/orders/search`, updateData).then((res) => {
          this.store = [{
            key: 'urgent',
            date: '加急出库单',
            collapsed: false,
            items: []
          }]
          //  记录用户输入时间
          let startTime = this.orders.beginTime
          let endTime = this.orders.endTime
          let keyword = this.orders.keyword
          this.orders = res.content
          //  过滤纯备货单
          // for (let i = 0; i < this.orders.length; i++) {
          //   let amount = 0
          //   for (let j = 0; j < this.orders[i].orderItems.length; j++) {
          //     amount += this.orders[i].orderItems[j].amount
          //   }
          //   if (amount === 0) {
          //     this.orders.splice(i, 1)
          //   }
          // }
          this.orders.beginTime = startTime
          this.orders.endTime = endTime
          this.orders.keyword = keyword
          if (this.pageSize < res.totalCount) {
            this.loadMore = true
          } else {
            this.loadMore = false
          }
          for (let i = 0; i < res.content.length; i++) {
            if (res.content[i].urgentLevel === 1) {
              this.store[0].items.push(res.content[i])
              this.showShore.urgent = false
            } else {
              let date = new Date(res.content[i].createdTime).toLocaleDateString()
              let Index = 0
              let item = this.store.find((item, index) => {
                Index = index
                return item.date === date
              })
              if (item) {
                this.store[Index].items.push(res.content[i])
              } else {
                this.store.push({
                  key: res.content[i].createdTime,
                  date: date,
                  collapsed: false,
                  items: [res.content[i]]
                })
                this.showShore[res.content[i].createdTime] = false
              }
            }
          }
        }).catch((res) => {
          this.$Message.error(res.message)
        }).finally(() => {
          this.cancel()
          if (typeof callback === 'function') callback()
        }).finally((res) => {
          this.loadingList = false
        })
      },
      getStockoutById (item) {
        this.$http.get(`/order/${item.id}`, {
          '_loading': true
        }).then((res) => {
          this.currentItem = res
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      doScan: function () {
        this.scanDo = true
        this.scanBoxCode()
      },
      scanBoxCode: function () {
        let scanFailed = (msg) => {
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scanBoxCode()
          })
        }
        if (this.scanDo) {
          this.scanDo = false
          this.$parent.scan().then(res => {
            this.busy = true
            this.$http.get(`/store/invoice/QrCode/${res.code}`, {_loading: true}).then((data) => {
              if (data) {
                let idarray = []
                for (let i in this.stockList) {
                  idarray.push(this.stockList[i].id)
                }
                if (idarray.indexOf(data.id) > -1) {
                  this.$Message.warning('该产品已经扫码！')
                } else {
                  this.stockList.push(data)
                }
                this.$router.replace({
                  path: this.$route.path,
                  query: { action: 'list' }
                })
              } else {
                throw new Error('没找到相关产品')
              }
            }).catch(error => {
              let msg = error.message || error.msg || '扫码失败，请稍候重试'
              if (error.code === 'COMM_BIZ_NOT_EXISTS') {
                msg = '错误的箱码，请重新扫描'
              }
              scanFailed(msg)
            }).finally(() => {
              this.busy = false
              this.scanDo = true
            })
          }).catch(res => {
            scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
          })
        }
      },
      showStockList: function () {
        this.updateData = {
          'code': this.currentItem.code,
          'orderId': this.currentItem.id,
          'info': this.currentItem.info,
          'qrList': this.stockList,
          _loading: true
        }

        this.$http.post(`/store/invoice/preview`, this.updateData).then((res) => {
          this.scanDetal = res
          this.$router.replace({
            path: this.$route.path,
            query: { action: 'detal' }
          })
        }).catch((err) => {
          this.$Message.error(err.message)
        })
      },
      stockOut: function () {
        this.$http.post(`/store/invoice`, this.updateData).then((data) => {
          this.$router.replace({
            path: this.$route.path,
            query: { action: null }
          })
          this.getStockoutList()
          this.$Message.success('出库成功')
        }).catch(error => {
          this.$parent.confirm('出库失败，请稍候重试', error, '重新出库').then(() => {
            this.scanBoxCode()
          })
        })
      },
      deleteList: function (item) {
        for (let i in this.stockList) {
          if (this.stockList[i].id === item.id) {
            this.$parent.confirm('移除', `‘${item.batchId}’批次的‘${item.productName}’产品?`, '移除').then(() => {
              this.stockList.splice(i, 1)
            })
          }
        }
      },
      backHome: function () {
        this.stockList = []
        this.$router.replace({
          path: this.$route.path,
          query: { action: null }
        })
      },
      shown: function () {
        this.stockList = []
        this.getStockoutList(null, this.updateList)
      }
    },
    mounted: function () {
      this.getStockoutList(null, this.updateList)
    }
  }
</script>

<style lang="less">
  .app-stock {
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;

  &-body {
     position: relative;
     display: flex;
     flex-direction: column;
   }

  &-date {
     padding: .8rem 1rem;
     background-color: #f5f5f5;
     color: #80848f;
     font-size: 1rem;
     display: flex;
     flex-direction: row;
     justify-content: space-between;
     position: relative;

  &:after {
     font-family: Ionicons;
     content: '\F104';
     transition: all 275ms;
   }

  &-float {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
   }
  }

  &-group {
  &-collapsed {
  .app-stock-date:after {
    transform: rotate(180deg);
  }

  .app-stock-date::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    transform-origin: 0 1;
    transform: scaleY(.33);
    background-color: rgba(0, 0, 0, .1);
  }

  .app-stock-list-item {
    display: none;
  }
  }
  }

  &-list-item {
     margin: 5px 0;
   }

  &-item {
     position: relative;
     padding: .5rem 0 1rem 0;
     background-color: white;
   }

  &-box-code {
     color: #2b85e4;
     font-weight: bold;
   }

  &-status-0 {
   }
  &-status-1 {
     color: #19be6b;
   }
  }

  .app-stock-list-edit {
  .app-stock-item {
    padding-right: 3.5rem;

  &:before {
     position: absolute;
     top: 0;
     right: 0;
     height: 100%;
     width: 3.5rem;
     display: flex;
     justify-content: center;
     align-items: center;
     font-size: 1.8rem;
     font-family: Ionicons;
     content: '\F3FE';
     color: #dddee1;
   }

  &-disabled:before {
     opacity: 0;
   }

  &-selected:before {
     content: '\F3FF';
     color: #2b85e4;
   }
  }
  }

  .app-orders-list {
  &-empty {
     text-align: center;
     padding: 1rem;
     font-size: 1rem;
   }

  &-item {
     padding: .5rem 0;
     margin: 5px 0;
     background-color: white;
   }
  }
</style>
