const $ = new Env('会话切换')
$.KEY_sessions = 'chavy_boxjs_sessions'
$.CFG_isSilent = $.getdata('CFG_BoxSwitcher_isSilent')

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await execSwitch()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

function execSwitch() {
  return new Promise((resove) => {
    // 会话排序: `创建时间`升序
    const sessions = getSessions()
    sessions.sort((a, b) => a.createTime.replace(/-|:| /g, '') - b.createTime.replace(/-|:| /g, ''))
    const apps = {}
    sessions.forEach((session) => {
      const appId = session.appId
      const appName = session.appName
      apps[appId] = apps[appId] ? apps[appId] : { id: appId, name: appName, sessions: [], skipedSessions: [] }
      const app = apps[appId]
      session.datas.sort((a, b) => a.key.localeCompare(b.key))
      const appDatas = []
      session.datas.forEach((data) => appDatas.push({ key: data.key, val: $.getdata(data.key) }))
      // 会话列表自重复
      const duplicateSession = app.sessions.find((_session) => JSON.stringify(_session.datas) === JSON.stringify(session.datas))
      if (duplicateSession) {
        $.log(`⚠️ ${$.name}, ${appName}: ${session.name} 与 ${duplicateSession.name} 重复, 建议删除!`)
        app.skipedSessions.push(session)
        return true
      }
      // 会话为当前会话
      else if (JSON.stringify(session.datas) === JSON.stringify(appDatas)) {
        app.sessions.push(session)
        app.curSessionId = session.id
        return true
      }
      // 继续添加会话
      else {
        app.sessions.push(session)
      }
    })
    Object.keys(apps).forEach((appId) => {
      const app = apps[appId]
      if (app.sessions.length <= 1) {
        $.log(`⚠️ ${$.name}, ${app.name}: 跳过!`)
        return true
      }
      const curSessionIdx = app.sessions.findIndex((session) => session.id === app.curSessionId)
      const curSession = app.sessions[curSessionIdx]
      const isNewRound = curSessionIdx + 1 === app.sessions.length
      const nextSessionIdx = isNewRound ? 0 : curSessionIdx + 1
      const nextSession = app.sessions[nextSessionIdx]
      nextSession.datas.forEach((_data) => $.setdata(_data.val, _data.key) || true)
      $.log(`❕ ${$.name}, ${curSession.appName}: ${curSession.name} => ${nextSession.name} ${isNewRound ? '(新一轮)' : ''}`)
    })

    resove()
  })
}

function getSessions() {
  const sessionstr = $.getdata($.KEY_sessions)
  const sessions = sessionstr ? JSON.parse(sessionstr) : []
  return Array.isArray(sessions) ? sessions : []
}

function showmsg() {
  return new Promise((resove) => {
    if (!$.CFG_isSilent || $.CFG_isSilent === 'false') {
      $.msg($.name, $.subt, $.desc)
    }
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i),this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),t&&this.log(t),s&&this.log(s),i&&this.log(i)}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s.body=e,s.statusCode=s.status,i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
