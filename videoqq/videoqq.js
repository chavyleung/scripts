const chavy = init()
const cookieName = '腾讯视频'
const KEY_signcookie = 'chavy_cookie_videoqq'
const KEY_loginurl = 'chavy_auth_url_videoqq'
const KEY_loginheader = 'chavy_auth_header_videoqq'
const KEY_mh5signurl = 'chavy_msign_url_videoqq'
const KEY_mh5signheader = 'chavy_msign_header_videoqq'

const signinfo = {}
let VAL_signcookie = chavy.getdata(KEY_signcookie)
let VAL_loginurl = chavy.getdata(KEY_loginurl)
let VAL_loginheader = chavy.getdata(KEY_loginheader)
let VAL_mh5signurl = chavy.getdata(KEY_mh5signurl)
let VAL_mh5signheader = chavy.getdata(KEY_mh5signheader)

;(sign = async () => {
  chavy.log(`🔔 ${cookieName}`)
  await login()
  await signapp()
  await getexp()
  await signmh5()
  await getpricelist()
  await getprice()
  await showmsg()
})().catch((e) => chavy.log(`❌ ${cookieName} 签到失败: ${e}`))

function login() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_loginurl, headers: JSON.parse(VAL_loginheader) }
    chavy.get(url, (error, response, data) => {
      try {
        const result = JSON.parse(data.match(/\((.*)\);/)[1])
        if (result.errcode == 0) {
          let respcookie = response.headers['Set-Cookie']
          respcookie = respcookie.replace(/Expires=(.*?)GMT,? ?/g, '')
          respcookie = respcookie.replace(/Path=(.*?); ?/g, '')
          respcookie = respcookie.replace(/Domain=(.*?); ?/g, '')
          respcookie = respcookie.replace(/;$/g, '')
          const setcookies = []
          for (setcookie of respcookie.split(';')) setcookies.push({ key: setcookie.split('=')[0], val: setcookie.split('=')[1] })
          for (resultcookie in result) setcookies.push({ key: resultcookie, val: result[resultcookie] })
          updateSignAppCookies(setcookies)
          updateSignMh5Cookies(setcookies)
        } else {
          chavy.log(`❌ ${cookieName} login - 登录失败`)
          chavy.log(`❌ ${cookieName} login - response: ${JSON.stringify(response)}`)
        }
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} login - 登录失败: ${e}`)
        chavy.log(`❌ ${cookieName} login - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function updateSignAppCookies(cookies) {
  if (VAL_signcookie) {
    // chavy.log(`❕ ${cookieName} updateSignAppCookies - oldSignCookie: ${VAL_signcookie}`)
    for (cookie of cookies) {
      const matchexp = new RegExp(`${cookie.key}=[^;]*`, 'g')
      if (VAL_signcookie.indexOf(cookie.key) >= 0) VAL_signcookie = VAL_signcookie.replace(matchexp, `${cookie.key}=${cookie.val}`)
      else VAL_signcookie += `; ${cookie.key}=${cookie.val}`
    }
    // chavy.log(`❕ ${cookieName} updateSignAppCookies - newSignCookie: ${VAL_signcookie}`)
  } else {
    chavy.log(`⚠ ${cookieName} updateSignAppCookies: 请先获取 Cookies`)
  }
}

function updateSignMh5Cookies(cookies) {
  if (VAL_mh5signheader) {
    const msignheader = JSON.parse(VAL_mh5signheader)
    let msignCookies = msignheader.Cookie
    // chavy.log(`❕ ${cookieName} updateSignMh5Cookies - oldSignheader: ${VAL_mh5signheader}`)
    for (cookie of cookies) {
      const matchexp = new RegExp(`${cookie.key}=[^;]*`, 'g')
      if (msignCookies.indexOf(cookie.key) >= 0) msignCookies = msignCookies.replace(matchexp, `${cookie.key}=${cookie.val}`)
      else msignCookies += `; ${cookie.key}=${cookie.val}`
    }
    msignheader.Cookie = msignCookies
    VAL_mh5signheader = JSON.stringify(msignheader)
    // chavy.log(`❕ ${cookieName} updateSignMh5Cookies - newSignheader: ${VAL_mh5signheader}`)
  } else {
    chavy.log(`⚠ ${cookieName} updateSignMh5Cookies: 请先获取 Cookies`)
  }
}

function signapp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const VAL_signurl = `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=hierarchical_task_system&cmd=2&_=${timestamp}`
    let url = { url: VAL_signurl, headers: { Cookie: VAL_signcookie } }
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.signapp = JSON.parse(data.match(/\((.*)\);/)[1])
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

function getexp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const VAL_getexpurl = `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=spp_PropertyNum&cmd=1&growth_value=1&otype=json&_=${timestamp}`
    let url = { url: VAL_getexpurl, headers: { Cookie: VAL_signcookie } }
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.expinfo = JSON.parse(data.match(/\((.*)\);/)[1])
        resolve()
      } catch (e) {
        chavy.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} getexp - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} getexp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}
