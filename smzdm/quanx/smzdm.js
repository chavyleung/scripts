const cookieName = '什么值得买'
const cookieKey = 'chavy_cookie_smzdm'
const cookieVal = $prefs.valueForKey(cookieKey)

function sign() {
  let url = {
    url: `https://zhiyou.smzdm.com/user/checkin/jsonp_checkin`,
    headers: {
      Cookie: cookieVal
    }
  }
  url.headers['Referer'] = 'http://www.smzdm.com/'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'

  $task.fetch(url).then((response) => {
    let data = response.body
    let result = JSON.parse(data)
    let title = `${cookieName}`
    // 签到成功
    if (result && result.data && result.error_code == 0) {
      let subTitle = `签到结果: 成功`
      let detail = `累计: ${result.data.checkin_num}次, 经验: ${result.data.exp}, 金币: ${result.data.gold}, 积分: ${result.data.point}`
      $notify(title, subTitle, detail)
    }
    // 签到失败
    else {
      let subTitle = `签到结果: 失败`
      let detail = `请把日志中的输出反馈到Github`
      $notify(title, subTitle, detail)
    }
    console.log(`${cookieName}, data: ${data}`)
  })
}

sign()
