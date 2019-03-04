// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'babel-polyfill'
import store from './store'
import axios from 'axios'
import promiseFinally from 'promise.prototype.finally'
import 'iview/dist/styles/iview.css'
import iview from 'iview'
import '@/assets/font.css'
import cbcCommon from '@/assets/lib/common'
import cbcConstant from '@/assets/lib/constant'
import cbcDictionary from '@/assets/lib/dictionary'
import errorCodes from '@/assets/lib/errorCodes'
import errorView from '@/components/common/ErrorView'
import citypicker from '@/components/common/CityPicker'
import axiosconfig from '@/config'

let app

Vue.use(iview)
Vue.config.productionTip = false

promiseFinally.shim();
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000;
axios.defaults.baseURL = axiosconfig.baseUrl

axios.interceptors.request.use((config) => {
  let loading = false
  if (config.data === true || config[0] === true || config._loading === true) {
    loading = true
    config.data = null
  } else if (Vue.prototype.$isPlainObject(config.data) && config.data._loading === true) {
    loading = true
    delete config.data._loading
  }
  if (loading && app) {
    app.$children[0].showLoading()
  }
  return config;
}, (error) => {
  if (app) {
    app.$children[0].hideLoading()
  }
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  if (app) {
    app.$children[0].hideLoading()
  }

  if (response.data.error == null || !response.data.error) {
    return Promise.resolve(response.data.data);
  } else {
    if (response.data.error.code === errorCodes.notSigned.CODE) {
      if (window.location.href.indexOf('/app/') >= 0) {
        window.location.href = '/app/signin'
      } else {
        window.location.href = '/signin'
      }
      /* if (response.config.method.toLowerCase() === 'get') {
      } else {
        app.$children[0].signin()
      } */
    }

    return Promise.reject(response.data.error);
  }
}, (error) => {
  if (app) {
    app.$children[0].hideLoading()
  }
  if (error.code === 'ECONNABORTED') {
    error = new Error('请求超时或者被取消了，请稍候重试。')
  }
  return Promise.reject(error);
});

Vue.prototype.$http = axios
Vue.use(cbcCommon)
Vue.use(cbcConstant)
Vue.use(cbcDictionary)
Vue.component('error-view', errorView)
Vue.component('city-picker', citypicker)
Vue.prototype.$ErrCode = errorCodes
Vue.prototype.$privilege = null

let privRoutes = {
  path: '/',
  name: 'main',
  component: resolve => require(['@/components/Main'], resolve),
  meta: {title: '碧护'},
  children: null
}

router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {
    if (Vue.prototype.$privilege) {
      /* 对于未匹配的路径, 跳转到正在建设页面：提示正在建设中 */
      next('/construction');
    } else {
      axios.get('/system/user/current/privs').then(res => {
        if (Vue.prototype.$isPlainObject(res) && Vue.prototype.$isArray(res.all, true) && Vue.prototype.$isArray(res.current, true)) {
          Vue.prototype.$privilege = res
          let rootmenus = {}
          let routes = [{
            path: '',
            name: 'index',
            component: resolve => require(['@/components/system/Profile'], resolve),
            meta: {title: '碧护 - 系统设置 - 首页'}
          }]
          for (let p of res.all) {
            if (p.param) {
              p.param = JSON.parse(p.param)
            }
            if (p.pid == null) {
              rootmenus[p.id] = p
            } else {
              p.path = p.path.replace(/(:(\w+))/i, (a, b, c) => {
                return p.param[c]
              })
              let paths = p.path.split('/')
              let nav = {
                path: p.path,
                name: p.path.replace(/\//g, '_'),
                component: resolve => require([`@/components/${paths[0]}/${paths[1].replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`], resolve),
                meta: {
                  title: `碧护 - ${rootmenus[p.pid].text} - ${p.text}`,
                  rid: p.id
                }
              }
              routes.push(nav)
            }
          }
          privRoutes.children = routes
          router.addRoutes([privRoutes])
          router.replace(to)
        } else {
          next('/signin')
        }
      }).catch(res => {
        next('/signin');
      })
    }
  } else {
    let token = window.localStorage.getItem('pt')
    let nextable = true
    if (to.query.token) {
      let qs = Object.assign({}, to.query)
      delete qs.token

      if (Vue.prototype.$SHA265(JSON.stringify(qs)) !== token) {
        nextable = false
      }
    } else if (!(to.meta.rid == null ||
        Vue.prototype.$privilege.current.findIndex(pc => {
          return pc.id === to.meta.rid
        }) >= 0)) {
      let route = Vue.prototype.$privilege.all.find(d => d.id === to.meta.rid)
      if (`/${route.path}` !== to.path) {
        nextable = false
      }
    }

    if (nextable) {
      iview.LoadingBar.start()
      document.title = to.meta.title
      next()
    } else {
      next('/construction')
    }
  }
})

router.afterEach((to, from, next) => {
  iview.LoadingBar.finish()
})

// 加载语言包
Vue.prototype.$i18n.load(function () {
  /* eslint-disable no-new */
  app = new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: {App}
  })
})
