/**
 * Created by san on 2017/7/23.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import actions from './actions'
import mutations from './mutations'

import account from './modules/account'
import record from './modules/record'
import wechat from './modules/wechat'

const store = new Vuex.Store({
  // 根状态
  state: {
    // test: 123
  },
  // 根getter
  getters: {
    // 类似computed,存放需要缓存，或计算的数据

  },
  // 根分发操作
  mutations,

  // 根action
  actions,

  // 模块
  modules: {
    account,
    record,
    wechat
  }

});

export default store;

