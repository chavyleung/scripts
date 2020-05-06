const chavy = init()
const cookieName = '顺丰速运'
const KEY_loginurl = 'chavy_loginurl_sfexpress'
const KEY_loginheader = 'chavy_loginheader_sfexpress'
const KEY_login27url = 'chavy_login27url_sfexpress'
const KEY_login27header = 'chavy_login27header_sfexpress'

const signinfo = {}
let VAL_loginurl = chavy.getdata(KEY_loginurl)
let VAL_loginheader = chavy.getdata(KEY_loginheader)
let VAL_login27url = chavy.getdata(KEY_login27url)
let VAL_login27header = chavy.getdata(KEY_login27header)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await loginapp()
  await signapp()
  // if (VAL_login27url && VAL_login27header) {
  //   await loginapp27()
  //   await signapp27()
  //   await getinfo27()
  // }
  await getinfo()
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function loginapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_loginurl, headers: { Cookie: '' } }
    chavy.get(url, (error, response, data) => {
      try {
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `登录结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp - 登录失败: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function loginapp27() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_login27url, headers: JSON.parse(VAL_login27header) }
    chavy.get(url, (error, response, data) => {
      try {
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `登录结果: 失败 (27周年)`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp27 - 登录失败: ${e}`)
        chavy.log(`❌ ${cookieName} loginapp27 - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function signapp() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://sf-integral-sign-in.weixinjia.net/app/signin`, headers: JSON.parse(VAL_loginheader) }
    delete url.headers['Cookie']
    url.headers['Origin'] = 'https://sf-integral-sign-in.weixinjia.net'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Host'] = 'sf-integral-sign-in.weixinjia.net'
    url.headers['Content-Length'] = '15'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.body = `date=${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    chavy.post(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
        signinfo.signapp = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function signapp27() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://mcs-mimp-web.sf-express.com/mcs-mimp/activity/sign`, headers: {} }
    delete url.headers['Cookie']
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Type'] = 'application/json;charset=utf-8'
    url.headers['Host'] = 'mcs-mimp-web.sf-express.com'
    url.headers['Origin'] = 'https://mcs-mimp-web.sf-express.com'
    url.headers['Referer'] = 'https://mcs-mimp-web.sf-express.com/sfAnniversary'
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 mediaCode=SFEXPRESSAPP-iOS-ML'
    url.body = '{"channel": "SFAPP","secondChannel": "APP_HOME_ENTRY"}'
    chavy.post(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} signapp27 - response: ${JSON.stringify(response)}`)
        signinfo.signapp27 = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败 (27周年)`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signapp27 - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signapp27 - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo27() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://mcs-mimp-web.sf-express.com/mcs-mimp/activity/sign/days`, headers: JSON.parse(VAL_loginheader) }
    delete url.headers['Cookie']
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Length'] = '2'
    url.headers['Content-Type'] = 'application/json;charset=utf-8'
    url.headers['Host'] = 'mcs-mimp-web.sf-express.com'
    url.headers['Origin'] = 'https://mcs-mimp-web.sf-express.com'
    url.headers['Referer'] = 'https://mcs-mimp-web.sf-express.com/sfAnniversary'
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 mediaCode=SFEXPRESSAPP-iOS-ML'
    url.body = '{}'
    chavy.post(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} getinfo27 - response: ${JSON.stringify(response)}`)
        signinfo.getinfo27 = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取信息: 失败 (27周年)`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo27 - 获取信息: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo27 - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://sf-integral-sign-in.weixinjia.net/app/init`, headers: JSON.parse(VAL_loginheader) }
    delete url.headers['Cookie']
    url.headers['Origin'] = 'https://sf-integral-sign-in.weixinjia.net'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Host'] = 'sf-integral-sign-in.weixinjia.net'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Content-Length'] = '0'

    chavy.post(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取信息: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - 获取信息失败: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if (signinfo.signapp.code == 0 && signinfo.signapp.msg == 'success') {
    subTitle = `签到: 成功`
  } else if (signinfo.signapp.code == -1) {
    if (signinfo.signapp.msg == 'ALREADY_CHECK') {
      subTitle = `签到: 重复`
    } else {
      subTitle = `签到: 失败`
    }
  } else {
    subTitle = `签到: 未知`
    detail = `说明: ${signinfo.signapp.msg}`
  }

  if (signinfo.info && signinfo.info.code == 0) {
    detail = `积分: ${signinfo.info.data.member_info.integral}, 本周连签: ${signinfo.info.data.check_count}天`
  }

  if (signinfo.signapp27) {
    subTitle += subTitle == '' ? '' : '; '
    if (signinfo.signapp27.success == true) {
      subTitle += `周年: 成功 (+${signinfo.signapp27.obj}积分)`
    } else if (signinfo.signapp27.success == false) {
      if (signinfo.signapp27.errorCode == '200010') {
        subTitle += `签到: 重复`
      } else if (signinfo.signapp27.errorCode == '100111') {
        subTitle += `签到: 未登录`
      } else {
        subTitle += `签到: 失败`
      }
    } else {
      subTitle += `周年: 未知`
      detail += `说明: ${signinfo.signapp.msg}`
    }

    if (signinfo.getinfo27 && signinfo.getinfo27.success == true) {
      detail += `, 周年连签: ${signinfo.getinfo27.obj.length}天`
    }
  }

  chavy.msg(cookieName, subTitle, detail)
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
