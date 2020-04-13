const cookieName = '趣头条'
const signKey = 'senku_signKey_qtt'
const signXTKKey = 'senku_signXTK_qtt'
const senku = init()

const requrl = $request.url
if ($request && $request.method != 'OPTIONS') {
  try {
    const tokenVal = '&' + requrl.match(/token=[a-zA-Z0-9_-]+/)[0]
    const uuidVal = '&' + requrl.match(/uuid=[a-zA-Z0-9_-]+/)[0]
    const signVal = tokenVal + uuidVal
    const signXTKVal = requrl.match(/tk=[a-zA-Z0-9_-]+/)[0]
    if (signVal) senku.setdata(signVal, signKey)
    if (signXTKVal) senku.setdata(signXTKVal, signXTKKey)
    senku.msg(cookieName, `获取Cookie: 成功`, ``)
    senku.log(`🔔${signVal},🔔${signXTKVal}`)
  } catch (error) {
    senku.log(`❌error:${error}`)
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
senku.done()
