const cookieName = "百度贴吧";
const cookieKey = "chavy_cookie_tieba";
const cookieVal = $request.headers["Cookie"];

if (cookieVal) {
  let cookie = $prefs.setValueForKey(cookieVal, cookieKey);
  if (cookie) {
    let msg = `Cookie [${cookieName}] 写入成功!`;
    $notify(msg, "", "详见日志");
  }
}

$done({});
