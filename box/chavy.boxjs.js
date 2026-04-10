const $ = new Env('BoxJs')

// 为 eval 准备的上下文环境
const $eval_env = {}

$.version = '0.19.28'
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
  const referer = $request.headers.referer || $request.headers.Referer
  if (!/^https?:\/\/(.+\.)?boxjs\.(com|net)\//.test(referer)) {
    const isMuteQueryAlert = [true, 'true'].includes(
      $.getdata('@chavy_boxjs_userCfgs.isMuteQueryAlert')
    )

    if (!isMuteQueryAlert) {
      // 关闭静默状态
      const _isMute = $.isMute
      $.isMute = false

      $.msg(
        $.name,
        '❗️发现有脚本或人正在读取你的数据',
        [
          '请注意数据安全, 你可以: ',
          '1. 在 BoxJs 的脚本日志中查看详情',
          '2. 在 BoxJs 的页面 (侧栏) 中 "不显示查询警告"'
        ].join('\n')
      )

      // 还原静默状态
      $.isMute = _isMute
    }

    $.log(
      [
        '',
        '❗️❗️❗️ 发现有脚本或人正在读取你的数据 ❗️❗️❗️',
        JSON.stringify($request),
        ''
      ].join('\n')
    )
  }

  const [, query] = $.path.split('/query')
  if (/^\/boxdata/.test(query)) {
    $.json = getBoxData()
  } else if (/^\/baks/.test(query)) {
    const [, backupId] = query.split('/baks/')
    $.json = $.getjson(backupId)
  } else if (/^\/versions$/.test(query)) {
    await getVersions(true)
  } else if (/^\/data/.test(query)) {
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

  const apiHandlers = {
    '/save': apiSave,
    '/addAppSub': apiAddAppSub,
    '/deleteAppSub': apiDeleteAppSub,
    '/reloadAppSub': apiReloadAppSub,
    '/delGlobalBak': apiDelGlobalBak,
    '/updateGlobalBak': apiUpdateGlobalBak,
    '/saveGlobalBak': apiSaveGlobalBak,
    '/impGlobalBak': apiImpGlobalBak,
    '/revertGlobalBak': apiRevertGlobalBak,
    '/runScript': apiRunScript,
    '/saveData': apiSaveData,
    '/surge': apiSurge,
    '/update': apiUpdate
  }

  for (const [key, handler] of Object.entries(apiHandlers)) {
    if (api === key || api.startsWith(`${key}?`)) {
      await handler()
      break
    }
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

  const extraDatas =
    $.getdata(`${$.KEY_usercfgs.replace('#', '@')}.gist_cache_key`) || []

  extraDatas.forEach((key) => {
    datas[key] = $.getdata(key)
  })

  const usercfgs = getUserCfgs()
  const sessions = getAppSessions()
  const curSessions = getCurSessions()
  const sysapps = getSystemApps()
  const syscfgs = getSystemCfgs()
  const appSubCaches = getAppSubCaches()
  const globalbaks = getGlobalBaks()

  // 把 `内置应用`和`订阅应用` 里需要持久化属性放到`datas`
  sysapps.forEach((app) => {
    const newDatas = getAppDatas(app)
    Object.assign(datas, newDatas)
  })
  usercfgs.appsubs.forEach((sub) => {
    const subcache = appSubCaches[sub.url]
    if (subcache && subcache.apps && Array.isArray(subcache.apps)) {
      subcache.apps.forEach((app) => {
        const newDatas = getAppDatas(app)
        Object.assign(datas, newDatas)
      })
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
    env: $.isStash() ? 'Stash' : $.isShadowrocket() ? 'Shadowrocket' : $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isEgern() ? 'Egern' : $.isSurge() ? 'Surge' : 'Node',
    version: $.version,
    versionType: $.versionType,
    envs: [
      { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/surge.png'] },
      { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/quantumultx.png'] },
      { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/loon.png'] },
      { id: 'Shadowrocket', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/shadowrocket.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/shadowrocket.png'] },
      { id: 'Stash', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/stash.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/stash.png'] },
      { id: 'Egern', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Alpha/appstore.png', 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/appstore.png'] }
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
        { id: '@chavy_boxjs_userCfgs.debugger_webs', name: '调试地址', val: 'Dev体验,https://raw.githubusercontent.com/chavyleung/scripts/boxjs.dev/box/chavy.boxjs.html', type: 'textarea', placeholder: '每行一个配置，用逗号分割每个配置的名字和链接：配置,url', persistentHint:true, autoGrow: true, rows: 2, desc: '逗号分隔名字和链接, 回车分隔多个地址' },
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
      id: "BoxGist",
      name: "Gist备份",
      keys: [
        "@gist.token",
        "@gist.username",
        "@gist.split",
        "@gist.revision_options",
        "@gist.backup_type"
      ],
      author: "@dompling",
      repo: "https://github.com/dompling/Script/tree/master/gist",
      icons: [
        "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png",
        "https://raw.githubusercontent.com/Former-Years/icon/master/github-bf.png"
      ],
      descs_html: [
        "<h2>Token的获取方式</h2>",
        "<ol>头像菜单 -></ol>",
        "<ol>Settings -></ol>",
        "<ol>Developer settings -></ol>",
        "<ol>Personal access tokens -></ol>",
        "<ol>Generate new token -></ol>",
        "<ol>在里面找到 gist 勾选提交</ol>",
        "<h2>Gist Revision Id</h2>",
        "<ol>打开Gist项目</ol>",
        "<ol>默认为Code，选择Revisions</ol>",
        "<ol>找到需要恢复的版本文件</ol>",
        "<ol>点击右上角【...】>【View file】</ol>",
        "<ol>浏览器地址最后一串为 RevisionId</ol>"
      ],
      scripts: [
        {
          name: "备份 Gist",
          script: "https://raw.githubusercontent.com/dompling/Script/master/gist/backup.js"
        },
        {
          name: "从 Gist 恢复",
          script: "https://raw.githubusercontent.com/dompling/Script/master/gist/restore.js"
        },
        {
          name: "更新历史版本",
          script: "https://raw.githubusercontent.com/dompling/Script/master/gist/commit.js"
        }
      ],
      settings: [
        {
          id: "@gist.split",
          name: "用户数据分段",
          val: null,
          type: "number",
          placeholder: "用户数据过大时，请进行拆分防止内存警告⚠️",
          desc: "值为数字，拆分段数比如 2 就拆分成两个 datas."
        },
        {
          id: "@gist.revision_id",
          type: "modalSelects",
          name: "历史版本RevisionId",
          desc: "不填写时，默认获取最新，恢复后会自动清空。选择无内容时，请运行上方更新历史版本",
          items: "@gist.revision_options"
        },
        {
          id: "@gist.backup_type",
          name: "备份/恢复内容",
          val: "usercfgs,datas,sessions,curSessions,backups,appSubCaches",
          type: "checkboxes",
          items: [
            {
              key: "usercfgs",
              label: "用户偏好"
            },
            {
              key: "datas",
              label: "用户数据"
            },
            {
              key: "sessions",
              label: "应用会话"
            },
            {
              key: "curSessions",
              label: "当前会话"
            },
            {
              key: "backups",
              label: "备份索引"
            },
            {
              key: "appSubCaches",
              label: "应用订阅缓存"
            }
          ]
        },
        {
          id: "@gist.username",
          name: "用户名",
          val: null,
          type: "text",
          placeholder: "github 用户名",
          desc: "必填"
        },
        {
          id: "@gist.token",
          name: "Personal access tokens",
          val: null,
          type: "text",
          placeholder: "github personal access tokens",
          desc: "必填"
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
    gist_cache_key: [],

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
      const dataval = $.getdata(key)
      datas[key] = nulls.includes(dataval) ? null : dataval

      if (setting.type === 'boolean') {
        setting.val = nulls.includes(dataval)
          ? setting.val
          : dataval === 'true' || dataval === true
      } else if (setting.type === 'int') {
        setting.val = dataval * 1 || setting.val
      } else if (setting.type === 'checkboxes') {
        if (!nulls.includes(dataval) && typeof dataval === 'string') {
          setting.val = dataval ? dataval.split(',') : []
        } else {
          setting.val = Array.isArray(setting.val)
            ? setting.val
            : setting.val.split(',')
        }
      } else {
        setting.val = dataval || setting.val
      }

      if (setting.type === 'modalSelects') {
        setting.items = datas?.[setting.items] || []
      }
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

async function apiUpdate() {
  const data = $.toObj($request.body)
  const path = data.path.split('.')
  const val = data.val
  const key = path.shift()
  // 必须用 hasOwnProperty：val 为 false 时 data.val && … 会误判为跳过更新
  if (path.join('.') && Object.prototype.hasOwnProperty.call(data, 'val')) {
    switch (key) {
      case 'usercfgs':
        const usercfgs = getUserCfgs()
        update(usercfgs, path.join('.'), val)
        $.setjson(usercfgs, $.KEY_usercfgs)
        break
      default:
        break
    }
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

async function apiDeleteAppSub() {
  const sub = $.toObj($request.body)
  // 添加订阅
  const usercfgs = getUserCfgs()
  usercfgs.appsubs = usercfgs.appsubs.filter((e) => e.url !== sub.url)
  $.setjson(usercfgs, $.KEY_usercfgs)
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
  if (opts.argument) {
    script_text = `globalThis.$argument=\`${opts.argument}\`;${script_text}`
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
    const result = await new Promise((resolve) => {
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
      result,
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
      // 仅缓存存在 id 的订阅
      Object.keys(subcaches).forEach((key) => {
        if (!subcaches[key].hasOwnProperty('id')) {
          delete subcaches[key]
        }
      })
      $.setjson(subcaches, $.KEY_app_subCaches)
      $.log(`更新订阅, 成功! ${url}`)
    } catch (e) {
      $.logErr(e)
      $.log(`更新订阅, 失败! ${url}`)
    }
  })
}

function update(obj, path, value) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
}

// 自定义并发控制函数
async function limitConcurrency(tasks, limit) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = task(); // 执行任务
    results.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }

    executing.push(promise);
    promise.then(() => {
      const index = executing.indexOf(promise);
      if (index !== -1) executing.splice(index, 1);
    }).catch(() => {
      const index = executing.indexOf(promise);
      if (index !== -1) executing.splice(index, 1);
    });
  }

  return Promise.all(results);
}

async function reloadAppSubCaches() {
  $.msg($.name, '更新订阅: 开始!');
  const reloadActs = [];
  const usercfgs = getUserCfgs();
  
  // 收集所有任务（函数形式）
  usercfgs.appsubs.forEach((sub) => {
    reloadActs.push(() => reloadAppSubCache(sub.url)); // 存储函数而不是立即执行的 Promise
  });

  // 使用并发限制执行任务
  await limitConcurrency(reloadActs, 20); // 限制并发数为 20

  $.log(`全部订阅, 完成!`);
  const endTime = new Date().getTime();
  const costTime = (endTime - $.startTime) / 1000;
  $.msg($.name, `更新订阅: 完成! 🕛 ${costTime} 秒`);
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
    'Content-Type': 'application/json; charset=utf-8'
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
 * EnvJs
 */
//prettier-ignore
function Env(e,t){class s{constructor(e){this.env=e}send(e,t="GET"){e="string"==typeof e?{url:e}:e;let s=this.get;"POST"===t&&(s=this.post);const i=new Promise((t,i)=>{s.call(this,e,(e,s,o)=>{e?i(e):t(s)})});return e.timeout?((e,t=1e3)=>Promise.race([e,new Promise((e,s)=>{setTimeout(()=>{s(new Error("请求超时"))},t)})]))(i,e.timeout):i}get(e){return this.send.call(this.env,e)}post(e){return this.send.call(this.env,e,"POST")}}return new class{constructor(e,t){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=e,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,t),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof Egern?"Egern":"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}isEgern(){return"Egern"===this.getEnv()}toObj(e,t=null){try{return JSON.parse(e)}catch{return t}}toStr(e,t=null,...s){try{return JSON.stringify(e,...s)}catch{return t}}getjson(e,t){let s=t;if(this.getdata(e))try{s=JSON.parse(this.getdata(e))}catch{}return s}setjson(e,t){try{return this.setdata(JSON.stringify(e),t)}catch{return!1}}getScript(e){return new Promise(t=>{this.get({url:e},(e,s,i)=>t(i))})}runScript(e,t){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=t&&t.timeout?t.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:e,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,(e,t,i)=>s(i))}).catch(e=>this.logErr(e))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t);if(!s&&!i)return{};{const i=s?e:t;try{return JSON.parse(this.fs.readFileSync(i))}catch(e){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):i?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s=void 0){const i=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of i)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e||(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce((e,s,i)=>Object(e[s])===e[s]?e[s]:e[s]=(Math.abs(t[i+1])|0)===+t[i+1]?[]:{},e)[t[t.length-1]]=s),e}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,i,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(a);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),i)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(e,t);return s}getval(e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":return $persistentStore.read(e);case"Quantumult X":return $prefs.valueForKey(e);case"Node.js":return this.data=this.loaddata(),this.data[e];default:return this.data&&this.data[e]||null}}setval(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":return $persistentStore.write(e,t);case"Quantumult X":return $prefs.setValueForKey(e,t);case"Node.js":return this.data=this.loaddata(),this.data[t]=e,this.writedata(),!0;default:return this.data&&this.data[t]||null}}initGotEnv(e){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,e&&(e.headers=e.headers?e.headers:{},e&&(e.headers=e.headers?e.headers:{},void 0===e.headers.cookie&&void 0===e.headers.Cookie&&void 0===e.cookieJar&&(e.cookieJar=this.ckjar)))}get(e,t=()=>{}){switch(e.headers&&(delete e.headers["Content-Type"],delete e.headers["Content-Length"],delete e.headers["content-type"],delete e.headers["content-length"]),e.params&&(e.url+="?"+this.queryStr(e.params)),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(e,(e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)});break;case"Quantumult X":this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then(e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)},e=>t(e&&e.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(e),this.got(e).on("redirect",(e,t)=>{try{if(e.headers["set-cookie"]){const s=e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),t.cookieJar=this.ckjar}}catch(e){this.logErr(e)}}).then(e=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=e,n=s.decode(a,this.encoding);t(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)},e=>{const{message:i,response:o}=e;t(i,o,o&&s.decode(o.rawBody,this.encoding))})}}post(e,t=()=>{}){const s=e.method?e.method.toLocaleLowerCase():"post";switch(e.body&&e.headers&&!e.headers["Content-Type"]&&!e.headers["content-type"]&&(e.headers["content-type"]="application/x-www-form-urlencoded"),e.headers&&(delete e.headers["Content-Length"],delete e.headers["content-length"]),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](e,(e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)});break;case"Quantumult X":e.method=s,this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then(e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)},e=>t(e&&e.error||"UndefinedError"));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(e);const{url:o,...r}=e;this.got[s](o,r).then(e=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=e,n=i.decode(a,this.encoding);t(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)},e=>{const{message:s,response:o}=e;t(s,o,o&&i.decode(o.rawBody,this.encoding))})}}time(e,t=null){const s=t?new Date(t):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in i)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?i[t]:("00"+i[t]).substr((""+i[t]).length)));return e}queryStr(e){let t="";for(const s in e){let i=e[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),t+=`${s}=${i}&`)}return t=t.substring(0,t.length-1),t}msg(t=e,s="",i="",o={}){const r=e=>{const{$open:t,$copy:s,$media:i,$mediaMime:o}=e;switch(typeof e){case void 0:return e;case"string":switch(this.getEnv()){case"Surge":case"Stash":case"Egern":default:return{url:e};case"Loon":case"Shadowrocket":return e;case"Quantumult X":return{"open-url":e};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":case"Egern":default:{const r={};let a=e.openUrl||e.url||e["open-url"]||t;a&&Object.assign(r,{action:"open-url",url:a});let n=e["update-pasteboard"]||e.updatePasteboard||s;n&&Object.assign(r,{action:"clipboard",text:n});let h=e.mediaUrl||e["media-url"]||i;if(h){let e,t;if(h.startsWith("http"));else if(h.startsWith("data:")){const[s]=h.split(";"),[,i]=h.split(",");e=i,t=s.replace("data:","")}else{e=h,t=(e=>{const t={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in t)if(0===e.indexOf(s))return t[s];return null})(h)}Object.assign(r,{"media-url":h,"media-base64":e,"media-base64-mime":o??t})}return Object.assign(r,{"auto-dismiss":e["auto-dismiss"],sound:e.sound}),r}case"Loon":{const s={};let o=e.openUrl||e.url||e["open-url"]||t;o&&Object.assign(s,{openUrl:o});let r=e.mediaUrl||e["media-url"]||i;return r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=e["open-url"]||e.url||e.openUrl||t;r&&Object.assign(o,{"open-url":r});let a=e.mediaUrl||e["media-url"]||i;a&&Object.assign(o,{"media-url":a});let n=e["update-pasteboard"]||e.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":default:$notification.post(t,s,i,r(o));break;case"Quantumult X":$notify(t,s,i,r(o));case"Node.js":}if(!this.isMuteLog){let e=["","==============📣系统通知📣=============="];e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n")),this.logs=this.logs.concat(e)}}debug(...e){this.logLevels[this.logLevel]<=this.logLevels.debug&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.debug}${e.map(e=>e??String(e)).join(this.logSeparator)}`))}info(...e){this.logLevels[this.logLevel]<=this.logLevels.info&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.info}${e.map(e=>e??String(e)).join(this.logSeparator)}`))}warn(...e){this.logLevels[this.logLevel]<=this.logLevels.warn&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.warn}${e.map(e=>e??String(e)).join(this.logSeparator)}`))}error(...e){this.logLevels[this.logLevel]<=this.logLevels.error&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.error}${e.map(e=>e??String(e)).join(this.logSeparator)}`))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.map(e=>e??String(e)).join(this.logSeparator))}logErr(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t,e);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t,void 0!==e.message?e.message:e,e.stack)}}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){const t=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${t} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Egern":case"Quantumult X":default:$done(e);break;case"Node.js":process.exit(1)}}}(e,t)}
