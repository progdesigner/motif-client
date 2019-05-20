
import axios from 'axios'
import qs from 'qs'

class Naver {

  static install() {

  }

  constructor(config = {}) {
    const { credential, apiUrl } = config
    const { clientId, callbackUrl } = credential || {}

    this._apiUrl = apiUrl
    this._credential = credential
  }

  generateAuthorizeUrl() {

    const { clientId, callbackUrl } = this._credential || {}

    let baseURL = 'https://nid.naver.com/oauth2.0/authorize'
    let responseType = 'token'
    let state = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    })
    let params = {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: callbackUrl,
      state: state
    }
    let paramString = qs.stringify(params)
    return "".concat(baseURL, "?").concat(paramString)
  }

  loginPopup({ success, fail }) {
    let url = this.generateAuthorizeUrl()
    let width = 460
    let height = 629
    let top = 0
    let left = 0
    let popupWindow = window.open(url, 'naverloginpop', "titlebar=1, resizable=1, scrollbars=yes, width=".concat(width, ", height=").concat(height, ", top=").concat(top, ", left=").concat(left))

    let windowHandler = {
      interval: null
    }
    let windowCloserPromise = new Promise(function (resolve, reject) {
      windowHandler.interval = setInterval(function () {
        if (popupWindow.closed) {
          setTimeout(function () {
            clearInterval(windowHandler.interval);
            return fail({
              code: 'popup-closed',
              message: 'The popup has been closed by the user before finalizing the operation'
            });
          }, 100);
        }
      }, 100);
    })

    let tokenHandlerPromise = new Promise(function () {
      function receiveMessage(event) {
        if (event.source !== popupWindow) return;
        if (event.origin !== window.location.origin) return;
        clearInterval(windowHandler.interval);
        window.removeEventListener('message', receiveMessage, false);
        success(event.data);
      }

      window.addEventListener('message', receiveMessage, false);
    })
  }

  login() {
    return new Promise((resolve, reject) => {

      this.loginPopup({
        success: (authObj) => {
          let { access_token, expires_in, state, token_type } = authObj
          let options = {
            access_token: access_token
          }

          axios.post(`${this._apiUrl}/v1/firebase/auth/naver`, options)
            .then(res => {
              let { error, data } = res.data
              if (error) {
                reject(new Error(error))
                return
              }
              console.log( 'data', data )
              resolve(data)
            })
            .catch(e => {
              reject(e)
            })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  logout() {
    return Promise.resolve()
  }
}

const plugin = {
  install (Vue, {loadComponent = true} = {}) {
    Naver.install()

    Vue.component("Naver", Naver)
  }
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
export {
  Naver
}
