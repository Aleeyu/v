/**
 * Created by san on 2017/8/23.
 */
// import {UPDATE_DETAILS} from '../mutations-type'
import axios from 'axios'

export default {
  namespaced: true,
  state: {
    /* {
     gpsx: ''
     ,gpsy: ''
     } */
    gps: null,
    /* {
     info: '',
     province: '',
     city: '',
     area: '',
     street: ''
     } */
    address: null,
    list: null,
    current: null
  },
  getters: {
    // 类似computed,存放需要缓存，或计算的数据
  },
  mutations: {
    updateList (state, arg) {
      state.list = arg
    },
    updateGps (state, location) {
      state.gps = {
        gpsx: location.lng,
        gpsy: location.lat
      }
    },
    updateAddress (state, location) {
      state.address = {...location}
    },
    updateCurrent (state, record) {
      console.log('update: ' + JSON.stringify(record))
      state.current = record
    }
  },
  actions: {
    /* [UPDATE_DETAILS] (context) {
     context.commit(UPDATE_DETAILS)
     } */
    getList ({commit}, dynamicId) {
      return new Promise((resolve, reject) => {
        axios.post('/qrcode/dynamicrecord/search', {
          page: 1,
          size: 100,
          orderBy: [{property: 'createdTime', order: 'desc'}],
          queryFilter: [{property: 'dynamicId', op: '=', value: dynamicId}]
        }).then(res => {
          if (res && res.content && res.content.length > 0) {
            commit('updateList', res.content)
            resolve(res.content)
          } else resolve(res)
        }).catch(err => {
          reject(err)
          console.error('获取记录列表失败')
        })
      })
    }
  }
}
