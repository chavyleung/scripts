const cookieName = '分期乐'
const signurlKey = 'senku_signurl_fenqile'
const signheaderKey = 'senku_signheader_fenqile'
const signbodyKey = 'senku_signbody_fenqile'
const senku = init()
const signurlVal = senku.getdata(signurlKey)
const signheaderVal = senku.getdata(signheaderKey)
const signBodyVal = senku.getdata(signbodyKey)
const signinfo = {}


check()

function check(){
  signDaily()
  sign()
  checkin()
}

function sign() {
  const url = { url: signurlVal, headers: JSON.parse(signheaderVal), body: signBodyVal }
  senku.post(url, (error, response, data) => {
    senku.log(`${cookieName}, sing--data: ${data}`)
    signinfo.sign = JSON.parse(data)
  })
}

function signDaily(){
  const url = { url: `https://pm.m.fenqile.com/route0014/app/tab/privilege/convertTaskReward.json`, headers: JSON.parse(signheaderVal), body: signBodyVal }
    senku.post(url, (error, response, data) => {
    senku.log(`${cookieName}, signDaily--data: ${data}`)
    signinfo.signDaily = JSON.parse(data)
  })
}


function getinfo(){
  const title = `${cookieName}`
  let subTitle = `天天领乐星:`
  let detail = ``

  //signDaily
  if (signinfo.signDaily.data.result == 0) {
    subTitle += `成功`
  }
  else if (signinfo.signDaily.data.result == 11650011) {
    subTitle += `重复签到`
  }
  else {
    subTitle += `失败`
    detail += `编码: ${signinfo.signDaily.data.result}, 说明: ${signinfo.signDaily.data.res_info}`
  }

  //sign
  subTitle += ` 签到领乐星:`
  if (signinfo.sign.data.result == 0) {
    subTitle += `成功`
    detail += `账户乐星总数: ${signinfo.sign.data.result_rows.postStar}`
  }
  else if (signinfo.sign.data.result == 12130022) {
    subTitle += `重复签到`
  }
  else {
    subTitle += `失败`
    detail += `编码: ${signinfo.sign.data.result}, 说明: ${signinfo.sign.data.res_info}`
  }
  senku.msg(title, subTitle, detail)
  senku.done()
}

function checkin(checkms = 0) {
  if (signinfo.sign && signinfo.signDaily) {
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
