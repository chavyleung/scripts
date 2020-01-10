const cookieName = '人人视频'
const cookieKey = 'chavy_cookie_rrtv'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
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
    chavy.log(`${cookieName}, data: ${data}`)
    getinfo(JSON.parse(data))
  })
  chavy.done()
}

function getinfo(signresult) {
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
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (signresult.code == '0000') {
      subTitle = `签到结果: 成功`
      detail = `等级: ${result.data.user.level} (${result.data.user.levelStr}), 说明: ${signresult.msg}`
    } else if (signresult.code == '8750') {
      subTitle = `签到结果: 成功 (重复签到)`
      detail = `等级: ${result.data.user.level} (${result.data.user.levelStr}), 说明: ${signresult.msg}`
    } else if (signresult.code == '8400') {
      subTitle = `签到失败: 失败`
      detail = `说明: ${signresult.msg}`
    } else {
      subTitle = `签到失败: 未知`
      detail = `编码: ${signresult.code}, 说明: ${signresult.msg}`
    }

    chavy.msg(title, subTitle, detail)
  })
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
