const cookieName = '百度贴吧'
const cookieKey = 'chavy_cookie_tieba'
const cookieVal = $request.headers['Cookie']

if (cookieVal.indexOf('BDUSS') > 0) {
  let cookie = $prefs.setValueForKey(cookieVal, cookieKey)
  if (cookie) {
    let msg = `${cookieName}`
    $notify(msg, 'Cookie写入成功', '详见日志')
    console.log(msg)
    console.log(cookieVal)
  }
} else {
  let msg = `${cookieName}`
  let msgDetail = `获取失败: 请确保在已登录状态下获取Cookie`
  $notify(msg, '', msgDetail)
  console.log(`${msg}, ${msgDetail}`)
  console.log(cookieVal)
}

$done({})
