<template>
  <div>
    <!--入库详情-->
    <div class="app-stockin-detail app-common-layout" v-if="$route.query.action === 'item'" style="height: 100%">
      <div class="app-banner bottom-border">
        <div class="app-banner-title">
          <h1>{{ currentItem.code}}</h1>
          <h4>生产单入库详情</h4>
        </div>
      </div>
      <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息"
                  @action="getStockinById ($route.query.id)"
                  :loading="busy"></error-view>
      <div style="overflow-y: auto" class="app-body app-stock-body">
        <div slot="items" class="app-list">
          <div class="app-stock-item" style="padding: .5rem 0 0.5rem 0;">
            <div class="app-list-info-group" style="border-bottom: 1px solid #dbdbdb; border-radius: 5px">
              <div class="app-list-info" style="width: 100%">
                <i>创建时间：</i>
                <h2 v-if="loadingItem">{{ new Date(currentItem.createdTime).format() || '-' }}</h2>
                <i>生产备注：</i><br>
                <h2 v-if="loadingItem">{{ currentItem.remarks || '-' }}</h2>
                <br>
              </div>
            </div>
          </div>
          <Input v-model="currentItem.info" type="textarea" :maxlength="40" :rows="2" placeholder="入库备注...">
          </Input>
          <Input style="margin-top: .5em" v-model="currentItem.sendBy" :maxlength="10" placeholder="送货人...">
          </Input>
          <v-touch v-if="productList.length !== 0" class="app-list-item app-list-button" v-for="item in productList"
                   :key="item.id">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info flex">
                  <i>产品名称</i>
                  <h2>{{item.productName}}</h2>
                  <i>包装信息</i>
                  <h2>{{ item.box || 0 }}箱 {{ item.cases || 0}}盒</h2>
                </div>
                <div class="app-list-info-sep">&nbsp;&nbsp;</div>
                <div class="app-list-info">
                  <i>计划入库</i>
                  <h2>{{ item.amount || 0 }} 盒</h2>
                  <i>已经入库</i>
                  <h2>{{ item.inAmount || 0 }} 盒</h2>
                </div>
              </div>
            </div>
          </v-touch>
          <div v-if="productList.length === 0" slot="items" class="app-list-empty"
               style="background: #fff; margin-top: .5em; border-radius: 5px">
            没有与当前生产单相关的入库产品
          </div>
        </div>
      </div>

      <div class="app-menus">
        <button @click="doScan">
          <Icon type="android-expand"></Icon>
          <span>扫码入库</span>
        </button>
        <button @click="showStockList('all')">
          <Icon type="android-exit"></Icon>
          <span>全部入库</span>
        </button>
        <button @click="back">
          <Icon type="reply"></Icon>
          <span>返回列表</span>
        </button>
      </div>
    </div>
    <!--入库确认-->
    <div class="app-stockin-detail app-common-layout" v-if="$route.query.action === 'confirm'"
         style="height: 100%;overflow-y: auto">
      <div class="app-banner bottom-border">
        <div class="app-banner-title">
          <h1>{{currentItem.code}}</h1>
          <h4>生产单确认入库</h4>
        </div>
      </div>
      <error-view class="app-body app-common-body" v-show="error" :error="error" name="箱码信息"
                  @action="getStockinById ($route.query.id)"
                  :loading="busy"></error-view>
      <div slot="items" class="app-list">
        <v-touch class="app-list-item app-list-button">
          <div class="app-stock-item">
            <div class="app-list-info-group">
              <div class="app-list-info" style="width: 100%">
                <i>创建时间：</i>
                <h2>{{ new Date(confirmItem.createdTime).format() ||
                  '-' }}</h2>
                <i>送货人：</i><br>
                <h2>{{ confirmItem.sendBy || '-' }}</h2>
                <i>接收人：</i><br>
                <h2>{{ confirmItem.receivedBy || '-' }}</h2>
                <i>入库备注：</i><br>
                <h2>{{ confirmItem.info || '-' }}</h2>
              </div>
            </div>
          </div>
        </v-touch>
      </div>
      <list-panel class="app-body app-common-body" :pageable=false @refresh="refresh">
        <div slot="items" class="app-list">
          <v-touch v-if="confirmItem.itemList.length !==0" class="app-list-item app-list-button"
                   v-for="item in confirmItem.itemList" :key="item.id">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info flex">
                  <i>产品名称</i>
                  <h2>{{item.productName}}</h2>
                  <i>产品编码</i>
                  <h2>{{ item.productNo || '-' }}</h2>
                </div>
                <div class="app-list-info-sep">&nbsp;&nbsp;</div>
                <div class="app-list-info">
                  <i>包装信息</i>
                  <h2>{{item.amountInfo}}</h2>
                  <i>入库数量</i>
                  <h2>{{ item.amount || '-' }}盒</h2>
                </div>
              </div>
            </div>
          </v-touch>
          <div v-if="confirmItem.itemList.length ===0" slot="items" class="app-list-empty"
               style="background: #fff; margin-top: .5em; border-radius: 5px">
            当前生产单还没有任何待入库产品
          </div>
        </div>
      </list-panel>
      <div class="app-menus">
        <button @click="StockConfirm(StockinData)" :disabled="confirmItem.itemList.length === 0">
          <!--<button @click="StockConfirm(StockinData)">-->
          <Icon type="android-exit"></Icon>
          <span>确认入库</span>
        </button>
        <button @click="back">
          <Icon type="reply"></Icon>
          <span>取消入库</span>
        </button>
      </div>
    </div>
    <!--扫码列表-->
    <div class="app-stockin-detail app-common-layout" v-if="$route.query.action == 'list'" style="height: 100%">
      <div class="app-banner bottom-border">
        <div class="app-banner-title">
          <h1>已扫码产品</h1>
        </div>
      </div>
      <list-panel class="app-body app-stock-body" :refreshable=false :pageable=false>
        <div slot="items" class="app-list">
          <v-touch class="app-list-item app-list-button" v-for="item in stockList" :key="item.id">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info flex">
                  <i>产品名称：</i>
                  <h2>{{ item.productName }}</h2>
                  <i>批次号：</i>
                  <h2>{{ item.batchId }}</h2>
                </div>
                <div class="app-list-info">
                  <i>箱码/盒码：</i>
                  <h2>{{ item.orderCode }}</h2>
                  <i>类型：</i>
                  <h2>{{ item.qrcodeType === 'UNITS_CASE'? '盒码' : '箱码' }}</h2>
                </div>
                <div class="app-list-info">
                  <Button style="padding: 5px 10px;margin-top: 3.5em" @click="deleteList(item)">
                    <Icon type="close-round"></Icon>
                  </Button>
                </div>
              </div>
            </div>
          </v-touch>
        </div>
        <div slot="items" class="app-list-empty" v-if="stockList.length === 0">
          没有已扫描的入库单
        </div>
      </list-panel>

      <div class="app-menus">
        <button @click="doScan">
          <Icon type="android-expand"></Icon>
          <span>继续扫码</span>
        </button>
        <button @click="showStockList('scan')" v-if="stockList.length > 0">
          <Icon type="android-exit"></Icon>
          <span>完成扫码</span>
        </button>
        <button @click="back">
          <Icon type="reply"></Icon>
          <span>返回列表</span>
        </button>
      </div>
    </div>
    <!--入库成功-->
    <div class="app-stockin-detail app-common-layout" v-if="$route.query.action === 'stockSuccess'"
         style="height: 100%;overflow-y: auto">
      <div class="app-banner bottom-border">
        <div class="app-banner-title">
          <h1>入库成功</h1>
          <h4>当前生产单入库信息如下,你可以选择继续对该生产单立即出库</h4>
        </div>
      </div>
      <list-panel class="app-body app-common-body" :pageable=false :refreshable=false>
        <div slot="items" class="app-list">
          <v-touch class="app-list-item app-list-button">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info" style="width: 100%">
                  <i>入库单号：</i>
                  <h2>{{SuccessInData.code || '-'}}</h2>
                  <i>创建时间：</i>
                  <h2>{{ SuccessInData.createdTime ? new
                    Date(SuccessInData.createdTime).format() : '-' }}</h2>
                  <i>送货人：</i><br>
                  <h2>{{ SuccessInData.sendBy || '-' }}</h2>
                  <i>接收人：</i><br>
                  <h2>{{ SuccessInData.receivedBy || '-' }}</h2>
                  <i>入库备注：</i><br>
                  <h2>{{ SuccessInData.info || '-' }}</h2>
                </div>
              </div>
            </div>
          </v-touch>
          <div v-show="false" class="app-list-info-group" style="margin-bottom: 1em">
            <div class="app-list-info">
              <Checkbox v-model="stockOutData.isend" style="font-size: 1em; font-weight: bold">设为该订单最后一次出库</Checkbox>
            </div>
          </div>
          <br>
          <Input v-model="stockOutData.info" type="textarea" :maxlength="40" :rows="2" placeholder="出库备注..."></Input>
          <v-touch class="app-list-item app-list-button" v-if="SuccessInData.itemList.length !== 0"
                   v-for="item in SuccessInData.itemList" :key="item.id">
            <div class="app-stock-item">
              <div class="app-list-info-group">
                <div class="app-list-info flex">
                  <i>产品名称</i>
                  <h2>{{item.productName}}</h2>
                  <i>数量</i>
                  <h2>{{ item.amount || '-' }}盒</h2>
                </div>
                <div class="app-list-info-sep">&nbsp;&nbsp;</div>
                <div class="app-list-info">
                  <i>包装信息</i>
                  <h2>{{item.amountInfo}}</h2>
                  <i>编码</i>
                  <h2>{{ item.productNo || '-' }}</h2>
                </div>
              </div>
            </div>
          </v-touch>
          <div slot="items" class="app-list-empty" v-if="SuccessInData.itemList.length === 0"
               style="background: #fff; margin-top: .5em; border-radius: 5px">
            当前生产单没有任何出库产品
          </div>
        </div>
      </list-panel>
      <div class="app-menus">
        <button @click="stockOutConfirm">
          <Icon type="android-open"></Icon>
          <span>立即出库</span>
        </button>
        <button @click="backList">
          <Icon type="reply"></Icon>
          <span>返回列表</span>
        </button>
      </div>
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
        loadingItem: false,        // 加载完成
        status: ['待接收', '待生产', '生产中', '已生产', '已入库'],
        error: null,
        model: null,
        updatedata: {},
        productList: [],
        confirmItem: {},           // 确认入库信息
        SuccessInData: {},        // 成功入库信息
        stockOutData: {},         // 成功入库信息
        StockinData: {},          //  入库上传数据
        stockList: [],            //  已扫码产品列表
        StockType: 'all',        // 全部入库或扫码入库
        currentItem: {
          orderNo: ''
        }
      }
    },
    methods: {
      back: function () {
        this.$router.back()
        this.stockList = []
        this.loadingItem = true  // 防止返回时之前信息被隐藏
      },
      backList: function () {
        this.$router.replace({
          path: '/app/stockin'
        })
        this.stockList = []
        this.loadingItem = true
      },
      scanBoxCode: function () {
        let scanFailed = (msg) => {
          this.$parent.confirm('扫码失败', msg, '重新扫码').then(() => {
            this.scanBoxCode()
          })
        }
        this.$parent.scan().then(res => {
          this.busy = true
          if (res.type === 'UNITS_BAG') {
            throw new Error('袋码不能入库！')
          }
          this.$http.get(`/store/receipt/QrCode/${res.code}/${this.$route.query.id}`).then((data) => {
            var errscan = this.stockList.find((item) => {
              let dataCode = data.orderCode.split('#')
              let itemCode = item.orderCode.split('#')
              return dataCode[0] === itemCode[0] && dataCode.length !== itemCode.length
            })
            if (data) {
              let idarray = []
              for (let i in this.stockList) {
                idarray.push(this.stockList[i].id)
              }
              if (idarray.indexOf(data.id) > -1) {
                this.$Message.warning('该产品已经扫码！')
              } else {
                if (errscan) {
                  if (res.type === 'UNITS_CASE') {
                    throw new Error('该盒码对应箱码已存在当前列表中，请扫描其他盒码入库！')
                  } else {
                    throw new Error('该箱码对应盒码已存在当前列表中，只能扫描盒码入库！')
                  }
                } else {
                  this.stockList.push(data)
                }
              }
              this.$router.replace({
                path: this.$route.path,
                query: {
                  action: 'list',
                  orderId: this.$route.query.orderId,
                  id: this.$route.query.id
                }
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
          })
        }).catch(res => {
          scanFailed(res.message || res.msg || '扫码失败，请稍候重试')
        })
      },
      doScan: function () {
        // TODO pc调试
//        this.$router.replace({
//          path: this.$route.path,
//          query: {
//            action: 'list',
//            orderId: this.$route.query.orderId
//          }
//        })
        this.scanBoxCode()
      },
      getStockinById (id) {
        this.$http.get(`/production/order/${id}/receiveitems`).then((res) => {
          this.productList = res
        }).catch((res) => {
          this.$Message.error(res.message)
        })
      },
      getStockinItem (id) {
        this.updatedata = {
          _loading: true,
          page: 1,
          size: 10,
          orderBy: [
            {
              property: 'createdTime',
              order: 'desc'
            }
          ],
          queryFilter: [
            {
              property: 'id',
              op: '=',
              value: id
            }
          ]
        }
        this.$http.post(`/production/order/search`, this.updatedata).then((res) => {
          this.currentItem = res.content[0]
          this.loadingItem = true
        }).catch((err) => {
          this.$router.replace({
            path: '/app/stockin'
          })
          this.$Message.error(err.message)
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
      showStockList: function (type, callback) {
        this.StockType = type
        if (type === 'all') {
          this.StockinData = {
            _loading: true,
            productionId: this.currentItem.id,
            sendBy: this.currentItem.sendBy ? this.currentItem.sendBy : '',
            info: this.currentItem.info ? this.currentItem.info : ''
          }
        } else {
          this.StockinData = {
            _loading: true,
            productionId: this.currentItem.id,
            sendBy: this.currentItem.sendBy ? this.currentItem.sendBy : '',
            info: this.currentItem.info ? this.currentItem.info : '',
            qrList: this.stockList
          }
        }
        this.$http.post(`/store/receipt/preview`, this.StockinData).then((res) => {
          this.confirmItem = res
          this.$router.push({
            path: this.$route.path,
            query: {
              orderId: this.$route.query.orderId,
              action: 'confirm'
            }
          })
        }).catch((err) => {
          this.$Message.error(err.message)
        }).finally(() => {
          if (typeof callback === 'function') callback()
        })
      },
      StockConfirm: function (update) {
        this.$http.post(`/store/receipt`, update).then((data) => {
          if (this.$route.query.orderId) {
            this.$router.push({
              path: this.$route.path,
              query: {
                action: 'stockSuccess',
                orderId: this.$route.query.orderId
              }
            })
            this.SuccessInData = data
            this.$Message.success('入库成功')
          }
        }).catch((error) => {
          this.$Modal.confirm({
            title: '入库失败！',
            content: error.message,
            okText: '重新入库',
            cancelText: '取消',
            onOk: () => {
              this.StockConfirm(update)
            }
          })
        })
      },
      stockOutConfirm: function () {
        this.$parent.confirm('出库确认!', '是否将当前入库产品出库?', '确认').then(() => {
          this.stockOut()
        })
      },
      stockOut: function () {
        let qrIdList = []
        for (let i in this.SuccessInData.detailList) {
          qrIdList.push(this.SuccessInData.detailList[i].qrcodeId)
        }
        this.$http.post(`/store/invoice`, {
          code: '',
          orderId: this.$route.query.orderId,
          info: this.stockOutData.info ? this.stockOutData.info : '',
          isend: this.stockOutData.isend ? true : false,
          qrList: this.stockList,
          _loading: true
        }).then((data) => {
          this.stockOutData = {}
          this.$Message.success('出库成功')
          this.$parent.replaceRoute({
            path: '/app/stockin'
          })
        }).catch(error => {
          this.$parent.confirm('出库失败，请稍候重试', error.message, '重新出库').then(() => {
            this.scanBoxCode()
          })
        }).finally((res) => {
          this.confirmItem = {}
        })
      },
      refresh: function (callback) {
        this.showStockList(this.StockType, callback)
      },
      cancel: function () {
        this.$emit('edit', false)
      },
      shown: function () {
        this.stockList = []
        this.loadingItem = false
        if (this.$route.query.id) {
          this.getStockinById(this.$route.query.id)
          this.getStockinItem(this.$route.query.id)
        } else {
          this.$router.replace({
            path: '/app/stockin'
          })
        }
        // TODO pc调试
//        this.$http.get(`/store/receipt/QrCode/16464551464715161083392530616862/${this.$route.query.id}`, {_loading: true}).then((data) => {
//          this.stockList.push(data)
//        })
      }
    }
  }
</script>
<style lang="less">
  .app-stock-detal {
    padding: 1em;
    h2 {
      font-size: 1rem;
    }
  }

  .app-stock {
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-direction: column;

    &-body {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    &-group {
      &-collapsed {
        .app-stock-date:after {
          transform: rotate(180deg);
        }

        .app-stock-list-item {
          height: 0;
        }
      }
    }

    &-list-item {
      overflow: hidden;
      height: 5rem;
      transition: all 275ms;
    }

    &-item {
      position: relative;
      padding: .5rem 0 1rem 0;
      height: 100%;
    }

    &-info-group {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      padding: 0.5rem 0 0 0;
    }

    &-info-sep {
      font-size: .8rem;
    }

    &-info {
      padding: 0 .5rem;
      i {
        font-size: .8rem;
        color: #bbbec4;
        font-style: normal;
      }
      h2 {
        display: inline-block;
        white-space: nowrap;
        width: 10em;
        overflow: hidden;
        text-overflow: ellipsis;
      }

    }

    &-box-code {
      font-size: 0.8rem;
      color: #2b85e4;
      font-weight: bold;
    }

    &-code-total {
      font-size: 0.8rem;
      color: #19be6b;
      font-weight: bold;
    }

    &-info-unset {
      color: #ed3f14;
    }
  }

  .app-stock-list {
    padding-bottom: 2rem;
  }

  .app-stock-list-edit {
    .app-stock-item {
      padding-left: 3.5rem;

      &:before {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 3.5rem;
        padding-top: 1.5rem;
        font-size: 1.8rem;
        background-color: #f8f8f9;
        text-align: center;
        font-family: Ionicons;
        content: '\F3FE';
        color: #dddee1;
      }

      &-selected:before {
        content: '\F3FF';
        color: #2b85e4;
      }
    }
  }

  .app-list {
    &-empty {
      text-align: center;
      padding: 1rem;
      font-size: 1rem;
    }
  }
</style>
