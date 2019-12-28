/**
 *
 * [MITM]
 * tieba.baidu.com
 *
 * [rewrite_local]
 * ^https:\/\/tieba\.baidu\.com\/m\/ url script-response-body tieba.cookie.js
 *
 * [task_local]
 * 1 0 0 * * tieba.js
 *
 */

const cookieName = '网易云音乐'
const cookieKey = 'chavy_cookie_neteasemusic'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
  let cookie = $prefs.setValueForKey(cookieVal, cookieKey)
  if (cookie) {
    let msg = `Cookie [${cookieName}] 写入成功!`
    $notify(msg, '', '详见日志')
  }
}

$done({})
