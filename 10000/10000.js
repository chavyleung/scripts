const chavy = init()
const cookieName = '电信营业厅'
const KEY_signheader = 'chavy_signheader_10000'
const KEY_signbody = 'chavy_signbody_10000'
const KEY_mobile = 'chavy_mobile_10000'

const signinfo = {}
const VAL_signheader = chavy.getdata(KEY_signheader)
const VAL_signbody = chavy.getdata(KEY_signbody)
const VAL_mobileVal = chavy.getdata(KEY_mobile)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await signapp()
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function signapp() {
  return new Promise((resolve, reject) => {
    let url = { url: `https://wapside.189.cn:9001/api/home/sign`, body: VAL_signbody, headers: JSON.parse(VAL_signheader) }
    chavy.post(url, (error, response, data) => {
      try {
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

function showmsg() {
  let subTitle = ``
  let detail = ``
  if (signinfo.signapp.data.code == 1) {
    subTitle = `签到结果: 成功`
    detail = `获得金币${signinfo.signapp.data.coin}, 金豆${signinfo.signapp.data.flow}`
  } else if (signinfo.signapp.data.code == 0) {
    subTitle = `签到结果: 重复`
    detail = `说明: ${signinfo.signapp.data.msg}`
  } else {
    subTitle = `签到结果: 失败`
    detail = `说明: ${signinfo.signapp.data.msg}`
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