function signmh5() {
  return new Promise((resolve, reject) => {
    const url = { url: VAL_mh5signurl, headers: JSON.parse(VAL_mh5signheader) }
    chavy.get(url, (error, response, data) => {
      try {
        signinfo.signmh5 = JSON.parse(data.match(/window\.__STATE__=(.*?)<\/script>/)[1]).payloads.execCheck
        resolve()
      } catch (e) {
        chavy.msg(`${cookieName} (移动端)`, `签到结果: 失败`, `说明: ${e}`)
        chavy.log(`❌ ${cookieName} (移动端) signmh5 - 签到失败: ${e}`)
        chavy.log(`❌ ${cookieName} (移动端) signmh5 - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}
function getpricelist() {
  return new Promise((resolve, reject) => {
    try {
      const VAL_getpriceurl = `http://activity.video.qq.com/fcgi-bin/asyn_activity?otype=json&platform=3&magic_appid=2&app_type=1&type=90&act_id=106197&module_id=116049&option=8&days=7`
      const url = { url: VAL_getpriceurl, headers: JSON.parse(VAL_mh5signheader) }
      url.headers['Host'] = 'activity.video.qq.com'
      url.headers['Origin'] = 'http://v.qq.com'
      url.headers['Referer'] = 'http://v.qq.com/x/bu/mobile_checkin'
      url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15'
      chavy.get(url, (error, response, data) => {
        signinfo.pricelist = JSON.parse(data.match(/\((.*)\);/)[1])
        resolve()
      })
    } catch (e) {
      chavy.msg(`${cookieName} (移动端)`, `获取结果: 失败`, `说明: ${e}`)
      chavy.log(`❌ ${cookieName} (移动端) getpricelist - 获取失败: ${e}`)
      chavy.log(`❌ ${cookieName} (移动端) getpricelist - response: ${JSON.stringify(response)}`)
      resolve()
    }
  })
}
function getprice() {
  return new Promise((resolve, reject) => {
    try {
      const VAL_getpriceurl = `http://activity.video.qq.com/fcgi-bin/asyn_activity?otype=json&platform=3&magic_appid=2&app_type=1&type=90&act_id=106197&module_id=116049&option=6&days=7`
      const url = { url: VAL_getpriceurl, headers: JSON.parse(VAL_mh5signheader) }
      url.headers['Host'] = 'activity.video.qq.com'
      url.headers['Origin'] = 'http://v.qq.com'
      url.headers['Referer'] = 'http://v.qq.com/x/bu/mobile_checkin'
      url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15'
      chavy.get(url, (error, response, data) => {
        signinfo.priceinfo = JSON.parse(data.match(/\((.*)\);/)[1])
        resolve()
      })
    } catch (e) {
      chavy.msg(`${cookieName} (移动端)`, `抽奖结果: 失败`, `说明: ${e}`)
      chavy.log(`❌ ${cookieName} (移动端) getprice - 抽奖失败: ${e}`)
      chavy.log(`❌ ${cookieName} (移动端) getprice - response: ${JSON.stringify(response)}`)
      resolve()
    }
  })
}
function showmsg() {
  return new Promise((resolve, reject) => {
    // APP签到
    if (signinfo.signapp) {
      let subTitle, detail
      if (signinfo.signapp.ret == 0) {
        subTitle = '签到结果: 成功'
        if (signinfo.expinfo) {
          subTitle += !signinfo.signapp.checkin_score ? ' (重复签到)' : ''
          detail = `V力值: ${signinfo.expinfo.GrowthValue.num} (+${signinfo.signapp.checkin_score}), 观影券: ${signinfo.expinfo.MovieTicket.num}, 赠片资格: ${signinfo.expinfo.GiveMovie.num}`
        }
      } else if (signinfo.signapp.ret == -10006) {
        subTitle = '签到结果: 失败'
        detail = `原因: 未登录, 说明: ${signinfo.signapp.msg}`
      } else if (signinfo.signapp.ret == -10019) {
        subTitle = '签到结果: 失败'
        detail = `原因: 非会员, 说明: ${signinfo.signapp.msg}`
      } else {
        subTitle = '签到结果: 未知'
        detail = `编码: ${signinfo.signapp.ret}, 说明: ${signinfo.signapp.msg}`
      }
      chavy.msg(cookieName, subTitle, detail)
    }

    // H5签到
    if (signinfo.signmh5) {
      let subTitle, detail
      if (signinfo.signmh5.ret == 0) {
        subTitle = `签到结果: 成功`
        if (signinfo.signmh5.data && signinfo.signmh5.data.show_text_1) detail = `说明: ${signinfo.signmh5.data.show_text_1}`
        else detail = `说明: ${signinfo.signmh5.msg}`
      } else if (signinfo.signmh5.ret == -2021) {
        subTitle = `签到结果: 成功（重复签到）`
      } else {
        subTitle = `签到结果: 失败`
        detail = `编码: ${signinfo.signmh5.ret}, 说明: ${signinfo.signmh5.msg}`
      }
      chavy.msg(`${cookieName} (移动端)`, subTitle, detail)
    }

    // 会员抽奖
    if (signinfo.priceinfo && signinfo.pricelist) {
      let subTitle, detail
      if (signinfo.priceinfo.ret == 0 && signinfo.priceinfo.data) {
        subTitle = `抽奖结果: 成功 (第${signinfo.priceinfo.data.day}天)`
        detail = `${signinfo.priceinfo.data.prize_name}: +${signinfo.priceinfo.data.prize_num}, ${signinfo.priceinfo.data.extra_prize_name}: +${signinfo.priceinfo.data.extra_prize_level}等奖`
        chavy.log(`❕ ${cookieName} (移动端) 抽奖池: ${JSON.stringify(signinfo.pricelist)}`)
      } else if (signinfo.priceinfo.ret == -2023) {
        subTitle = `抽奖结果: 重复`
        detail = `说明: ${signinfo.priceinfo.msg}`
        chavy.log(`❕ ${cookieName} (移动端) 抽奖池: ${JSON.stringify(signinfo.pricelist)}`)
      } else {
        subTitle = `抽奖结果: 失败`
        detail = `编码: ${signinfo.priceinfo.ret}, 说明: ${signinfo.priceinfo.msg}`
      }
      if (signinfo.priceinfo.ret != -2011) chavy.msg(`${cookieName} (移动端)`, subTitle, detail)
    }

    resolve()
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
