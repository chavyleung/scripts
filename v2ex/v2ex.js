/**
 *
 * [MITM]
 * *.v2ex.com
 *
 * [Script]
 * http-request ^https://www.v2ex.com/ script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.cookie.js
 * cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.js
 *
 */

const cookieName = 'V2EX'
const cookieKey = 'chavy_cookie_v2ex'
const cookieVal = $persistentStore.read(cookieKey)

function sign() {
  let url = {
    url: `https://www.v2ex.com/mission/daily`,
    headers: {
      Cookie: cookieVal
    }
  }

  $httpClient.get(url, (error, response, data) => {
    if (data.indexOf('每日登录奖励已领取')) {
      console.log(`签到跳过: ${cookieName}, 原因: 今天已经签过了`)
      $notification.post('签到跳过', cookieName, `原因: 今天已经签过了`)
    } else {
      let regex = /<input[^>]*\/mission\/daily\/redeem\?once=(\d+)[^>]*>/g
      for (const code of data.matchAll(regex)) {
        signMission(code[1])
      }
    }
  })
  $done({})
}

function signMission(code) {
  let url = {
    url: `https://www.v2ex.com/mission/daily/redeem?once=${code}`,
    headers: { Cookie: cookieVal }
  }
  $httpClient.get(url, (error, response, data) => {
    if (data.indexOf('每日登录奖励已领取') > 0) {
      console.log(`签到成功: ${cookieName}`)
      $notification.post('签到成功', cookieName, '')
    } else {
      console.log(`签到失败: ${cookieName}, error: ${error}, response: ${response}, data: ${data}`)
      $notification.post('签到失败', cookieName, '详见日志')
    }
  })
}

sign({})
