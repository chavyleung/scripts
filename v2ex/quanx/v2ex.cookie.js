const cookieName = 'V2EX'
const cookieKey = 'chavy_cookie_v2ex'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
  let cookie = $prefs.setValueForKey(cookieVal, cookieKey)
  if (cookie) {
    let msg = `Cookie [${cookieName}] 写入成功!`
    $notify(msg, '', '详见日志')
    console.log(msg)
    console.log(cookieVal)
  }
}

$done({})
