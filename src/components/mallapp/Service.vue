<template>
  <div class="app-service app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1>售后服务</h1>
      </div>
      <div class="app-banner-button right">
      </div>
    </div>

    <div class="app-service-base" :class="[model.status === 1 ? 'completed' : 'processing']"
         v-if="record && model && model.isNew !== true">
      <div class="app-order-record tight"><em>工单编号</em>{{ model.ticketNo }}</div>
      <div class="app-order-record tight"><em>处理状态</em>{{ model.status === 1 ? '已处理' : '未处理' }}</div>
      <div class="app-order-record tight" v-if="model.status === 0">我们的客服将与您联系进行处理，请保持手机在可通话状态</div>
    </div>

    <list-panel class="app-body app-common-body" :class="{'app-service-disabled': model && model.isNew !== true}"
                :refreshable="false" :pageable="false">
      <error-view v-if="error" :error="error" @action="load"></error-view>

      <div class="app-list" v-if="!error && record && model">
        <div class="app-list-item">
          <div class="app-order-record"><em>订单编号</em>{{ record.orderNo }}
            <!-- <Button type="text" @click.stop="copy(record.orderNo)">复制</Button> -->
          </div>
          <div class="app-order-record"><em>下单时间</em>{{ new Date(record.createdTime).format() }}</div>
        </div>

        <div class="app-list-item" v-if="$isArray(record.orderDetails, true)">
          <div class="app-cart-item app-cart-item-coll bottom-border" v-for="d in record.orderDetails">
            <div class="app-cart-image" :style="{backgroundImage: getPicture(d), marginLeft: '1rem'}"></div>
            <div class="app-cart-info">
              <v-touch tag="h1">{{ d.goodsName }} {{ d.specKey }}</v-touch>
              <v-touch tag="h3">{{ d.spec }}</v-touch>
              <div class="app-cart-sale">
                <span class="app-cart-price">{{ Number(d.salesPrice / 100).toFixed(2) }}</span>
                <span class="app-statement-quantity">×{{d.number}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="app-list-item" v-if="record.comment">
          <div class="app-order-record"><em>留言内容</em>{{ record.comment }}</div>
        </div>

        <!--<div class="app-list-item">
          <div class="app-order-record app-order-record-vertical">
            <em>服务类型</em>
            <RadioGroup v-model="model.typeId" type="button" size="large">
              <Radio label="TICKET_RETURNED">退货</Radio>
              <Radio label="TICKET_ADVICE">建议</Radio>
              <Radio label="TICKET_OTHER">其它</Radio>
            </RadioGroup>
          </div>
        </div>-->

        <div class="app-list-item">
          <div class="app-order-record app-order-record-vertical">
            <em>问题描述</em>
            <div class="app-service-desc">
              <Input type="textarea" v-model.trim="model.ticketContent" placeholder="请描述您的问题" :rows="5"
                     :maxlength="500"/>
              <mark>{{ (model.ticketContent || '').length }} / 500</mark>
            </div>

            <file-uploader v-if="model.isNew || model.imgs != null" class="app-service-images" :itemSize="64"
                           :immediate="true" :viewable="false" :maxFileCount="3" :mobile="true"
                           :toastMessage="true" :confirm="false" accept="image/*" :entId="model.ticketId"
                           typeKey="mallappserviceimages" :maxSize="5120" :maxTotalSize="20480"></file-uploader>
          </div>
        </div>
      </div>
    </list-panel>

    <div class="app-menus" v-if="record && model && model.isNew === true">
      <Button class="horizontal primary" icon="android-done" :disabled="busy" @click.stop="save">提交</Button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'
  import FileUploader from '@/components/common/FileUploader'

  export default {
    components: {ListPanel, FileUploader},
    data () {
      return {
        busy: false,
        status: {
          UNPAY: 0,
          UNDELIVERED: 1,
          UNRECEIVED: 2,
          COMPLETED: 3,
          CANCELLED: 4,
          CLOSED: 5,
          DELETED: 6
        },
        record: null,
        error: null,
        model: null
      }
    },
    methods: {
      /**
       * 后退至上一页
       */
      back: function () {
        this.$router.back()
      },
      shown: function () {
        if (this.$route.query.id) {
          this.load()
        } else {
          this.back()
        }
      },
      load: function (callback) {
        if (!this.busy) {
          this.busy = true
          this.record = null
          this.$http.get(`/wechat/customer/mallorder/${this.$route.query.id}`, true).then(res => {
            this.busy = false
            this.check(res, callback)
          }).catch(err => {
            this.busy = false
            console.log(err)
            this.error = this.$Err.unhandled()
            if (typeof callback === 'function') {
              callback()
            }
          })
        }
      },
      /**
       * 生成图片地址
       * @param d 商品信息
       */
      getPicture: function (d) {
        let pic = null
        if (this.$isPlainObject(d) && d.hasOwnProperty('pictures')) {
          let pics = String(d.pictures).split(',')
          if (pics.length > 0 && !!pics[0]) {
            pic = `url(${pics[0]})`
          }
        }
        return pic
      },
      copy: function (data) {
        this.$parent.copy(data)
      },
      check: function (record, callback) {
        if (!this.busy && this.$isPlainObject(record) && record.hasOwnProperty('status') &&
          record.status !== this.status.UNPAY && record.status !== this.status.CLOSED &&
          record.status !== this.status.DELETED) {
          // 只能订单状态不为未付款、已关闭、已删除的才能申请售后
          this.busy = true
          let o = {
            page: 1,
            size: 10,
            queryFilter: [{property: 'mallOrderId', op: '=', value: record.orderId}],
            _loading: true
          }
          this.$http.post('/wechat/customer/market/ticket/search', o).then(res => {
            this.error = null
            this.record = record
            if (this.$isArray(res.content, true)) {
              this.model = res.content[0]
            } else {
              this.model = {
                isNew: true,
                ticketId: this.$uuid(),
                typeId: 'TICKET_RETURNED',
                mallOrderId: record.orderId,
                mallOrderNo: record.orderNo,
                ticketContent: '',
                imgs: null
              }
            }
          }).catch(err => {
            console.log(err)
            this.error = this.$Err.unhandled()
          }).finally(() => {
            this.busy = false
            if (typeof callback === 'function') {
              callback()
            }
          })
        } else {
          this.$parent.replaceRoute({
            path: '/mallapp/order'
          })
        }
      },
      save: function () {
        if (!this.busy && this.record && this.$isPlainObject(this.model) && this.model.isNew === true) {
          if (this.model.ticketContent == null || this.model.ticketContent === '') {
            this.$Message.info('请对本次消费中的问题进行描述')
          } else {
            this.busy = true
            this.$http.post('/wechat/customer/market/ticket', Object.assign(this.model, {_loading: true})).then(res => {
              this.$Message.success('提交信息成功！')
              this.model = res
            }).catch(err => {
              console.log(err)
              this.$Message.error(err.message || err.msg || '提交信息失败！')
            }).finally(() => {
              this.busy = false
            })
          }
        }
      }
    }
  }
</script>

<style lang="less">
  .app-service {
    &-desc {
      position: relative;

      mark {
        position: absolute;
        right: 1px;
        bottom: 1px;
        padding: .5rem;
        background-color: white;
        color: #495060;
      }
    }

    &-base {
      padding: .5rem 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, .1);
      z-index: 9;

      * {
        color: white !important;
      }

      &.processing {
        background-color: #19be6b;
      }

      &.completed {
        background-color: #2d8cf0;
      }
    }

    &-disabled {
      * {
        pointer-events: none;
      }
    }

    &-images {
      .upload-item {
        width: 5rem !important;
        height: 5rem !important;
      }
    }
  }
</style>
