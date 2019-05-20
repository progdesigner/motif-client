import axios from 'axios'
import { Kakao } from '../../modules/Kakao'
import { Naver } from '../../modules/Naver'

class MotifAuth {

  constructor(client, options) {
    let { firebase, firebaseStore, firebaseAuth, kakaoAppKey, naverCredential, apiUrl }= options

    this._client = client
    this._firebase = firebase
    this._firebaseAuth = firebaseAuth
    this._firebaseStore = firebaseStore
    this._apiUrl = apiUrl

    this._kakao = new Kakao({
      appKey: kakaoAppKey
    })

    this._naver = new Naver({
      credential: naverCredential,
      apiUrl: apiUrl
    })
  }

  createCustomToken(type, profile) {

    return new Promise((resolve, reject) => {
      let { access_token, uid, display_name, photo_url } = profile
      let params = {
        access_token, uid
      }

      console.log( 'createCustomToken', profile )

      axios.post(`${this._apiUrl}/v1/firebase/auth/${type}/custom`, params)
        .then(res => {
          let { data, error } = res.data
          if (error) {
            reject(new Error(error))
            return
          }
          resolve(data)
        })
        .catch(reject)
    })
  }

  signIn( authType ) {
    const auth = this._firebaseAuth

    if (authType === 'kakaotalk') {
      return new Promise((resolve, reject) => {
        this._kakao.login()
          .then(profile => {
            let { access_token, uid, display_name, photo_url } = profile

            this.createCustomToken('kakao-talk', profile)
              .then(res => {
                let { custom_token } = res
                profile.custom_token = custom_token
                return auth.signInWithCustomToken(custom_token)
              })
              .then(res => {
                if (!auth.currentUser) {
                  throw new Error('login is fail')
                }

                const payload = {
                  displayName: display_name,
                  photoURL: photo_url
                }

                return auth.currentUser.updateProfile( payload )
              })
              .then(res => {
                resolve(profile)
              })
              .catch(reject)
          })
          .catch(reject)
      })
    }
    else if (authType === 'naver') {
      return new Promise((resolve, reject) => {
        this._naver.login()
          .then(profile => {
            let { access_token, uid, display_name, photo_url } = profile

            this.createCustomToken('naver', profile)
              .then(res => {
                let { custom_token } = res
                profile.custom_token = custom_token
                return auth.signInWithCustomToken(custom_token)
              })
              .then(res => {
                if (!auth.currentUser) {
                  throw new Error('login is fail')
                }

                const payload = {
                  displayName: display_name,
                  photoURL: photo_url
                }

                return auth.currentUser.updateProfile( payload )
              })
              .then(res => {
                resolve(profile)
              })
              .catch(reject)
          })
          .catch(reject)
      })
    }

    return Promise.error(new Error('unknown error'))
  }

  signOut() {
    const auth = this._firebaseAuth

    this._naver.logout()
    this._kakao.logout()

    return auth.signOut()
  }
}

export default MotifAuth;
