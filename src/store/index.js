import Vue from 'vue'
import Vuex from 'vuex'
import shop from './modules/shop'
import checkout from './modules/checkout'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: 0,
    title: ''
  },

  mutations: {
    triggerLoading (state, loading = true) {
      if (!loading) {
        if (state.loading > 0) {
          state.loading--
        }
      } else {
        state.loading++
      }
    },

    setTitle (state, title) {
      state.title = title
    }
  },

  modules: {
    shop,
    checkout
  }
})
