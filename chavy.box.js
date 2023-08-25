const $ = new Env('BoxJs')

// 为 eval 准备的上下文环境
const $eval_env = {}

$.version = '0.12.12'
$.versionType = 'beta'

// 发出的请求需要需要 Surge、QuanX 的 rewrite
$.isNeedRewrite = true

/**
 * ===================================
 * 持久化属性: BoxJs 自有的数据结构
 * ===================================
 */

// 存储`用户偏好`
$.KEY_usercfgs = 'chavy_boxjs_userCfgs'
// 存储`应用会话`
$.KEY_sessions = 'chavy_boxjs_sessions'
// 存储`页面缓存`
$.KEY_web_cache = 'chavy_boxjs_web_cache'
// 存储`应用订阅缓存`
$.KEY_app_subCaches = 'chavy_boxjs_app_subCaches'
// 存储`全局备份` (弃用, 改用 `chavy_boxjs_backups`)
$.KEY_globalBaks = 'chavy_boxjs_globalBaks'
// 存储`备份索引`
$.KEY_backups = 'chavy_boxjs_backups'
// 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
$.KEY_cursessions = 'chavy_boxjs_cur_sessions'

/**
 * ===================================
 * 持久化属性: BoxJs 公开的数据结构
 * ===================================
 */

// 存储用户访问`BoxJs`时使用的域名
$.KEY_boxjs_host = 'boxjs_host'

// 请求响应体 (返回至页面的结果)
$.json = $.name // `接口`类请求的响应体
$.html = $.name // `页面`类请求的响应体

// 页面源码地址
$.web = `https://cdn.jsdelivr.net/gh/chavyleung/scripts@${
  $.version
}/box/chavy.boxjs.html?_=${new Date().getTime()}`
// 版本说明地址 (Release Note)
$.ver = `https://raw.githubusercontent.com/chavyleung/scripts/master/box/release/box.release.json`

