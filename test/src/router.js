import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import SampleCheckPlusSafe from './components/nice/SampleCheckPlusSafe.vue'
import SampleCheckPlusSafeHandler from './components/nice/SampleCheckPlusSafeHandler.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/nice/sample/check-plus-safe/handler',
      name: 'SampleCheckPlusSafeHandler',
      component: SampleCheckPlusSafeHandler
    },
    {
      path: '/nice/sample/check-plus-safe',
      name: 'SampleCheckPlusSafe',
      component: SampleCheckPlusSafe
    }
  ]
})
