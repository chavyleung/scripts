/**
 *
 * hostname = app.17u.cn
 *
 * # Surge
 * http-request ^https:\/\/app\.17u\.cn\/welfarecenter\/index\/signIndex script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js, tag=同程旅行
 * cron "5 12 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js, timeout=300, tag=同程旅行-签到
 *
 * # QuanX
 * ^https:\/\/app\.17u\.cn\/welfarecenter\/index\/signIndex url script-request-header https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js
 * 5 12 * * * https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js, tag=同程旅行-签到
 *
 * # Loon
 * http-request ^https:\/\/app\.17u\.cn\/welfarecenter\/index\/signIndex script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js, tag=同程旅行
 * cron "5 12 * * *" script-path=https://raw.githubusercontent.com/chavyleung/scripts/master/tongcheng-trip/tongcheng-trip.js, timeout=300, tag=同程旅行-签到
 *
 * # 获取方式: 打开同程旅行 APP → 领福利，命中 signIndex 请求后自动保存请求头（含 phone、apptoken、device）
 */


const $ = new Env('同程旅行')
const BASE_URL = 'https://app.17u.cn/welfarecenter'
const KEY_SIGNHEADER = 'tongcheng_trip_signheader'

function getTodayDate() {
  return $.time('yyyy-MM-dd')
}

function postApi(path, body, headers) {
  return new Promise((resolve) => {
    const opts = {
      url: path.startsWith('http') ? path : BASE_URL + path,
      headers: { ...headers, 'content-type': 'application/json' },
      body: typeof body === 'object' ? JSON.stringify(body || {}) : body || '{}'
    }
    $.post(opts, (err, resp, data) => {
      try {
        resolve(data ? JSON.parse(data) : null)
      } catch (e) {
        $.logErr(e, data)
        resolve(null)
      }
    })
  })
}

function signIndex() {
  return new Promise((resolve) => {
    const signheaderVal = $.getdata(KEY_SIGNHEADER)
    if (!signheaderVal) {
      $.log('未获取到 Cookie，请先通过 MiTM 获取：在 APP 打开「领福利」→ 点击签到')
      $.msg($.name, '', '请先配置抓包脚本，在 APP 领福利页点击签到以获取 Cookie')
      resolve(null)
      return
    }
    $.headers = JSON.parse(signheaderVal)
    $.phone = $.headers.phone || $.headers.Phone || '当前账号'
    postApi('/index/signIndex', {}, $.headers).then((data) => resolve(data))
  })
}

function doSignIn() {
  return new Promise((resolve) => {
    const todayDate = getTodayDate()
    postApi('/index/sign', { type: 1, day: todayDate }, $.headers).then((data) => resolve(data))
  })
}

function getTaskList() {
  return new Promise((resolve) => {
    postApi('/task/taskList?version=11.0.7', {}, $.headers).then((data) => resolve(data))
  })
}

function taskStart(taskCode) {
  return new Promise((resolve) => {
    postApi('/task/start', { taskCode }, $.headers).then((data) => resolve(data))
  })
}

function taskFinish(taskId) {
  return new Promise((resolve) => {
    postApi('/task/finish', { id: taskId }, $.headers).then((data) => resolve(data))
  })
}

function taskReceive(taskId) {
  return new Promise((resolve) => {
    postApi('/task/receive', { id: taskId }, $.headers).then((data) => resolve(data))
  })
}

