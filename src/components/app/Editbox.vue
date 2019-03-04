<template>
  <div class="app-edit-box app-common-layout">
    <div class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>箱码信息</h1>
        <h4>查看当前箱码的相关信息，以及其袋码段列表</h4>
      </div>
    </div>

    <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息" @action="getBoxInfo"
                :loading="busy"></error-view>

    <div class="app-base-info" v-if="!error && model">
      <div class="app-list-info-group">
        <div class="app-list-info">
          <i>箱码</i>
          <h2 class="app-production-box-code">{{ model.qrcodeOrderCode }}</h2>
        </div>
        <div class="app-list-info flex">
          <i>产品名称</i>
          <h2>{{ model.productName }}</h2>
        </div>
        <div class="app-list-info">
          <i>状态</i>
          <h2 :class="[`app-production-status-${model.isend}`]">{{ status[model.isend] }}</h2>
        </div>
      </div>
    </div>
    <div v-else-if="!error" class="app-body app-common-body app-list-empty">
      正在加载数据，请稍候...
    </div>

    <list-panel v-show="!error && model" class="app-body app-common-body" :refreshable="!busy" :pageable="!bags.last"
                @scroll="scroll"
                @refresh="queryByManual" @nextpage="queryByPage">
      <div slot="items" class="app-list" v-if="$isPlainObject(bags.store)"
           :class="{'app-production-list-edit': $route.query.action === 'edit'}">
        <div class="app-production-group" v-for="d in bags.store"
             :class="{'app-production-group-collapsed': d.collapsed, 'bottom-border': d.collapsed}"
             :key="d.key" :data-date="d.key">
          <div class="app-production-date" @click="d.collapsed = !d.collapsed">
            {{ d.date }}
          </div>

          <v-touch class="app-production-list-item app-list-button" v-for="(item, inx) in d.items" :key="inx"
                   @tap="itemTap(item.id)"
                   @press="itemPress(item.id)" :class="{'app-production-item-collapsed': d.collapsed}"
                   :data-date="item.group">
            <div class="app-production-item"
                 :class="{'app-production-item-selected': bags.editItems.indexOf(item.id) >= 0}">
              <div class="app-list-info-group">
                <div class="app-list-info">
                  <i>开始袋码</i>
                  <h2>{{ formatCode(item.beginOrderCode) }}</h2>
                </div>
                <div class="app-list-info-sep">-</div>
                <div class="app-list-info flex" v-if="item.endCode">
                  <i>结束袋码</i>
                  <h2>{{ formatCode(item.endOrderCode) }}</h2>
                </div>
              </div>
            </div>
          </v-touch>
        </div>
      </div>
      <div v-else slot="items" class="app-list-empty">
        当前箱码还没有关联任何袋码<br />请点击右下侧的&nbsp;
        <Icon type="plus"></Icon>
        &nbsp;按钮进行添加袋码段<br/>
        或者点击&nbsp;
        <Icon type="android-attach"></Icon>
        &nbsp;按钮进行单袋补充
      </div>

      <div slot="anchor" class="app-production-date app-production-date-float"
           v-if="bags.currentDate && bags.currentKey"
           :class="{'app-production-date-collapsed': bags.store[bags.currentKey].collapsed}"
           @click="bags.store[bags.currentKey].collapsed = !bags.store[bags.currentKey].collapsed">
        {{ bags.currentDate }}
      </div>
    </list-panel>

    <div class="app-float-button"
         v-if="!error && $route.query.action == null && $route.query.id != null">
      <!--  && this.model && this.model.isend === 0 -->
      <v-touch @tap="bagAdd">
        <Button type="text">
          <Icon type="plus"></Icon>
        </Button>
      </v-touch>
      <v-touch @tap="singleAdd">
        <Button>
          <Icon type="android-attach"></Icon>
        </Button>
      </v-touch>
    </div>


    <div class="app-menus" v-if="$route.query.action == 'edit'">
      <button @click="itemRemove" :disabled="bags.editItems.length === 0">
        <Icon type="trash-a"></Icon>
        <span>删除所选</span>
      </button>
      <button @click="itemEditCancel">
        <Icon type="reply"></Icon>
        <span>取消编辑</span>
      </button>
    </div>

    <div class="app-menus" v-else>
      <button @click="complete" :disabled="!model || model.isend !== 0 || !$isPlainObject(bags.store)">
        <Icon type="android-checkmark-circle"></Icon>
        <span>标记为完成</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>生产列表</span>
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
        status: ['装箱中', '已完成'],
        error: null,
        model: null,
        bags: {
          editItems: [],
          last: true,
          currentDate: null,
          currentKey: null,
          page: 1,
          size: 10,
          store: null
        }
      }
    },
    methods: {
      back: function () {
        this.$router.back()
      },
      shown: function () {
        if (this.$route.query.id) {
          this.getBoxInfo()
        } else {
          this.$parent.replaceRoute({
            path: '/app/production'
          })
        }
      },
      formatCode: function (code) {
        return ('00000000000000' + String(code)).substr(-10)
      },
      getBoxInfo: function () {
        if (this.model == null || this.model.id !== this.$route.query.id) {
          this.busy = true

          this.$http.get(`/scanitem/box/${this.$route.query.id}`, true).then(res => {
            if (res) {
              this.error = null
              this.model = res
            } else {
              this.model = null
              this.error = {
                type: this.$ErrType.NOTFOUND,
                title: '未绑定生产单号',
                content: '该箱码目前还没有绑定任何生产单号',
                action: '',
                cancel: ''
              }
            }
          }).catch(res => {
            this.error = this.$Err.notFound(false, true)
          }).finally(() => {
            this.busy = false
            if (this.model) {
              this.queryByManual()
            }
          })
        }
      },
      resetParams: function (clearAll = false) {
        this.bags.last = true
        this.bags.currentDate = null
        this.bags.page = 1
      },
      queryByPage: function (callback) {
        this.bags.page += 1
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
            page: this.bags.page,
            size: this.bags.size,
            orderBy: [{property: 'createdTime', order: 'desc'}],
            queryFilter: [{property: 'scanId', op: '=', value: this.model.id}],
            _loading: true
          }
          this.$http.post('/scanitem/bag/search', o).then(res => {
            if (this.bags.page <= 1) {
              this.bags.store = {}
            }
            this.bags.last = this.bags.page >= res.totalPages || (this.bags.page === 1 && res.content.length === 0)
            for (let p of res.content) {
              let d = new Date(p.createdTime)
              let ymdDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
              let ymd = ymdDate.getTime().toString()
              if (!this.bags.store.hasOwnProperty(ymd)) {
                this.bags.store[ymd] = {
                  key: ymd,
                  date: ymdDate.toLocaleDateString(),
                  collapsed: false,
                  items: []
                }
              }
              this.bags.store[ymd].items.push(p)
            }
          }).catch(res => {
            this.$Message.error(this.$C.MSG_COMM_GET_FAIL.format('袋码列表'))
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') callback()
          })
        }
      },
      itemPress: function (id) {
        if (this.model && this.model.isend === 0) {
          if (this.$route.query.action !== 'edit') {
            this.bags.editItems.length = 0
            this.$router.push({
              path: this.$route.path,
              query: {
                id: this.model.id,
                action: 'edit'
              }
            })
          }
          this.itemTap(id)
        }
      },
      itemTap: function (id) {
        if (this.$route.query.action === 'edit') {
          let inx = this.bags.editItems.indexOf(id)
          if (inx >= 0) {
            this.bags.editItems.splice(inx, 1)
          } else {
            this.bags.editItems.push(id)
          }
        } else {
          this.$router.push({
            path: '/app/editbag',
            query: {
              id: this.model.qrcodeId,
              sid: id
            }
          })
        }
      },
      itemRemove: function () {
        if (this.$isArray(this.bags.editItems, true)) {
          this.$parent.confirm('删除确认', '您正准备删除选中的袋码段，该操作不可撤消。您确定要进行删除吗？').then(() => {
            this.busy = true
            console.log(this.bags.editItems)
            this.$http.post('/scanitem/batch/bag', this.bags.editItems).then(res => {
              this.busy = false
              this.$Message.success(this.$C.MSG_COMM_DELETE_SUCCESS.format('袋码段'))
              this.queryByManual()
              this.$router.back()
            }).catch(res => {
              this.busy = false
              this.$Message.error(this.$C.MSG_COMM_DELETE_FAIL.format('袋码段'))
            })
          })
        }
      },
      itemEditCancel: function () {
        this.$router.back()
      },
      scroll: function (event) {
        this.bags.currentDate = null
        this.bags.currentKey = null
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
          if (current && this.$isPlainObject(this.bags.store)) {
            this.bags.currentDate = this.bags.store[current.dataset.date].date
            this.bags.currentKey = current.dataset.date
          }
        }
      },
      bagAdd: function () {
        this.$router.push({
          path: '/app/editbag',
          query: {
            id: this.$route.query.id
          }
        })
      },
      singleAdd: function () {
        let scanFailed = (msg) => {
          this.busy = false
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.singleAdd()
          })
        }

        this.$parent.scan().then(res => {
          if (res.type === 'UNITS_BAG') {
            this.busy = true
            this.$http.get(`/scanitem/bag?id=${res.code}&productionId=${this.model.productionId}`, true).then(res1 => {
              if (this.$isPlainObject(res1) && res1.orderCode) {
                let o = {
                  id: this.$uuid(),
                  scanId: this.model.id,
                  _loading: true,
                  beginCode: res1.id,
                  endCode: res1.id,
                  beginOrderCode: res1.orderCode,
                  endOrderCode: res1.orderCode
                }
                this.$http.post('/scanitem/bag', o).then(res2 => {
                  this.busy = false
                  this.queryByManual()
                }).catch(res1 => {
                  let msg = res1.message || res1.msg || '扫码失败，请稍候重试'
                  scanFailed(msg)
                })
              } else {
                scanFailed('扫码失败，请稍候重试')
              }
            }).catch(res => {
              let msg = res.message || res.msg || '扫码失败，请稍候重试'
              if (res.code === 'COMM_BIZ_NOT_EXISTS') {
                msg = '错误的袋码，请重新扫描'
              }
              scanFailed(msg)
            })
          } else {
            scanFailed('错误的袋码，请重新扫描')
          }
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      complete: function () {
        // this.model && this.model.isend === 0 &&
        if (this.$isPlainObject(this.bags.store)) {
          this.busy = true
          this.$http.put(`/scanitem/box/status/${this.model.id}`, true).then(res => {
            this.$Message.success('标记为完成成功')
            this.model.isend = 1
            this.$parent.executeBroadcast('updateBoxStatus', this.model.id)
          }).catch(res => {
            if (res.code === 'COMM_BIZ_NOT_EXISTS') {
              this.$Message.error('当前生产信息一定还没有绑定任何袋码段，不能标记为完成')
            } else if (res.code === 'COMM_BIZ_ERROR') {
              this.$Message.error('当前生产信息的袋码段有未扫码完成的，不能标记为完成')
            } else {
              this.$Message.error(res.msg || res.message || '未能成功标记为完成，请稍候再试')
            }
          }).finally(() => {
            this.busy = false
          })
        }
      }
    }
  }
</script>
