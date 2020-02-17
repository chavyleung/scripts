const cookieName = '腾讯视频'
const cookieKey = 'chavy_cookie_videoqq'
const authUrlKey = 'chavy_auth_url_videoqq'
const authHeaderKey = 'chavy_auth_header_videoqq'
const msignurlKey = 'chavy_msign_url_videoqq'
const msignheaderKey = 'chavy_msign_header_videoqq'
const chavy = init()
let cookieVal = chavy.getdata(cookieKey)
const authUrlVal = chavy.getdata(authUrlKey)
const authHeaderVal = chavy.getdata(authHeaderKey)
const msignurlVal = chavy.getdata(msignurlKey)
const msignheaderVal = chavy.getdata(msignheaderKey)
const signinfo = {}

sign()

function sign() {
  if (authUrlVal && authHeaderVal) {
    const url = { url: authUrlVal, headers: JSON.parse(authHeaderVal) }
    chavy.get(url, (error, response, data) => {
      // chavy.log(`${cookieName}, auth_refresh - data: ${data}`)
      // chavy.log(`${cookieName}, auth_refresh - old-cookie: ${cookieVal}`)
      // chavy.log(`${cookieName}, auth_refresh - set-cookie: ${response.headers['Set-Cookie']}`)
      const result = JSON.parse(data.match(/\(([^\)]*)\)/)[1])
      let respcookie = response.headers['Set-Cookie']
      // chavy.log(`${cookieName}, auth_refresh - Expires: ${respcookie.indexOf('Expires=') >= 0 ? respcookie.match(/Expires=(.*?)GMT/)[1] : '无'}`)
      respcookie = respcookie.replace(/Expires=(.*?)GMT,? ?/g, '')
      respcookie = respcookie.replace(/Path=(.*?); ?/g, '')
      respcookie = respcookie.replace(/Domain=(.*?); ?/g, '')
      respcookie = respcookie.replace(/;$/g, '')
      if (result.errcode == 0) {
        let setcookies = []
        for (setcookie of respcookie.split(';')) {
          const setcookieKey = setcookie.split('=')[0]
          const setcookieVal = setcookie.split('=')[1]
          if (setcookieKey && cookieVal.indexOf(setcookieKey) >= 0) {
            cookieVal = cookieVal.replace(new RegExp(`${setcookieKey}=[^;]*`), `${setcookieKey}=${setcookieVal}`)
          } else {
            cookieVal += `; ${setcookieKey}=${setcookieVal}`
          }
          setcookies.push({ key: setcookieKey, val: setcookieVal })
          // chavy.log(`${cookieName}, auth_refresh - set-cookie: ${setcookieKey} = ${setcookieVal}`)
        }
        for (resultcookie in result) {
          if (cookieVal.indexOf(resultcookie) >= 0) {
            cookieVal = cookieVal.replace(new RegExp(`${resultcookie}=[^;]*`, 'g'), `${resultcookie}=${result[resultcookie]}`)
            setcookies.push({ key: resultcookie, val: result[resultcookie] })
            // chavy.log(`${cookieName}, auth_refresh - ret-cookie: ${resultcookie} = ${result[resultcookie]}`)
          }
        }
        // chavy.log(`${cookieName}, auth_refresh - new-cookie: ${cookieVal}`)
        // chavy.log(`${cookieName}, auth_refresh - setcookies: ${JSON.stringify(setcookies)}`)
        chavy.setdata(cookieVal, cookieKey)
        signapp()
        signmobile(setcookies)
        chavy.done()
      }
    })
  } else {
    signapp()
  }
}

function refreshSetCookie() {}

function signapp() {
  const timestamp = Math.round(new Date().getTime() / 1000).toString()
  let url = { url: `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=hierarchical_task_system&cmd=2&_=${timestamp}`, headers: { Cookie: cookieVal } }
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data.match(/QZOutputJson=\(([^\)]*)\)/)[1])
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    if (result.ret == 0) {
      getexp(result)
    } else if (result.ret == -10006) {
      subTitle = '签到结果: 失败'
      detail = `原因: 未登录, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    } else if (result.ret == -10019) {
      subTitle = '签到结果: 失败'
      detail = `原因: 非VIP会员, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    } else {
      subTitle = '签到结果: 未知'
      detail = `编码: ${result.ret}, 说明: ${result.msg}`
      chavy.msg(title, subTitle, detail)
    }
  })
  // chavy.done()
}

function signmobile(cookies) {
  if (msignheaderVal) {
    let msignheaderObj = JSON.parse(msignheaderVal)
    let msignCookies = msignheaderObj.Cookie
    // chavy.log(`${cookieName} updatemobile old-cookie: ${msignCookies}`)
    for (c of cookies) {
      if (msignCookies.indexOf(c.key) >= 0) {
        msignCookies = msignCookies.replace(new RegExp(`${c.key}=[^;]*`, 'g'), `${c.key}=${c.val}`)
      }
    }
    // chavy.log(`${cookieName} updatemobile new-cookie: ${msignCookies}`)
    msignheaderObj.Cookie = msignCookies

    const url = { url: msignurlVal, headers: msignheaderObj }
    chavy.get(url, (error, response, data) => {
      const dmatch = data.match(/window\.__STATE__=(.*?)<\/script>/)
      let result = {}
      result.msg = '未知'
      result.ret = -9999
      if (dmatch) {
        try {
          result = JSON.parse(dmatch[1]).payloads.execCheck
        } catch (e) {
          chavy.log(`${cookieName} catch - error: ${e}`)
        }
      }
      const title = `${cookieName} (移动端)`
      let subtitle = ``
      let detail = ``
      if (result.ret == -9999) {
        // chavy.log(`${cookieName} updatemobile data: ${data}`)
        subtitle = `签到结果: 失败`
        detail = `说明: 未知`
      } else {
        if (result.ret == 0) {
          subtitle = `签到结果: 成功`
          if (result.data && result.data.show_text_1) detail = `说明: ${result.data.show_text_1}`
          else detail = `说明: ${result.msg}`
        } else if (result.ret == -2021) {
          subtitle = `签到结果: 成功（重复签到）`
        }
      }
      chavy.msg(title, subtitle, detail)
    })
  }
}

function getexp(signresult) {
  const timestamp = Math.round(new Date().getTime() / 1000).toString()
  let url = { url: `https://vip.video.qq.com/fcgi-bin/comm_cgi?name=spp_PropertyNum&cmd=1&growth_value=1&otype=json&_=${timestamp}`, headers: { Cookie: cookieVal } }
  url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
  chavy.get(url, (error, response, data) => {
    chavy.log(`${cookieName}, data: ${data}`)
    let result = JSON.parse(data.match(/QZOutputJson=\(([^\)]*)\)/)[1])
    const title = `${cookieName}`
    let subTitle = ''
    let detail = ''
    if (signresult.checkin_score) {
      subTitle = '签到结果: 成功'
      detail = `V力值: ${result.GrowthValue.num} (+${signresult.checkin_score}), 观影券: ${result.MovieTicket.num}, 赠片资格: ${result.GiveMovie.num}`
    } else {
      subTitle = '签到结果: 成功 (重复签到)'
      detail = `V力值: ${result.GrowthValue.num}, 观影券: ${result.MovieTicket.num}, 赠片资格: ${result.GiveMovie.num}`
    }
    chavy.msg(title, subTitle, detail)
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
