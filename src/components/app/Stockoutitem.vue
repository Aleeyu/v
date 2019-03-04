<template>
  <div class="app-stockin-detail app-common-layout">
    <!--显示详情-->
    <div class="app-banner bottom-border" v-if="$route.query.action == 'item'">
      <div class="app-banner-title">
        <h1>{{ currentItem.orderNo}}</h1>
        <h4>订单出库详情</h4>
      </div>
    </div>
    <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息"
                @action="getStockoutById($route.query.id)"
                :loading="busy"></error-view>

    <div v-if="$route.query.action == 'item'" style="overflow-y: auto" class="app-body app-stock-body">
      <div slot="items" class="app-list">
        <v-touch class="app-list-item app-list-button" v-if="loadingItem">
          <div class="app-stock-item">
            <div class="app-list-info-group">
              <div class="app-list-info" style="width: 100%">
                <i>经销商：</i>
                <h2>{{ currentItem.dealerName || '-' }}</h2>
                <i>目标区域：</i>
                <h2>{{ currentItem.targetArea || '-' }}</h2>
                <i>创建时间：</i>
                <h2>{{ new Date(currentItem.createdTime).format() || '-' }}</h2>
                <i>订单备注：</i>
                <h2>{{ currentItem.comment || '-' }}</h2>
              </div>
            </div>
          </div>
        </v-touch>
        <div v-show="false" class="app-list-info-group" style="margin-bottom: 1em" v-if="loadingItem">
          <div class="app-list-info">
            <Checkbox v-model="currentItem.isend" size="large" style="font-weight: bold">设为该订单最后一次出库</Checkbox>
          </div>
        </div>
        <Input v-model="currentItem.info" type="textarea" :maxlength="40" :rows="2" placeholder="出库备注..."></Input>
        <v-touch class="app-list-item app-list-button" v-for="itemList in currentItem.orderItemOuts" :key="itemList.id">
          <div class="app-stock-item">
            <div class="app-list-info-group">
              <div class="app-list-info">
                <i>产品名称</i>
                <h2>{{itemList.proName}}</h2>
                <i>包装信息</i>
                <h2>{{itemList.box + itemList.stockBox || 0}}箱{{itemList.cases + itemList.stockCases || 0}}盒</h2>
              </div>
              <div class="app-list-info flex">
                <i>计划出库</i>
                <h2>{{itemList.stockAmount? itemList.stockAmount + itemList.amount: itemList.amount}}盒</h2>
                <i>实际出库</i>
                <h2>{{itemList.outAmount || 0}}盒</h2>
              </div>
              <div class="app-list-info">
                <i>计划备货</i>
                <h2>{{itemList.stockAmount || 0}}盒</h2>
                <i>实际备货</i>
                <h2>{{itemList.reserveAmount || 0}}盒</h2>
              </div>
            </div>
          </div>
        </v-touch>

      </div>
    </div>


    <div class="app-menus" v-if="$route.query.action == 'item'">
      <button @click="doScan">
        <Icon type="android-expand"></Icon>
        <span>扫码出库</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>返回列表</span>
      </button>
    </div>

    <!--扫码列表-->
    <div v-if="$route.query.action == 'list'" style="overflow-y: auto" class="app-body app-stock-body">
      <div class="app-banner bottom-border">
        <div class="app-banner-title">
          <h1>经销商【{{currentItem.dealerName}}】</h1>
          <h4>待出库列表</h4>
        </div>
      </div>

      <list-panel class="app-body app-stock-body" :refreshable=false :pageable=false>
        <div slot="items" class="app-list">
          <v-touch class="app-list-item app-list-button" v-for="item in stockList" :key="item.id">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info">
                  <i>产品名称：</i>
                  <h2>{{ item.productName }}</h2>
                  <i>扫码类型：</i>
                  <h2 v-if="item.qrcodeType === 'UNITS_BOX'">箱码</h2>
                  <h2 v-if="item.qrcodeType === 'UNITS_CASE'">盒码</h2>
                  <h2 v-if="item.qrcodeType === 'UNITS_BAG'">袋码</h2>
                  <i>批次号：</i>
                  <h2>{{ item.batchId }}</h2>
                </div>
                <div class="app-list-info flex">
                  <i>经销商名称：</i>
                  <h2>{{ item.dealerName }}</h2>
                  <i>订单类型：</i>
                  <h2 v-if="item.orderType === 0">现生产单</h2>
                  <h2 v-if="item.orderType === 1">备货单</h2>
                  <i>箱码/盒码：</i>
                  <h2>{{ item.orderCode }}</h2>
                </div>
                <div class="app-list-info">
                  <Button style="padding: 5px 10px" @click="deleteList(item)">
                    <Icon type="close-round"></Icon>
                  </Button>
                </div>
              </div>
            </div>
          </v-touch>
        </div>
        <div slot="items" class="app-list-empty" v-if="stockList.length === 0">
          没有已扫描的出库单
        </div>
      </list-panel>
    </div>
    <div class="app-menus" v-if="$route.query.action == 'list'">
      <button @click="doScan">
        <Icon type="android-expand"></Icon>
        <span>继续扫码</span>
      </button>
      <button @click="showStockList" v-if="stockList.length > 0">
        <Icon type="android-open"></Icon>
        <span>完成扫码</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>返回列表</span>
      </button>
    </div>

    <!--出库确认-->
    <div v-if="$route.query.action == 'detal'" class="app-banner bottom-border">
      <div class="app-banner-title">
        <h1>{{scanDetal.orderNo}}</h1>
        <h4>出库单信息确认</h4>
      </div>
    </div>

    <list-panel v-if="$route.query.action == 'detal'" class="app-body app-common-body" :pageable=false
                @refresh="refresh">
      <div slot="items" class="app-list">
        <v-touch class="app-list-item app-list-button">
          <div class="app-stock-item">
            <div class="app-list-info-group">
              <div class="app-list-info" style="width: 100%">
                <i>创建时间：</i>
                <h2>{{ new Date(scanDetal.createdTime).format() || '-' }}</h2>
                <i>送货人：</i><br>
                <h2>{{ scanDetal.sendBy || '-' }}</h2>
                <i>送货单位：</i><br>
                <h2>{{ scanDetal.sendDepName || '-' }}</h2>
                <i>经销商：</i><br>
                <h2>{{ scanDetal.receivedDepName || '-' }}</h2>
                <i>接收单位：</i><br>
                <h2>{{ scanDetal.receivedDepName || '-' }}</h2>
                <i>接收时间：</i><br>
                <h2>{{ new Date(scanDetal.receivedTime).format() || '-' }}</h2>
                <i>备注：</i><br>
                <h2>{{ scanDetal.info || '-' }}</h2>
              </div>
            </div>
          </div>
        </v-touch>
        <v-touch class="app-list-item app-list-button" v-if="scanDetal.itemList" v-for="item in scanDetal.itemList"
                 :key="item.id">
          <div class="app-stock-item">
            <div class="app-list-info-group">
              <div class="app-list-info">
                <i>产品名称</i>
                <h2>{{item.productName}}</h2>
              </div>
              <div class="app-list-info-sep">&nbsp;&nbsp;</div>
              <div class="app-list-info flex">
                <i>包装信息</i>
                <h2>{{item.amountInfo}}</h2>
              </div>
              <div class="app-list-info-sep">&nbsp;&nbsp;</div>
              <div class="app-list-info">
                <i>计划出库</i>
                <h2>{{ item.amount || 0 }}盒</h2>
              </div>
            </div>
          </div>
        </v-touch>
        <div slot="items" class="app-list-empty" v-else>
          没有与当前订单相关的出库产品
        </div>
      </div>
    </list-panel>

    <div class="app-menus" v-if="$route.query.action == 'detal'">
      <!--<button @click="stockOut(updateData)">-->
      <button @click="stockOut()" :disabled="scanDetal.itemList.length === 0">
        <Icon type="android-open"></Icon>
        <span>确认出库</span>
      </button>
      <button @click="back">
        <Icon type="reply"></Icon>
        <span>取消出库</span>
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
        statusName: ['待确认', '已下发', '生产中', '已生产', '已出库', '已接收'],
        error: null,
        scanDetal: {},
        itemLoaded: false,
        loadingItem: false,
        stockList: [],
        currentItem: {},
        // 允许继续出库的数量
        numCase: {}
      }
    },
    methods: {
      back: function () {
        this.$router.back()
        this.stockList = []
        this.numCase = {}
        this.loadingItem = true  // 防止返回时之前信息被隐藏
      },

      refresh: function (callback) {
        this.showStockList(callback)
      },
      getStockoutById (id) {
        this.$http.get(`/order/${id}`).then((res) => {
          this.loadingItem = true
          this.itemLoaded = true
          this.currentItem = res
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      doScan: function () {
        // 计算最大扫码数量
        let orderItemOuts = this.currentItem.orderItemOuts
        for (let i = 0; i < orderItemOuts.length; i++) {
        // 判断是否是该产品该次出库的首次扫码
          if (typeof this.numCase[orderItemOuts[i].proId] === 'undefined') {
            this.numCase[orderItemOuts[i].proId] = orderItemOuts[i].amount + orderItemOuts[i].stockAmount - orderItemOuts[i].outAmount
          }
        }
        this.scanBoxCode()
        // TODO pc调试
        // this.$router.push({
        //   path: this.$route.path,
        //   query: {
        //     action: 'list',
        //     id: this.$route.query.id
        //   }
        // })
      },
      getboxCaseById: function (id) {
        return new Promise((resolve, reject) => {
          this.$http.get(`/product/${id}`).then((Case) => {
            resolve(Case.boxCase)
          }).catch((err) => {
            console.log(err)
            reject('获取产品规格失败')
          })
        })
      },
      pushStock: function (data, boxCase) {
        data.numCase = boxCase
        this.stockList.push(data)
        this.$router.push({
          path: this.$route.path,
          query: {action: 'list', id: this.$route.query.id}
        })
      },
      scanBoxCode: function () {
        let scanFailed = (msg) => {
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scanBoxCode()
          })
        }
        this.$parent.scan().then(scan => {
          this.busy = true
          if (scan.type === 'UNITS_BAG') {
            throw new Error('袋码不能出库！')
          }
          this.$http.get(`/store/invoice/QrCode/${scan.code}/${this.$route.query.id}`).then((data) => {
            let boxCase = 0
            if (!data) {
              throw new Error('没找到相关产品')
            }
            this.getboxCaseById(data.productId).then((Case) => {
              if (scan.type === 'UNITS_CASE') {
                boxCase = 1
              } else {
                boxCase = Case
              }
//            判断箱码盒码是否冲突
              var errscan = this.stockList.find((item) => {
                let dataCode = data.orderCode.split('#')
                let itemCode = item.orderCode.split('#')
                return dataCode[0] === itemCode[0] && dataCode.length !== itemCode.length
              })
              let scaned = false
              if (this.stockList.length > 0) {
                for (let i in this.stockList) {
                  if (this.stockList[i].id === data.id) {
                    this.$Message.warning('该产品已经扫码！')
                    scaned = true
                    break
                  }
                }
              }
              if (!scaned) {
                if (errscan) {
                  if (scan.type === 'UNITS_CASE') {
                    throw new Error('该盒码对应箱码已存在当前列表中，请扫描其他盒码出库！')
                  } else {
                    throw new Error('该箱码对应盒码已存在当前列表中，只能扫描盒码出库！')
                  }
                } else {
                  if (data.finishPrintTime > Date.parse(new Date())) {
                    this.$Modal.confirm({
                      title: '警告！',
                      content: '生产打印时间晚于出库时间，是否添加到出库列表?',
                      okText: '添加',
                      cancelText: '取消',
                      onOk: () => {
                        this.numCase[data.productId] -= boxCase
                        if (this.numCase[data.productId] < 0) {
                          setTimeout(() => {
                            this.$Modal.confirm({
                              title: '警告！',
                              content: '该产品已经完成出库计划，是否添加产品到出库列表?',
                              okText: '添加',
                              cancelText: '取消',
                              onOk: () => {
                                this.pushStock(data, boxCase)
                              }
                            })
                          }, 500)
                        } else {
                          this.pushStock(data, boxCase)
                        }
                      }
                    })
                  } else {
                    this.numCase[data.productId] -= boxCase
                    if (this.numCase[data.productId] < 0) {
                      this.$Modal.confirm({
                        title: '警告！',
                        content: '该产品已经完成出库计划，是否添加产品到出库列表?',
                        okText: '添加',
                        cancelText: '取消',
                        onOk: () => {
                          this.pushStock(data, boxCase)
                        }
                      })
                    } else {
                      this.pushStock(data, boxCase)
                    }
                  }
                }
              }
            }).catch(errMeg => {
              scanFailed(errMeg)
            })
          }).catch(error => {
            let msg = error.message || error.msg || '扫码失败，请稍候重试'
            if (error.code === 'COMM_BIZ_NOT_EXISTS') {
              msg = '错误的箱码，请重新扫描'
            }
            scanFailed(msg)
          }).finally(() => {
            this.busy = false
          })
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      showStockList: function (callback) {
        let qrIdList = []
        for (let i in this.stockList) {
          qrIdList.push(this.stockList[i].id)
        }
        this.updateData = {
          orderId: this.currentItem.id,
          info: this.currentItem.info || '',
          isend: this.currentItem.isend || false,
          qrList: this.stockList,
          _loading: true
        }
        this.$http.post(`/store/invoice/preview`, this.updateData).then((res) => {
          this.scanDetal = res
          this.updateData.code = res.code
          this.$router.replace({
            path: this.$route.path,
            query: {action: 'detal'}
          })
        }).catch((err) => {
          this.$Message.error(err.message)
        }).finally(() => {
          if (typeof callback === 'function') callback()
        })
      },
      deleteList: function (item) {
        for (let i in this.stockList) {
          if (this.stockList[i].id === item.id) {
            this.$parent.confirm('移除', `‘${item.batchId}’批次的‘${item.productName}’产品?`, '移除').then(() => {
              this.numCase[item.productId] += this.stockList[i].numCase
              this.stockList.splice(i, 1)
            })
          }
        }
      },
      stockOut: function () {
        this.$http.post(`/store/invoice`, this.updateData).then((data) => {
          this.$Message.success('出库成功')
          // 初始化已扫码数据
          this.stockList = []
          this.numCase = {}
          this.$router.replace({
            path: '/app/stockout'
          })
        }).catch(error => {
          this.$parent.confirm('出库失败，请稍候重试', error, '重新出库').then(() => {
            this.scanBoxCode()
          })
        })
      },
      shown: function () {
        this.numCase = {}
        this.stockList = []
        this.numCase = {}
        this.loadingItem = false
        if (this.$route.query.id) {
          this.getStockoutById(this.$route.query.id)
        } else {
          this.$router.replace({
            path: '/app/stockout'
          })
        }
        // TODO pc调试
        // this.$http.get(`/store/invoice/QrCode/14756322345018511132223384111084/${this.$route.query.id}`).then((data) => {
        //   this.stockList.push(data)
        // })
      }
    }
  }
</script>
