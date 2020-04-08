const cookieName = '趣头条'
const signurlKey = 'senku_signurl_qtt'
const signheaderKey = 'senku_signheader_qtt'
const signbodyKey = 'senku_signbody_qtt'
const senku = init()
const signurlVal = senku.getdata(signurlKey)
const signheaderVal = senku.getdata(signheaderKey)
const adUrl = signurlVal.replace(/sign\?/, "adDone?").concat("&GUID=58711eba362605e8c3afa9be885.31911288")
const getinfoUrlVal = signurlVal.replace(/sign\?/, "info?")
const signinfo = { playList: [] }

console.log(getinfoUrlVal)
let playUrl = [adUrl.concat("&pos=one"), adUrl.concat("&pos=two"), adUrl.concat("&pos=three"), adUrl.concat("&pos=four")]


  ; (sign = async () => {
    senku.log(`🔔 ${cookieName}`)
    await signDay()
    await play()
    await getinfo()

    showmsg()
    senku.done()
  })().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())


function signDay() {
  return new Promise((resolve, reject) => {
    const url = { url: signurlVal, headers: JSON.parse(signheaderVal) }
    senku.get(url, (error, response, data) => {
      try {
        senku.log(`❕ ${cookieName} signDay - response: ${JSON.stringify(response)}`)
        signinfo.signDay = JSON.parse(data)
        resolve()
      } catch (e) {
        senku.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        senku.log(`❌ ${cookieName} signDay - 签到失败: ${e}`)
        senku.log(`❌ ${cookieName} signDay - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const url = { url: getinfoUrlVal, headers: JSON.parse(signheaderVal) }
    senku.get(url, (error, response, data) => {
      try {
        senku.log(`❕ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        senku.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        senku.log(`❌ ${cookieName} getinfo - 签到失败: ${e}`)
        senku.log(`❌ ${cookieName} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

//  播放广告获取奖励
function playAd(urlParameter) {
  return new Promise((resolve, reject) => {
    const url = { url: urlParameter, headers: JSON.parse(signheaderVal) }
    senku.get(url, (error, response, data) => {
      try {
        senku.log(`❕ ${cookieName} playAd - response: ${JSON.stringify(response)}`)
        signinfo.playList.push(JSON.parse(data))
        resolve()
      } catch (e) {
        senku.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
        senku.log(`❌ ${cookieName} playAd - 签到失败: ${e}`)
        senku.log(`❌ ${cookieName} playAd - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

// 播放广告
function play() {
  return new Promise((resolve, reject) => {
    playUrl.forEach((url) => {
      playAd(url)
      resolve()
    })
  })
}

// 将时间戳格式化
function tTime(timestamp) {
  const date = new Date(timestamp * 1000)
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  const D = date.getDate() + ' '
  const h = date.getHours() + ':'
  const m = date.getMinutes() + ':'
  const s = date.getSeconds()
  return M + D + h + m + s
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  let moreDetail = ''
  // signDay
  if (signinfo.info && signinfo.info.data.signIn.today == 1) {
    if (signinfo.signDay.code == 0) {
      const continuation = signinfo.info.data.signIn.continuation
      const amount = signinfo.info.data.signIn.amount
      const currentCoin = amount[continuation]
      const nextCoin = amount[continuation + 1]
      const coins = signinfo.info.data.show_balance_info.coins
      subTitle = '签到: 成功'
      detail += detail == '' ? '' : ', '
      detail += `获得${currentCoin}金币,下次:${nextCoin},总共:${coins}连续签到${continuation}天`
    }
    else subTitle = '签到: 重复'
  } else {
    subTitle = '签到: 失败'
    senku.log(`❌ ${cookieName} showmsg - 每日签到: ${JSON.stringify(signinfo.signDay)}`)
  }

  // playAds
  subTitle += subTitle == '' ? '' : ', '
  if (signinfo.playList) {
    subTitle += '广告奖励: 成功'
    moreDetail += moreDetail == '' ? '' : '\n'
    const icon = signinfo.info.data.signIn.ext_ad.icon
    const coins = signinfo.info.data.show_balance_info.coins
    const continuation = signinfo.info.data.signIn.continuation
    for (const poss of icon) {
      const time = tTime(poss.next_time)
      moreDetail += `\n视频${poss.pos}: 下次签到时间${time},可获得${poss.amount}`
    }
    detail += detail == '' ? '' : ', '
    detail += `总共:${coins}连续签到${continuation}天`
  } else subTitle += '广告奖励: 失败'

  if (moreDetail) detail += `\n查看签到详情\n${moreDetail}`
  senku.msg(cookieName, subTitle, detail)
  senku.done()
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
