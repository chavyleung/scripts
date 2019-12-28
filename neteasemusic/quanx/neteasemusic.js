const cookieName = '网易云音乐'
const cookieKey = 'chavy_cookie_neteasemusic'
const cookieVal = $prefs.valueForKey(cookieKey)

const pc = `http://music.163.com/api/point/dailyTask?type=1`
const mobile = `http://music.163.com/api/point/dailyTask?type=0`

function sign() {
  let url = {
    url: null,
    headers: {
      Cookie: cookieVal
    }
  }

  let signinfo = {}

  url.url = pc
  $task.fetch(url).then((response) => {
    let data = response.body
    let result = JSON.parse(data)
    signinfo.pc = {
      title: `网易云音乐(PC)`,
      success: result.code == 200 || result.code == -2 ? true : false,
      skiped: result.code == -2 ? true : false,
      resultCode: result.code,
      resultMsg: result.msg
    }
    console.log(`开始签到: ${signinfo.pc.title}, 编码: ${result.code}, 原因: ${result.msg}`)
  })

  url.url = mobile
  $task.fetch(url).then((response) => {
    let data = response.body
    let result = JSON.parse(data)
    signinfo.app = {
      title: `网易云音乐(APP)`,
      success: result.code == 200 || result.code == -2 ? true : false,
      skiped: result.code == -2 ? true : false,
      resultCode: result.code,
      resultMsg: result.msg
    }
    console.log(`开始签到: ${signinfo.app.title}, 编码: ${result.code}, 原因: ${result.msg}`)
  })
  check(signinfo)
}

function check(signinfo, checkms = 0) {
  if (signinfo.pc && signinfo.app) {
    log(signinfo)
    $done({})
  } else {
    if (checkms > 5000) {
      $done({})
    } else {
      setTimeout(() => check(signinfo, checkms + 100), 100)
    }
  }
}

function log(signinfo) {
  let title = `签到结果: ${cookieName}`
  let subTitle = ``
  let detail = `今日共签: ${signinfo.signedCnt}, 本次成功: ${signinfo.successCnt}, 失败: ${signinfo.failedCnt}, 跳过: ${signinfo.skipedCnt}`

  if (signinfo.pc.success && signinfo.app.success) {
    subTitle = `全部签到成功`
    detail = `PC: ${signinfo.pc.success ? '成功' : '失败'}, APP: ${signinfo.app.success ? '成功' : '失败'}`
  } else if (!signinfo.pc.success && !signinfo.app.success) {
    subTitle = `全部签到失败`
    detail = `PC: ${signinfo.pc.success ? '成功' : '失败'}, APP: ${signinfo.app.success ? '成功' : '失败'}, 详见日志!`
  } else {
    subTitle = ``
    detail = `PC: ${signinfo.pc.success ? '成功' : '失败'}, APP: ${signinfo.app.success ? '成功' : '失败'}, 详见日志!`
  }
  $notify(title, subTitle, detail)
}

sign()
