const $ = new Env('字幕组')
$.VAL_cookie = $.getdata('chavy_cookie_zimuzu')
$.VAL_appurl = $.getdata('chavy_auth_url_zimuzu_app')

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await web()
  await app()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

function web() {
  return new Promise((resove) => {
    const url = { url: `http://www.rrys2019.com/user/login/getCurUserTopInfo`, headers: {} }
    url.headers['Cookie'] = $.VAL_cookie
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    $.get(url, (error, response, data) => ($.web = JSON.parse(data, resove())))
  })
}

async function app() {
  await loginapp()
  await refreshapp()
  await signapp()
}

function loginapp() {
  return new Promise((resove) => {
    const url = { url: $.VAL_appurl, headers: {} }
    url.headers['Accept'] = `*/*`
    url.headers['Accept-Encoding'] = `gzip;q=1.0, compress;q=0.5`
    url.headers['Accept-Language'] = `zh-Hans-CN;q=1.0, en-US;q=0.9`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `ios.zmzapi.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `YYets_swift/2.5.7 (com.yyets.ZiMuZu; build:29; iOS 13.3.1) Alamofire/4.9.1`
    $.get(url, (error, response, data) => (($.loginapp = JSON.parse(data)), resove()))
  })
}

function refreshapp() {
  return new Promise((resove) => {
    const uid = $.loginapp && $.loginapp.data && $.loginapp.data.uid
    const token = $.loginapp && $.loginapp.data && $.loginapp.data.token
    const url = { url: `http://h5.rrhuodong.com/index.php?g=api/mission&m=index&a=login&uid=${uid}&token=${token}`, headers: {} }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `h5.rrhuodong.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    $.get(url, (error, response, data) => resove())
  })
}

function signapp() {
  return new Promise((resove) => {
    const url = { url: `http://h5.rrhuodong.com/index.php?g=api/mission&m=clock&a=store&id=2`, headers: {} }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `h5.rrhuodong.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    $.get(url, (error, response, data) => (($.app = JSON.parse(data)), resove()))
  })
}

function showmsg() {
  return new Promise((resove) => {
    $.subt = ''
    $.desc = ''
    // web
    $.subt += '网页: '
    if ($.web.status == 1) {
      if ($.web.data.new_login) $.subt += '成功'
      else $.subt += '成功 (重复)'
      $.desc = `人人钻: ${$.web.data.userinfo.point}, 登录天数: ${$.web.data.usercount.cont_login}`
    } else if ($.web.status == 4001) {
      $.subt += '未登录'
    } else {
      $.subt += '失败'
    }

    // app
    $.subt += '; APP: '
    if ($.app.status == 1) $.subt += '成功'
    else if ($.app.status == 4005) $.subt += '成功 (重复)'
    else if ($.app.status == 1021) $.subt += '未登录'
    else $.subt += '失败'
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i),this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),t&&this.log(t),s&&this.log(s),i&&this.log(i)}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s.body=e,s.statusCode=s.status,i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
