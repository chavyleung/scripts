const cookieName = '电信营业厅'
const cookieKey = 'chavy_cookie_10000'
const mobileKey = 'chavy_mobile_10000'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)
const mobileVal = chavy.getdata(mobileKey)

sign()

function sign() {
  let url = { url: `https://wapside.189.cn:9001/api/home/sign`, headers: { Cookie: cookieVal } }
  url.headers['Content-Type'] = 'application/json;charset=utf-8'
  url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;CtClient;7.6.0;iOS;13.3;iPhone XR'
  url.headers['Host'] = 'wapside.189.cn:9001'
  url.headers['Origin'] = 'https://wapside.189.cn:9001'
  url.headers['Referer'] = 'https://wapside.189.cn:9001/resources/dist/signInActivity.html?cmpid=jt-khd-my-zygn&ticket=0ab000281b4a8139f264620ae1d8b1ce067a6587921f90a6260dca4389a4e01a&version=7.6.0'
  url.body = JSON.stringify({ phone: mobileVal })
  chavy.post(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data)
    const title = `${cookieName}`
    let subTitle = ``
    let detail = ``
    if (result.data.code == 1) {
      subTitle = `签到结果: 成功 (${mobileVal})`
      detail = `获得金币${result.data.coin}, 金豆${result.data.flow}`
    } else if (result.data.code == 0) {
      subTitle = `签到结果: 重复 (${mobileVal})`
      detail = `说明: ${result.data.msg}`
    } else {
      subTitle = `签到结果: 失败 (${mobileVal})`
      detail = `说明: ${result.data.msg}`
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
