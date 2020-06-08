const $ = new Env('有道云笔记')
$.VAL_sign_url = $.getdata('chavy_signurl_noteyoudao')
$.VAL_sign_body = $.getdata('chavy_signbody_noteyoudao')
$.VAL_sign_headers = $.getdata('chavy_signheaders_noteyoudao')

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await signinapp()
  await logindaily()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc), $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

function logindaily() {
  const url = { url: 'https://note.youdao.com/yws/api/daupromotion?method=sync', headers: JSON.parse($.VAL_sign_headers) }
  return new Promise((resove) => {
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.log(`❕ ${$.name}, 每日登录: ${data}`)
        $.daily = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 每日登录: 失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function signinapp() {
  const url = { url: $.VAL_sign_url, body: $.VAL_sign_body, headers: JSON.parse($.VAL_sign_headers) }
  return new Promise((resove) => {
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.log(`❕ ${$.name}, 每日签到: ${data}`)
        $.signin = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 每日登录: 失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function showmsg() {
  return new Promise((resove) => {
    const dailyFlag = $.daily.accept === true ? '成功' : '重复'
    const signinFlag = $.signin.success === 1 ? '成功' : $.signin.success === 0 ? '重复' : '错误'
    $.subt = `每日登录: ${dailyFlag}, 每日签到: ${signinFlag}`
    const continuousDays = `连签: ${$.daily.rewardSpace / 1024 / 1024}天`
    const rewardSpace = `本次获得: ${$.daily.rewardSpace / 1024 / 1024}MB`
    const totalReward = `总共获得: ${$.daily.totalRewardSpace / 1024 / 1024}MB`
    $.desc = `${continuousDays}, ${rewardSpace}, ${totalReward}`
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i),this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),t&&this.log(t),s&&this.log(s),i&&this.log(i)}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
