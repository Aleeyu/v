/**
 * Created by Yatagaras on 2017/8/28.
 */

export default {
  install (Vue) {
    let dicts = {}

    let addDict = function (code, name, parent, desc, type) {
      if (code && name && type) {
        if (!parent || dicts.hasOwnProperty(parent)) {
          let d = {
            code: code,
            name: name,
            parentCode: parent,
            description: desc,
            type: type
          }
          dicts[code] = d
        } else {
          console.warn(`Adding sub level dictionary: , but could not find the specified parent class.`)
        }
      }
    }

    Vue.prototype.$Dict = dicts
    Vue.prototype.$DictManage = {
      add: addDict,
      query: function (type) {
        let res = []
        if (type && typeof type === 'string') {
          for (let k in dicts) {
            if (dicts.hasOwnProperty(k)) {
              let d = dicts[k]
              if (Vue.prototype.$isPlainObject(d) && d.hasOwnProperty('type') && d.type === type) {
                res.push(JSON.parse(JSON.stringify(d)))
              }
            }
          }
        }
        return res
      },
      find: function (code, equal = true, returnCode = true) {
        let res = []
        if (code && typeof code === 'string') {
          for (let k in dicts) {
            if (dicts.hasOwnProperty(k)) {
              let d = dicts[k]
              if (Vue.prototype.$isPlainObject(d) && d.hasOwnProperty('code')) {
                if ((equal && d.code === code) || (!equal && d.code.indexOf(code) >= 0)) {
                  if (returnCode) {
                    res.push(d.code)
                  } else {
                    res.push(JSON.parse(JSON.stringify(d)))
                  }
                }
              }
            }
          }
        }
        return res
      }
    }

    addDict('LOTTERY_TYPE_SHAKE', '摇一摇', null, '摇一摇', 'LOTTERY_TYPE');
    addDict('LOTTERY_TYPE_WHEEL', '转盘', null, '转盘', 'LOTTERY_TYPE');
    addDict('MK_COMP_TYPE_EVENT', '营销活动类', null, '营销活动类', 'MK_COMP_TYPE');
    addDict('MK_COMP_TYPE_TOOL', '工具类', null, '工具类', 'MK_COMP_TYPE');
    addDict('MK_PROM_TYPE_MONEY', '按金额统计', null, '按金额统计', 'MK_PROM_TYPE');
    addDict('MK_PROM_TYPE_TIMES', '按次统计', null, '按次统计', 'MK_PROM_TYPE');
    addDict('MK_SHARE_TYPE_CHECKBUY', '对方需要购买', null, '好友扫码浏览宣传页面，并在微商城中完成了一次购买行为', 'MK_SHARE_TYPE');
    addDict('MK_SHARE_TYPE_CHECKFOCUS', '对方需要关注', null, '好友扫码浏览宣传页面，并关注了公众号', 'MK_SHARE_TYPE');
    addDict('MK_SHARE_TYPE_CHECKREAD', '对方需要查阅', null, '好友扫码浏览宣传页面既认为分享成功', 'MK_SHARE_TYPE');
    addDict('MK_SHARE_TYPE_UNCHECK', '分享即为成功', null, '分享即认为成功', 'MK_SHARE_TYPE');
    addDict('MK_STATUS_CREATING', '创建中', null, '创建中', 'MK_STATUS');
    addDict('MK_STATUS_RUNNING', '运行中', null, '运行中', 'MK_STATUS');
    addDict('MK_STATUS_STOPED', '已停止', null, '运行中的只能停止，创建中的活动允物理删除许', 'MK_STATUS');
    addDict('MK_TYPE_MULTI', '一物一码活动', null, '参与活动的每个商品都拥有自己独一无二的二维码，每个二维码只能参与一次活动，适合有奖励内容（如：抽奖、送积分等）的活动', 'MK_TYPE');
    addDict('MK_TYPE_SINGLE', '单一码活动', null, '使用统一的二维码参与活动，每个二维码可以重复参加活动，适合只有调查、采集但没有奖励的活动', 'MK_TYPE');
    addDict('MK_TYPE_WECHAT', '公众号活动', null, '公众号', 'MK_TYPE');
    addDict('ARTICLE_APPROVAL_FAIL', '审批未通过', null, '文章审批未通过', 'ART_APPROVAL');
    addDict('ARTICLE_APPROVAL_PASS', '审批通过', null, '文章审批通过', 'ART_APPROVAL');
    addDict('ARTICLE_APPROVAL_WAIT', '待审批', null, '公众号文章待审批', 'ART_APPROVAL');
    addDict('OD_DELIVERY_TYPE_MAN', '手动发货', null, null, 'OD_DELIVERY_TYPE');
    addDict('OD_DELIVERY_TYPE_THIRD', '第三方发货', null, null, 'OD_DELIVERY_TYPE');
    addDict('OD_GOODS_STATUS_ONWAY', '配送中', null, '在途商品', 'OD_GOODS_STATUS');
    addDict('OD_GOODS_STATUS_RECEIVED', '已收货', null, null, 'OD_GOODS_STATUS');
    addDict('OD_GOODS_STATUS_REPAIR', '维修中', null, null, 'OD_GOODS_STATUS');
    addDict('OD_GOODS_STATUS_RETURNED', '已退货', null, null, 'OD_GOODS_STATUS');
    addDict('OD_GOODS_STATUS_RETURNNING', '退还中', null, null, 'OD_GOODS_STATUS');
    addDict('OD_ORDER_STATUS_CANCELED', '已取消', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_FINISHED', '已完成', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_ONSER', '售后服务中', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_UNCREATE', '待创建', null, '占位订单，仅为订单生成订单号', 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_UNDELI', '代发货', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_UNPAY', '待付款', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_STATUS_UNREC', '待收货', null, null, 'OD_ORDER_STATUS');
    addDict('OD_ORDER_TYPE_GIFT', '赠品类订单', null, '由营销活动生成的奖品、赠品类订单', 'OD_ORDER_TYPE');
    addDict('OD_ORDER_TYPE_SALE', '销售订单', null, '商城中正常下单的订单', 'OD_ORDER_TYPE');
    addDict('OD_ORDER_TYPE_SERVICE', '客服订单', null, '由客服人员下的订单，多用于处理客户服务时', 'OD_ORDER_TYPE');
    addDict('OD_PAY_TYPE_CASH', '现金支付', null, '现金支付', 'OD_PAY_TYPE');
    addDict('OD_PAY_TYPE_ONLINE', '网络支付', null, '网络支付', 'OD_PAY_TYPE');
    addDict('QUESTION_TYPE_MULTI', '多选', null, null, 'QUESTION_TYPE');
    addDict('QUESTION_TYPE_RADIO', '单选', null, null, 'QUESTION_TYPE');
    addDict('QUESTION_TYPE_TEXT', '输入', null, null, 'QUESTION_TYPE');
    addDict('SP_COUPON_LIMIT_AUT', '自动计算', null, '自动计算到期时间', 'SP_COUPON_LIMIT');
    addDict('SP_COUPON_LIMIT_FIX', '固定周期', null, '使用设置好的开始结束时间', 'SP_COUPON_LIMIT');
    addDict('SP_COUPON_SOURCE_JD', '京东', null, '自有商城', 'SP_COUPON_SOURCE');
    addDict('SP_COUPON_SOURCE_OWN', '自有商城', null, '自有商城', 'SP_COUPON_SOURCE');
    addDict('SP_COUPON_SOURCE_TAOBAO', '淘宝', null, '淘宝', 'SP_COUPON_SOURCE');
    addDict('SP_COUPON_STATUS_NORMAL', '正常', null, '正常', 'SP_COUPON_STATUS');
    addDict('SP_COUPON_STATUS_SENDED', '已发放', null, '已发放', 'SP_COUPON_STATUS');
    addDict('SP_COUPON_STATUS_USED', '已使用', null, '已使用', 'SP_COUPON_STATUS');
    addDict('SP_GOODS_SOURCE_3RD_BLH', '百礼汇', null, '百礼汇', 'SP_GOODS_SOURCE');
    addDict('SP_GOODS_SOURCE_OWN', '自有商城', null, '自有商城', 'SP_GOODS_SOURCE');
    addDict('SP_GOODS_SOURCE_WECHAT', '微信', null, '微信', 'SP_GOODS_SOURCE');
    addDict('SP_GOODS_STATUS_CREATING', '创建中', null, '创建中，该状态下允许物理删除', 'SP_GOODS_STATUS');
    addDict('SP_GOODS_STATUS_NORMAL', '上架', null, '上架', 'SP_GOODS_STATUS');
    addDict('SP_GOODS_STATUS_STOPED', '下架', null, '下架', 'SP_GOODS_STATUS');
    addDict('SP_GOODS_TYPE_COUPON', '代金券', null, '代金券', 'SP_GOODS_TYPE');
    addDict('SP_GOODS_TYPE_NORMAL', '一般商品', null, '一般商品', 'SP_GOODS_TYPE');
    addDict('SP_GOODS_TYPE_POINT', '积分', null, '积分', 'SP_GOODS_TYPE');
    addDict('SP_GOODS_TYPE_RANDOMREDPACK', '随机红包', null, '随机红包', 'SP_GOODS_TYPE');
    addDict('SP_GOODS_TYPE_REDPACK', '红包', null, '红包', 'SP_GOODS_TYPE');
    addDict('STYLE_SHOWTYPE_IMAGE', '显示图片', null, '显示图片', 'STYLE_SHOWTYPE');
    addDict('STYLE_SHOWTYPE_TEXT', '显示文本', null, '显示文本', 'STYLE_SHOWTYPE');
    addDict('UNITS_BAG', '袋', null, '袋', 'UNITS');
    addDict('UNITS_CASE', '盒', null, '盒', 'UNITS');
    addDict('UNITS_BOX', '箱', null, '箱', 'UNITS');
  }
}
