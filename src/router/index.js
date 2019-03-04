import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

Vue.use(Router)
Vue.use(Meta)

const Construction = resolve => require(['@/components/Construction'], resolve)

const Signin = resolve => require(['@/components/Signin'], resolve)

const MobileAppMain = resolve => require(['@/components/app/Main'], resolve)
const MallAppMain = resolve => require(['@/components/mallapp/Main'], resolve)

const MobileMain = resolve => require(['@/components/mobile/Main'], resolve)

const Tracing = resolve => require(['@/components/mobile/Tracing'], resolve)
const Lottery = resolve => require(['@/components/mobile/Lottery'], resolve)

const InvoicePrint = resolve => require(['@/components/report/Invoice'], resolve)
const ReceiptPrint = resolve => require(['@/components/report/Receipt'], resolve)
const Order = resolve => require(['@/components/report/Order'], resolve)
const ProductionOrder = resolve => require(['@/components/report/ProductionOrder'], resolve)
const QrCodeApply = resolve => require(['@/components/report/QrCodeApply'], resolve)
const AnalysisPrint = resolve => require(['@/components/report/FleegoodsAnalysis'], resolve)

let routes = [
  {
    path: '/construction',
    name: 'construction',
    component: Construction,
    meta: {title: '页面正在建设中'}
  },
  {
    path: '/signin',
    name: 'signin',
    meta: {
      title: '碧护'
    },
    component: Signin
  },
  {
    path: '/mobile/:comp',
    name: 'mobile',
    component: MobileMain,
    meta: {title: '碧护经销商'}
  },
  {
    path: '/app/:comp',
    name: 'mobile_app',
    component: MobileAppMain,
    meta: {title: '碧护'}
  },
  {
    path: '/mallapp/:comp',
    name: 'mall_app',
    component: MallAppMain,
    meta: {title: '碧护商城'}
  },
  {
    path: '/UNITS_BOX/:id',
    name: 'tracingBox',
    component: Tracing,
    meta: {title: '碧护 - 活动'}
  },
  {
    path: '/UNITS_BAG/:id',
    name: 'tracingBag',
    component: Tracing,
    meta: {title: '碧护 - 活动'}
  },
  {
    path: '/UNITS_CASE/:id',
    name: 'tracingCase',
    component: Tracing,
    meta: {title: '碧护 - 活动'}
  },
  {
    path: '/report/invoice/:id',
    name: 'invoicePrint',
    component: InvoicePrint,
    meta: {title: '销售出库单'}
  },
  {
    path: '/report/fleegoodsanalysis',
    name: 'AnalysisPrint',
    component: AnalysisPrint,
    meta: {title: '窜货详情打印'}
  },
  {
    path: '/report/receipt/:id',
    name: 'receiptPrint',
    component: ReceiptPrint,
    meta: {title: '销售入库单'}
  },
  {
    path: '/report/order',
    name: 'order',
    component: Order,
    meta: {title: '订单打印'}
  },
  {
    path: '/report/productionorder',
    name: 'productionorder',
    component: ProductionOrder,
    meta: {title: '生产单打印'}
  },
  {
    path: '/report/qrcodeapply/:id',
    name: 'qrcodeapply',
    component: QrCodeApply,
    meta: {title: '二维码印刷确认单打印'}
  },
  {
    path: '/origin',
    name: 'origin',
    component: Tracing,
    meta: {title: '溯源'}
  },
  {
    path: '/lottery',
    name: 'lottery',
    component: Lottery,
    meta: {title: '抽奖'}
  }
];

export default new Router({
  mode: 'history',
  routes: routes,
  scrollBehavior (to, from, savedPosition) {
    return {x: 0, y: 0}
  }
})
