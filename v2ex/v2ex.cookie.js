/**
 *
 * [MITM]
 * *.v2ex.com
 *
 * [Script]
 * http-request ^http:\/\/www\.v2ex\.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.cookie.js
 * cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/v2ex/v2ex.js
 *
 */

const cookieName = 'V2EX'
const cookieKey = 'chavy_cookie_v2ex'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
  let cookie = $persistentStore.write(cookieVal, cookieKey)
  if (cookie) {
    let msg = `Cookie [${cookieName}] 写入成功!`
    $notification.post(msg, '', '详见日志')
    console.log(msg)
    console.log(cookieVal)
  }
}

$done({})
