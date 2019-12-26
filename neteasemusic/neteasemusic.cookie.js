/**
 *
 * [MITM]
 * music.163.com
 *
 * [Script]
 * http-request ^http://music.163.com script-path=scripts/neteasemusic/neteasemusic.cookie.js
 * cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/neteasemusic/neteasemusic.js
 *
 */

const cookieName = '网易云音乐'
const cookieKey = 'chavy_cookie_neteasemusic'
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
