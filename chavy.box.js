const $ = new Env('chavy.box.js')
$.domain = '8.8.8.8'

$.KEY_sessions = 'chavy_boxjs_sessions'
$.KEY_userCfgs = 'chavy_boxjs_userCfgs'

$.json = $.name
$.html = $.name

!(async () => {
  const path = getPath($request.url)
  // 处理主页请求 => /home
  if (/^\/home/.test(path)) {
    handleHome()
  }
  // 处理 App 请求 => /app
  else if (/^\/app/.test(path)) {
    handleApp(path.split('/app/')[1])
  }
  // 处理 Api 请求 => /api
  else if (/^\/api/.test(path)) {
    $.isapi = true
    handleApi()
  }
})()
  .catch((e) => {
    $.logErr(e)
  })
  .finally(() => {
    if ($.isapi) {
      $.done({ body: $.json })
    } else {
      $.done({ body: $.html })
    }
  })

/**
 * https://dns.google/ => ``
 * https://dns.google/api => `/api`
 */
function getPath(url) {
  // 如果以`/`结尾, 先去掉最后一个`/`
  const fullpath = /\/$/.test(url) ? url.replace(/\/$/, '') : url
  return new RegExp($.domain).test(url) ? fullpath.split($.domain)[1] : undefined
}

function getSystemCfgs() {
  return {
    env: $.isSurge() ? 'Surge' : $.isQuanX ? 'QuanX' : 'Loon',
    envs: [
      { id: 'Surge', icon: 'https://raw.githubusercontent.com/Orz-3/task/master/surge.png' },
      { id: 'QuanX', icon: 'https://raw.githubusercontent.com/Orz-3/task/master/quantumultx.png' },
      { id: 'Loon', icon: 'https://raw.githubusercontent.com/Orz-3/task/master/loon.png' }
    ],
    chavy: {
      id: 'Chavy Scripts',
      icon: 'https://avatars3.githubusercontent.com/u/29748519?s=460&u=392a19e85465abbcb1791c9b8b32184a16e6795e&v=4',
      repo: 'https://github.com/chavyleung/scripts'
    },
    orz3: {
      id: 'Orz-3',
      icon: 'https://raw.githubusercontent.com/Orz-3/task/master/Orz-3.png',
      repo: 'https://github.com/Orz-3/'
    },
    boxjs: {
      id: 'BoxJs',
      show: false,
      icon: 'https://raw.githubusercontent.com/Orz-3/task/master/box.png',
      repo: 'https://github.com/chavyleung/scripts'
    }
  }
}

