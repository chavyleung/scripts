const cookieName = '威锋网'
const cookieKey = 'chavy_cookie_feng'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  let url = { url: `https://beta-api.feng.com/v1/attendance/userSignIn`, headers: {}, body: {} }
  url.headers['Host'] = 'beta-api.feng.com'
  url.headers['Origin'] = 'https://www.feng.com'
  url.headers['Referer'] = 'https://www.feng.com/'
  url.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
  url.headers['Accept'] = 'application/json, text/plain, */*'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  url.headers['X-Access-Token'] = getToken()
  chavy.post(url, (error, response, data) => {
    let result = JSON.parse(data)
    let title = `${cookieName}`
    // 签到成功 || 签到重复
    if (result.status && (result.status.code == 0 || result.status.code == 1021)) {
      if (chavy.isQuanX()) getexp(result)
      if (chavy.isSurge()) showSurgeMsg(result)
    }
    // 签到失败
    else {
      let subTitle = `签到结果: 失败`
      let detail = `说明: ${result.status.message}`
      chavy.msg(title, subTitle, detail)
      chavy.log(`${cookieName}, cookieKey: ${cookieVal}`)
      chavy.log(`${cookieName}, token: ${getToken()}`)
    }
    chavy.log(`${cookieName}, data: ${data}`)
  })
  chavy.done()
}

function getexp(signResult) {
  let url = { url: `https://beta-api.feng.com/v1/user/experience`, headers: {}, body: {} }
  url.headers['Host'] = 'beta-api.feng.com'
  url.headers['Origin'] = 'https://www.feng.com'
  url.headers['Referer'] = 'https://www.feng.com/'
  url.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
  url.headers['Accept'] = 'application/json, text/plain, */*'
  url.headers['Accept-Encoding'] = 'gzip, deflate, br'
  url.headers['Accept-Language'] = 'zh-cn'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  url.headers['X-Access-Token'] = getToken()
  chavy.get(url, (error, response, data) => {
    let result = JSON.parse(data)
    let title = `${cookieName}`
    let subTitle = ''
    let detail = `累计: ${result.data.signInCount}次, 等级: ${result.data.level} (${result.data.levelTitle}), 经验: ${result.data.currentExperience}/${result.data.creditsLower}`
    chavy.log(signResult.status.code + ', ' + signResult.status.code == 0)
    // 签到成功
    if (signResult.status.code == 0) {
      subTitle = `签到结果: 成功`
      chavy.msg(title, subTitle, detail)
    }
    // 签到重复
    else if (signResult.status.code == 1021) {
      subTitle = `签到结果: 成功 (重复签到)`
      chavy.msg(title, subTitle, detail)
    }
    chavy.log(`${cookieName}, data: ${data}`)
  })
}

function showSurgeMsg(signResult) {
  let title = `${cookieName}`
  let detail = `详情: Surge环境下无法获取 (目测是Bug)`
  // 签到成功
  if (signResult.status.code == 0) {
    subTitle = `签到结果: 成功`
    chavy.msg(title, subTitle, detail)
  }
  // 签到重复
  else if (signResult.status.code == 1021) {
    subTitle = `签到结果: 成功 (重复签到)`
    chavy.msg(title, subTitle, detail)
  }
}

function getToken() {
  const userInfo = decodeURIComponent(decodeURIComponent(cookieVal.match(/userInfo=(\{[^;]*)/)[1]))
  return JSON.parse(userInfo).accessToken
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
