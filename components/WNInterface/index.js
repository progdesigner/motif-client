export { default as WNInterface } from './WNInterface.js'

const plugin = {
  install (Vue, {loadComponent = true} = {}) {

    let wni = WNInterface
    wni.onReady((e) => {
      if (wni.interfaceVersion === e.interfaceVersion) {
        wni.appVersion = e.appVersion
        wni.isReady = true
      }
    })

    Vue.wni = wni

    Object.defineProperties(Vue.prototype, {
      wni: {
        get() {
          return wni
        }
      }
    })
  },

  WNInterface
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
