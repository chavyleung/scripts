const cookieName = 'CSDN'
const tokenurlKey = 'chavy_tokenurl_csdn'
const tokenheaderKey = 'chavy_tokenheader_csdn'
const signurlKey = 'chavy_signurl_csdn'
const signheaderKey = 'chavy_signheader_csdn'
const chavy = init()
const tokenurlVal = chavy.getdata(tokenurlKey)
const tokenheaderVal = chavy.getdata(tokenheaderKey)
const signurlVal = chavy.getdata(signurlKey)
let signheaderVal = chavy.getdata(signheaderKey)

sign()

function sign() {
  loginapp((logininfo) => {
    if (logininfo.code == '0') {
      const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
      url.body = '{}'
      chavy.post(url, (error, response, data) => {
        chavy.log(`${cookieName}, data: ${data}`)
        const title = `${cookieName}`
        let subTitle = ''
        let detail = ''
        let result = JSON.parse(data)
        if (result.code == 200) {
          if (result.data.isSigned === false) {
            subTitle = `签到结果: 成功`
            detail = `共签: ${result.data.totalCount}天, 连签: ${result.data.keepCount}天`
          } else if (result.data.isSigned === true) {
            subTitle = `签到结果: 成功 (重复签到)`
          } else {
            subTitle = `签到结果: 失败`
            detail = `编码: ${result.code}, 说明: ${result.msg}`
          }
        } else {
          subTitle = `签到结果: 失败`
          detail = `说明: 详见日志`
        }
        chavy.msg(title, subTitle, detail)
        chavy.done()
      })
      chavy.done()
    } else {
      const title = `${cookieName}`
      const subTitle = '签到结果: 失败'
      const detail = `原因: ${logininfo.message}`
      chavy.msg(title, subTitle, detail)
      chavy.log(`${cookieName}, ${subTitle}, ${detail}`)
      chavy.done()
    }
  })
}

function loginapp(cb) {
  const url = { url: tokenurlVal, headers: JSON.parse(tokenheaderVal) }
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, loginapp: ${data}`)
    let result = JSON.parse(data)
    let signheaderObj = JSON.parse(signheaderVal)
    signheaderObj['JWT-TOKEN'] = result.data.token
    signheaderObj['Cookie'] = signheaderObj['Cookie'].replace(/JWT-TOKEN=[^;]*/, `JWT-TOKEN=${result.data.token}`)
    signheaderVal = JSON.stringify(signheaderObj)
    cb(result)
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
