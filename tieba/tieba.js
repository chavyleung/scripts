const cookieName = '百度贴吧'
const cookieKey = 'chavy_cookie_tieba'
const chavy = init()
const cookieVal = chavy.getdata(cookieKey)

sign()

function sign() {
  signTieba()
  // signWenku()
  signZhidao()
}

function signTieba() {
  let url = { url: `https://tieba.baidu.com/mo/q/newmoindex`, headers: { Cookie: cookieVal } }
  chavy.post(url, (error, response, data) => {
    let result = JSON.parse(data)
    let tbs = result.data.tbs
    let forums = result.data.like_forum
    let signinfo = {
      forumCnt: forums.length,
      signedCnt: 0,
      successCnt: 0,
      failedCnt: 0,
      skipedCnt: 0
    }

    for (const bar of forums) {
      // 已签
      if (bar.is_sign == 1) {
        signinfo.signedCnt += 1
        signinfo.skipedCnt += 1
        chavy.log(`[${cookieName}] \"${bar.forum_name}\"签到结果: 跳过, 原因: 重复签到`)
      }
      // 未签
      else {
        signBar(bar, tbs, (error, response, data) => {
          let signresult = JSON.parse(data)
          if (signresult.no == 0 || signresult.no == 1011) {
            signinfo.signedCnt += 1
            signinfo.successCnt += 1
            chavy.log(`[${cookieName}] \"${bar.forum_name}\"签到结果: 成功`)
          } else {
            signinfo.failedCnt += 1
            chavy.log(`[${cookieName}] \"${bar.forum_name}\"签到结果: 失败, 编码: ${signresult.no}, 原因: ${signresult.error}`)
          }
        })
      }
    }
    check(forums, signinfo)
  })
}

function signBar(bar, tbs, cb) {
  let url = {
    url: `https://tieba.baidu.com/sign/add`,
    headers: { Cookie: cookieVal },
    body: `ie=utf-8&kw=${bar.forum_name.split('&').join('%26')}&tbs=${tbs}`
  }
  chavy.post(url, cb)
}

function signWenku() {
  let url = { url: `https://wenku.baidu.com/task/submit/signin`, headers: { Cookie: cookieVal } }
  url.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  chavy.get(url, (error, response, data) => {
    const signresult = JSON.parse(data)
    const title = '百度文库'
    let subTitle = ''
    let detail = ''
    if (signresult.errno == '0') {
      subTitle = '签到结果: 成功'
      chavy.msg(title, subTitle, detail)
      chavy.log(`[${title}] ${subTitle}`)
    } else {
      subTitle = '签到结果: 未知'
      detail = '详见日志'
      chavy.msg(title, subTitle, detail)
      chavy.log(`[${title}] 签到结果: 未知, ${data}`)
    }
  })
}

function signZhidao() {
  let url = {
    url: `https://zhidao.baidu.com/`,
    headers: { Cookie: cookieVal }
  }
  chavy.get(url, (error, response, data) => {
    const timestamp = Date.parse(new Date())
    const utdata = `61,61,7,0,0,0,12,61,5,2,12,4,24,5,4,1,4,${timestamp}`
    const stoken = data.match(/"stoken"[^"]*"([^"]*)"/)[1]
    const signurl = { url: `https://zhidao.baidu.com/submit/user`, headers: { Cookie: cookieVal }, body: {} }
    signurl.body = `cm=100509&utdata=${utdata}&stoken=${stoken}`
    chavy.post(signurl, (signerror, signresp, signdata) => {
      const signresult = JSON.parse(signdata)
      const title = '百度知道'
      let subTitle = ''
      let detail = ''
      if (signresult.errorNo == 0) {
        subTitle = '签到结果: 成功'
        detail = `活跃: ${signresult.data.signInDataNum}天, 说明: ${signresult.errorMsg}`
        chavy.msg(title, subTitle, detail)
        chavy.log(`[${title}] ${subTitle}, ${signdata}`)
      } else if (signresult.errorNo == 2) {
        subTitle = `签到结果: 成功 (重复签到)`
        detail = `活跃: ${signresult.data.signInDataNum}天, 说明: ${signresult.errorMsg}`
        chavy.msg(title, subTitle, detail)
        chavy.log(`[${title}] ${subTitle}, ${signdata}`)
      } else {
        subTitle = '签到结果: 失败'
        detail = `说明: ${signresult.errorMsg}`
        chavy.msg(title, subTitle, detail)
        chavy.log(`[${title}] ${subTitle}`)
      }
    })
  })
}

function check(forums, signinfo, checkms = 0) {
  let title = `${cookieName}`
  let subTitle = ``
  let detail = `今日共签: ${signinfo.signedCnt}/${signinfo.forumCnt}, 本次成功: ${signinfo.successCnt}, 本次失败: ${signinfo.failedCnt}`
  if (signinfo.forumCnt == signinfo.signedCnt + signinfo.failedCnt) {
    // 成功数+跳过数=总数 = 全部签到成功
    if (signinfo.successCnt + signinfo.skipedCnt == signinfo.forumCnt) {
      subTitle = `签到结果: 全部成功`
    } else {
      subTitle = `签到结果: 部分成功`
    }
    chavy.log(`${title}, ${subTitle}, ${detail}`)
    chavy.msg(title, subTitle, detail)
    chavy.done()
  } else {
    if (checkms > 9000) {
      subTitle = `签到结果: 超时退出 (请重试)`
      chavy.log(`${title}, ${subTitle}, ${detail}`)
      chavy.msg(title, subTitle, detail)
      chavy.done()
    } else {
      setTimeout(() => check(forums, signinfo, checkms + 50), 50)
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
