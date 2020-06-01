/**
 *
 * 进入 叠蛋糕 主页获取 Cookies
 *
 * Surge:
 * Rewrite: JD618 = type=http-request,pattern=^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData,script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js,requires-body=true
 * Tasks: JD618 = type=cron,cronexp="10,20,30,40,50 0 * * *",script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.js,wake-system=true,timeout=600
 *
 * QuanX:
 * # 本地
 * ^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData url script-request-body jd.618.cookie.js
 * # 远程
 * ^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData url script-request-body https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js
 *
 * [task_local]
 * # 本地
 * 10,20,30,40,50 0 * * * jd.618.js, tag=京东618
 * # 远程
 * 10,20,30,40,50 0 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.js, tag=京东618
 *
 * Loon:
 * cron "10,20,30,40,50 0 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.js, timeout=600, tag=京东618
 * http-request ^https:\/\/api.m.jd.com\/client.action\?functionId=cakebaker_getHomeData script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/jd/jd.618.cookie.js,requires-body=true
 *
 * [MITM]
 * hostname = api.m.jd.com
 */

const $ = new Env('京东618')

!(async () => {
  $.log('', `🔔 ${$.name}, 获取会话: 开始!`, '')
  const VAL_url = $request.url
  const VAL_body = $request.body
  const VAL_headers = JSON.stringify($request.headers)
  if (VAL_url && VAL_body && VAL_headers) {
    $.setdata($request.url, 'chavy_url_jd816')
    $.setdata($request.body, 'chavy_body_jd816')
    $.setdata(JSON.stringify($request.headers), 'chavy_headers_jd816')
    $.subt = '获取会话: 成功!'
  }
})()
  .catch((e) => {
    $.subt = '获取会话: 失败!'
    $.desc = `原因: ${e}`
    $.log(`❌ ${$.name}, 获取会话: 失败! 原因: ${e}!`)
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 获取会话: 结束!`, ''), $.done()
  })

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i),this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),t&&this.log(t),s&&this.log(s),i&&this.log(i)}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s.body=e,s.statusCode=s.status,i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
