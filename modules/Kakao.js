
class Kakao {

  static install() {
    if (!global.Kakao) {
      let plugin = document.createElement('script')
      plugin.src = `//developers.kakao.com/sdk/js/kakao.min.js`
      plugin.async = true

      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript) {
        firstScript.parentNode.insertBefore(plugin, firstScript)
      }
      else {
        document.head.appendChild(plugin)
      }
    }
  }

  constructor(config = {}) {
    const { appKey } = config

    this._sdk = global.Kakao

    if (this._sdk.Auth.getAppKey() === appKey) {
      console.warn( 'Kakao SDK already init' )
    }
    else {
      this._sdk.init(appKey)
    }
  }

  login() {
    console.log( 'login' )

    return new Promise((resolve, reject) => {

      this._sdk.Auth.loginForm({
        persistAccessToken: true,
        always: (result) => {
          console.log( 'result', result )
        },
        success: (authObj) => {

          let { access_token, expires_in, refresh_token, refresh_token_expires_in, scope, token_type } = authObj

          console.log( 'authObj', authObj )

          this._sdk.API.request({
            url: '/v2/user/me',
            success: (res) => {
              let { id, properties } = res
              let { nickname, profile_image, thumbnail_image, email } = properties

              console.log( 'properties', properties )

              resolve({
                uid: `kakao-talk:${id}`,
                access_token: access_token,
                email: email,
                display_name: nickname,
                photo_url: profile_image
              })
            },
            fail: (error) => {
              console.log( 'error', error )
              reject(error)
            }
          });
        },
        fail: (err) => {
          console.log( 'err', err )
          reject(err)
        }
      })
    })
  }

  logout() {

    return new Promise(resolve => {

      Kakao.Auth.logout({
        callback: () => {
          resolve()
        }
      })
    })
  }
}

const plugin = {
  install (Vue, {loadComponent = true} = {}) {

    Kakao.install()

    Vue.component("Kakao", Kakao)
  }
}

typeof window.Vue === 'function' && window.Vue.use(plugin)

export default plugin
export {
  Kakao
}
