const chavy = init()
const cookieName = 'WPS'
const KEY_signhomeurl = 'chavy_signhomeurl_wps'
const KEY_signhomeheader = 'chavy_signhomeheader_wps'
const KEY_signwxurl = 'chavy_signwxurl_wps'
const KEY_signwxheader = 'chavy_signwxheader_wps'

const signinfo = {}
let VAL_signhomeurl = chavy.getdata(KEY_signhomeurl)
let VAL_signhomeheader = chavy.getdata(KEY_signhomeheader)
let VAL_signwxurl = chavy.getdata(KEY_signwxurl)
let VAL_signwxheader = chavy.getdata(KEY_signwxheader)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await gethome()
  await signapp()
  await getinfo()
  if (VAL_signwxurl) {
    await getwxinfo()
    if (signinfo.is_sign_up == 0) {
      await signwxapp()
      await getwxinfo()
    }
  }
  await getreward()
  showmsg()
  chavy.done()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`), chavy.done())

function gethome() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signhomeurl, headers: JSON.parse(VAL_signhomeheader) }
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.homeinfo = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取签到: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} gethome - 获取签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} gethome - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function signapp() {
  return new Promise((resolve, reject) => {
    const VAL_signurl = `https://zt.wps.cn/2018/docer_check_in/api/checkin_today`
    const url = { url: VAL_signurl, headers: JSON.parse(VAL_signhomeheader) }
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Origin'] = 'https://zt.wps.cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Content-Length'] = '0'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'
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

function signwxapp() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_signwxurl, headers: JSON.parse(VAL_signwxheader) }
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.signwxapp = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `小程序签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} signwxapp - 小程序签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} signwxapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const VAL_getinfourl = `https://zt.wps.cn/2018/docer_check_in/api/checkin_record`
    const url = { url: VAL_getinfourl, headers: JSON.parse(VAL_signhomeheader) }
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'

    chavy.get(url, (error, response, data) => {
      try {
        signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - 获取结果失败: ${e}`)
        chavy.log(`❌ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getwxinfo() {
  return new Promise((resolve, reject) => {
    const VAL_getwxinfourl = `https://zt.wps.cn/2018/clock_in/api/get_data?member=wps`
    const url = { url: VAL_getwxinfourl, headers: JSON.parse(VAL_signwxheader) }

    chavy.get(url, (error, response, data) => {
      try {
        const wxinfo = JSON.parse(data)
        if (!signinfo.wxinfo) signinfo.is_sign_up = wxinfo.is_sign_up
        signinfo.wxinfo = wxinfo
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取小程序结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getwxinfo - 获取小程序结果失败: ${e}`)
        chavy.log(`❌ ${cookieName} getwxinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getreward() {
  return new Promise((resolve, reject) => {
    const VAL_getrewardurl = `https://zt.wps.cn/2018/docer_check_in/api/reward_record`
    const url = { url: VAL_getrewardurl, headers: JSON.parse(VAL_signhomeheader) }
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'

    chavy.get(url, (error, response, data) => {
      try {
        signinfo.reward = JSON.parse(data)
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `获取奖励: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getreward - 获取奖励失败: ${e}`)
        chavy.log(`❌ ${cookieName} getreward - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if (signinfo.signapp && signinfo.signapp.result == 'ok') {
    subTitle = `日常签到: 成功`
    // detail = `获得金币${result.data.coin}, 金豆${result.data.flow}`
  } else if (signinfo.signapp && signinfo.signapp.result == 'error' && signinfo.signapp.msg == 'recheckin') {
    subTitle = `日常签到: 重复`
    // detail = `说明: ${result.data.msg}`
  } else {
    subTitle = `日常签到: 失败`
    detail = `详见日志`
    chavy.log(`❌ ${cookieName} showmsg - homeinfo: ${JSON.stringify(signinfo.homeinfo)}`)
    chavy.log(`❌ ${cookieName} showmsg - signapp: ${JSON.stringify(signinfo.signapp)}`)
  }

  if (signinfo.wxinfo) {
    subTitle += subTitle == '' ? '' : '; '
    if (signinfo.is_sign_up == 0 && signinfo.signwxapp && signinfo.signwxapp.result == 'ok') subTitle += `小程序: 成功`
    else if (signinfo.is_sign_up == 1) subTitle += `小程序: 重复`
    else {
      subTitle += `小程序: 失败`
      chavy.log(`❌ ${cookieName} showmsg - wxinfo: ${JSON.stringify(signinfo.wxinfo)}`)
      chavy.log(`❌ ${cookieName} showmsg - signwxapp: ${JSON.stringify(signinfo.signwxapp)}`)
    }
  }

  if (signinfo.homeinfo && signinfo.signapp && signinfo.info && signinfo.homeinfo.data[0]) {
    const cur = signinfo.homeinfo.data[0]
    detail += `连签: ${signinfo.info.data.max_days}天, 本期: ${cur.end_date} (第${cur.id}期)`
  }

  if (signinfo.reward && signinfo.reward.data) {
    detail += `\n查看签到详情`
    days = signinfo.info.data.max_days
    curDays = 0
    for (r of signinfo.reward.data) {
      const rstatus = r.status == 'unreceived' ? '[未领]' : '[已领]'
      const limit_days = parseInt(r.limit_days)
      const daysstatus = days >= limit_days ? '✅' : '❕'
      if (curDays < limit_days) (curDays = limit_days), (detail += `\n\n${daysstatus}连签${limit_days}天: `)
      detail += `\n${rstatus} ${r.reward_name}`
    }
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