async function runSignIn() {
  $.accountResult = ''
  $.signSuccess = false
  $.tokenInvalid = false

  const signIndexRes = await signIndex()
  if (!signIndexRes) return
  if (signIndexRes.code !== 2200) {
    $.log(`用户【${$.phone}】 - token 失效了，请重新在 APP 领福利页点击签到以更新`)
    $.tokenInvalid = true
    $.accountResult = `📱 账号：${$.phone}\n❌ token 失效，请重新抓包获取\n\n`
    $.msg('✈️ 同程旅行签到结果\n⚠️ Token 失效', '', $.accountResult)
    return
  }

  const todaySign = signIndexRes.data?.todaySign
  const mileage = signIndexRes.data?.mileageBalance?.mileage ?? 0
  $.log(`用户【${$.phone}】 - 今日${todaySign ? '已' : '未'}签到，当前剩余里程 ${mileage}！`)

  if (todaySign) {
    $.log(`用户【${$.phone}】 - 今日已签到，开始获取任务列表`)
    $.signSuccess = true
  } else {
    $.log(`用户【${$.phone}】 - 今日未签到，开始执行签到`)
    const signRes = await doSignIn()
    if (signRes && signRes.code === 2200) {
      $.log(`用户【${$.phone}】 - 签到成功！`)
      $.signSuccess = true
    } else {
      $.log(`用户【${$.phone}】 - 签到失败！${signRes?.message || '未知错误'}`)
    }
  }

  const taskListRes = await getTaskList()
  if (taskListRes && taskListRes.code === 2200 && Array.isArray(taskListRes.data)) {
    const tasks = taskListRes.data.filter((t) => t.state === 1 && t.browserTime !== 0)
    for (const task of tasks) {
      const { taskCode, title, browserTime } = task
      $.log(`用户【${$.phone}】 - 开始做任务【${title}】，需要浏览 ${browserTime} 秒`)
      const startRes = await taskStart(taskCode)
      if (startRes && startRes.code === 2200 && startRes.data) {
        const taskId = startRes.data
        await $.wait(browserTime * 1000)
        let finishOk = false
        for (let attempt = 0; attempt < 3; attempt++) {
          const finishRes = await taskFinish(taskId)
          if (finishRes && finishRes.code === 2200) {
            $.log(`用户【${$.phone}】 - 完成任务【${taskId}】成功！开始领取奖励`)
            finishOk = true
            break
          }
          if (attempt < 2) {
            $.log(`用户【${$.phone}】 - 完成任务【${taskId}】失败，第 ${attempt + 1} 次重试...`)
            await $.wait(2000 * (attempt + 1))
          }
        }
        if (finishOk) {
          await taskReceive(taskId)
          $.log(`用户【${$.phone}】 - 领取签到奖励成功！开始下一个任务`)
        }
      }
    }
  }

  const mileageRes = await postApi('/index/signIndex', {}, $.headers)
  if (mileageRes && mileageRes.code === 2200 && mileageRes.data) {
    const d = mileageRes.data
    const cycleSignNum = d.cycleSighNum
    const mileage2 = d.mileageBalance?.mileage ?? 0
    const todayMileage = d.mileageBalance?.todayMileage ?? 0
    $.log(`用户【${$.phone}】 - 本月签到 ${cycleSignNum} 天，今日共获取 ${todayMileage} 里程，当前剩余里程 ${mileage2}`)
    const statusIcon = $.signSuccess ? '✨️' : '❗️'
    const resultText = $.signSuccess
      ? `${statusIcon} 签到成功，本月签到【${cycleSignNum}】天`
      : `${statusIcon} 签到暂不可用，请前往 APP 手动签到！\n🈷️ 本月签到【${cycleSignNum}】天`
    $.accountResult = `📱 账号：${$.phone}\n${resultText}\n🎁 当前里程: 【${mileage2}】(+${todayMileage})\n\n`
  } else {
    $.accountResult = `📱 账号：${$.phone}\n`
    if ($.signSuccess) $.accountResult += '✅ 签到成功（但获取里程信息失败）\n\n'
    else $.accountResult += '❌ 签到失败且获取里程信息失败\n\n'
  }

  let title = '✈️ 同程旅行签到结果\n'
  if ($.tokenInvalid) title += ' ⚠️ Token 失效'
  $.msg(title, '', $.accountResult.trim())
}

// 入口：MiTM 时保存 Cookie，否则执行签到
const isMitmRequest =
  typeof $request !== 'undefined' &&
  $request &&
  typeof $request.url === 'string' &&
  /\/welfarecenter\/index\/signIndex/.test($request.url) &&
  $request.headers
if (isMitmRequest) {
  if ($request.method !== 'OPTIONS') {
    $.setdata(JSON.stringify($request.headers), KEY_SIGNHEADER)
    $.msg($.name, '获取同程旅行账户成功', '请运行签到脚本')
    $.done()
  } else {
    $.log('获取同程旅行账户失败')
    $.done()
  }
} else {
  !(async () => {
    await runSignIn()
  })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
}


