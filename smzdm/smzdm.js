const cookieName = '什么值得买'
const cookieKey = 'chavy_cookie_smzdm'
const cookieVal = $persistentStore.read(cookieKey)

function sign() {
  let url = {
    url: `https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112405819534189067781_1474859317229&_=1474859317231`,
    headers: {
      Cookie: cookieVal
    }
  }
  url.headers['Referer'] = 'http://www.smzdm.com/'
  url.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'

  $httpClient.get(url, (error, response, data) => {
    $notification.post(cookieName, '签到结果: 未知', '详见日志')
    console.log(`${cookieName}, error: ${error}, response: ${response}, data: ${data}`)
  })

  $done({})
}

sign()
