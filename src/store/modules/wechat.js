export default {
  namespaced: true,
  state: {
    userInfo: null
  },
  getters: {

  },
  mutations: {
    updateUserInfo (state, info) {
      state.userInfo = info;
    }
  },
  actions: {
    /* [UPDATE_DETAILS] (context) {
     context.commit(UPDATE_DETAILS)
     } */
  }
}
