'use strict';

import MotifAuth from './components/Auth'
import KakaoPlugin from './modules/Kakao'
import NaverPlugin from './modules/Naver'

export class MotifClient {
  constructor( options = {} ) {
    this.auth = new MotifAuth(this, options)
  }
}

const plugin = {
  install (Vue, {loadComponent = true} = {}) {

    Vue.use(KakaoPlugin)
    Vue.use(NaverPlugin)

    Vue.component('motif', MotifClient)
  }
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
