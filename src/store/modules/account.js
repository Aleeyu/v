/**
 * Created by san on 2017/7/23.
 */
// import {UPDATE_DETAILS} from '../mutations-type'
import axios from 'axios'

export default {
  namespaced: true,
  state: {
    details: {}
  },
  getters: {
    // 类似computed,存放需要缓存，或计算的数据
  },
  mutations: {
    /* [UPDATE_DETAILS] (state, arg) {
     state.details = {...state.details, ...arg}
     } */
    updateDetails (state, arg) {
      if (!arg || (!arg.wechatNick && !arg.wechatAvatar)) {
        arg.wxInfo = null
      } else {
        arg.wxInfo = {
          wechatNick: arg.wechatNick,
          wechatAvatar: arg.wechatAvatar
        }
      }

      state.details = {...state.details, ...arg}
    },
    removeDetailsKey (state, arg) {
      for (let item of arg) {
        delete state.details[item]
      }
    },
    clearDetails (state) {
      state.details = {};
    }
  },
  actions: {
    /* [UPDATE_DETAILS] (context) {
     context.commit(UPDATE_DETAILS)
     } */
    getDetails ({commit}) {
      return new Promise((resolve, reject) => {
        axios.get('/system/user/current').then(res => {
          if (!res || (!res.wechatNick && !res.wechatAvatar)) {
            res.wxInfo = null
          } else {
            res.wxInfo = {
              wechatNick: res.wechatNick,
              wechatAvatar: res.wechatAvatar
            }
          }
          commit('updateDetails', res)
          resolve()
        }).catch(err => {
          reject(err)
          console.log('获取个人信息失败')
        })
      })
    }
  }
}
