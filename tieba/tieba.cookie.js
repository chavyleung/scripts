/**
 *
 * [MITM]
 * tieba.baidu.com
 *
 * [Script]
 * http-request ^http://tieba.baidu.com script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.cookie.js
 * cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tieba/tieba.js
 *
 */

const cookieName = '百度贴吧'
const cookieKey = 'chavy_cookie_tieba'
let cookieVal = $request.headers['Cookie']

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
