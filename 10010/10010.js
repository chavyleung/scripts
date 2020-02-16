const cookieName = '中国联通'
const tokenurlKey = 'chavy_tokenurl_10010'
const tokenheaderKey = 'chavy_tokenheader_10010'
const signurlKey = 'chavy_signurl_10010'
const signheaderKey = 'chavy_signheader_10010'
const chavy = init()
const tokenurlVal = chavy.getdata(tokenurlKey)
const tokenheaderVal = chavy.getdata(tokenheaderKey)
const signurlVal = chavy.getdata(signurlKey)
let signheaderVal = chavy.getdata(signheaderKey)
const signinfo = {}

sign()

function sign() {
  signapp()
  getinfo()
  // getdetail()
  check()
}

function gettel() {
  const reqheaders = JSON.parse(signheaderVal)
  const reqreferer = reqheaders.Referer
  const reqCookie = reqheaders.Cookie
  let tel = ''
  if (reqreferer.indexOf(`desmobile=`) >= 0) tel = reqreferer.match(/desmobile=(.*?)(&|$)/)[1]
  if (tel == '' && reqCookie.indexOf(`u_account=`) >= 0) tel = reqCookie.match(/u_account=(.*?);/)[1]
  return tel
}

function loginapp(cb) {
  const url = { url: tokenurlVal, headers: JSON.parse(tokenheaderVal) }
  chavy.get(url, (error, response, data) => {
    const respcookie = response.headers['Set-Cookie']
    const signheaderObj = JSON.parse(signheaderVal)
    let signcookie = signheaderObj['Cookie']
    signcookie = signcookie.replace(/route5=([^;]*)/, respcookie.match(/route5=([^;]*)/)[0])
    signcookie = signcookie.replace(/JSESSIONID=([^;]*)/, respcookie.match(/JSESSIONID=([^;]*)/)[0])
    signheaderObj['Cookie'] = signcookie
    signheaderVal = JSON.stringify(signheaderObj)
    cb()
  })
}

function signapp() {
  loginapp(() => {
    chavy.log(`${cookieName}, signapp - signheaderVal: ${signheaderVal}`)
    const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
    url.body = `className=signinIndex`
    chavy.post(url, (error, response, data) => (signinfo.signapp = data))
  })
}

function getinfo() {
  const tel = gettel()
  const url = { url: `https://mina.10010.com/wxapplet/bind/getIndexData/alipay/alipaymini?user_id=${tel}` }
  chavy.log(`${cookieName}, getinfo - tel: ${tel}`)
  chavy.get(url, (error, response, data) => (signinfo.info = data))
}

function getdetail() {
  const url = { url: `https://mina.10010.com/wxapplet/bind/getCombospare/alipay/alipaymini?stoken=&user_id=${gettel()}` }
  chavy.get(url, (error, response, data) => (signinfo.detail = data))
}

function check(checkms = 0) {
  if (signinfo.signapp && signinfo.info) {
    chavy.log(`${cookieName}, signapp: ${signinfo.signapp}`)
    chavy.log(`${cookieName}, info: ${signinfo.info}`)
    // chavy.log(`${cookieName}, detail: ${signinfo.detail}`)
    signinfo.signapp = JSON.parse(signinfo.signapp)
    signinfo.info = JSON.parse(signinfo.info)
    // signinfo.detail = JSON.parse(signinfo.detail)
    showmsg()
  } else {
    if (checkms > 5000) {
      chavy.log(`${cookieName}, signapp: ${signinfo.signapp}`)
      chavy.log(`${cookieName}, info: ${signinfo.info}`)
      // chavy.log(`${cookieName}, detail: ${signinfo.detail}`)
      chavy.msg(`${cookieName}`, `签到失败: 超时退出`, ``)
      chavy.done()
    } else {
      setTimeout(() => check(checkms + 100), 100)
    }
  }
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  let signday = ''

  // 签到结果
  if (signinfo.signapp.msgCode == '0000') {
    subTitle = `签到结果: 成功`
    signday = ` (连签${signinfo.signapp.continuCount}天)`
    detail = `连签: ${signinfo.signapp.continuCount}天, 积分: +${signinfo.signapp.prizeCount}`
  } else if (signinfo.signapp.msgCode == '0008') {
    subTitle = `签到结果: 成功 (重复签到)`
  } else {
    subTitle = `签到结果: 失败`
  }

  // 基本信息
  if (signinfo.info.code == '0000') {
    subTitle += signday
    detail = detail ? `${detail}\n` : ``
    const free = signinfo.info.dataList[0]
    const flow = signinfo.info.dataList[1]
    const voice = signinfo.info.dataList[2]
    detail = `话费: ${free.number}${free.unit}, 已用: ${flow.number}${flow.unit}, 剩余: ${voice.number}${voice.unit}`
  }

  // 详细信息
  // if (signinfo.detail.code == '0000') {
  // }

  chavy.msg(cookieName, subTitle, detail)
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