!(async () => {
  // 勿扰模式
  $.isMute = [true, 'true'].includes($.getdata('@chavy_boxjs_userCfgs.isMute'))

  // 请求路径
  $.path = getPath($request.url)

  // 请求参数 /api/save?id=xx&name=xx => {id: 'xx', name: 'xx'}
  const [, query] = $.path.split('?')
  $.queries = query
    ? query.split('&').reduce((obj, cur) => {
        const [key, val] = cur.split('=')
        obj[key] = val
        return obj
      }, {})
    : {}

  // 请求类型: GET
  $.isGet = $request.method === 'GET'
  // 请求类型: POST
  $.isPost = $request.method === 'POST'
  // 请求类型: OPTIONS
  $.isOptions = $request.method === 'OPTIONS'

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
  // 升级备份数据
  upgradeGlobalBaks()

  // 处理预检请求
  if ($.isOptions) {
    $.type = 'options'
    await handleOptions()
  }
  // 处理`页面`请求
  else if ($.isPage) {
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
 * http://boxjs.com/ => `http://boxjs.com`
 * http://boxjs.com/app/jd => `http://boxjs.com`
 */
function getHost(url) {
  return url.slice(0, url.indexOf('/', 8))
}

/**
 * http://boxjs.com/ => ``
 * http://boxjs.com/api/getdata => `/api/getdata`
 */
function getPath(url) {
  // 如果以`/`结尾, 去掉最后一个`/`
  const end = url.lastIndexOf('/') === url.length - 1 ? -1 : undefined
  // slice第二个参数传 undefined 会直接截到最后
  // indexOf第二个参数用来跳过前面的 "https://"
  return url.slice(url.indexOf('/', 8), end)
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
  // 获取 BoxJs 数据
  const boxdata = getBoxData()
  boxdata.syscfgs.isDebugMode = false

  // 调试模式: 是否每次都获取新的页面
  const isDebugWeb = [true, 'true'].includes(
    $.getdata('@chavy_boxjs_userCfgs.isDebugWeb')
  )
  const debugger_web = $.getdata('@chavy_boxjs_userCfgs.debugger_web')
  const cache = $.getjson($.KEY_web_cache, null)

  // 如果没有开启调试模式，且当前版本与缓存版本一致，且直接取缓存
  if (!isDebugWeb && cache && cache.version === $.version) {
    $.html = cache.cache
  }
  // 如果开启了调试模式，并指定了 `debugger_web` 则从指定的地址获取页面
  else {
    if (isDebugWeb && debugger_web) {
      // 调试地址后面拼时间缀, 避免 GET 缓存
      const isQueryUrl = debugger_web.includes('?')
      $.web = `${debugger_web}${
        isQueryUrl ? '&' : '?'
      }_=${new Date().getTime()}`
      boxdata.syscfgs.isDebugMode = true
      console.log(`[WARN] 调试模式: $.web = : ${$.web}`)
    }
    // 如果调用这个方法来获取缓存, 且标记为`非调试模式`
    const getcache = () => {
      console.log(`[ERROR] 调试模式: 正在使用缓存的页面!`)
      boxdata.syscfgs.isDebugMode = false
      return $.getjson($.KEY_web_cache).cache
    }
    await $.http.get($.web).then(
      (resp) => {
        if (/<title>BoxJs<\/title>/.test(resp.body)) {
          // 返回页面源码, 并马上存储到持久化仓库
          $.html = resp.body
          const cache = { version: $.version, cache: $.html }
          $.setjson(cache, $.KEY_web_cache)
        } else {
          // 如果返回的页面源码不是预期的, 则从持久化仓库中获取
          $.html = getcache()
        }
      },
      // 如果获取页面源码失败, 则从持久化仓库中获取
      () => ($.html = getcache())
    )
  }
  // 根据偏好设置, 替换首屏颜色 (如果是`auto`则交由页面自适应)
  const theme = $.getdata('@chavy_boxjs_userCfgs.theme')
  if (theme === 'light') {
    $.html = $.html.replace('#121212', '#fff')
  } else if (theme === 'dark') {
    $.html = $.html.replace('#fff', '#121212')
  }
  /**
   * 后端渲染数据, 感谢 https://t.me/eslint 提供帮助
   *
   * 如果直接渲染到 box: null 会出现双向绑定问题
   * 所以先渲染到 `boxServerData: null` 再由前端 `this.box = this.boxServerData` 实现双向绑定
   */
  $.html = $.html.replace(
    'boxServerData: null',
    'boxServerData:' + JSON.stringify(boxdata)
  )

  // 调试模式支持 vue Devtools (只有在同时开启调试模式和指定了调试地址才生效)
  // vue.min.js 生效时, 会导致 @click="window.open()" 报 "window" is not defined 错误
  if (isDebugWeb && debugger_web) {
    $.html = $.html.replace('vue.min.js', 'vue.js')
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
    const [, backupId] = query.split('/baks/')
    $.json = $.getjson(backupId)
  } else if (/^\/versions$/.test(query)) {
    await getVersions(true)
  } else if (/^\/data/.test(query)) {
    // TODO 记录每次查询的 key 至 usercfgs.viewkeys
    const [, dataKey] = query.split('/data/')
    $.json = {
      key: dataKey,
      val: $.getdata(dataKey)
    }
  }
}

/**
 * 处理 API 请求
 */
async function handleApi() {
  const [, api] = $.path.split('/api')

  if (api === '/save' || api.startsWith('/save?')) {
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
  } else if (api === '/saveData') {
    await apiSaveData()
  } else if (api === '/surge') {
    await apiSurge()
  }
}

async function handleOptions() {}

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
    if (subcache && subcache.apps && Array.isArray(subcache.apps)) {
      subcache.apps.forEach((app) => Object.assign(datas, getAppDatas(app)))
    }
  })

  const box = {
    datas,
    usercfgs,
    sessions,
    curSessions,
    sysapps,
    syscfgs,
    appSubCaches,
    globalbaks
  }

  return box
}

/**
 * 获取系统配置
 */
