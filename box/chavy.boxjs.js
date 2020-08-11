const $ = new Env('BoxJs')

$.version = '0.7.4'
$.versionType = 'beta'

// 存储`用户偏好`
$.KEY_usercfgs = 'chavy_boxjs_userCfgs'
// 存储`应用会话`
$.KEY_sessions = 'chavy_boxjs_sessions'
// 存储`页面缓存`
$.KEY_web_cache = 'chavy_boxjs_web_cache'
// 存储`应用订阅缓存`
$.KEY_app_subCaches = 'chavy_boxjs_app_subCaches'
// 存储`全局备份`
$.KEY_globalBaks = 'chavy_boxjs_globalBaks'
// 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
$.KEY_cursessions = 'chavy_boxjs_cur_sessions'

// 请求响应体 (返回至页面的结果)
$.json = $.name // `接口`类请求的响应体
$.html = $.name // `页面`类请求的响应体

$.web = `https://cdn.jsdelivr.net/gh/chavyleung/scripts@${$.version}/box/chavy.boxjs.html`
// $.web = `http://192.168.50.109:8080/box/chavy.boxjs.html?_=${new Date().getTime()}`
// $.web = `http://192.168.8.112:8080/box/chavy.boxjs.html?_=${new Date().getTime()}`

!(async () => {
  // 勿扰模式
  $.isMute = [true, 'true'].includes($.getdata('@chavy_boxjs_userCfgs.isMute'))

  // 请求路径
  $.path = getPath($request.url)

  // 请求类型: GET
  $.isGet = $request.method === 'GET'
  // 请求类型: POST
  $.isPost = $request.method === 'POST'

  // 请求类型: page、api、query
  $.type = 'page'
  // 查询请求: /query/xxx
  $.isQuery = $.isGet && /^\/query\/.*?/.test($.path)
  // 接口请求: /api/xxx
  $.isApi = $.isPost && /^\/api\/.*?/.test($.path)
  // 页面请求: /xxx
  $.isPage = $.isGet && !$.isQuery && !$.isApi

  // 升级用户数据
  upgradeUserData()

  // 处理`页面`请求
  if ($.isPage) {
    $.type = 'page'
    await handlePage()
  }
  // 处理`查询`请求
  else if ($.isQuery) {
    $.type = 'query'
    await handleQuery()
  }
  // 处理`接口`请求
  else if ($.isApi) {
    $.type = 'api'
    await handleApi()
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => doneBox())

/**
 * http://boxjs.com/ => ``
 * http://boxjs.com/api/getdata => `/api/getdata`
 */
function getPath(url) {
  // 如果以`/`结尾, 先去掉最后一个`/`
  const fullpath = /\/$/.test(url) ? url.replace(/\/$/, '') : url
  const domain = getDomain(url)
  return new RegExp(domain).test(url) ? fullpath.split(domain)[1] : undefined
}

/**
 * http://boxjs.com/ => `boxjs.com`
 * http://127.0.0.1:9999/ => `127.0.0.1:9999`
 */
function getDomain(url) {
  const [, domain] = /https?:\/\/(.*?)\/.*/.exec(url)
  return domain
}

/**
 * ===================================
 * 处理前端请求
 * ===================================
 */

/**
 * 处理`页面`请求
 */
async function handlePage() {
  const cache = $.getjson($.KEY_web_cache, null)
  if (cache && cache.version === $.version) {
    $.html = cache.cache
  } else {
    await $.http.get($.web).then(
      (resp) => {
        if (/<title>BoxJs<\/title>/.test(resp.body)) {
          $.html = resp.body
          const cache = { version: $.version, cache: $.html }
          $.setjson(cache, $.KEY_web_cache)
        } else {
          $.html = $.getjson($.KEY_web_cache).cache
        }
      },
      () => ($.html = $.getjson($.KEY_web_cache).cache)
    )
  }
}

/**
 * 处理`查询`请求
 */
async function handleQuery() {
  const [, query] = $.path.split('/query')
  if (/^\/boxdata/.test(query)) {
    $.json = getBoxData()
  } else if (/^\/baks/.test(query)) {
    const globalbaks = getGlobalBaks(true)
    $.json = { globalbaks }
  }
}

/**
 * 处理 API 请求
 */
async function handleApi() {
  const [, api] = $.path.split('/api')

  if (api === '/save') {
    await apiSave()
  } else if (api === '/addAppSub') {
    await apiAddAppSub()
  } else if (api === '/reloadAppSub') {
    await apiReloadAppSub()
  } else if (api === '/delGlobalBak') {
    await apiDelGlobalBak()
  } else if (api === '/updateGlobalBak') {
    await apiUpdateGlobalBak()
  } else if (api === '/saveGlobalBak') {
    await apiSaveGlobalBak()
  } else if (api === '/impGlobalBak') {
    await apiImpGlobalBak()
  } else if (api === '/revertGlobalBak') {
    await apiRevertGlobalBak()
  } else if (api === '/runScript') {
    await apiRunScript()
  }
}

/**
 * ===================================
 * 获取基础数据
 * ===================================
 */

function getBoxData() {
  const datas = {}
  const usercfgs = getUserCfgs()
  const sessions = getAppSessions()
  const curSessions = getCurSessions()
  const sysapps = getSystemApps()
  const syscfgs = getSystemCfgs()
  const appSubCaches = getAppSubCaches()
  const globalbaks = getGlobalBaks()

  // 把 `内置应用`和`订阅应用` 里需要持久化属性放到`datas`
  sysapps.forEach((app) => Object.assign(datas, getAppDatas(app)))
  usercfgs.appsubs.forEach((sub) => {
    const subcache = appSubCaches[sub.url]
    if (subcache && subcache.apps) {
      subcache.apps.forEach((app) => Object.assign(datas, getAppDatas(app)))
    }
  })

  const box = { datas, usercfgs, sessions, curSessions, sysapps, syscfgs, appSubCaches, globalbaks }
  return box
}

/**
 * 获取系统配置
 */
function getSystemCfgs() {
  // prettier-ignore
  return {
    env: $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isSurge() ? 'Surge' : 'Node',
    version: $.version,
    versionType: $.versionType,
    envs: [
      { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/task/master/surge.png'] },
      { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/task/master/quantumultx.png'] },
      { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/task/master/loon.png'] }
    ],
    chavy: { id: 'ChavyLeung', icon: 'https://avatars3.githubusercontent.com/u/29748519', repo: 'https://github.com/chavyleung/scripts' },
    senku: { id: 'GideonSenku', icon: 'https://avatars1.githubusercontent.com/u/39037656', repo: 'https://github.com/GideonSenku' },
    orz3: { id: 'Orz-3', icon: 'https://raw.githubusercontent.com/Orz-3/task/master/Orz-3.png', repo: 'https://github.com/Orz-3/' },
    boxjs: { id: 'BoxJs', show: false, icon: 'https://raw.githubusercontent.com/Orz-3/task/master/box.png', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/box.png', 'https://raw.githubusercontent.com/Orz-3/task/master/box.png'], repo: 'https://github.com/chavyleung/scripts' },
    defaultIcons: ['https://raw.githubusercontent.com/Orz-3/mini/master/appstore.png', 'https://raw.githubusercontent.com/Orz-3/task/master/appstore.png'],
    scontributors: []
  }
}

/**
 * 获取内置应用
 */
function getSystemApps() {
  // prettier-ignore
  const sysapps = [
    {
      id: 'BoxSetting',
      name: '偏好设置',
      descs: ['可设置 http-api 地址 & 超时时间 (Surge TF)', '可设置明暗两种主题下的主色调'],
      keys: ['@chavy_boxjs_userCfgs.httpapi', '@chavy_boxjs_userCfgs.color_dark_primary', '@chavy_boxjs_userCfgs.color_light_primary'],
      settings: [
        { id: '@chavy_boxjs_userCfgs.httpapis', name: 'HTTP-API (Surge TF)', val: '', type: 'textarea', placeholder: ',examplekey@127.0.0.1:6166', autoGrow: true, rows: 2, desc: '示例: ,examplekey@127.0.0.1:6166! 注意: 以逗号开头, 逗号分隔多个地址, 可加回车' },
        { id: '@chavy_boxjs_userCfgs.httpapi_timeout', name: 'HTTP-API Timeout (Surge TF)', val: 20, type: 'number', desc: '如果脚本作者指定了超时时间, 会优先使用脚本指定的超时时间.' },
        { id: '@chavy_boxjs_userCfgs.color_light_primary', name: '明亮色调', canvas: true, val: '#F7BB0E', type: 'colorpicker', desc: '' },
        { id: '@chavy_boxjs_userCfgs.color_dark_primary', name: '暗黑色调', canvas: true, val: '#2196F3', type: 'colorpicker', desc: '' }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: ['https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.mini.png', 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.png']
    },
    {
      id: 'BoxSwitcher',
      name: '会话切换',
      desc: '打开静默运行后, 切换会话将不再发出系统通知 \n注: 不影响日志记录',
      keys: [],
      settings: [{ id: 'CFG_BoxSwitcher_isSilent', name: '静默运行', val: false, type: 'boolean', desc: '切换会话时不发出系统通知!' }],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: ['https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.mini.png', 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.png'],
      script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/switcher/box.switcher.js'
    }
  ]
  return sysapps
}

/**
 * 获取用户配置
 */
function getUserCfgs() {
  const defcfgs = { favapps: [], appsubs: [], httpapi: 'examplekey@127.0.0.1:6166' }
  const usercfgs = Object.assign(defcfgs, $.getjson($.KEY_usercfgs, {}))
  return usercfgs
}

/**
 * 获取`应用订阅`缓存
 */
function getAppSubCaches() {
  return $.getjson($.KEY_app_subCaches, {})
}

/**
 * 获取全局备份
 */
function getGlobalBaks(isComplete = false) {
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  if (isComplete) {
    return globalbaks
  } else {
    globalbaks.forEach((bak) => delete bak.bak)
    return globalbaks
  }
}

/**
 * 获取用户应用
 */
function getUserApps() {
  // TODO 用户可在 BoxJs 中自定义应用, 格式与应用订阅一致
  return []
}

/**
 * 获取应用会话
 */
function getAppSessions() {
  return $.getjson($.KEY_sessions, [])
}

/**
 * 获取当前切换到哪个会话
 */
function getCurSessions() {
  return $.getjson($.KEY_cursessions, {})
}

/**
 * ===================================
 * 接口类函数
 * ===================================
 */

function getAppDatas(app) {
  const datas = {}
  const nulls = [null, undefined, 'null', 'undefined']
  if (app.keys && Array.isArray(app.keys)) {
    app.keys.forEach((key) => {
      const val = $.getdata(key)
      datas[key] = nulls.includes(val) ? null : val
    })
  }
  if (app.settings && Array.isArray(app.settings)) {
    app.settings.forEach((setting) => {
      const key = setting.id
      const val = $.getdata(key)
      datas[key] = nulls.includes(val) ? null : val
    })
  }
  return datas
}

async function apiSave() {
  const data = $.toObj($request.body)
  if (Array.isArray(data)) {
    data.forEach((dat) => $.setdata(dat.val, dat.key))
  } else {
    $.setdata(data.val, data.key)
  }
  $.json = getBoxData()
}

async function apiAddAppSub() {
  const sub = $.toObj($request.body)
  // 添加订阅
  const usercfgs = getUserCfgs()
  usercfgs.appsubs.push(sub)
  $.setjson(usercfgs, $.KEY_usercfgs)
  // 加载订阅缓存
  await reloadAppSubCache(sub.url)
  $.json = getBoxData()
}

async function apiReloadAppSub() {
  const sub = $.toObj($request.body)
  if (sub) {
    await reloadAppSubCache(sub.url)
  } else {
    await reloadAppSubCaches()
  }
  $.json = getBoxData()
}

async function apiDelGlobalBak() {
  const bak = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bakIdx = globalbaks.findIndex((b) => b.id === bak.id)
  if (bakIdx > -1) {
    globalbaks.splice(bakIdx, 1)
    $.setjson(globalbaks, $.KEY_globalBaks)
  }
  $.json = getBoxData()
}

async function apiUpdateGlobalBak() {
  const { id: bakId, name: bakName } = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = globalbaks.find((b) => b.id === bakId)
  if (bak) {
    bak.name = bakName
    $.setjson(globalbaks, $.KEY_globalBaks)
  }
  $.json = { globalbaks }
}

async function apiRevertGlobalBak() {
  const { id: bakId } = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = globalbaks.find((b) => b.id === bakId)
  if (bak && bak.bak) {
    const {
      chavy_boxjs_sysCfgs,
      chavy_boxjs_sysApps,
      chavy_boxjs_sessions,
      chavy_boxjs_userCfgs,
      chavy_boxjs_cur_sessions,
      chavy_boxjs_app_subCaches,
      ...datas
    } = bak.bak
    $.setdata(JSON.stringify(chavy_boxjs_sessions), $.KEY_sessions)
    $.setdata(JSON.stringify(chavy_boxjs_userCfgs), $.KEY_usercfgs)
    $.setdata(JSON.stringify(chavy_boxjs_cur_sessions), $.KEY_cursessions)
    $.setdata(JSON.stringify(chavy_boxjs_app_subCaches), $.KEY_app_subCaches)
    const isNull = (val) => [undefined, null, 'null', 'undefined', ''].includes(val)
    Object.keys(datas).forEach((datkey) => $.setdata(isNull(datas[datkey]) ? '' : `${datas[datkey]}`, datkey))
  }
  const boxdata = getBoxData()
  boxdata.globalbaks = globalbaks
  $.json = boxdata
}

async function apiSaveGlobalBak() {
  let globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = $.toObj($request.body)
  const box = getBoxData()
  const bakdata = {}
  bakdata['chavy_boxjs_userCfgs'] = box.usercfgs
  bakdata['chavy_boxjs_sessions'] = box.sessions
  bakdata['chavy_boxjs_cur_sessions'] = box.curSessions
  bakdata['chavy_boxjs_app_subCaches'] = box.appSubCaches
  Object.assign(bakdata, box.datas)
  bak.bak = bakdata
  globalbaks.push(bak)
  if (!$.setjson(globalbaks, $.KEY_globalBaks)) {
    globalbaks = $.getjson($.KEY_globalBaks, [])
  }
  $.json = { globalbaks }
}

async function apiImpGlobalBak() {
  let globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = $.toObj($request.body)
  globalbaks.push(bak)
  $.setjson(globalbaks, $.KEY_globalBaks)
  $.json = { globalbaks }
}

async function apiRunScript() {
  const opts = $.toObj($request.body)
  const httpapi = $.getdata('@chavy_boxjs_userCfgs.httpapi')
  const ishttpapi = /.*?@.*?:[0-9]+/.test(httpapi)
  if ($.isSurge() && ishttpapi) {
    const runOpts = { timeout: opts.timeout }
    await $.getScript(opts.url).then((script) => $.runScript(script, runOpts))
  } else {
    await $.getScript(opts.url).then((script) => {
      // 避免被执行脚本误认为是 rewrite 环境
      // 所以需要 `$request = undefined`
      $request = undefined
      eval(script)
    })
  }
}

/**
 * ===================================
 * 工具类函数
 * ===================================
 */

function reloadAppSubCache(url) {
  return $.http.get(url).then((resp) => {
    try {
      const subcaches = getAppSubCaches()
      subcaches[url] = $.toObj(resp.body)
      subcaches[url].updateTime = new Date()
      $.setjson(subcaches, $.KEY_app_subCaches)
      $.log(`更新订阅, 成功! ${url}`)
    } catch (e) {
      $.logErr(e)
      $.log(`更新订阅, 失败! ${url}`)
    }
  })
}

async function reloadAppSubCaches() {
  $.msg($.name, '更新订阅: 开始!')
  const reloadActs = []
  const usercfgs = getUserCfgs()
  usercfgs.appsubs.forEach((sub) => {
    reloadActs.push(reloadAppSubCache(sub.url))
  })
  await Promise.all(reloadActs)
  $.log(`全部订阅, 完成!`)
  const endTime = new Date().getTime()
  const costTime = (endTime - $.startTime) / 1000
  $.msg($.name, `更新订阅: 完成! 🕛 ${costTime} 秒`)
}

function upgradeUserData() {
  const usercfgs = getUserCfgs()
  // 如果存在`usercfgs.appsubCaches`则需要升级数据
  const isNeedUpgrade = !!usercfgs.appsubCaches
  if (isNeedUpgrade) {
    // 迁移订阅缓存至独立的持久化空间
    $.setjson(usercfgs.appsubCaches, $.KEY_app_subCaches)
    // 移除用户偏好中的订阅缓存
    delete usercfgs.appsubCaches
    usercfgs.appsubs.forEach((sub) => {
      delete sub._raw
      delete sub.apps
      delete sub.isErr
      delete sub.updateTime
    })
  }
  if (isNeedUpgrade) {
    $.setjson(usercfgs, $.KEY_usercfgs)
  }
}

/**
 * ===================================
 * 结束类函数
 * ===================================
 */
function doneBox() {
  if ($.isPage) donePage()
  else if ($.isQuery) doneQuery()
  else if ($.isApi) doneApi()
  else $.done()
}

function donePage() {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/html;charset=UTF-8' }
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.html } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.html })
  }
}

function doneQuery() {
  $.json = $.toStr($.json)
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/json; charset=utf-8' }
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.json } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  }
}

function doneApi() {
  $.json = $.toStr($.json)
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/json; charset=utf-8' }
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.json } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  }
}

// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,o)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};this.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)));let a=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];a.push(s),e&&a.push(e),i&&a.push(i),console.log(a.join("\n")),this.logs=this.logs.concat(a)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
