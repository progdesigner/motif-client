
'use strict'

const _ = require('lodash')
const debug = function() {}

const InterfaceType = {
  Android: 'Android',
  iOS: 'iOS',
  Unknown: 'Unknown'
}

const InterfaceEvent = {
  Ready: 'init-page',
  Appear: 'appear-page',
  Disappear: 'disappear-page',
  Pause: 'pause-page',
  Resume: 'resume-page',
  RemoteNotification: "remote-notification"
}

const utils = {
  isJSONString: function (str) {
    if (typeof str === 'string' && str.length > 1) {
      var firstChat = str.substr(0, 1)
      if (firstChat === '{' || firstChat === '[') {
        return true
      }
    }
    return false
  },

  objectFromString: function (str) {
    if (utils.isJSONString(str)) {
      try {
        var obj = JSON.parse(str)
        for (var key in obj) {
          obj[key] = utils.objectFromString(obj[key])
        }
        return obj
      } catch (e) {
        return str
      }
    }
    return str
  }
}

class NativeProxyInterface {
  get userAgent () {
    if (global.window && global.window.navigator && global.window.navigator.userAgent) {
      return global.window.navigator.userAgent.toUpperCase()
    }
    return ''
  }

  _getInterfaceType () {
    let userAgent = this.userAgent
    if (userAgent.match(/iphone|ipad|ipod/i)) {
      return InterfaceType.iOS
    } else if (userAgent.match(/android/i)) {
      return InterfaceType.Android
    }
    return InterfaceType.Unknown
  }

  constructor () {
    this._type = this._getInterfaceType()
  }

  execute (payload) {
    debug('NativeProxyInterface - execute', payload)

    return new Promise((resolve, reject) => {
      let message = JSON.stringify(payload)

      if (this._type === InterfaceType.Android) {
        if (window.NativeAndroid) {
          try {
            let result = window.NativeAndroid.postMessage(message)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        } else {
          reject(new Error('No native API founds.'))
        }
      } else if (this._type === InterfaceType.iOS) {
        if (window.webkit.messageHandlers && window.webkit.messageHandlers.NativeiOS) {
          try {
            let result = window.webkit.messageHandlers.NativeiOS.postMessage(message)
            resolve(result)
          } catch (e) {
            reject(e)
          }
        } else {
          reject(new Error('No native API founds.'))
        }
      } else {
        reject(new Error('No native API founds.'))
      }
    })
  }
}

class WNRequestInvoker {
  constructor (target, interfaceVersion, options) {
    let { command, data } = options

    this._target = target
    this._interfaceVersion = interfaceVersion || ''
    this._command = command || ''
    this._data = data || {}
    this._async = false // 쓸일이...
    this._error = null
  }

  async execute () {
    debug('WNRequestInvoker - execute')
    try {
      return await this._target.execute({
        'version': this._interfaceVersion,
        'payload': {
          'command': this._command,
          'data': this._data
        }
      })
    } catch (e) {

    }
  }
}

class WNResponse {
  get group () {
    return this._group
  }

  get key () {
    return this._key
  }

  get isExpired () {
    return this._expired
  }

  get isProgressing () {
    return this._progressing
  }

  constructor (responder, options) {
    let { group, context, callback } = options

    this._responder = responder
    this._group = group || responder.generateGroup()
    this._key = responder.generateKey()
    this._context = context
    this._handler = callback
    this._expired = false
    this._progressing = false

    // @TODO: _progressing 처리 필요
  }

  execute () {
    debug('WNResponse - execute', this._group, this._key)

    let params = []
    _.each(arguments, (arg) => {
      let param = typeof arg === 'string' ? utils.objectFromString(arg) : arg
      params.push(param)
    })

    this._handler.apply(this._context, params)
  }

  expire (inGroup) {
    if (inGroup === true) {
      this._responder.invalidate(this.group)
    } else {
      this._expired = true
    }
  }

  toString () {
    return `WNInterface.responder.pool[\'${this.group}\'][\'${this.key}\'].execute`
  }
}

class WNResponder {
  get pool () {
    return this._pool
  }

  seed (seed) {
    seed = (seed === undefined) ? +new Date() : seed
    seed = Math.sin(seed) * 10000
    return seed - Math.floor(seed)
  }

  generateKey () {
    this._responseIndex = this._responseIndex + 1
    return 'key' + this._responseIndex
  }

  generateGroup () {
    let groupkey = 'g' + Math.round(this.seed(+new Date() / 1000) * 10000)
    this._pool[groupkey] = {}
    return groupkey
  }

  constructor () {
    this._responseIndex = 0
    this._pool = {}
  }

  add (response) {
    let group = response.group
    let key = response.key

    if (this._pool[group] === undefined) {
      this._pool[group] = {}
    }

    this._pool[group][key] = response
  }

  remove (response) {
    let group = response.group
    let key = response.key

    if (this._pool[group] && this._pool[group][key]) {
      let response = this._pool[group][key]
      response.expire()
      this._pool[group][key] = null
      delete this._pool[group][key]
    }
  }

  invalidate (group) {
    debug('WNResponder - invalidate', group)

    if (this._pool[group]) {
      for (let key in this._pool[group]) {
        let response = this._pool[group][key]
        response.expire()
      }
    }
  }

  batch (group, data) {
    debug('WNResponder - batch', group)

    if (this._pool[group]) {
      for (let key in this._pool[group]) {
        let response = this._pool[group][key]
        response.execute(data)
      }
    }
  }

  onInitPage (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.Ready, info)
  }

  onAppearPage (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.Appear, info)
  }

  onDisappearPage (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.Disappear, info)
  }

  onPausePage (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.Pause, info)
  }

  onResumePage (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.Resume, info)
  }

  onRemoteNotification (eventString) {
    let info = JSON.parse(eventString)
    this.batch(InterfaceEvent.RemoteNotification, info)
  }
}

class WNInterface {
  get version () {
    return '0.5.1'
  }

  get interfaceVersion() {
    return "v1"
  }

  get native () {
    return this._nativeInterface
  }

  get responder () {
    return this._responder
  }

  constructor (props) {
    this._responder = new WNResponder()
    this._nativeInterface = new NativeProxyInterface()
  }

  async execute (command, data) {
    debug('WNInterface - execute', command, data)

    try {
      let invoker = new WNRequestInvoker(this._nativeInterface, this.interfaceVersion, { command, data })

      return await invoker.execute()
    } catch (e) {

    }
  }

  on (eventName, callback) {
    let response = new WNResponse(this._responder, {
      context: this,
      group: eventName,
      callback: callback
    })

    this._responder.add(response)

    return response
  }

  cb (callback, group) {
    let response = new WNResponse(this._responder, {
      context: this,
      group: group,
      callback: callback
    })

    this._responder.add(response)

    return response.toString()
  }

  onReady (callback) {
    this.on(InterfaceEvent.Ready, callback)
  }

  onAppear (callback) {
    this.on(InterfaceEvent.Appear, callback)
  }

  onDisappear (callback) {
    this.on(InterfaceEvent.Disappear, callback)
  }

  onPause (callback) {
    this.on(InterfaceEvent.Pause, callback)
  }

  onResume (callback) {
    this.on(InterfaceEvent.Resume, callback)
  }

  onRemoteNotification (callback) {
    this.on(InterfaceEvent.RemoteNotification, callback)
  }
}

global.WNInterface = new WNInterface()

export default global.WNInterface
