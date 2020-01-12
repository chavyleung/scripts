const cookieName = '顺丰速运'
const cookieKey = 'chavy_cookie_sfexpress'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  chavy.log(`${cookieName}, Cookie: ${cookieVal}`)
  let url = { url: `https://sf-integral-sign-in.weixinjia.net/app/signin`, headers: { Cookie: cookieVal } }
  url.headers['Origin'] = `https://sf-integral-sign-in.weixinjia.net`
  url.headers['Connection'] = `keep-alive`
  url.headers['Content-Type'] = `application/x-www-form-urlencoded`
  url.headers['Accept'] = `application/json, text/plain, */*`
  url.headers['Host'] = `sf-integral-sign-in.weixinjia.net`
  url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 mediaCode=SFEXPRESSAPP-iOS-ML`
  url.headers['ontent-Length'] = `15`
  url.headers['Accept-Language'] = `zh-cn`
  url.headers['Accept-Encoding'] = `gzip, deflate, br`
  url.body = `date=${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  chavy.log(`${cookieName}, body: ${url.body}`)
  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    const result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.code == 0 && result.msg == 'success') {
      subTitle = `签到结果: 成功`
    } else if (result.code == -1) {
      if (result.msg == 'ALREADY_CHECK') {
        subTitle = `签到结果: 成功 (重复签到)`
      } else {
        subTitle = `签到结果: 失败`
      }
    } else {
      subTitle = `签到结果: 未知`
      detail = `说明: ${result.msg}`
    }
    chavy.msg(title, subTitle, detail)
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