function getSystemCfgs() {
  // prettier-ignore
  return {
    env: $.isStash() ? 'Stash' : $.isShadowrocket() ? 'Shadowrocket' : $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isSurge() ? 'Surge' : 'Node',
    version: $.version,
    versionType: $.versionType,
    envs: [
      { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/surge.png'] },
      { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/quantumultx.png'] },
      { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/loon.png'] },
      { id: 'Shadowrocket', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/shadowrocket.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/shadowrocket.png'] },
      { id: 'Stash', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/stash.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/stash.png'] }
    ],
    chavy: { id: 'ChavyLeung', icon: 'https://avatars3.githubusercontent.com/u/29748519', repo: 'https://github.com/chavyleung/scripts' },
    senku: { id: 'GideonSenku', icon: 'https://avatars1.githubusercontent.com/u/39037656', repo: 'https://github.com/GideonSenku' },
    id77: { id: 'id77', icon: 'https://avatars0.githubusercontent.com/u/9592236', repo: 'https://github.com/id77' },
    orz3: { id: 'Orz-3', icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/Orz-3.png', repo: 'https://github.com/Orz-3/' },
    boxjs: { id: 'BoxJs', show: false, icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/box.png', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/box.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/box.png'], repo: 'https://github.com/chavyleung/scripts' },
    defaultIcons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/appstore.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/appstore.png']
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
      descs: ['可手动执行一些抹掉数据的脚本', '可设置明暗两种主题下的主色调', '可设置壁纸清单'],
      keys: [
        '@chavy_boxjs_userCfgs.httpapi',
        '@chavy_boxjs_userCfgs.bgimg',
        '@chavy_boxjs_userCfgs.http_backend',
        '@chavy_boxjs_userCfgs.color_dark_primary',
        '@chavy_boxjs_userCfgs.color_light_primary'
      ],
      settings: [
        { id: '@chavy_boxjs_userCfgs.httpapis', name: 'HTTP-API (Surge)', val: '', type: 'textarea', placeholder: ',examplekey@127.0.0.1:6166', autoGrow: true, rows: 2, persistentHint:true, desc: '示例: ,examplekey@127.0.0.1:6166! 注意: 以逗号开头, 逗号分隔多个地址, 可加回车' },
        { id: '@chavy_boxjs_userCfgs.httpapi_timeout', name: 'HTTP-API Timeout (Surge)', val: 20, type: 'number', persistentHint:true, desc: '如果脚本作者指定了超时时间, 会优先使用脚本指定的超时时间.' },
        { id: '@chavy_boxjs_userCfgs.http_backend', name: 'HTTP Backend (Quantumult X)', val: '', type: 'text',placeholder: 'http://127.0.0.1:9999', persistentHint:true, desc: '示例: http://127.0.0.1:9999 ! 注意: 必须是以 http 开头的完整路径, 不能是 / 结尾' },
        { id: '@chavy_boxjs_userCfgs.bgimgs', name: '背景图片清单', val: '无,\n跟随系统,跟随系统\nlight,http://api.btstu.cn/sjbz/zsy.php\ndark,https://uploadbeta.com/api/pictures/random\n妹子,http://api.btstu.cn/sjbz/zsy.php', type: 'textarea', placeholder: '无,{回车} 跟随系统,跟随系统{回车} light,图片地址{回车} dark,图片地址{回车} 妹子,图片地址', persistentHint:true, autoGrow: true, rows: 2, desc: '逗号分隔名字和链接, 回车分隔多个地址' },
        { id: '@chavy_boxjs_userCfgs.bgimg', name: '背景图片', val: '', type: 'text', placeholder: 'http://api.btstu.cn/sjbz/zsy.php', persistentHint:true, desc: '输入背景图标的在线链接' },
        { id: '@chavy_boxjs_userCfgs.changeBgImgEnterDefault', name: '手势进入壁纸模式默认背景图片', val: '', type: 'text', placeholder: '填写上面背景图片清单的值', persistentHint:true, desc: '' },
        { id: '@chavy_boxjs_userCfgs.changeBgImgOutDefault', name: '手势退出壁纸模式默认背景图片', val: '', type: 'text', placeholder: '填写上面背景图片清单的值', persistentHint:true, desc: '' },
        { id: '@chavy_boxjs_userCfgs.color_light_primary', name: '明亮色调', canvas: true, val: '#F7BB0E', type: 'colorpicker', desc: '' },
        { id: '@chavy_boxjs_userCfgs.color_dark_primary', name: '暗黑色调', canvas: true, val: '#2196F3', type: 'colorpicker', desc: '' }
      ],
      scripts: [
        {
          name: "抹掉：所有缓存",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.caches.js"
        },
        {
          name: "抹掉：收藏应用",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.favapps.js"
        },
        {
          name: "抹掉：用户偏好",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.js"
        },
        {
          name: "抹掉：所有会话",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.usercfgs.sessions.js"
        },
        {
          name: "抹掉：所有备份",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.baks.js"
        },
        {
          name: "抹掉：BoxJs (注意备份)",
          script: "https://raw.githubusercontent.com/chavyleung/scripts/master/box/scripts/boxjs.revert.boxjs.js"
        }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.mini.png',
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.png'
      ]
    },
    {
      id: 'BoxSwitcher',
      name: '会话切换',
      desc: '打开静默运行后, 切换会话将不再发出系统通知 \n注: 不影响日志记录',
      keys: [],
      settings: [{ id: 'CFG_BoxSwitcher_isSilent', name: '静默运行', val: false, type: 'boolean', desc: '切换会话时不发出系统通知!' }],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.mini.png',
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.png'
      ],
      script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/switcher/box.switcher.js'
    },
    {
      "id": "BoxGist",
      "name": "Gist备份",
      "keys": ["@gist.token", "@gist.username"],
      "author": "@dompling",
      "repo": "https://github.com/dompling/Script/tree/master/gist",
      "icons": [
        "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png",
        "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png"
      ],
      "descs_html": [
        "脚本由 <a href='https://github.com/dompling' target='_blank'>@dompling</a> 提供, 感谢!",
        "<br />",
        "<b>Token</b> 获取方式:",
        "<span style='margin-left: 40px'>头像菜单 -></span>",
        "<span style='margin-left: 40px'>Settings -></span>",
        "<span style='margin-left: 40px'>Developer settings -></span>",
        "<span style='margin-left: 40px'>Personal access tokens -></span>",
        "<span style='margin-left: 40px'>Generate new token -></span>",
        "<span style='margin-left: 40px'>在里面找到 gist 勾选提交</span>"
      ],
      "scripts": [
        {
          "name": "备份 Gist",
          "script": "https://raw.githubusercontent.com/dompling/Script/master/gist/backup.js"
        },
        {
          "name": "从 Gist 恢复",
          "script": "https://raw.githubusercontent.com/dompling/Script/master/gist/restore.js"
        }
      ],
      "settings": [
        {
          "id": "@gist.username",
          "name": "用户名",
          "val": null,
          "type": "text",
          "placeholder": "github 用户名",
          "desc": "必填"
        },
        {
          "id": "@gist.token",
          "name": "Personal access tokens",
          "val": null,
          "type": "text",
          "placeholder": "github personal access tokens",
          "desc": "必填"
        }
      ]
    }
  ]
  return sysapps
}

/**
 * 获取用户配置
 */
function getUserCfgs() {
  const defcfgs = {
    favapps: [],
    appsubs: [],
    viewkeys: [],
    isPinedSearchBar: true,
    httpapi: 'examplekey@127.0.0.1:6166',
    http_backend: ''
  }
  const usercfgs = Object.assign(defcfgs, $.getjson($.KEY_usercfgs, {}))

  // 处理异常数据：删除所有为 null 的订阅
  if (usercfgs.appsubs.includes(null)) {
    usercfgs.appsubs = usercfgs.appsubs.filter((sub) => sub)
    $.setjson(usercfgs, $.KEY_usercfgs)
  }

  return usercfgs
}

/**
 * 获取`应用订阅`缓存
 */
function getAppSubCaches() {
  return $.getjson($.KEY_app_subCaches, {})
}

/**
 * 获取全局备份列表
 */
function getGlobalBaks() {
  let backups = $.getjson($.KEY_backups, [])

  // 处理异常数据：删除所有为 null 的备份
  if (backups.includes(null)) {
    backups = backups.filter((bak) => bak)
    $.setjson(backups, $.KEY_backups)
  }

  return backups
}

/**
 * 获取版本清单
 */
function getVersions() {
  return $.http.get($.ver).then(
    (resp) => {
      try {
        $.json = $.toObj(resp.body)
      } catch {
        $.json = {}
      }
    },
    () => ($.json = {})
  )
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
  return $.getjson($.KEY_sessions, []) || []
}

/**
 * 获取当前切换到哪个会话
 */
function getCurSessions() {
  return $.getjson($.KEY_cursessions, {}) || {}
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

function dealKey(str) {
  const [rootKey, delIndex] = str.split('.')
  if (rootKey && rootKey.indexOf('@') > -1 && delIndex !== undefined) {
    const key = rootKey.replace('@', '')
    const datas = JSON.parse($.getdata(key))
    if (Array.isArray(datas) && delIndex <= datas.length - 1) {
      datas.splice(delIndex, 1)
      $.setdata(JSON.stringify(datas), key)
    }
  }
}

async function apiSave() {
  const data = $.toObj($request.body)
  if (Array.isArray(data)) {
    data.forEach((dat) => {
      if (dat.val === null) {
        dealKey(dat.key)
      } else {
        $.setdata(dat.val, dat.key)
      }
    })
  } else {
    if (data.val === null) {
      dealKey(data.key)
    } else {
      $.setdata(data.val, data.key)
    }
  }

  const appId = $.queries['appid']
  if (appId) {
    updateCurSesssions(appId, data)
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
  const backup = $.toObj($request.body)
  const backups = $.getjson($.KEY_backups, [])
  const bakIdx = backups.findIndex((b) => b.id === backup.id)
  if (bakIdx > -1) {
    backups.splice(bakIdx, 1)
    $.setdata('', backup.id)
    $.setjson(backups, $.KEY_backups)
  }
  $.json = getBoxData()
}

async function apiUpdateGlobalBak() {
  const { id: backupId, name: backupName } = $.toObj($request.body)
  const backups = $.getjson($.KEY_backups, [])
  const backup = backups.find((b) => b.id === backupId)
  if (backup) {
    backup.name = backupName
    $.setjson(backups, $.KEY_backups)
  }
  $.json = getBoxData()
}

async function apiRevertGlobalBak() {
  const { id: bakcupId } = $.toObj($request.body)
  const backup = $.getjson(bakcupId)
  if (backup) {
    const {
      chavy_boxjs_sysCfgs,
      chavy_boxjs_sysApps,
      chavy_boxjs_sessions,
      chavy_boxjs_userCfgs,
      chavy_boxjs_cur_sessions,
      chavy_boxjs_app_subCaches,
      ...datas
    } = backup
    $.setdata(JSON.stringify(chavy_boxjs_sessions), $.KEY_sessions)
    $.setdata(JSON.stringify(chavy_boxjs_userCfgs), $.KEY_usercfgs)
    $.setdata(JSON.stringify(chavy_boxjs_cur_sessions), $.KEY_cursessions)
    $.setdata(JSON.stringify(chavy_boxjs_app_subCaches), $.KEY_app_subCaches)
    const isNull = (val) =>
      [undefined, null, 'null', 'undefined', ''].includes(val)
    Object.keys(datas).forEach((datkey) =>
      $.setdata(isNull(datas[datkey]) ? '' : `${datas[datkey]}`, datkey)
    )
  }
  const boxdata = getBoxData()
  $.json = boxdata
}

async function apiSaveGlobalBak() {
  const backups = $.getjson($.KEY_backups, [])
  const boxdata = getBoxData()
  const backup = $.toObj($request.body)
  const backupData = {}
  backupData['chavy_boxjs_userCfgs'] = boxdata.usercfgs
  backupData['chavy_boxjs_sessions'] = boxdata.sessions
  backupData['chavy_boxjs_cur_sessions'] = boxdata.curSessions
  backupData['chavy_boxjs_app_subCaches'] = boxdata.appSubCaches
  Object.assign(backupData, boxdata.datas)
  backups.push(backup)
  $.setjson(backups, $.KEY_backups)
  $.setjson(backupData, backup.id)
  $.json = getBoxData()
}

async function apiImpGlobalBak() {
  const backups = $.getjson($.KEY_backups, [])
  const backup = $.toObj($request.body)
  const backupData = backup.bak
  delete backup.bak
  backups.push(backup)
  $.setjson(backups, $.KEY_backups)
  $.setjson(backupData, backup.id)
  $.json = getBoxData()
}

async function apiRunScript() {
  // 取消勿扰模式
  $.isMute = false
  const opts = $.toObj($request.body)
  const httpapi = $.getdata('@chavy_boxjs_userCfgs.httpapi')
  const ishttpapi = /.*?@.*?:[0-9]+/.test(httpapi)
  let script_text = null
  if (opts.isRemote) {
    await $.getScript(opts.url).then((script) => (script_text = script))
  } else {
    script_text = opts.script
  }
  if (
    $.isSurge() &&
    !$.isLoon() &&
    !$.isShadowrocket() &&
    !$.isStash() &&
    ishttpapi
  ) {
    const runOpts = { timeout: opts.timeout }
    await $.runScript(script_text, runOpts).then(
      (resp) => ($.json = JSON.parse(resp))
    )
  } else {
    await new Promise((resolve) => {
      $eval_env.resolve = resolve
      // 避免被执行脚本误认为是 rewrite 环境
      // 所以需要 `$request = undefined`
      $eval_env.request = $request
      $request = undefined
      // 重写 console.log, 把日志记录到 $eval_env.cached_logs
      $eval_env.cached_logs = []
      console.cloned_log = console.log
      console.log = (l) => {
        console.cloned_log(l)
        $eval_env.cached_logs.push(l)
      }
      // 重写脚本内的 $done, 调用 $done() 即是调用 $eval_env.resolve()
      script_text = script_text.replace(/\$done/g, '$eval_env.resolve')
      script_text = script_text.replace(/\$\.done/g, '$eval_env.resolve')
      try {
        eval(script_text)
      } catch (e) {
        $eval_env.cached_logs.push(e)
        resolve()
      }
    })
    // 还原 console.log
    console.log = console.cloned_log
    // 还原 $request
    $request = $eval_env.request
    // 返回数据
    $.json = {
      result: '',
      output: $eval_env.cached_logs.join('\n')
    }
  }
}

async function apiSurge() {
  const opts = $.toObj($request.body)
  const httpapi = $.getdata('@chavy_boxjs_userCfgs.httpapi')
  const ishttpapi = /.*?@.*?:[0-9]+/.test(httpapi)
  if (
    $.isSurge() &&
    !$.isLoon() &&
    !$.isShadowrocket() &&
    !$.isStash() &&
    ishttpapi
  ) {
    const [key, prefix] = httpapi.split('@')
    opts.url = `http://${prefix}/${opts.url}`
    opts.headers = {
      'X-Key': key,
      'Accept': 'application/json, text/plain, */*'
    }
    await new Promise((resolve) => {
      $[opts.method.toLowerCase()](opts, (_, __, resp) => {
        $.json = JSON.parse(resp)
        resolve($.json)
      })
    })
  }
}

async function apiSaveData() {
  const { key: dataKey, val: dataVal } = $.toObj($request.body)
  $.setdata(dataVal, dataKey)
  $.json = {
    key: dataKey,
    val: $.getdata(dataKey)
  }
}

/**
 * ===================================
 * 工具类函数
 * ===================================
 */

function reloadAppSubCache(url) {
  // 地址后面拼时间缀, 避免 GET 缓存
  const requrl = `${url}${
    url.includes('?') ? '&' : '?'
  }_=${new Date().getTime()}`
  return $.http.get(requrl).then((resp) => {
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
 * 升级备份数据
 *
 * 升级前: 把所有备份都存到一个持久化空间
 * 升级后: 把每个备份都独立存到一个空间, `$.KEY_backups` 仅记录必要的数据索引
 */
function upgradeGlobalBaks() {
  let oldbaks = $.getdata($.KEY_globalBaks)
  let newbaks = $.getjson($.KEY_backups, [])
  const isEmpty = (bak) => [undefined, null, ''].includes(bak)
  const isExistsInNew = (backupId) => newbaks.find((bak) => bak.id === backupId)

  // 存在旧备份数据时, 升级备份数据格式
  if (!isEmpty(oldbaks)) {
    oldbaks = JSON.parse(oldbaks)
    oldbaks.forEach((bak) => {
      if (isEmpty(bak)) return
      if (isEmpty(bak.bak)) return
      if (isExistsInNew(bak.id)) return

      console.log(`正在迁移: ${bak.name}`)
      const backupId = bak.id
      const backupData = bak.bak

      // 删除旧的备份数据, 仅保留索引信息
      delete bak.bak
      newbaks.push(bak)

      // 提取旧备份数据, 存入独立的持久化空间
      $.setjson(backupData, backupId)
    })
    $.setjson(newbaks, $.KEY_backups)
  }

  // 清空所有旧备份的数据
  $.setdata('', $.KEY_globalBaks)
}

function updateCurSesssions(appId, data) {
  if (!appId) {
    console.log(`[updateCurSesssions] 跳过! 没有指定 appId!`)
    return
  }

  const curSessions = getCurSessions()
  const curSessionId = curSessions[appId]
  if (!curSessionId) {
    console.log(
      `[updateCurSesssions] 跳过! 应用 [${appId}] 找不到当前会话, 请先应用会话!`
    )
    return
  }

  const sessions = getAppSessions()
  const session = sessions.find((session) => session.id === curSessionId)
  if (!session) {
    console.log(
      `[updateCurSesssions] 跳过! 应用 [${appId}] 找不到当前会话, 请先应用会话!`
    )
    return
  }

  session.datas = data
  $.setjson(sessions, $.KEY_sessions)
}

/**
 * ===================================
 * 结束类函数
 * ===================================
 */
function doneBox() {
  // 记录当前使用哪个域名访问
  $.setdata(getHost($request.url), $.KEY_boxjs_host)
  if ($.isOptions) doneOptions()
  else if ($.isPage) donePage()
  else if ($.isQuery) doneQuery()
  else if ($.isApi) doneApi()
  else $.done()
}

function getBaseDoneHeaders(mixHeaders = {}) {
  return Object.assign(
    {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept'
    },
    mixHeaders
  )
}

function getHtmlDoneHeaders() {
  return getBaseDoneHeaders({
    'Content-Type': 'text/html;charset=UTF-8'
  })
}
function getJsonDoneHeaders() {
  return getBaseDoneHeaders({
    'Content-Type': 'text/json; charset=utf-8'
  })
}

function doneOptions() {
  const headers = getBaseDoneHeaders()
  if ($.isQuanX()) $.done({ headers })
  else $.done({ response: { headers } })
}

function donePage() {
  const headers = getHtmlDoneHeaders()
  if ($.isQuanX()) $.done({ status: 'HTTP/1.1 200', headers, body: $.html })
  else $.done({ response: { status: 200, headers, body: $.html } })
}

function doneQuery() {
  $.json = $.toStr($.json)
  const headers = getJsonDoneHeaders()
  if ($.isQuanX()) $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  else $.done({ response: { status: 200, headers, body: $.json } })
}

function doneApi() {
  $.json = $.toStr($.json)
  const headers = getJsonDoneHeaders()
  if ($.isQuanX()) $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  else $.done({ response: { status: 200, headers, body: $.json } })
}

/**
 * GistBox by https://github.com/Peng-YM
 */
// prettier-ignore
function GistBox(e){const t=function(e,t={}){const{isQX:s,isLoon:n,isSurge:o}=function(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,n="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!n,isJSBox:n}}(),r={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(i=>r[i.toLowerCase()]=(r=>(function(r,i){(i="string"==typeof i?{url:i}:i).url=e?e+i.url:i.url;const a=(i={...t,...i}).timeout,u={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...i.events};let c,d;u.onRequest(r,i),c=s?$task.fetch({method:r,...i}):new Promise((e,t)=>{(o||n?$httpClient:require("request"))[r.toLowerCase()](i,(s,n,o)=>{s?t(s):e({statusCode:n.status||n.statusCode,headers:n.headers,body:o})})});const f=a?new Promise((e,t)=>{d=setTimeout(()=>(u.onTimeout(),t(`${r} URL: ${i.url} exceeds the timeout ${a} ms`)),a)}):null;return(f?Promise.race([f,c]).then(e=>(clearTimeout(d),e)):c).then(e=>u.onResponse(e))})(i,r))),r}("https://api.github.com",{headers:{Authorization:`token ${e}`,"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"},events:{onResponse:e=>String(e.statusCode).startsWith("4")?Promise.reject(`ERROR: ${JSON.parse(e.body).message}`):e}}),s=e=>`boxjs.bak.${e}.json`,n=e=>e.match(/boxjs\.bak\.(\d+)\.json/)[1];return new class{async findDatabase(){return t.get("/gists").then(e=>{const t=JSON.parse(e.body);for(let e of t)if("BoxJs Gist"===e.description)return e.id;return-1})}async createDatabase(e){e instanceof Array||(e=[e]);const n={};return e.forEach(e=>{n[s(e.time)]={content:e.content}}),t.post({url:"/gists",body:JSON.stringify({description:"BoxJs Gist",public:!1,files:n})}).then(e=>JSON.parse(e.body).id)}async deleteDatabase(e){return t.delete(`/gists/${e}`)}async getBackups(e){const s=await t.get(`/gists/${e}`).then(e=>JSON.parse(e.body)),{files:o}=s,r=[];for(let e of Object.keys(o))r.push({time:n(e),url:o[e].raw_url});return r}async addBackups(e,t){t instanceof Array||(t=[t]);const n={};return t.forEach(e=>n[s(e.time)]={content:e.content}),this.updateBackups(e,n)}async deleteBackups(e,t){t instanceof Array||(t=[t]);const n={};return t.forEach(e=>n[s(e)]={}),this.updateBackups(e,n)}async updateBackups(e,s){return t.patch({url:`/gists/${e}`,body:JSON.stringify({files:s})})}}}

/**
 * EnvJs
 */
// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,r)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $environment&&$environment["surge-version"]}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=s&&s.timeout?s.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"},timeout:r};this.post(a,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),r=JSON.stringify(this.data);e?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(s,r):this.fs.writeFileSync(t,r)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return e;return r}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),r=e?this.getval(e):"";if(r)try{const t=JSON.parse(r);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(s),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const s=JSON.parse(h);this.lodash_set(s,r,t),e=this.setval(JSON.stringify(s),i)}catch(s){const o={};this.lodash_set(o,r,t),e=this.setval(JSON.stringify(o),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let e=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{if(t.headers["set-cookie"]){const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();e&&this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t,a=e.decode(h,this.encoding);s(null,{status:i,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:i,response:r}=t;s(i,r,r&&e.decode(r.rawBody,this.encoding))})}}post(t,s=(()=>{})){const e=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[e](t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())t.method=e,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[e](r,o).then(t=>{const{statusCode:e,statusCode:r,headers:o,rawBody:h}=t,a=i.decode(h,this.encoding);s(null,{status:e,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:e,response:r}=t;s(e,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,s=null){const e=s?new Date(s):new Date;let i={"M+":e.getMonth()+1,"d+":e.getDate(),"H+":e.getHours(),"m+":e.getMinutes(),"s+":e.getSeconds(),"q+":Math.floor((e.getMonth()+3)/3),S:e.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(e.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in i)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[s]:("00"+i[s]).substr((""+i[s]).length)));return t}queryStr(t){let s="";for(const e in t){let i=t[e];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),s+=`${e}=${i}&`)}return s=s.substring(0,s.length-1),s}msg(s=t,e="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()||this.isShadowrocket()?t:this.isQuanX()?{"open-url":t}:this.isSurge()||this.isStash()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let s=t.openUrl||t.url||t["open-url"],e=t.mediaUrl||t["media-url"];return{openUrl:s,mediaUrl:e}}if(this.isQuanX()){let s=t["open-url"]||t.url||t.openUrl,e=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":s,"media-url":e,"update-pasteboard":i}}if(this.isSurge()||this.isShadowrocket()||this.isStash()){let s=t.url||t.openUrl||t["open-url"];return{url:s}}}};if(this.isMute||(this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$notification.post(s,e,i,o(r)):this.isQuanX()&&$notify(s,e,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(s),e&&t.push(e),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!(this.isSurge()||this.isShadowrocket()||this.isQuanX()||this.isLoon()||this.isStash());e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),this.isSurge()||this.isShadowrocket()||this.isQuanX()||this.isLoon()||this.isStash()?$done(t):this.isNode()&&process.exit(1)}}(t,s)}
