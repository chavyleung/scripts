const cookieName = '人人视频'
const cookieKey = 'chavy_cookie_rrtv'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)
const signinfo = {}

sign()

function sign() {
  signdaily()
  signwelfare()
  check()
}

function signdaily() {
  let url = { url: `https://api.rr.tv/rrtv-activity/sign/sign`, headers: { token: cookieVal } }
  url.headers['clientType'] = `ios_rrsp_jzsp`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Connection'] = `keep-alive`
  url.headers['clientVersion'] = `4.3.5`
  url.headers['Content-Type'] = `application/x-www-form-urlencoded; charset=UTF-8`
  url.headers['Origin'] = `https://mobile.rr.tv`
  url.headers['Referer'] = `https://mobile.rr.tv/`
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Host'] = `api.rr.tv`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['Content-Length'] = `12`
  url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 App/RRSPApp platform/iPhone AppVersion/4.3.5'

  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, signdaily.data: ${data}`)
    signinfo.signdaily = JSON.parse(data)
  })
}

function signwelfare() {
  let url = { url: `https://api.rr.tv/dailyWelfare/getWelfare`, headers: { token: cookieVal } }
  url.headers['clientType'] = `web`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Connection'] = `keep-alive`
  url.headers['clientVersion'] = `0.0.1`
  url.headers['Content-Type'] = `application/x-www-form-urlencoded; charset=UTF-8`
  url.headers['Origin'] = `https://mobile.rr.tv`
  url.headers['Referer'] = `https://mobile.rr.tv/mission/`
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Host'] = `api.rr.tv`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['Content-Length'] = `45`
  url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 App/RRSPApp platform/iPhone AppVersion/4.3.5'

  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, signwelfare.data: ${data}`)
    signinfo.signwelfare = JSON.parse(data)
  })
}

function check(checkms = 0) {
  if (signinfo.signdaily && signinfo.signwelfare) {
    getinfo()
  } else {
    if (checkms > 5000) {
      chavy.msg(`${cookieName}`, `签到失败: 超时退出`, ``)
      chavy.done()
    } else {
      setTimeout(() => check(checkms + 100), 100)
    }
  }
}

function getinfo() {
  let url = { url: `https://api.rr.tv/user/profile`, headers: { token: cookieVal } }
  url.headers['clientType'] = `ios_rrsp_jzsp`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.headers['Connection'] = `keep-alive`
  url.headers['clientVersion'] = `4.3.5`
  url.headers['Content-Type'] = `application/x-www-form-urlencoded; charset=UTF-8`
  url.headers['Origin'] = `https://mobile.rr.tv`
  url.headers['Referer'] = `https://mobile.rr.tv/`
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Host'] = `api.rr.tv`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['Content-Length'] = `0`
  url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 App/RRSPApp platform/iPhone AppVersion/4.3.5'

  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, userinfo: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (signinfo.signdaily) {
      subTitle = `每日签到: `
      if (signinfo.signdaily.code == '0000' || signinfo.signdaily.code == '8750') {
        subTitle += signinfo.signdaily.code == '0000' ? '成功; ' : ''
        subTitle += signinfo.signdaily.code == '8750' ? '重复; ' : ''
      } else {
        subTitle += '失败; '
      }
    }
    if (signinfo.signwelfare) {
      subTitle += `每日福利: `
      if (signinfo.signwelfare.code == '0000' || signinfo.signwelfare.code == '8623') {
        subTitle += signinfo.signwelfare.code == '0000' ? '成功; ' : ''
        subTitle += signinfo.signwelfare.code == '8623' ? '重复; ' : ''
      } else {
        subTitle += '失败;'
      }
    }
    if (result.code == '0000') {
      const levelStr = result.data.user.levelStr ? ` (${result.data.user.levelStr})` : ``
      detail = `等级: ${result.data.user.level}${levelStr}, 积分: ${result.data.user.score}`
    } else {
      detail = `编码: ${result.code}, 说明: ${result.msg}`
    }
    chavy.msg(title, subTitle, detail)
    // if (signresult.code == '0000') {
    //   const levelStr = result.data.user.levelStr ? ` (${result.data.user.levelStr})` : ``
    //   subTitle = `签到结果: 成功`
    //   detail = `等级: ${result.data.user.level}${levelStr}, 说明: ${signresult.msg}`
    // } else if (signresult.code == '8750') {
    //   const levelStr = result.data.user.levelStr ? ` (${result.data.user.levelStr})` : ``
    //   subTitle = `签到结果: 成功 (重复签到)`
    //   detail = `等级: ${result.data.user.level}${levelStr}, 说明: ${signresult.msg}`
    // } else if (signresult.code == '8400') {
    //   subTitle = `签到失败: 失败`
    //   detail = `说明: ${signresult.msg}`
    // } else {
    //   subTitle = `签到失败: 未知`
    //   detail = `编码: ${signresult.code}, 说明: ${signresult.msg}`
    // }

    // chavy.msg(title, subTitle, detail)
  })
  chavy.done()
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
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
