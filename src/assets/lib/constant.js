/**
 * Created by Yatagaras on 2017/7/25.
 * 定义常量，包括错误信息、提示信息等
 */

export default {
  install (Vue) {
    let constants = {}

    const supportedLanguages = {
      'zh-cn': {
        name: '简体中文 (Simplified Chinese)',
        failed: '加载语言文件失败，请稍候重试'
      },
      'en-us': {
        name: 'English (United States)',
        failed: 'Loading language file failed, please try again later'
      }
    }

    let internationalize = {
      current: null,
      load: function (callback) {
        let l = window.localStorage.getItem('lang') || 'zh-cn'
        if (!supportedLanguages.hasOwnProperty(l)) {
          l = 'zh-cn'
        }
        Vue.prototype.$http.get(`/static/lang/${l}.json`, {
          baseURL: ''
        }).then(res => {
          window.localStorage.setItem('lang', l)
          constants = res
          Vue.prototype.$C = constants
          internationalize.current = l
          if (callback) {
            callback()
          }
        }).catch(res => {
          Vue.prototype.$Message.error(supportedLanguages[l].current)
        })
      },
      change: function (l) {
        if (l && supportedLanguages.hasOwnProperty(l) >= 0) {
          let current = window.localStorage.getItem('lang') || 'zh-cn'
          if (current !== l) {
            window.localStorage.setItem('lang', l)
            window.location.reload()
          }
        }
      }
    }

    /**
     * 国际化对象
     */
    Vue.prototype.$i18n = internationalize

    const errorType = {
      'UNHANDLED': 0,
      'NODATA': 1,
      'NORESULT': 2,
      'NOTFOUND': 3
    }

    Vue.prototype.$ErrType = errorType

    /**
     * 定义常用列表、明细获取错误对象，用于error-view
     */
    Vue.prototype.$Err = {
      unhandled: function (retry = true, close = false) {
        return {
          type: errorType.UNHANDLED,
          title: constants.ERROR_COMM_UNHANDLED_TITLE,
          content: constants.ERROR_COMM_UNHANDLED_CONTENT,
          action: retry ? constants.BUTTON_COMM_OPERATE_RETRY : '',
          cancel: close ? constants.BUTTON_COMM_OPERATE_CLOSE : ''
        }
      },
      noData: function (create = true) {
        return {
          type: errorType.NODATA,
          title: constants.LIST_COMM_NODATA_TITLE,
          content: create ? constants.LIST_COMM_NODATA_CONTENT : constants.LIST_COMM_NODATA_CONTENT_NO_CREATE,
          action: create ? constants.BUTTON_COMM_OPERATE_ADD : ''
        }
      },
      noResult: function (create = true) {
        return {
          type: errorType.NORESULT,
          title: constants.LIST_COMM_NORESULT_TITLE,
          content: constants.LIST_COMM_NORESULT_CONTENT,
          action: create ? constants.BUTTON_COMM_OPERATE_ADD : ''
        }
      },
      notFound: function (back = true, retry = true) {
        return {
          type: errorType.NOTFOUND,
          title: constants.DETAIL_COMM_NOTFOUND_TITLE,
          content: constants.DETAIL_COMM_NOTFOUND_CONTENT,
          action: retry ? constants.BUTTON_COMM_OPERATE_RETRY : '',
          cancel: back ? constants.BUTTON_COMM_OPERATE_BACK : ''
        }
      }
    }
  }
}