function getSystemApps() {
  const sysapps = [
    {
      id: '10010',
      name: '中国联通',
      keys: ['chavy_tokenurl_10010', 'chavy_tokenheader_10010', 'chavy_signurl_10010', 'chavy_signheader_10010', 'chavy_loginlotteryurl_10010', 'chavy_loginlotteryheader_10010', 'chavy_findlotteryurl_10010', 'chavy_findlotteryheader_10010'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/10010',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/10010.png', 'https://raw.githubusercontent.com/Orz-3/task/master/10010.png']
    },
    {
      id: '52poje',
      name: '吾爱破解',
      keys: ['CookieWA'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/52pojie-DailyBonus/52pojie.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/52pj.png', 'https://raw.githubusercontent.com/Orz-3/task/master/52pj.png']
    },
    {
      id: 'AcFun',
      name: 'AcFun',
      keys: ['chavy_cookie_acfun', 'chavy_token_acfun'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/acfun',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/acfun.png', 'https://raw.githubusercontent.com/Orz-3/task/master/acfun.png']
    },
    {
      id: 'ApkTw',
      name: 'ApkTw',
      keys: ['chavy_cookie_apktw'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/apktw',
      url: 'https://apk.tw/',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/apktw.png', 'https://raw.githubusercontent.com/Orz-3/task/master/apktw.png'],
      tasks: [{ cron: '3 0 * * *', script: 'apktw.js' }],
      rewrites: [{ type: 'request', pattern: '^https://apk.tw/member.php(.*?)action=login', script: 'apktw.cookie.js', body: true }]
    },
    {
      id: 'BAIDU',
      name: '百度签到',
      keys: ['chavy_cookie_tieba'],
      settings: [
        { id: 'CFG_tieba_isOrderBars', name: '按连签排序', val: false, type: 'boolean', desc: '默认按经验排序' },
        { id: 'CFG_tieba_maxShowBars', name: '每页显示数', val: 15, type: 'text', desc: '每页最显示多少个吧信息' },
        { id: 'CFG_tieba_maxSignBars', name: '每次并发', val: 5, type: 'text', desc: '每次并发签到多少个吧' },
        { id: 'CFG_tieba_signWaitTime', name: '并发间隔 (毫秒)', val: 2000, type: 'text', desc: '每次并发间隔时间' }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/tieba',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/baidu.png', 'https://raw.githubusercontent.com/Orz-3/task/master/baidu.png']
    },
    {
      id: 'iQIYI',
      name: '爱奇艺',
      keys: ['CookieQY'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/iQIYI-DailyBonus/iQIYI.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/iQIYI.png', 'https://raw.githubusercontent.com/Orz-3/task/master/iQIYI.png']
    },
    {
      id: 'JD',
      name: '京东',
      keys: ['CookieJD', 'CookieJD2'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/JD-DailyBonus/JD_DailyBonus.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/jd.png', 'https://raw.githubusercontent.com/Orz-3/task/master/jd.png']
    },
    {
      id: 'JD618',
      name: '京东618',
      keys: ['chavy_url_jd816', 'chavy_body_jd816', 'chavy_headers_jd816'],
      settings: [
        { id: 'CFG_618_radomms_min', name: '最小随机等待 (毫秒)', val: 2000, type: 'text', desc: '在任务默认的等待时间基础上，再增加的随机等待时间！' },
        { id: 'CFG_618_radomms_max', name: '最大随机等待 (毫秒)', val: 5000, type: 'text', desc: '在任务默认的等待时间基础上，再增加的随机等待时间！' },
        { id: 'CFG_618_isSignShop', name: '商店签到', val: true, type: 'boolean', desc: '71 家商店, 如果每天都签不上, 可以关掉了! 默认: true' },
        { id: 'CFG_618_isJoinBrand', name: '品牌会员', val: false, type: 'boolean', desc: '25 个品牌, 会自动加入品牌会员! 默认: true' },
        { id: 'CFG_BOOM_times_JD618', name: '炸弹次数', val: 1, type: 'text', desc: '总共发送多少次炸弹! 默认: 1' },
        { id: 'CFG_BOOM_interval_JD618', name: '炸弹间隔 (毫秒)', val: 100, type: 'text', desc: '每次间隔多少毫秒! 默认: 100' }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/jd',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/jd.png', 'https://raw.githubusercontent.com/Orz-3/task/master/jd.png']
    },
    {
      id: 'videoqq',
      name: '腾讯视频',
      keys: ['chavy_cookie_videoqq', 'chavy_auth_url_videoqq', 'chavy_auth_header_videoqq', 'chavy_msign_url_videoqq', 'chavy_msign_header_videoqq'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/videoqq',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/videoqq.png', 'https://raw.githubusercontent.com/Orz-3/task/master/videoqq.png']
    },
    {
      id: 'V2EX',
      name: 'V2EX',
      keys: ['chavy_cookie_v2ex'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/v2ex',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/v2ex.png', 'https://raw.githubusercontent.com/Orz-3/task/master/v2ex.png']
    },
    {
      id: 'NeteaseMusic',
      name: '网易云音乐',
      keys: ['chavy_cookie_neteasemusic'],
      settings: [
        { id: 'CFG_neteasemusic_retryCnt', name: '重试次数', val: 10, type: 'text', desc: '一直尝试签到直至出现“重复签到”标识!' },
        { id: 'CFG_neteasemusic_retryInterval', name: '重试间隔 (毫秒)', val: 500, type: 'text', desc: '每次重试间隔时间 (毫秒)！' }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/neteasemusic',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/Netease.png', 'https://raw.githubusercontent.com/Orz-3/task/master/Netease.png']
    },
    {
      id: 'WPS',
      name: 'WPS',
      keys: ['chavy_signhomeurl_wps', 'chavy_signhomeheader_wps'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/wps',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/wps.png', 'https://raw.githubusercontent.com/Orz-3/task/master/wps.png']
    },
    {
      id: 'NoteYoudao',
      name: '有道云笔记',
      keys: ['chavy_signurl_noteyoudao', 'chavy_signbody_noteyoudao', 'chavy_signheaders_noteyoudao'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/noteyoudao',
      url: 'https://apps.apple.com/cn/app/有道云笔记-扫描王版/id450748070',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/noteyoudao.png', 'https://raw.githubusercontent.com/Orz-3/task/master/noteyoudao.png'],
      tasks: [{ cron: '3 0 * * *', script: 'noteyoudao.js' }],
      rewrites: [{ type: 'request', pattern: '^https://note.youdao.com/yws/mapi/user?method=checkin', script: 'noteyoudao.cookie.js', body: true }]
    },
    {
      id: 'QTT',
      name: '趣头条',
      keys: ['senku_signKey_qtt', 'senku_signXTK_qtt', 'senku_readKey_qtt', 'senku_navCoinKey_qtt'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/qtt',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/qtt.png', 'https://raw.githubusercontent.com/Orz-3/task/master/qtt.png']
    },
    {
      id: 'qmkg',
      name: '全民K歌',
      keys: ['senku_signurl_qmkg', 'senku_signheader_qmkg', 'senku_signbody_qmkg'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/qmkg',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/qmkg.png', 'https://raw.githubusercontent.com/Orz-3/task/master/qmkg.png']
    },
    {
      id: 'bcz',
      name: '百词斩',
      keys: ['senku_cookie_bcz', 'senku_key_bcz'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/bcz',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/bcz.png', 'https://raw.githubusercontent.com/Orz-3/task/master/bcz.png']
    },
    {
      id: 'zxhc',
      name: '智行火车票',
      keys: ['senku_signurl_zxhc', 'senku_signheader_zxhc', 'senku_signbody_zxhc'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/zxhc',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/zxhc.png', 'https://raw.githubusercontent.com/Orz-3/task/master/zxhc.png']
    },
    {
      id: 'fenqile',
      name: '分期乐',
      keys: ['senku_signurl_fenqile', 'senku_signheader_fenqile', 'senku_signbody_fenqile', 'senku_signDailyKey_fenqile', 'senku_signDailyUrlKey_fenqile'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/fenqile',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/fenqile.png', 'https://raw.githubusercontent.com/Orz-3/task/master/fenqile.png']
    },
    {
      id: 'fandeng',
      name: '樊登读书',
      keys: ['senku_signurl_pandeng', 'senku_signheader_pandeng', 'senku_signbody_pandeng'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/fandeng',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/fandeng.png', 'https://raw.githubusercontent.com/Orz-3/task/master/fandeng.png']
    },
    {
      id: 'dbsj',
      name: '豆瓣时间',
      keys: ['senku_signurl_dbsj', 'senku_signheader_dbsj', 'senku_signbody_dbsj'],
      author: '@GideonSenku',
      repo: 'https://github.com/chavyleung/scripts/tree/master/dbsj',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/dbsj.png', 'https://raw.githubusercontent.com/Orz-3/task/master/dbsj.png']
    },
    {
      id: 'txnews',
      name: '腾讯新闻',
      keys: ['sy_signurl_txnews', 'sy_cookie_txnews', 'sy_signurl_txnews2', 'sy_cookie_txnews2'],
      author: '@Sunert',
      repo: 'https://github.com/Sunert/Scripts/blob/master/Task/txnews.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/txnews.png', 'https://raw.githubusercontent.com/Orz-3/task/master/txnews.png']
    },
    {
      id: 'BoxSwitcher',
      name: '会话切换',
      keys: [],
      settings: [{ id: 'CFG_BoxSwitcher_isSilent', name: '静默运行', val: false, type: 'boolean', desc: '切换会话时不发出系统通知!' }],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/box.png', 'https://raw.githubusercontent.com/Orz-3/task/master/box.png']
    },
    {
      id: 'sfexpress',
      name: '顺丰速运',
      keys: ['chavy_loginurl_sfexpress', 'chavy_loginheader_sfexpress'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/sfexpress',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/sfexpress.png', 'https://raw.githubusercontent.com/Orz-3/task/master/sfexpress.png']
    }
  ]
  sysapps
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((app) => {
      app.datas = Array.isArray(app.datas) ? app.datas : []
      app.keys.forEach((key) => {
        app.datas.push({ key, val: $.getdata(key) })
      })
      Array.isArray(app.settings) &&
        app.settings.forEach((setting) => {
          const val = $.getdata(setting.id)
          if (setting.type === 'boolean') {
            setting.val = val === null ? setting.val : val === 'true'
          } else if (setting.type === 'int') {
            setting.val = val * 1 || setting.val
          } else {
            setting.val = val || setting.val
          }
        })
    })
  return sysapps
}

function getUserCfgs() {
  const userCfgsStr = $.getdata($.KEY_userCfgs)
  return userCfgsStr ? JSON.parse(userCfgsStr) : {}
}

function getUserApps() {
  return []
}

function getSessions() {
  const sessionstr = $.getdata($.KEY_sessions)
  const sessions = sessionstr ? JSON.parse(sessionstr) : []
  return Array.isArray(sessions) ? sessions : []
}

function getSystemThemes() {
  return [
    { id: '', name: '默认' },
    { id: 'red', name: '红色' },
    { id: 'pink', name: '粉红' },
    { id: 'purple', name: '紫色' },
    { id: 'blue', name: '蓝色' },
    { id: 'light-blue', name: '浅蓝' },
    { id: 'brown', name: '棕色' },
    { id: 'grey', name: '灰色' },
    { id: 'blue-grey', name: '蓝灰' }
  ]
}

function handleApi() {
  const data = JSON.parse($request.body)
  // 保存会话
  if (data.cmd === 'saveSession') {
    const session = data.val
    const sessions = getSessions()
    const isExistsApp = getSystemApps().find((app) => app.id === session.appId)
    if (isExistsApp) {
      sessions.push(session)
      const savesuc = $.setdata(JSON.stringify(sessions), $.KEY_sessions)
      $.subt = `保存会话: ${savesuc ? '成功' : '失败'} (${session.appName})`
      $.desc = []
      $.desc.push(`会话名称: ${session.name}`, `应用名称: ${session.appName}`, `会话编号: ${session.id}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
      $.msg($.name, $.subt, $.desc.join('\n'))
    }
  }
  // 保存当前会话
  else if (data.cmd === 'saveCurAppSession') {
    const app = data.val
    const isExistsApp = getSystemApps().find((_app) => _app.id === app.id)
    if (isExistsApp) {
      let isAllSaveSuc = true
      app.datas.forEach((data) => {
        const oldval = $.getdata(data.key)
        const newval = data.val
        const savesuc = $.setdata(`${newval}`, data.key)
        isAllSaveSuc = !savesuc ? false : isAllSaveSuc
        $.log('', `❕ ${app.name}, 保存设置: ${data.key} ${savesuc ? '成功' : '失败'}!`, `旧值: ${oldval}`, `新值: ${newval}`)
      })
      $.subt = `保存会话: ${isAllSaveSuc ? '成功' : '失败'} (${app.name})`
      $.msg($.name, $.subt, '')
    }
  }
  // 保存设置
  else if (data.cmd === 'saveSettings') {
    $.log(`❕ ${$.name}, 保存设置!`)
    const settings = data.val
    if (Array.isArray(settings)) {
      settings.forEach((setting) => {
        const oldval = $.getdata(setting.id)
        const newval = setting.val
        const usesuc = $.setdata(`${newval}`, setting.id)
        $.log(`❕ ${$.name}, 保存设置: ${setting.id} ${usesuc ? '成功' : '失败'}!`, `旧值: ${oldval}`, `新值: ${newval}`)
        $.setdata(`${newval}`, setting.id)
      })
      $.subt = `保存设置: 成功! `
      $.msg($.name, $.subt, '')
    }
  }
  // 应用会话
  else if (data.cmd === 'useSession') {
    $.log(`❕ ${$.name}, 应用会话!`)
    const session = data.val
    const sessions = getSessions()
    const sessionIdx = sessions.findIndex((s) => session.id === s.id)
    if (sessions.splice(sessionIdx, 1) !== -1) {
      session.datas.forEach((data) => {
        const oldval = $.getdata(data.key)
        const newval = data.val
        const usesuc = $.setdata(`${newval}`, data.key)
        $.log(`❕ ${$.name}, 替换数据: ${data.key} ${usesuc ? '成功' : '失败'}!`, `旧值: ${oldval}`, `新值: ${newval}`)
      })
      $.subt = `应用会话: 成功 (${session.appName})`
      $.desc = []
      $.desc.push(`会话名称: ${session.name}`, `应用名称: ${session.appName}`, `会话编号: ${session.id}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
      $.msg($.name, $.subt, $.desc.join('\n'))
    }
  }
  // 删除会话
  else if (data.cmd === 'delSession') {
    const session = data.val
    const sessions = getSessions()
    const sessionIdx = sessions.findIndex((s) => session.id === s.id)
    if (sessions.splice(sessionIdx, 1) !== -1) {
      const delsuc = $.setdata(JSON.stringify(sessions), $.KEY_sessions) ? '成功' : '失败'
      $.subt = `删除会话: ${delsuc ? '成功' : '失败'} (${session.appName})`
      $.desc = []
      $.desc.push(`会话名称: ${session.name}`, `会话编号: ${session.id}`, `应用名称: ${session.appName}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
      $.msg($.name, $.subt, $.desc.join('\n'))
    }
  }
  // 保存用户偏好
  else if (data.cmd === 'saveUserCfgs') {
    const usercfgs = data.val
    $.setdata(JSON.stringify(usercfgs), $.KEY_userCfgs)
  }
}

function getBoxData() {
  return {
    sessions: getSessions(),
    sysapps: getSystemApps(),
    userapps: getUserApps(),
    syscfgs: getSystemCfgs(),
    usercfgs: getUserCfgs(),
    colors: getSystemThemes()
  }
}

function handleApp(appId) {
  const box = getBoxData()
  const curapp = appId ? box.sysapps.find((app) => app.id === appId) : null
  $.html = printHtml(JSON.stringify(box), JSON.stringify(curapp))
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

function handleHome() {
  const box = getBoxData()
  $.html = printHtml(JSON.stringify(box))
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

function printHtml(data, curapp = null) {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <title>BoxJs</title>
      <meta charset="utf-8" />
      <link rel="Bookmark" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="shortcut icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    </head>
    <body>
      <div id="app">
        <v-app v-scroll="onScroll">
          <v-app-bar :color="ui.appbar.color" app dense>
            <v-menu bottom left v-if="['app', 'home', 'log', 'data'].includes(ui.curview) && box.syscfgs.env === ''">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"><v-icon>mdi-palette</v-icon></v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(color, colorIdx) in box.colors" :key="color.id" @click="ui.appbar.color=color.id">
                  <v-list-item-title>22{{ color.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu bottom left v-else-if="['app', 'home', 'log', 'data'].includes(ui.curview) && box.syscfgs.env !== ''">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-avatar size="26">
                    <img :src="box.syscfgs.envs.find(e=>e.id===box.syscfgs.env).icon" alt="box.syscfgs.env" />
                  </v-avatar>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(env, envIdx) in box.syscfgs.envs" :key="env.id" @click="box.syscfgs.env=env.id">
                  <v-list-item-avatar size="24"><v-img :src="env.icon"></v-img></v-list-item-avatar>
                  <v-list-item-title>{{ env.id }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn icon @click="ui.curview = ui.bfview" v-else><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-autocomplete :label="ui.curapp ? ui.curapp.name + ' ' + ui.curapp.author : 'chavy.box.js'" no-data-text="未实现" dense hide-details solo> </v-autocomplete>
            <v-btn icon @click="ui.drawer.show = true">
              <v-avatar size="26">
                <img :src="box.syscfgs.orz3.icon" :alt="box.syscfgs.orz3.repo" />
              </v-avatar>
            </v-btn>
          </v-app-bar>
          <v-fab-transition>
            <v-speed-dial v-show="ui.box.show && !box.usercfgs.isHideBoxIcon" fixed fab bottom :left="ui.drawer.show" :right="!ui.drawer.show" class="mb-12">
              <template v-slot:activator>
                <v-btn fab>
                  <v-avatar size="48">
                    <img :src="box.syscfgs.boxjs.icon" :alt="box.syscfgs.boxjs.repo" />
                  </v-avatar>
                </v-btn>
              </template>
              <v-btn fab small color="grey" @click="box.usercfgs.isHideBoxIcon = true, onUserCfgsChange()">
                <v-icon>mdi-eye-off</v-icon>
              </v-btn>
              <v-btn fab small color="indigo" disabled>
                <v-icon>mdi-database-import</v-icon>
              </v-btn>
              <v-btn fab small color="green" @click="" v-clipboard:copy="JSON.stringify(boxdat)" v-clipboard:success="onCopy">
                <v-icon>mdi-export-variant</v-icon>
              </v-btn>
            </v-speed-dial>
          </v-fab-transition>
          <v-navigation-drawer v-model="ui.drawer.show" app temporary right>
            <v-list dense nav>
              <v-list-item two-line dense @click="onLink(box.syscfgs.chavy.repo)">
                <v-list-item-avatar>
                  <img src="https://avatars3.githubusercontent.com/u/29748519?s=460&u=392a19e85465abbcb1791c9b8b32184a16e6795e&v=4" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ box.syscfgs.chavy.id }}</v-list-item-title>
                  <v-list-item-subtitle>{{ box.syscfgs.chavy.repo }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-switch label="透明图标" v-model="box.usercfgs.isTransparentIcons" @change="onUserCfgsChange"></v-switch>
                </v-list-item-content>
                <v-list-item-action @click="onLink(box.syscfgs.orz3.repo)">
                  <v-btn fab small text>
                    <v-avatar size="32"><img :src="box.syscfgs.orz3.icon" :alt="box.syscfgs.orz3.repo" /></v-avatar>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-switch label="隐藏图标 (Box)" v-model="box.usercfgs.isHideBoxIcon" @change="onUserCfgsChange"></v-switch>
                </v-list-item-content>
                <v-list-item-action @click="onLink(box.syscfgs.boxjs.repo)">
                  <v-btn fab small text>
                    <v-avatar size="32"><img :src="box.syscfgs.boxjs.icon" :alt="box.syscfgs.boxjs.repo" /></v-avatar>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-switch label="隐藏底部导航" v-model="box.usercfgs.isHideNavi" @change="onUserCfgsChange"></v-switch>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-switch label="调试模式 (数据)" v-model="box.usercfgs.isDebugData" @change="onUserCfgsChange"></v-switch>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-switch label="调试模式 (格式)" v-model="box.usercfgs.isDebugFormat" @change="onUserCfgsChange"></v-switch>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
          <v-content>
            <v-container fluid v-if="ui.curview === 'app'">
              <v-card class="mx-auto" tile>
                <v-list nav dense>
                  <v-subheader inset>内置应用 ({{ box.sysapps.length }})</v-subheader>
                  <v-list-item three-line dense v-for="(app, appIdx) in box.sysapps" :key="app.id" @click="goAppSessionView(app)">
                    <v-list-item-avatar><v-img :src="app.icons[box.usercfgs.isTransparentIcons ? 0 : 1]"></v-img></v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ app.name }} ({{ app.id }})</v-list-item-title>
                      <v-list-item-subtitle>{{ app.repo }}</v-list-item-subtitle>
                      <v-list-item-subtitle color="blue">{{ app.author }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon> <v-icon color="grey lighten-1">mdi-chevron-right</v-icon></v-btn>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-subheader inset>
                    <span>自建应用 ({{ box.userapps.length }})</span>
                    <v-spacer></v-spacer>
                    <v-btn icon> <v-icon color="green">mdi-plus-circle</v-icon></v-btn>
                  </v-subheader>
                  <v-list-item three-line dense v-for="(app, appIdx) in box.userapps" :key="app.id" @click="goAppSessionView(app)">
                    <v-list-item-avatar><v-img :src="app.icon"></v-img></v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ app.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ app.repo }}</v-list-item-subtitle>
                      <v-list-item-subtitle color="blue">{{ app.author }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon> <v-icon color="grey lighten-1">mdi-chevron-right</v-icon></v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-container>
            <v-container fluid v-if="ui.curview === 'appsession'">
              <v-card class="mx-auto mb-4">
                <template v-if="Array.isArray(ui.curapp.settings)">
                  <v-subheader v-if="Array.isArray(ui.curapp.settings)">
                    应用设置 ({{ ui.curapp.settings.length }})
                  </v-subheader>
                  <v-form class="pl-4 pr-4">
                    <template v-for="(setting, settingIdx) in ui.curapp.settings">
                      <v-text-field :label="setting.name" v-model="setting.val" :hint="setting.desc" v-if="setting.type === 'text'"></v-text-field>
                      <v-slider :label="setting.name" v-model="setting.val" :hint="setting.desc" :min="setting.min" :max="setting.max" thumb-label="always" v-else-if="setting.type === 'slider'"></v-slider>
                      <v-switch :label="setting.name" v-model="setting.val" :hint="setting.desc" v-else-if="setting.type === 'boolean'"></v-switch>
                    </template>
                  </v-form>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn small text color="success" @click="onSaveSettings">保存设置</v-btn>
                  </v-card-actions>
                </template>
              </v-card>
              <v-card class="mx-auto" v-if="ui.curapp.datas && ui.curapp.datas.length > 0">
                <v-subheader>
                  当前会话 ({{ ui.curapp.datas.length }})
                  <v-spacer></v-spacer>
                  <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="" v-clipboard:copy="JSON.stringify(ui.curapp)" v-clipboard:success="onCopy">
                        <v-list-item-title>复制会话</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="ui.impSessionDialog.show = true">
                        <v-list-item-title>导入会话</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-subheader>
                <v-list-item two-line dense v-for="(data, dataIdx) in ui.curapp.datas" :key="dataIdx">
                  <v-list-item-content>
                    <v-list-item-title>{{ data.key }}</v-list-item-title>
                    <v-list-item-subtitle>{{ data.val ? data.val : '无数据!' }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click.stop="onClearCurAppSessionData(ui.curapp, ui.curapp.datas, data)">
                      <v-icon color="grey darken-1">mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn small text color="success" @click="onSaveSession">保存会话</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="ml-10 mt-4" v-for="(session, sessionIdx) in ui.curappSessions" :key="session.id">
                <v-subheader>
                  #{{ sessionIdx + 1 }} {{ session.name }}
                </v-subheader>
                <v-list-item two-line dense v-for="(data, dataIdx) in session.datas" :key="dataIdx">
                  <v-list-item-content>
                    <v-list-item-title>{{ data.key }}</v-list-item-title>
                    <v-list-item-subtitle>{{ data.val ? data.val : '无数据!' }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-btn small text color="grey">{{ session.createTime }}</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn small text color="error" @click="onDelSession(session)">删除</v-btn>
                  <v-btn small text color="success" @click="onUseSession(session)">应用</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="ma-4" v-if="ui.curappSessions.length === 0">
                <v-card-text>当前脚本没有自建会话!</v-card-text>
              </v-card>
              <v-dialog v-model="ui.impSessionDialog.show" scrollable>
                <v-card>
                  <v-card-title>
                    导入会话
                    <v-spacer></v-spacer>
                    <v-btn text small class="mr-n4" color="red darken-1" @click="ui.impSessionDialog.impval = ''">清空</v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-textarea clearable auto-grow v-model="ui.impSessionDialog.impval" label="会话数据 (JSON)" hint="请粘贴 JSON 格式的会话数据! 你可以通过 复制会话 获得数据."></v-textarea>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-btn text small @click="" v-clipboard:copy="ui.impSessionDialog.impval" v-clipboard:success="onCopy">复制</v-btn>
                    <v-btn text small @click="onImpSessionPaste">粘粘</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text small color="grey darken-1" text @click="ui.impSessionDialog.show = false">取消</v-btn>
                    <v-btn text small color="success darken-1" text @click="onImpSession">导入</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-container>
            <v-snackbar top color="success" v-model="ui.snackbar.show" :timeout="ui.snackbar.timeout">
              {{ ui.snackbar.text }}
              <template v-slot:action>
              <v-btn text @click="ui.snackbar.show = false">关闭</v-btn>
              </template>
            </v-snackbar>
          </v-content>
          <v-expand-transition>
            <v-bottom-navigation :value="ui.curview" app v-show="ui.navi.show && !box.usercfgs.isHideNavi">
              <v-btn value="home">
                <span>首页</span>
                <v-icon>mdi-home</v-icon>
              </v-btn>
              <v-btn value="app">
                <span>应用</span>
                <v-icon>mdi-application</v-icon>
              </v-btn>
              <v-btn value="data">
                <span>数据</span>
                <v-icon>mdi-database</v-icon>
              </v-btn>
              <v-btn value="log">
                <span>日志</span>
                <v-icon>mdi-calendar-text</v-icon>
              </v-btn>
            </v-bottom-navigation>
          </v-expand-transition>
        </v-app>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/moment@2.26.0/moment.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/uuid@latest/dist/umd/uuidv4.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vue-clipboard2@0.3.1/dist/vue-clipboard.min.js"></script>
      <script>
        new Vue({
          el: '#app',
          vuetify: new Vuetify({ theme: { dark: true } }),
          data() {
            return {
              ui: {
                scrollY: 0,
                bfview: 'app',
                curview: 'app',
                curapp: ${curapp},
                curappTabs: { curtab: 'sessions' },
                curappSessions: null,
                impSessionDialog: { show: false, impval: '' },
                snackbar: { show: false, text: '已复制!', timeout: 2000 },
                appbar: { color: '' },
                box: { show: false },
                navi: { show: false },
                drawer: { show: false }
              },
              box: ${data}
            }
          },
          computed: {
            boxdat: function () {
              const KEY_sessions = 'chavy_boxjs_sessions'
              const KEY_sysCfgs = 'chavy_boxjs_sysCfgs'
              const KEY_userCfgs = 'chavy_boxjs_userCfgs'
              const KEY_sysApps = 'chavy_boxjs_sysApps'
              const dat = {}
              dat[KEY_sessions] = this.box.sessions
              dat[KEY_sysCfgs] = this.box.syscfgs
              dat[KEY_userCfgs] = this.box.usercfgs
              dat[KEY_sysApps] = this.box.sysapps
              this.box.sysapps.forEach((app, appIdx) => {
                app.datas.forEach((data, dataIdx) => {
                  if (![undefined, null].includes(data.val)) {
                    dat[data.key] = data.val
                  }
                })
              })
              return dat
            }
          },
          watch: {
            'ui.curview': {
              handler(newval, oldval) {
                this.ui.bfview = oldval
                if (newval === 'app') {
                  this.ui.curapp = null
                  this.ui.curappSessions = null
                  var state = { title: 'BoxJs' }
                  document.title = state.title
                  history.pushState(state, '', '/home')
                  this.$vuetify.goTo(this.ui.scrollY, {duration: 0, offset: 0})
                }
              }
            }
          },
          methods: {
            onLink(link) {
              window.open(link)
            },
            onScroll(e) {
              if(this.ui.curview === 'app') {
                this.ui.scrollY = e.currentTarget.scrollY + 48
              }
            },
            onUserCfgsChange() {
              axios.post('/api', JSON.stringify({ cmd: 'saveUserCfgs', val: this.box.usercfgs }))
            },
            goAppSessionView(app) {
              this.ui.bfview = this.ui.curview
              this.ui.curapp = app
              this.ui.curappSessions = this.box.sessions.filter((s) => s.appId === this.ui.curapp.id)
              this.ui.curview = 'appsession'
              var state = { title: 'BoxJs - ' + this.ui.curapp.name, url: window.location.href }
              history.pushState(state, '', '/app/' + this.ui.curapp.id)
              document.title = state.title
            },
            onClearCurAppSessionData(app, datas, data) {
              data.val = ''
              axios.post('/api', JSON.stringify({ cmd: 'saveCurAppSession', val: app }))
            },
            onSaveSession() {
              const session = {
                id: uuidv4(),
                name: '会话 ' + (this.ui.curappSessions.length + 1),
                appId: this.ui.curapp.id,
                appName: this.ui.curapp.name,
                enable: true,
                createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                datas: this.ui.curapp.datas
              }
              this.box.sessions.push(session)
              this.ui.curappSessions.push(session)
              axios.post('/api', JSON.stringify({ cmd: 'saveSession', val: session }))
            },
            onSaveSettings() {
              axios.post('/api', JSON.stringify({ cmd: 'saveSettings', val: this.ui.curapp.settings }))
            },
            onImpSessionPaste() {
              navigator.clipboard.readText().then((text) => {
                this.ui.impSessionDialog.impval = ''
                this.ui.impSessionDialog.impval = text
              })
            },
            onImpSession() {
              const impjson = this.ui.impSessionDialog.impval
              const impSession = impjson && JSON.parse(impjson)
              if (impSession && impSession.id && impSession.id === this.ui.curapp.id) {
                const impDatas = []
                this.ui.curapp.datas.forEach((data) => {
                  const impdata = impSession.datas.find((d) => d.key === data.key)
                  impDatas.push(impdata)
                })
                const session = {
                  id: uuidv4(),
                  name: '会话 ' + (this.ui.curappSessions.length + 1),
                  appId: this.ui.curapp.id,
                  appName: this.ui.curapp.name,
                  enable: true,
                  createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                  datas: impSession.datas
                }
                this.box.sessions.push(session)
                this.ui.curappSessions.push(session)
                axios.post('/api', JSON.stringify({ cmd: 'saveSession', val: session }))
                this.ui.impSessionDialog.show = false
              } else {
                alert('导入失败! 原因: appId 为空?')
              }
            },
            onDelSession(session) {
              axios.post('/api', JSON.stringify({ cmd: 'delSession', val: session }))
              const sessionIdx = this.box.sessions.findIndex((s) => session.id === s.id)
              if (this.box.sessions.splice(sessionIdx, 1) !== -1) {
                this.ui.curappSessions = this.box.sessions.filter((s) => s.appId === this.ui.curapp.id)
              }
            },
            onUseSession(session) {
              axios.post('/api', JSON.stringify({ cmd: 'useSession', val: session }))
              this.ui.curapp.datas = JSON.parse(JSON.stringify(session.datas))
            },
            onCopy(e) {
              this.ui.snackbar.show = true
            }
          },
          mounted: function () {
            if (this.ui.curapp) {
              this.goAppSessionView(this.ui.curapp)
            }
            setTimeout(() => {
              this.ui.navi.show = true
            }, 500)
            setTimeout(() => {
              this.ui.box.show = true
            }, 500)
          }
        })
      </script>
    </body>
  </html>
  
  `
}

function printJson() {
  return ''
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),h=JSON.stringify(this.data);e?this.fs.writeFileSync(t,h):i?this.fs.writeFileSync(s,h):this.fs.writeFileSync(t,h)}}getdata(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setdata(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)):this.isNode()&&(this.got=this.got?this.got:require("got"),this.got(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t));else if(this.isNode()){this.got=this.got?this.got:require("got");const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t))}}msg(s=t,e="",i="",h){this.isSurge()||this.isLoon()?$notification.post(s,e,i):this.isQuanX()&&$notify(s,e,i),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
