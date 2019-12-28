const cookieName = '什么值得买'
const cookieKey = 'chavy_cookie_smzdm'
const cookieVal = $prefs.valueForKey(cookieKey)

function sign() {
  let url = {
    url: `https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112405819534189067781_1474859317229&_=1474859317231`,
    headers: {
      Cookie: cookieVal
    }
  }
  url.headers['Referer'] = 'http://www.smzdm.com/'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'

  $task.fetch(url).then((response) => {
    let data = response.body
    $notify(cookieName, '签到结果: 未知', '详见日志')
    console.log(`${cookieName} data: ${data}`)
  })
}

sign()
