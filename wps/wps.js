const $ = new Env('WPS')
$.VAL_signhomeurl = $.getdata('chavy_signhomeurl_wps')
$.VAL_signhomeheader = $.getdata('chavy_signhomeheader_wps')
$.CFG_inviteWaitTime = $.getdata('CFG_wps_inviteTime') * 1 || 2000 // 每次并发间隔时间 (毫秒)

!(async () => {
  await loginapp()
  await signapp()
  await getquestion()
  await answerwx()
  // await signwx()
  // await signupwx()
  await getUserInfo()
  await invite()
  await getSigninfo()
  await getSignreward()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

// 登录 App
function loginapp() {
  return new Promise((resove) =>
    $.get({ url: $.VAL_signhomeurl, headers: JSON.parse($.VAL_signhomeheader) }, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.homeinfo = JSON.parse(data)
        if ($.homeinfo.result === 'ok') {
          const headers = JSON.parse($.VAL_signhomeheader)
          const [, sid] = /wps_sid=(.*?)(;|,|$)/.exec(headers.Cookie)
          $.sid = sid
        }
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  )
}

// 签到 App
function signapp() {
  return new Promise((resove) => {
    const url = { url: 'https://zt.wps.cn/2018/docer_check_in/api/checkin_today', headers: JSON.parse($.VAL_signhomeheader) }
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Origin'] = 'https://zt.wps.cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.signapp = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

// 获取并回答问题
async function answerwx() {
  const answers = [
    'WPS会员全文检索',
    '100G',
    'WPS会员数据恢复',
    'WPS会员PDF转doc',
    'WPS会员PDF转图片',
    'WPS图片转PDF插件',
    '金山PDF转WORD',
    'WPS会员拍照转文字',
    '使用WPS会员修复',
    'WPS全文检索功能',
    '有，且无限次',
    '文档修复'
  ]
  // 尝试最多 10 次回答问题
  for (let idx = 0; idx < 10; idx++) {
    $.log(`问题: ${$.question.title}`)
    if ($.question.multi_select === 0) {
      const optionIdx = $.question.options.findIndex((option) => answers.includes(option))
      if (optionIdx === -1) {
        $.log(`选项: ${$.question.options.join(', ')}`)
        $.log('跳过! 原因: 找不到答案.', '')
        await getquestion()
      } else {
        $.log(`选项: ${$.question.options.join(', ')}`)
        $.log(`答案: ${optionIdx + 1}.${$.question.options[optionIdx]}`, '')
        await answerquestion(optionIdx + 1)
        if ($.answer.right) {
          $.answer.optionIdx = optionIdx
          $.log('回答正确!')
          break
        } else {
          $.log(`回答错误! 详情: ${$.answer._raw.msg}`)
          await getquestion()
          continue
        }
      }
    } else {
      $.log(`选项: ${$.question.options.join(', ')}`)
      $.log('跳过! 原因: 不做多选.', '')
      await getquestion()
    }
  }
}

// 获取问题
function getquestion() {
  return new Promise((resove) => {
    const url = { url: 'https://zt.wps.cn/2018/clock_in/api/get_question?award=wps', headers: { sid: $.sid } }
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.question = JSON.parse(data).data
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

// 回答问题
function answerquestion(optIdx) {
  return new Promise((resove) => {
    const body = `answer=${optIdx}`
    const url = { url: 'https://zt.wps.cn/2018/clock_in/api/answer?member=wps', body, headers: { sid: $.sid } }
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        const _data = JSON.parse(data)
        $.answer = { _raw: _data, right: _data.result === 'ok' }
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function signwx() {
  return new Promise((resove) => {
    const url = { url: 'https://zt.wps.cn/2018/clock_in/api/clock_in?award=wps', headers: { sid: $.sid } }
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        const _data = JSON.parse(data)
        $.signwx = {
          _raw: _data,
          isSuc: _data.result === 'ok' || (_data.result === 'error' && '已打卡' === _data.msg),
          isRepeat: _data.result === 'error' && _data.msg === '已打卡',
          isSignupNeed: _data.result === 'error' && _data.msg === '前一天未报名',
          msg: _data.msg
        }
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function signupwx() {
  if (!$.signwx.isSignupNeed) return null
  return new Promise((resove) => {
    const url = { url: 'http://zt.wps.cn/2018/clock_in/api/sign_up', headers: { sid: $.sid } }
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        const _data = JSON.parse(data)
        $.signupwx = {
          _raw: _data,
          isSuc: _data.result === 'ok',
          msg: _data.msg
        }
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

// 获取签到详情
function getSigninfo() {
  return new Promise((resove) => {
    const url = { url: 'https://zt.wps.cn/2018/docer_check_in/api/checkin_record', headers: JSON.parse($.VAL_signhomeheader) }
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.signinfo = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

// 获取签到奖励
function getSignreward() {
  return new Promise((resove) => {
    const url = { url: 'https://zt.wps.cn/2018/docer_check_in/api/reward_record', headers: JSON.parse($.VAL_signhomeheader) }
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Referer'] = 'https://zt.wps.cn/static/2019/docer_check_in_ios/dist/?position=member_ios'
    url.headers['Accept'] = 'application/json, text/javascript, */*; q=0.01'
    url.headers['Host'] = 'zt.wps.cn'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['X-Requested-With'] = 'XMLHttpRequest'
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.signreward = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

// 获取用户信息
function getUserInfo() {
  return new Promise((resove) => {
    const url = { url: 'https://vip.wps.cn/userinfo', headers: { sid: $.sid } }
    $.get(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.userinfo = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

async function invite() {
  const sids = [
    'V02S2UBSfNlvEprMOn70qP3jHPDqiZU00a7ef4a800341c7c3b',
    'V02StVuaNcoKrZ3BuvJQ1FcFS_xnG2k00af250d4002664c02f',
    'V02SWIvKWYijG6Rggo4m0xvDKj1m7ew00a8e26d3002508b828',
    'V02Sr3nJ9IicoHWfeyQLiXgvrRpje6E00a240b890023270f97',
    'V02SBsNOf4sJZNFo4jOHdgHg7-2Tn1s00a338776000b669579',
    'V02SfEpW1yy4wUUh_eEnEHpiJJuoDnE00ae12710000179aa7f',
    'V02S2oI49T-Jp0_zJKZ5U38dIUSIl8Q00aa679530026780e96',
    'V02ShotJqqiWyubCX0VWTlcbgcHqtSQ00a45564e002678124c',
    'V02SFiqdXRGnH5oAV2FmDDulZyGDL3M00a61660c0026781be1',
    'V02S7tldy5ltYcikCzJ8PJQDSy_ElEs00a327c3c0026782526',
    'V02SPoOluAnWda0dTBYTXpdetS97tyI00a16135e002684bb5c',
    'V02Sb8gxW2inr6IDYrdHK_ywJnayd6s00ab7472b0026849b17',
    'V02SwV15KQ_8n6brU98_2kLnnFUDUOw00adf3fda0026934a7f',
    'V02SC1mOHS0RiUBxeoA8NTliH2h2NGc00a803c35002693584d'
  ]
  $.invites = []
  $.log('', `开始邀请(间隔 ${$.CFG_inviteWaitTime} 毫秒): `)
  for (let sidIdx = 0; sidIdx < sids.length; sidIdx++) {
    await new Promise((resove) => {
      const body = `invite_userid=${$.userinfo.data.userid}`
      const url = { url: 'http://zt.wps.cn/2018/clock_in/api/invite', body, headers: { sid: sids[sidIdx] } }
      $.post(url, (error, response, data) => {
        try {
          if (error) throw new Error(error)
          const _data = JSON.parse(data)
          const _invite = { _raw: _data, inviteIdx: sidIdx, isSuc: _data.result === 'ok' }
          $.invites.push(_invite)
          $.log(`   邀请第 ${_invite.inviteIdx + 1} 个用户: ${_invite.isSuc ? '成功!' : '失败!'}`)
        } catch (e) {
          $.log(`❗️ ${$.name}, 执行失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
        } finally {
          resove()
        }
      })
    })
    await $.wait($.CFG_inviteWaitTime)
  }
}

function showmsg() {
  return new Promise((resove) => {
    $.subt = ''
    $.desc = []
    if (/ok/.test($.signapp.result)) {
      $.subt = '签到: 成功'
    } else if (/error/.test($.signapp.result) && /recheckin/.test($.signapp.msg)) {
      $.subt = '签到: 重复'
    } else {
      $.subt = '签到: 失败'
    }
    if ($.signinfo && $.homeinfo.data[0]) {
      const current = $.homeinfo.data[0]
      $.desc.push(`连签: ${$.signinfo.data.max_days}天, 本期: ${current.end_date} (第${current.id}期)`)
      $.desc.push('查看签到详情', '')
    }
    if ($.signwx) {
      $.subt += ', '
      if ($.signwx.isSuc && !$.signwx.isRepeat) $.subt += `打卡: 成功`
      else if ($.signwx.isSuc && $.signwx.isRepeat) $.subt += `打卡: 重复`
      else if (!$.signwx.isSuc && $.signwx.isSignupNeed && $.signupwx.isSuc) $.subt += `打卡: 报名成功`
      else if (!$.signwx.isSuc && $.signwx.isSignupNeed && !$.signupwx.isSuc) $.subt += `打卡: 报名失败`
      else $.subt += `打卡: 失败`
      $.desc.push(`打卡: ${$.signwx.msg}`)
      if ($.signwx.isSignupNeed) {
        $.desc.push(`报名: ${$.signupwx.isSuc ? '成功' : `失败! 原因: ${$.signupwx.msg}`}`)
      }
      $.desc.push(`问题: ${$.question.title}`)
      $.desc.push(`答案: ${$.answer.optionIdx + 1}.${$.question.options[$.answer.optionIdx]}`)
    }
    if ($.invites) {
      const invitedCnt = $.invites.filter((invite) => invite.isSuc).length
      const inviteCnt = $.invites.length
      $.subt += ', 邀请: '
      $.subt += `${invitedCnt}/${inviteCnt}`
    }
    if ($.signreward && $.signreward.data) {
      const maxdays = $.signinfo.data.max_days
      let curDays = 0
      $.signreward.data.forEach((r) => {
        const rstatus = r.status == 'unreceived' ? '[未领]' : '[已领]'
        const limit_days = parseInt(r.limit_days)
        const daysstatus = maxdays >= limit_days ? '✅' : '❕'
        if (curDays < limit_days) {
          curDays = limit_days
          $.desc.push('', `${daysstatus} 连签${limit_days}天: `)
        }
        $.desc.push(`   ${rstatus} ${r.reward_name}`)
      })
    }
    $.msg($.name, $.subt, $.desc.join('\n'))
    resove()
  })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
