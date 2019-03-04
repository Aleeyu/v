<template>
  <div class="app-production">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>入库列表</h1>
      </div>
    </div>
    <div class="app-search-group">
      <div class="app-search bottom-border">
        <input type="date" placeholder="开始日期" :max="orders.endTime"v-model="orders.startTime" @change="searchFunc" class="flex"
               :class="{hasVal: orders.startTime}"/>
        <label>至</label>
        <input type="date" placeholder="结束日期" :min="orders.startTime"v-model="orders.endTime" @change="searchFunc" class="flex"
               :class="{hasVal: orders.endTime}"/>
      </div>
      <div class="app-search bottom-border">
        <input :maxlength="20" placeholder="生产单号快速查询" v-model="orders.keyword" type="search" @keyup.enter="searchFunc">
        <Button icon="search" type="primary" @click="searchFunc" :loading="loadingList"></Button>
      </div>
    </div>

    <list-panel ref="productionList" class="app-body app-production-body" :pageable="loadMore" @scroll="scroll"
                @nextpage="nextpage" @refresh="refresh">
      <div v-if="$route.query.action == null" slot="items" class="app-list app-production-list"
           :class="{'app-production-list-edit': $route.query.action === 'edit'}">
        <div class="app-production-group" v-for="d in store" :class="{'app-production-group-collapsed': showShore[d.key]}"
             :key="d.key" :data-date="d.key">
          <div class="app-production-date" @click="collapseGroup(d.key)" v-if="d.items.length"> {{ d.date }}</div>

          <v-touch class="app-production-list-item app-list-button" v-for="(item, inx) in d.items" :key="inx"
                   @tap="showDetal(item)" @press="openDetailList(item.id)">
            <div class="app-production-item"
                 :class="{'app-production-item-selected': editItems.indexOf(item.id) >= 0}">
              <div class="app-list-info-group">
                <div class="app-list-info">
                  <i>生产单号</i>
                  <h2 class="app-production-box-code">{{ item.code }}</h2>
                  <i>经销商</i>
                  <h2 style="display: block; max-width: 10em">{{ item.dealerName || '-' }}</h2>
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
                <div class="app-list-info flex">
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

<script type="text/ecmascript-6">
  import ListPanel from '@/components/app/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        editItems: [],
        busy: false,
        loadingList: true,
        currentDate: null,
        currentItem: {
          orderNo: ''
        },
        loadMore: false,
        scanDo: true,
        pageSize: 10,
        scanDetal: {},
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
        },    // 获取入库列表得参数
        updateData: {},    //  保存时上传的参数
        statusName: ['待接收', '待生产', '生产中', '已生产', '已入库'],
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
        this.getStockinList(callback, this.updateList)
      },
      showDetal: function (item) {
        this.stockList = []
        if (item.id) {
          this.$router.push({
            path: '/app/stockinitem',
            query: {
              action: 'item',
              id: item.id,
              orderId: item.orderId
            }
          })
        }
      },
      openDetailList: function (id) {
        if (id) {
          this.$router.push({
            path: '/app/stockindetail',
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
        if (this.orders.startTime) {
          this.updateList.queryFilter.push(
            {
              property: 'createdTime',
              op: '>=',
              value: Date.parse(this.orders.startTime.replace(/-/g, '/'))
            })
        }
        if (this.orders.endTime) {
          let timeStr = this.orders.endTime.replace(/-/g, '/') + ' 23:59:59'
          this.updateList.queryFilter.push(
            {
              property: 'createdTime',
              op: '<=',
              value: Date.parse(timeStr)
            })
        }
        if (this.orders.keyword) {
          this.updateList.wd = this.orders.keyword
        }
        this.getStockinList(null, this.updateList)
      },
      collapseGroup: function (key) {
        this.showShore[key] = !this.showShore[key]
        let Array = this.store
        this.store = []
        for (let i = 0; i < Array.length; i++) {
          this.store.push(JSON.parse(JSON.stringify(Array[i])))
        }
        console.log(this.showShore)
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
              this.currentDate = '加急入库单'
            } else {
              this.currentDate = new Date(parseInt(this.currentKey)).toLocaleDateString()
            }
          }
        }
        this.scrollTo = top
      },
      refresh: function (callback) {
        this.pageSize = 10
        this.updateList.size = this.pageSize
        this.getStockinList(callback, this.updateList)
      },
      getStockinList (callback, updatedata) {
        this.stockList = []
        if (!updatedata) {
          updatedata = {
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
        this.$http.post(`/production/order/search`, updatedata).then((res) => {
          this.store = [{
            key: 'urgent',
            date: '加急入库单',
            collapsed: false,
            items: []
          }]
          //  记录用户输入时间
          let startTime = this.orders.startTime
          let endTime = this.orders.endTime
          let keyword = this.orders.keyword
          this.orders = res.content
          this.orders.startTime = startTime
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
          this.loadingList = false
          if (typeof callback === 'function') callback()
        })
      },
      shown: function () {
        this.stockList = []
        this.getStockinList(null, this.updateList)
      }
    },
    mounted: function () {
      this.getStockinList(null, this.updateList)
    }
  }
</script>

<style lang="less">
  .app-production {
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
  .app-production-date:after {
    transform: rotate(180deg);
  }

  .app-production-date::before {
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

  .app-production-list-item {
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

  .app-production-list-edit {
  .app-production-item {
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
