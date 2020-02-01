const cookieName = '电信营业厅'
const cookieKey = 'chavy_cookie_10000'
const mobileKey = 'chavy_mobile_10000'
const chavy = init()
if (this.$request && this.$request.headers) {
  const cookieVal = $request.headers['Cookie']
  if (cookieVal) {
    if (chavy.setdata(cookieVal, cookieKey)) {
      chavy.msg(`${cookieName}`, '获取Cookie: 成功', '')
      chavy.log(`[${cookieName}] 获取Cookie: 成功, cookie: ${cookieVal}`)
    }
  }
}
if (this.$response) {
  chavy.log(JSON.parse($response.body).data.userInfo.mobile)
  const mobileVal = JSON.parse($response.body).data.userInfo.mobile
  if (mobileVal) {
    if (chavy.setdata(mobileVal, mobileKey)) {
      chavy.msg(`${cookieName}`, `获取号码: 成功 (${mobileVal})`, ``)
      chavy.log(`[${cookieName}] 获取号码: 成功, 号码: ${mobileVal}`)
    }
  }
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
chavy.done()
