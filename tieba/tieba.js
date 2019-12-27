/**
 *
 * [MITM]
 * tieba.baidu.com
 *
 * [Script]
 * http-request ^http:\/\/tieba\.baidu\.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.cookie.js
 * cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js
 *
 */

const cookieName = '百度贴吧'
const cookieKey = 'chavy_cookie_tieba'
const cookieVal = $persistentStore.read(cookieKey)

function sign() {
  let url = {
    url: `http://tieba.baidu.com/f/like/mylike`,
    headers: {
      Cookie: cookieVal
    }
  }

  $httpClient.post(url, (error, response, data) => {
    // <a href="/f?kw=surface" title="surface">surface</a>
    // let regex = /\/f\?kw=([^{'"}]*)/g
    // let regex = /\/f\?kw=([^{'"}]*).*?>([^<]*)/g
    let regex = /\/f\?kw=([^{'"}]*)/g
    for (const bar of data.matchAll(regex)) {
      signBar(bar)
    }
  })
  $done({})
}

function signBar(bar) {
  let url = {
    url: `http://tieba.baidu.com/sign/add?ie=utf-8&kw=${bar[1]}`,
    headers: { Cookie: cookieVal }
  }

  $httpClient.post(url, (error, response, data) => {
    let result = JSON.parse(data)
    if (result.no == 0) {
      console.log(`正在签到: ${bar[1]}, 签到成功`)
    } else {
      console.log(`正在签到: ${bar[1]}, 错误编码: ${result.no}, 错误原因: ${result.error}`)
    }
  })
}

sign()
