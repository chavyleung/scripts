const chavy = init()
const cookieName = '苏宁易购'
const KEY_loginurl = 'chavy_login_url_suning'
const KEY_loginbody = 'chavy_login_body_suning'
const KEY_loginheader = 'chavy_login_header_suning'
const KEY_signurl = 'chavy_sign_url_suning'
const KEY_signheader = 'chavy_sign_header_suning'
const KEY_signweburl = 'chavy_signweb_url_suning'
const KEY_signwebheader = 'chavy_signweb_header_suning'

const signinfo = {}
let VAL_loginurl = chavy.getdata(KEY_loginurl)
let VAL_loginbody = chavy.getdata(KEY_loginbody)
let VAL_loginheader = chavy.getdata(KEY_loginheader)
let VAL_signurl = chavy.getdata(KEY_signurl)
let VAL_signheader = chavy.getdata(KEY_signheader)
let VAL_signweburl = chavy.getdata(KEY_signweburl)
let VAL_signwebheader = chavy.getdata(KEY_signwebheader)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await loginapp()
  if (VAL_signurl) await signapp()
  if (VAL_signweburl) await signweb()
  await getinfo()
  await getwebinfo()
  showmsg()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`))

function loginapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_loginurl, body: VAL_loginbody, headers: JSON.parse(VAL_loginheader) }
    url.headers['Cookie'] = null
    chavy.post(url, (error, response, data) => {
      resolve()
    })
  })
}

function signapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signurl, headers: JSON.parse(VAL_signheader) }
    delete url.headers['Cookie']
    chavy.get(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} signapp - response: ${JSON.stringify(response)}`)
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

function signweb() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signweburl, headers: JSON.parse(VAL_signwebheader) }
    delete url.headers['Cookie']
    chavy.get(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} signweb - response: ${JSON.stringify(response)}`)
        signinfo.signweb = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `每日红包: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signweb - 每日红包失败: ${e}`)
        chavy.log(`❌ ${cookieName} signweb - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getwebinfo() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime()).toString()
    const VAL_webinfourl = `https://luckman.suning.com/luck-web/sign/api/query/detail/record_sign.do?terminal=app&channel=sign&_=${timestamp}`
    const url = { url: VAL_webinfourl, headers: JSON.parse(VAL_signheader) }
    delete url.headers['Cookie']
    url.headers['Host'] = 'luckman.suning.com'
    chavy.get(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} getwebinfo - response: ${JSON.stringify(response)}`)
        signinfo.webinfo = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `领红包结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getwebinfo - 领红包失败: ${e}`)
        chavy.log(`❌ ${cookieName} getwebinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime()).toString()
    const url = { url: `https://sign.suning.com/sign-web/m/newsign/getDiamondInfo.do?_=${timestamp}`, headers: JSON.parse(VAL_signheader) }
    delete url.headers['Cookie']
    chavy.get(url, (error, response, data) => {
      try {
        chavy.log(`❕ ${cookieName} getinfo - info: ${JSON.stringify(response)}`)
        signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取签到信息: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - 获取签到信息失败: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  let moreDetail = ''
  if (signinfo.signapp && signinfo.signapp.code == '1') {
    if (signinfo.signapp.data.todayFirstSignFlag == true) {
      subTitle = '签到: 成功'
    } else {
      subTitle = '签到: 重复'
    }
    for (myinfo of signinfo.info.data) {
      detail += detail == '' ? '总共: ' : ', '
      detail += myinfo.showLabel
    }
    detail += `, 说明: 还有${signinfo.signapp.data.remainingPoint}云钻待领取`
    const prizeLists = signinfo.signapp.data.prizeLists
    const customerDays = signinfo.signapp.data.customerDays
    const prize = prizeLists[customerDays - 1]
    moreDetail += moreDetail == '' ? '' : '\n'
    moreDetail += '\n💎 每日签到: '
    for (res of prize) moreDetail += `\n${res.prizeName}: ${res.prizeContent}`
  } else {
    subTitle = '签到: 失败'
    chavy.log(`❌ ${cookieName} showmsg - 每日签到: ${JSON.stringify(signinfo.signapp)}`)
  }

  subTitle += subTitle == '' ? '' : ', '
  if (signinfo.signweb) {
    if (signinfo.signweb.respCode == '1') {
      subTitle += '红包: 成功'
    } else if (signinfo.signweb.respCode == '70512') {
      subTitle += '红包: 重复'
    } else {
      subTitle += '红包: 失败'
      chavy.log(`❌ ${cookieName} showmsg - 每日红包 - signweb: ${JSON.stringify(signinfo.signweb)}`)
    }
  } else {
    subTitle += '红包: 失败'
    chavy.log(`❌ ${cookieName} showmsg - 每日红包 - signweb: ${JSON.stringify(signinfo.signweb)}`)
  }

  if (signinfo.webinfo && signinfo.webinfo.respData) {
    const currentIndex = signinfo.webinfo.respData.currentIndex
    const detailTreeMap = signinfo.webinfo.respData.detailTreeMap
    const currentMap = detailTreeMap[currentIndex]
    if (currentMap.signMark == true) {
      moreDetail += moreDetail == '' ? '' : '\n'
      moreDetail += '\n🧧 每日红包: '
      for (res of currentMap.resList) moreDetail += `\n${res.remark}: ${res.amount}`
    } else {
      chavy.log(`❌ ${cookieName} showmsg - 每日红包 - webinfo: ${JSON.stringify(signinfo.webinfo)}`)
    }
  } else {
    chavy.log(`❌ ${cookieName} showmsg - 每日红包 - webinfo: ${JSON.stringify(signinfo.webinfo)}`)
  }

  if (moreDetail) detail += `\n查看签到详情\n${moreDetail}`
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
