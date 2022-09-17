const $ = new Env(`🏎️ 掌上飞车`)
const date = new Date()
const illustrate = `掌上飞车APP => 发现 => 每日签到 => 点击签到`
typeof $request !== `undefined` ? start() : main()
 
function start () {
  if ($request.url && $request.headers) {
    try {userId = $request.url.match(/userId=([^&]+)/)[1]} catch {userId = ``}
    try {areaId = $request.url.match(/areaId=([^&]+)/)[1]} catch {areaId = ``}
    try {roleId = $request.url.match(/roleId=([^&]+)/)[1]} catch {roleId = ``}
    try {token = $request.url.match(/token=([^&]+)/)[1]} catch {token = ``}
    try {uin = $request.url.match(/uin=([^&]+)/)[1]} catch {uin = ``}
    $.write($request.url.replace(/&gift_id=\d+/, ""), `zsfc_url`)
    $.write($.toStr($request.headers), `zsfc_headers`)
    $.write(`userId=${userId}&areaId=${areaId}&roleId=${roleId}&token=${token}&uin=${uin}`, `zsfc_query`)
    $.notice($.name, `✅ 获取签到数据成功！`, `请不要再次打开掌上飞车APP, 否则 Cookie 将失效！`)
  } else {
    $.notice($.name, ``, `⭕ 无法读取请求头, 请检查配置`)
  }
  $.done()
}

async function main () {
  if (!$.read(`zsfc_url`)) {
    $.log(`❌ 当前 Cookie 为空, 请先获取`)
    $.notice($.name, `❌ 当前 Cookie 为空, 请先获取`, illustrate)
  } else if ($.read(`zsfc_query`).indexOf(`&token=&`) != -1) {
    $.log(`❌ 当前 Cookie 错误, 请重新获取`)
    $.notice($.name, `❌ 当前 Cookie 错误, 请重新获取`, illustrate)
  } else {
    await sign(await index())
    if ($.expired != 0) {
      await speed()
      if ($.giftid) await handle($.giftid, `第 ${$.day_award } 天奖励`)
      if ($.giftdays) await handle($.giftdays, ` ${$.day_welfare} 特别福利`)
    } else {
      $.notice($.name, `❌ 当前Cookie 已失效, 请重新获取`, illustrate)
    }
  }
  $.done()
}

function index() {
  return new Promise(resolve => {
    const options = {
      url: `https://mwegame.qq.com/ams/sign/month/speed?` + 
           `${$.read(`zsfc_query`)}`,
      headers: $.toObj($.read(`zsfc_headers`))
    }
    $.get(options, (error, response, data) => {
      if (data) {
        successive = data.match(/giftid="([^"]+)"/g)[0].match(/(\d+)/)[1]
      } else {
        $.log(`❌ 获取签到页面信息时发生错误`)
        $.log($.toStr(error))
      }
      resolve(successive)
    })
  })
}

function sign (_id) {
  return new Promise(resolve => {
    const options = {
      url: `${$.read("zsfc_url")}&gift_id=${_id}`,
      headers: $.toObj($.read(`zsfc_headers`))
    }
    $.log(`🧑‍💻 开始检查 Cookie 并进行每日签到`)
    $.get(options, (error, response, data) => {
      if (data) {
        let result = $.toObj(data.replace(/\r|\n/ig, ``))
        let message = result.message
        if (message.indexOf(`重试`) > -1) {
          $.expired = 0
          $.log(`❌ 当前 Cookie 已失效, 请重新获取`)
        } else if (message.indexOf(`已经`) > -1) {
          $.log(`✅ 检查结果: 当前 Cookie 有效`)
          $.log(`⭕ 签到结果: ${message}`)
        } else {
          sMsg = result.send_result.sMsg
          $.log(`✅ 检查结果: 当前 Cookie 有效`)
          $.log(`✅ ${sMsg}`)
          $.notice($.name, `✅ ${message}`, sMsg, ``)
        }
      } else {
        $.log(`❌ 无法完成每日签到`)
        $.log(error)
      }
      resolve()
    })
  })
}

function speed() {
  return new Promise(resolve => {
    const options = {
      url: `https://mwegame.qq.com/ams/sign/month/speed?` + 
           `${$.read(`zsfc_query`)}`,
      headers: $.toObj($.read(`zsfc_headers`))
    }
    $.log(`🧑‍💻 开始获取累计签到天数`)
    $.get(options, (error, response, data) => {
      if (data) {
        let arr = [0,1,2,3,0,4,0,5,0,6,7,8,0,9,0,10,11,0,12,13,0,14,15,0,0,16,0,0,0,0,0]
        $.day_award = data.match(/<span id="my_count">(\d+)<\/span> 天/)[1] * 1
        $.log(`✅ 当前 ${date.getMonth() + 1} 月累计签到 ${$.day_award} 天`)
        if (arr[$.day_award] != 0) {
          $.giftid = data.match(/giftid="([^"]+)"/g)[arr[$.day_award]].match(/(\d+)/)[1]
        }
        try {
          if (data.match(/月(\d+)日/g)[0].match(/(\d+)/)[1] * 1 == date.getDate()) {
            $.day_welfare = `${date.getMonth() + 1}月${date.getDate()}日`
            $.giftdays = data.match(/"giftdays([^"]+)"/g)[0].match(/(\d+)/)[1]
          }
        } catch {}
      } else {
        $.log(`❌ 获取累计签到天数时发生错误`)
        $.log($.toStr(error))
      }
      resolve()
    })
  })
}

function handle (_id, _award) {
  return new Promise(resolve => {
    const options = {
      url: `https://mwegame.qq.com/ams/send/handle`,
      headers: $.toObj($.read(`zsfc_headers`)),
      body: `${$.read(`zsfc_query`)}&gift_id=${_id}`
    }
    $.log(`🧑‍💻 开始领取${_award}`)
    $.post(options, (error, response, data) => {
      if (data) {
        let result = $.toObj(data.replace(/\r|\n/ig, ``))
        if (result.data.indexOf(`成功`) != -1) {
          sPackageName = result.send_result.sPackageName
          $.log(`✅ 领取结果: 获得${sPackageName}`)
        } else {
          $.log(`⭕ 领取结果: ${result.message}`)
        }
      } else {
        $.log(`❌ 领取${_award}时发生错误`)
        $.log($.toStr(error))
      }
      resolve()
    })
  })
}
 
function Env(name) {
  LN = typeof $loon != `undefined`
  SG = typeof $httpClient != `undefined` && !LN
  QX = typeof $task != `undefined`
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val); 
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { 'open-url': url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = `GET`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = `POST`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  toObj = (str) => JSON.parse(str)
  toStr = (obj) => JSON.stringify(obj)
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { name, read, write, notice, get, post, toObj, toStr, log, done }
}
