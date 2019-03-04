<template>
  <div class="app-production">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>添加箱码</h1>
        <h4>请先选择下面的一个生产单，然后点击
          <Icon type="android-expand"></Icon>
          按钮扫描箱码
        </h4>
      </div>
    </div>

    <div class="app-search-group">
      <div class="app-search bottom-border">
        <input type="date" placeholder="开始日期" :max="endDate" v-model="beginDate" class="flex"
               :class="{hasVal: beginDate}"/>
        <label>至</label>
        <input type="date" placeholder="结束日期" :min="beginDate" v-model="endDate" class="flex"
               :class="{hasVal: endDate}"/>
      </div>
      <div class="app-search bottom-border">
        <input :maxlength="20" placeholder="输入生产单号快速查询" v-model="keyword" type="search" @keyup.enter="queryByManual">
        <Button icon="search" type="primary" @click="queryByManual" :loading="busy"></Button>
      </div>
    </div>

    <list-panel class="app-body app-production-body" @refresh="queryByManual" v-if="store != null" @scroll="scroll"
                @nextpage="queryByPage" :refreshable="!busy" :pageable="!last">
      <div slot="items" class="app-list" v-if="$isArray(store, true)">

        <div class="app-orders-group" v-for="d in store" :class="{'app-orders-group-collapsed': d.collapsed}"
             :key="d.key" :data-date="d.key">
          <div class="app-orders-date" @click="collapseGroup(d.key)"> {{ d.date }}</div>

          <v-touch class="app-orders-list-item app-list-button" v-for="item in d.items" :key="item.id"
                   :class="{selected: selected && item.id === selected.id, 'app-orders-list-item-urgent': item.urgentLevel === 1}"
                   @tap="orderItemSelected(item)" @press="getOrderDetail(item)">
            <div class="app-list-info-group">
              <div class="app-list-info flex">
                <i>生产单号</i>
                <h2>{{ item.code }}</h2>
              </div>
              <div class="app-list-info-sep">&nbsp;&nbsp;</div>
              <div class="app-list-info" style="width: 7rem;">
                <i>计划数量</i>
                <h2>{{ item.box || 0 }}箱{{item.cases || 0}}盒</h2>
              </div>
              <div class="app-list-info-sep">&nbsp;&nbsp;</div>
              <div class="app-list-info" style="width: 7rem;">
                <i>完成箱数</i>
                <h2>{{ item.completeBox || 0 }}箱</h2>
              </div>
            </div>
          </v-touch>
        </div>
      </div>
      <div v-else slot="items" class="app-orders-list-empty">
        没有找到符合条件的生产单
      </div>
      <div slot="anchor" class="app-production-date app-production-date-float" v-show="currentKey"
           @click="collapseGroup(currentKey)">
        {{ currentDate }}
      </div>
    </list-panel>
    <div v-else-if="!error" class="app-body app-common-body app-list-empty">
      正在加载数据，请稍候...
    </div>

    <div class="app-menus">
      <button @click="scan" :disabled="selected == null">
        <Icon type="android-expand"></Icon>
        <span>扫描二维码</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>返回列表</span>
      </button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/app/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        busy: false,
        error: null,
        page: 1,
        size: 10,
        last: true,
        beginDate: null,
        endDate: null,
        keyword: null,
        selected: null,
        store: null,
        storeObject: null,
        currentKey: null,
        currentDate: null
      }
    },
    methods: {
      shown: function (anticlockwise) {
        if (!anticlockwise) {
          this.queryByManual()
        }
      },
      back: function () {
        this.selected = null
        this.$router.back()
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
            this.currentDate = this.storeObject[current.dataset.date].date
          }
        }
        this.scrollTo = top
      },
      resetParams: function (clearAll = false) {
        this.last = true
        this.selected = null
        this.page = 1
        if (clearAll) {
          this.keyword = null
          this.beginDate = null
          this.endDate = null
        }
      },
      queryByPage: function (callback) {
        this.page += 1
        this.query(callback)
      },
      queryByManual: function (callback) {
        if (!this.busy) {
          this.resetParams()
          this.query(callback)
        }
      },
      query: function (callback) {
        if (!this.busy) {
          this.busy = true
          let o = {
            page: this.page,
            size: this.size,
            orderBy: [{property: 'urgentLevel', order: 'desc'}, {property: 'createdTime', order: 'desc'}],
            queryFilter: [{property: 'status', op: '=', value: '2'}], //
            _loading: true
          }
          if (this.keyword) {
            o.queryFilter.push({property: 'code', op: 'like', value: this.keyword})
          }
          if (this.beginDate) {
            o.queryFilter.push({property: 'createdTime', op: '>=', value: new Date(this.beginDate).getTime()})
          }
          if (this.endDate) {
            o.queryFilter.push({
              property: 'createdTime',
              op: '<',
              value: new Date(this.endDate).getTime() + 24 * 60 * 60 * 1000
            })
          }
          this.$http.post('/production/order/search', o).then(res => {
            if (this.page <= 1) {
              this.store = []
              this.storeObject = {}
            }
            this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
            for (let p of res.content) {
              this.orderItemPush(p)
            }
          }).catch(res => {
            this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('生产单'))
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') callback()
          })
        }
      },
      orderItemPush: function (p, prepend = false) {
        let ymd = 'urgent'
        let ymdDate
        let isUrgent = p.urgentLevel != null && p.urgentLevel > 0

        if (!isUrgent) {
          let d = new Date(p.createdTime)
          ymdDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
          ymd = ymdDate.getTime().toString()
        }

        if (this.storeObject == null) {
          this.storeObject = {}
        }

        if (!this.storeObject.hasOwnProperty(ymd)) {
          let o = {
            key: ymd,
            date: isUrgent ? '加急' : ymdDate.toLocaleDateString(),
            collapsed: false,
            items: []
          }
          this.storeObject[ymd] = o
          if (prepend) {
            this.store.unshift(o)
          } else {
            this.store.push(o)
          }
        }
        if (prepend) {
          this.storeObject[ymd].items.unshift(p)
        } else {
          this.storeObject[ymd].items.push(p)
        }
      },
      collapseGroup: function (key) {
        if (this.storeObject.hasOwnProperty(key)) {
          let s = this.storeObject[key]
          s.collapsed = !s.collapsed
        }
      },
      orderItemSelected: function (item) {
        this.selected = item
      },
      getOrderDetail: function (item) {
        if (this.$isPlainObject(item)) {
          this.$router.push({
            path: '/app/productiondetail',
            query: {
              id: item.id
            }
          })
        }
      },
      scan: function () {
        let scanFailed = (msg) => {
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scan()
          })
        }

        let doScan = () => {
          this.$parent.scan().then(res => {
            if (res.type === 'UNITS_BOX') {
              this.busy = true
              this.$http.post('/scanitem/box', {
                productionId: this.selected.id,
                productionCode: this.selected.code,
                qrcodeId: res.code,
                qrcodeType: res.type,
                // qrcodeOrderCode: res.
                _loading: true
              }).then(res => {
                this.selected = null
                this.$parent.executeBroadcast('productionAdded', res)
                this.$parent.replaceRoute({
                  path: '/app/editbox',
                  query: {
                    id: res.qrcodeId
                  }
                })
              }).catch(res => {
                let msg = res.message || res.msg || '扫码失败，请稍候重试'
                if (res.code === 'COMM_BIZ_NOT_EXISTS') {
                  msg = '错误的箱码，请重新扫描'
                }
                scanFailed(msg)
              }).finally(() => {
                this.busy = false
              })
            } else {
              scanFailed('错误的箱码，请重新扫描')
            }
          }).catch(res => {
            scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
          })
        }

        if (this.selected) {
          if ((this.selected.cases === 0 && this.selected.completeBox >= this.selected.box) ||
            (this.selected.cases > 0 && this.selected.completeBox > this.selected.box)) {
            this.$parent.confirm('系统提示', '当前生产单已完成计划的数量，您确定要继续生产吗？').then(() => {
              doScan()
            })
          } else {
            doScan()
          }
        } else {
          this.$Message.info('请先选择一个生产单再进行扫描')
        }
      }
    },
    mounted: function () {
      this.$parent.registerBroadcast('selectProduction', this.orderItemSelected)
    }
  }
</script>

<style lang="less">
  .app-orders {
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
        .app-orders-date:after {
          transform: rotate(180deg);
        }

        .app-orders-date::before {
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

        .app-orders-list-item {
          display: none;
        }
      }
    }

    &-list {
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
  }

  .app-orders-list-item-urgent {
    position: relative;

    &:before {
      position: absolute;
      right: -2.9rem;
      top: .2rem;
      padding: .2rem 3rem;
      text-align: center;
      background-color: rgba(237, 63, 20, 0.6);
      content: '加急';
      font-size: .75rem;
      color: white;
      transform: rotate(45deg);
    }
    &.selected:before {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }
</style>
