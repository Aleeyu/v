<template>
  <div class="app-production">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>生产管理</h1>
        <h4>下面是您创建的生产信息，点击“+”按钮创建新的生产信息</h4>
      </div>
    </div>

    <v-touch class="app-float-button" @tap="itemAdd" v-if="$route.query.action == null"
             style="bottom: 1rem;">
      <Button type="text">
        <Icon type="plus"></Icon>
      </Button>
    </v-touch>

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

    <list-panel ref="productionList"
                class="app-body app-production-body" :refreshable="!busy" :pageable="!last" @scroll="scroll"
                @nextpage="queryByPage" @refresh="queryByManual">
      <div v-if="$isArray(store, true)" slot="items" class="app-list app-production-list"
           :class="{'app-production-list-edit': $route.query.action === 'edit'}">
        <div class="app-production-group" v-for="d in store" :class="{'app-production-group-collapsed': d.collapsed}"
             :key="d.key" :data-date="d.key">
          <div class="app-production-date" @click="collapseGroup(d.key)"> {{ d.date }}</div>

          <v-touch class="app-production-list-item app-list-button" v-for="(item, inx) in d.items" :key="inx"
                   @tap="itemTap(item)" @press="itemPress(item)">
            <div class="app-production-item"
                 :class="{'app-production-item-selected': editItems.indexOf(item.id) >= 0, 'app-production-item-disabled': item.isend === 1}">
              <div class="app-list-info-group">
                <div class="app-list-info" style="width: 50%;">
                  <i>箱码</i>
                  <h2 class="app-production-box-code">{{ item.qrcodeOrderCode }}</h2>
                </div>
                <div class="app-list-info" style="width: 50%;">
                  <i>生产单号</i>
                  <h2>{{ item.productionCode }}</h2>
                </div>
              </div>
              <div class="app-list-info-group">
                <div class="app-list-info" style="width: 50%;">
                  <i>产品名称</i>
                  <h2>{{ item.productName }}</h2>
                </div>
                <div class="app-list-info" style="width: 50%;">
                  <i>状态</i>
                  <h2 :class="[`app-production-status-${item.isend}`]">{{ status[item.isend] }}</h2>
                </div>
              </div>
            </div>
          </v-touch>
        </div>
      </div>
      <div v-else slot="items" class="app-list-empty">
        {{ (keyword || beginDate || endDate) ? '没有查询到生产信息' : '目前还没有任何生产信息' }}<br />点击右下侧的“
        <Icon type="plus"></Icon>
        ”按钮进行添加
      </div>
      <div slot="anchor" class="app-production-date app-production-date-float" v-show="currentKey"  @click="collapseGroup(currentKey)">
        {{ currentDate }}
      </div>
    </list-panel>

    <div class="app-menus" v-show="$route.query.action == 'edit'">
      <button @click="itemRemove" :disabled="editItems.length === 0">
        <Icon type="trash-a"></Icon>
        <span>删除所选</span>
      </button>
      <button @click="itemEditCancel">
        <Icon type="reply"></Icon>
        <span>取消编辑</span>
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
        inited: false,
        status: ['装箱中', '已完成'],
        editItems: [],
        busy: false,
        currentKey: null,
        currentDate: null,
        scrollTo: null,
        beginDate: null,
        endDate: null,
        keyword: null,
        page: 1,
        size: 10,
        last: true,
        store: null,
        storeObject: null
      }
    },
    methods: {
      shown: function () {
        if (!this.inited) {
          this.inited = true
          this.queryByManual()
        }
      },
      resetParams: function () {
        this.last = true
        this.page = 1
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
        this.busy = true
        let o = {
          page: this.page,
          size: this.size,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [{property: 'createdBy', op: '=', value: this.$parent.user.id}],
          _loading: true
        }

        if (this.keyword) {
          o.queryFilter.push({property: 'productionCode', op: 'like', value: this.keyword})
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

        this.$http.post('/scanitem/box/search', o).then(res => {
          if (this.page <= 1) {
            this.store = []
            this.editItems.length = 0
            this.storeObject = {}
          }
          this.last = this.page >= res.totalPages || (this.page === 1 && res.content.length === 0)
          for (let p of res.content) {
            this.itemPush(p)
          }
        }).catch(res => {
          this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('箱码列表'))
        }).finally(() => {
          this.busy = false
          if (typeof callback === 'function') callback()
        })
      },
      itemPush: function (p, prepend = false) {
        let d = new Date(p.createdTime)
        let ymdDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        let ymd = ymdDate.getTime().toString()
        if (this.storeObject == null) {
          this.storeObject = {}
        }
        if (!this.storeObject.hasOwnProperty(ymd)) {
          let o = {
            key: ymd,
            date: ymdDate.toLocaleDateString(),
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
      itemRemove: function () {
        if (this.$isArray(this.editItems, true)) {
          this.$parent.confirm('删除确认', '您正准备删除选中的生产信息，该操作不可撤消。您确定要进行删除吗？').then(() => {
            this.busy = true
            this.$http.post('/scanitem/batch/box', this.editItems).then(res => {
              this.busy = false
              this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('生产信息'))
              this.queryByManual()
              this.$router.back()
            }).catch(res => {
              this.busy = false
              this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('生产信息'))
            })
          })
        }
      },
      itemEditCancel: function () {
        this.$router.back()
      },
      itemAddCancel: function () {
        this.$router.back()
      },
      itemPress: function (item) {
        if (this.$route.query.action !== 'edit') {
          this.editItems.length = 0
          this.$router.push({
            path: this.$route.path,
            query: {
              action: 'edit'
            }
          })
        }
        this.itemTap(item)
      },
      itemTap: function (item) {
        if (this.$route.query.action === 'edit') {
          if (item.isend === 0) {
            let inx = this.editItems.indexOf(item.id)
            if (inx >= 0) {
              this.editItems.splice(inx, 1)
            } else {
              this.editItems.push(item.id)
            }
          }
        } else {
          this.$router.push({
            path: '/app/editbox',
            query: {
              id: item.qrcodeId
            }
          })
        }
      },
      collapseGroup: function (key) {
        if (this.storeObject.hasOwnProperty(key)) {
          let s = this.storeObject[key]
          s.collapsed = !s.collapsed
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
            this.currentDate = this.storeObject[current.dataset.date].date
          }
        }
        this.scrollTo = top
      },
      itemAdd: function () {
        this.$router.push({
          path: '/app/addproduction'
        })
      },
      onItemAdded: function (p) {
        this.itemPush(p, true)
        let el = this.$refs.productionList.getElement()
        this.scroll({
          target: el
        })
      },
      onUpdateBoxStatus: function (id) {
        if (this.$isPlainObject(this.storeObject)) {
          let found = false
          for (let k in this.storeObject) {
            if (this.storeObject.hasOwnProperty(k)) {
              let g = this.storeObject[k].items
              if (this.$isArray(g, true)) {
                for (let p of g) {
                  if (p.id === id) {
                    p.isend = 1
                    found = 1
                    break
                  }
                }
              }
            }
            if (found) {
              break
            }
          }
        }
      },
      onItemRemove: function (id) {
        if (this.$isPlainObject(this.storeObject)) {
          let found = false
          for (let k in this.storeObject) {
            if (this.storeObject.hasOwnProperty(k)) {
              let g = this.storeObject[k].items
              if (this.$isArray(g, true)) {
                for (let inx in g) {
                  if (g[inx].id === id) {
                    g.splice(inx, 1)
                    found = true
                    break
                  }
                }
              }
            }
            if (found) {
              break
            }
          }
        }
      }
    },
    mounted: function () {
      this.$parent.registerBroadcast('productionAdded', this.onItemAdded)
      this.$parent.registerBroadcast('updateBoxStatus', this.onUpdateBoxStatus)
      this.$parent.registerBroadcast('productionRemove', this.onItemRemove)
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
