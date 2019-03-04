<template>
  <div class="order-track-sub"
       :class="{'order-track-sub-empty': !$isArray(data, true), 'order-track-sub-first': first, 'order-track-sub-single': data.length === 1}">
    <div class="order-track" v-for="m in data" :key="m.sendDept">
      <Poptip class="order-track-item" :class="{'order-track-nosub': !$isArray(m.children, true)}" trigger="hover"
              :width="640" placement="bottom-start" title="收货明细">
        <div class="order-track-item-info">
          <h3>{{m.receivedDepName}}</h3>
          <h4>{{m.boxAmount}}箱{{m.caseAmount}}盒</h4>
        </div>
        <div class="order-track-products" slot="content">
          <Table :columns="columns" :data="m.products" size="small"></Table>
        </div>
      </Poptip>
      <component :is="subTrack" :data="m.children" :first="false"></component>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        subTrack: null,
        columns: [{
          type: 'index',
          title: ' '
        }, {
          title: '产品名称',
          key: 'productName',
          width: 160
        }, {
          title: '数量',
          key: 'amount',
          width: 120,
          render: function (h, p) {
            return p.row.amount + (p.row.qrcodeType === 'UNITS_BOX' ? '箱' : (p.row.qrcodeType === 'UNITS_CASE' ? '盒' : '袋'))
          }
        }, {
          title: '状态',
          key: 'status',
          width: 100,
          render: function (h, p) {
            return p.row.status === 1 ? h('span', '待收货') : h('span', {style: 'color: #19be6b'}, '已收货')
          }
        }, {
          title: '收货时间',
          key: 'receivedTime',
          render: function (h, p) {
            return p.row.receivedTime ? new Date(p.row.receivedTime).toLocaleString() : ''
          },
          width: 200
        }]
      }
    },
    props: {
      data: Array,
      first: {
        type: Boolean,
        default: true
      }
    },
    mounted () {
      require([`@/components/order/Track`], (componentObj) => {
        this.subTrack = componentObj
      }, () => {
        this.$Message.error('加载页面失败，请稍候重试！')
      })
    }
  }
</script>