function Env(e,t){class s{constructor(e){this.env=e}send(e,t="GET"){e="string"==typeof e?{url:e}:e;let s=this.get;"POST"===t&&(s=this.post);const i=new Promise(((t,i)=>{s.call(this,e,((e,s,o)=>{e?i(e):t(s)}))}));return e.timeout?((e,t=1e3)=>Promise.race([e,new Promise(((e,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),t)}))]))(i,e.timeout):i}get(e){return this.send.call(this.env,e)}post(e){return this.send.call(this.env,e,"POST")}}return new class{constructor(e,t){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=e,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,t),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(e,t=null){try{return JSON.parse(e)}catch{return t}}toStr(e,t=null,...s){try{return JSON.stringify(e,...s)}catch{return t}}getjson(e,t){let s=t;if(this.getdata(e))try{s=JSON.parse(this.getdata(e))}catch{}return s}setjson(e,t){try{return this.setdata(JSON.stringify(e),t)}catch{return!1}}getScript(e){return new Promise((t=>{this.get({url:e},((e,s,i)=>t(i)))}))}runScript(e,t){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=t&&t.timeout?t.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:e,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((e,t,i)=>s(i)))})).catch((e=>this.logErr(e)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t);if(!s&&!i)return{};{const i=s?e:t;try{return JSON.parse(this.fs.readFileSync(i))}catch(e){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):i?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s){const i=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of i)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e||(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce(((e,s,i)=>Object(e[s])===e[s]?e[s]:e[s]=Math.abs(t[i+1])>>0==+t[i+1]?[]:{}),e)[t[t.length-1]]=s),e}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,i,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(a);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),i)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(e,t);return s}getval(e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(e);case"Quantumult X":return $prefs.valueForKey(e);case"Node.js":return this.data=this.loaddata(),this.data[e];default:return this.data&&this.data[e]||null}}setval(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(e,t);case"Quantumult X":return $prefs.setValueForKey(e,t);case"Node.js":return this.data=this.loaddata(),this.data[t]=e,this.writedata(),!0;default:return this.data&&this.data[t]||null}}initGotEnv(e){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,e&&(e.headers=e.headers?e.headers:{},e&&(e.headers=e.headers?e.headers:{},void 0===e.headers.cookie&&void 0===e.headers.Cookie&&void 0===e.cookieJar&&(e.cookieJar=this.ckjar)))}get(e,t=(()=>{})){switch(e.headers&&(delete e.headers["Content-Type"],delete e.headers["Content-Length"],delete e.headers["content-type"],delete e.headers["content-length"]),e.params&&(e.url+="?"+this.queryStr(e.params)),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(e),this.got(e).on("redirect",((e,t)=>{try{if(e.headers["set-cookie"]){const s=e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),t.cookieJar=this.ckjar}}catch(e){this.logErr(e)}})).then((e=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=e,n=s.decode(a,this.encoding);t(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:i,response:o}=e;t(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(e,t=(()=>{})){const s=e.method?e.method.toLocaleLowerCase():"post";switch(e.body&&e.headers&&!e.headers["Content-Type"]&&!e.headers["content-type"]&&(e.headers["content-type"]="application/x-www-form-urlencoded"),e.headers&&(delete e.headers["Content-Length"],delete e.headers["content-length"]),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":e.method=s,this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(e);const{url:o,...r}=e;this.got[s](o,r).then((e=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=e,n=i.decode(a,this.encoding);t(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:s,response:o}=e;t(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(e,t=null){const s=t?new Date(t):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in i)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?i[t]:("00"+i[t]).substr((""+i[t]).length)));return e}queryStr(e){let t="";for(const s in e){let i=e[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),t+=`${s}=${i}&`)}return t=t.substring(0,t.length-1),t}msg(t=e,s="",i="",o={}){const r=e=>{const{$open:t,$copy:s,$media:i,$mediaMime:o}=e;switch(typeof e){case void 0:return e;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:e};case"Loon":case"Shadowrocket":return e;case"Quantumult X":return{"open-url":e};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=e.openUrl||e.url||e["open-url"]||t;a&&Object.assign(r,{action:"open-url",url:a});let n=e["update-pasteboard"]||e.updatePasteboard||s;n&&Object.assign(r,{action:"clipboard",text:n});let h=e.mediaUrl||e["media-url"]||i;if(h){let e,t;if(h.startsWith("http"));else if(h.startsWith("data:")){const[s]=h.split(";"),[,i]=h.split(",");e=i,t=s.replace("data:","")}else{e=h,t=(e=>{const t={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in t)if(0===e.indexOf(s))return t[s];return null})(h)}Object.assign(r,{"media-url":h,"media-base64":e,"media-base64-mime":o??t})}return Object.assign(r,{"auto-dismiss":e["auto-dismiss"],sound:e.sound}),r}case"Loon":{const s={};let o=e.openUrl||e.url||e["open-url"]||t;o&&Object.assign(s,{openUrl:o});let r=e.mediaUrl||e["media-url"]||i;return r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=e["open-url"]||e.url||e.openUrl||t;r&&Object.assign(o,{"open-url":r});let a=e.mediaUrl||e["media-url"]||i;a&&Object.assign(o,{"media-url":a});let n=e["update-pasteboard"]||e.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(t,s,i,r(o));break;case"Quantumult X":$notify(t,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let e=["","==============📣系统通知📣=============="];e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n")),this.logs=this.logs.concat(e)}}debug(...e){this.logLevels[this.logLevel]<=this.logLevels.debug&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.debug}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}info(...e){this.logLevels[this.logLevel]<=this.logLevels.info&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.info}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}warn(...e){this.logLevels[this.logLevel]<=this.logLevels.warn&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.warn}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}error(...e){this.logLevels[this.logLevel]<=this.logLevels.error&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.error}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.map((e=>e??String(e))).join(this.logSeparator))}logErr(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t,e);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t,void 0!==e.message?e.message:e,e.stack);break}}wait(e){return new Promise((t=>setTimeout(t,e)))}done(e={}){const t=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${t} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(e);break;case"Node.js":process.exit(1)}}}(e,t)}