'use strict';

import MotifAuth from './components/Auth'
import KakaoPlugin from './modules/Kakao'
import NaverPlugin from './modules/Naver'
import WNInterfacePlugin, { WNInterface as WNInterfaceModule } from './components/WNInterface'

export const WNInterface = WNInterfaceModule

export class MotifClient {
  constructor( options = {} ) {
    this.auth = new MotifAuth(this, options)
  }
}

const plugin = {
  install (Vue, {loadComponent = true} = {}) {
    Vue.use(KakaoPlugin)
    Vue.use(NaverPlugin)
    Vue.use(WNInterfacePlugin)

    Vue.component('motif', MotifClient)
  }
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
