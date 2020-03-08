const chavy = init()
const cookieName = '喜马拉雅'
const KEY_signcookie = 'chavy_cookie_ximalaya'

const signinfo = {}
let VAL_signcookie = chavy.getdata(KEY_signcookie)

;(exec = async () => {
  chavy.log(`🔔 ${cookieName} 开始签到`)
  await getinfo()
  if (signinfo.info.isTickedToday == false) await signapp()
  await browseapp()
  await getacc()
  showmsg()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`))

function signapp() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/lottery/check-in/check/action`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    chavy.post(url, (error, response, data) => {
      try {
        signinfo.signapp = data
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

function browseapp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const browseappurl = `https://mobile.ximalaya.com/daily-label-mobile/v1/task/checkIn/ts-${timestamp}?coinSwitch=true`
    const url = { url: browseappurl, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = '*/*'
    url.headers['Accept-Encoding'] = 'gzip, deflate'
    url.headers['Accept-Language'] = 'zh-Hans-CN;q=1, en-US;q=0.9'
    url.headers['Connection'] = 'close'
    url.headers['Host'] = 'mobile.ximalaya.com'
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    chavy.get(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} browseapp - response: ${JSON.stringify(response)}`)
        signinfo.browseapp = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `每日浏览: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} browseapp - 每日浏览: ${e}`)
        chavy.log(`❌ ${cookieName} browseapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/lottery/check-in/record`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取签到信息: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - 获取签到信息失败: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getacc() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/task/listen/account`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.acc = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取账号信息: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getacc - 获取账号信息失败: ${e}`)
        chavy.log(`❌ ${cookieName} getacc - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if (signinfo.info.isTickedToday == false) {
    if (signinfo.signapp == 'true') {
      subTitle = '签到: 成功'
      detail = `共签: ${signinfo.totalCheckedCounts + 1}天, 积分: ${accinfo.data.score}(+${signinfo.awardAmount})`
    } else {
      subTitle = '签到: 失败'
      detail = `说明: ${data}`
    }
  } else {
    subTitle = `签到: 重复`
    detail = `共签: ${signinfo.info.totalCheckedCounts}天, 积分: ${signinfo.acc.data.score}(+${signinfo.info.awardAmount})`
  }

  if (signinfo.browseapp) {
    if (signinfo.browseapp.ret == 0) {
      if (signinfo.browseapp.data.awards) subTitle += `, 每日浏览: 成功 (${signinfo.browseapp.data.awards})`
      else subTitle += ', 每日浏览: 重复'
    } else {
      subTitle += ', 每日浏览: 失败'
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
