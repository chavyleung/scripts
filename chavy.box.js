const $ = new Env('BoxJs')
$.domain = '8.8.8.8'

$.version = '0.5.4'
$.versionType = 'beta'
$.KEY_sessions = 'chavy_boxjs_sessions'
$.KEY_versions = 'chavy_boxjs_versions'
$.KEY_userCfgs = 'chavy_boxjs_userCfgs'
$.KEY_globalBaks = 'chavy_boxjs_globalBaks'
$.KEY_curSessions = 'chavy_boxjs_cur_sessions'

$.json = $.name
$.html = $.name

!(async () => {
  const path = getPath($request.url)
  // 处理主页请求 => /home
  if (/^\/home/.test(path)) {
    await handleHome()
  }
  // 处理主页请求 => /sub
  else if (/^\/sub/.test(path)) {
    await handleSub()
  }
  // 处理 App 请求 => /app
  else if (/^\/app/.test(path)) {
    const [, appId] = path.split('/app/')
    await handleApp(decodeURIComponent(decodeURIComponent(appId)))
  }
  // 处理 Api 请求 => /api
  else if (/^\/api/.test(path)) {
    $.isapi = true
    await handleApi()
  }
  // 处理 Api 请求 => /my
  else if (/^\/my/.test(path)) {
    await handleMy()
  }
  // 处理 revert 请求 => /revert
  else if (/^\/revert/.test(path)) {
    await handleRevert()
  }
})()
  .catch((e) => {
    $.logErr(e)
  })
  .finally(() => {
    if ($.isapi) {
      $done({ body: $.json })
    } else {
      $.done({ status: 200, body: $.html })
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
    env: $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isSurge() ? 'Surge' : 'Node',
    version: $.version,
    versionType: $.versionType,
    envs: [
      { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/task/master/surge.png'] },
      { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/task/master/quantumultx.png'] },
      { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/task/master/loon.png'] }
    ],
    chavy: {
      id: 'Chavy Scripts',
      icon: 'https://avatars3.githubusercontent.com/u/29748519',
      repo: 'https://github.com/chavyleung/scripts'
    },
    senku: {
      id: 'GideonSenku',
      icon: 'https://avatars1.githubusercontent.com/u/39037656',
      repo: 'https://github.com/GideonSenku'
    },
    orz3: {
      id: 'Orz-3',
      icon: 'https://raw.githubusercontent.com/Orz-3/task/master/Orz-3.png',
      repo: 'https://github.com/Orz-3/'
    },
    contributors: [
      { id: 'danchaw', icon: 'https://avatars1.githubusercontent.com/u/33873206?s=60&v=4', repo: 'https://github.com/danchaw' },
      { id: '0x959', icon: 'https://avatars3.githubusercontent.com/u/42092849?s=60&v=4', repo: 'https://github.com/0x959' },
      { id: 'lcandy2', icon: 'https://avatars1.githubusercontent.com/u/45784494?s=60&v=4', repo: 'https://github.com/lcandy2' },
      { id: 'lowking', icon: 'https://avatars0.githubusercontent.com/u/33308659?s=60&v=4', repo: 'https://github.com/lowking' },
      { id: 'chouchoui', icon: 'https://avatars1.githubusercontent.com/u/14866249?s=60&v=4', repo: 'https://github.com/chouchoui' },
      { id: 'evilbutcher', icon: 'https://avatars1.githubusercontent.com/u/62224738?s=60&v=4', repo: 'https://github.com/evilbutcher' },
      { id: 'eegod', icon: 'https://avatars0.githubusercontent.com/u/9635792?s=60&v=4', repo: 'https://github.com/eegod' },
      { id: 'KaytZ', icon: 'https://avatars2.githubusercontent.com/u/17397324?s=60&v=4', repo: 'https://github.com/KaytZ' }
    ],
    boxjs: {
      id: 'BoxJs',
      show: false,
      icon: 'https://raw.githubusercontent.com/Orz-3/task/master/box.png',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/box.png', 'https://raw.githubusercontent.com/Orz-3/task/master/box.png'],
      repo: 'https://github.com/chavyleung/scripts'
    }
  }
}

function getSystemApps() {
  const sysapps = [
    {
      id: '52poje',
      name: '吾爱破解',
      keys: ['CookieWA'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/52pojie-DailyBonus/52pojie.js',
      icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/52pj.png', 'https://raw.githubusercontent.com/Orz-3/task/master/52pj.png']
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
    }
  ]
  sysapps.sort((a, b) => a.id.localeCompare(b.id))
  wrapapps(sysapps)
  return sysapps
}

function getUserCfgs() {
  const defcfgs = { favapps: [], appsubs: [], appsubCaches: {}, refreshsecs: 3 }
  const userCfgsStr = $.getdata($.KEY_userCfgs)
  return userCfgsStr ? Object.assign(defcfgs, JSON.parse(userCfgsStr)) : defcfgs
}

function getGlobalBaks() {
  const globalBaksStr = $.getdata($.KEY_globalBaks)
  return globalBaksStr ? JSON.parse(globalBaksStr) : []
}

function refreshAppSub(sub, usercfgs) {
  return new Promise((resolve) => {
    const suburl = sub.url.replace(/[ ]|[\r\n]/g, '')
    $.get({ url: suburl }, (err, resp, data) => {
      try {
        const respsub = JSON.parse(data)
        if (Array.isArray(respsub.apps)) {
          respsub._raw = sub
          respsub.updateTime = new Date()
          usercfgs.appsubCaches[suburl] = respsub
          console.log(`更新订阅, 成功! ${suburl}`)
        }
      } catch (e) {
        $.logErr(e, resp)
        sub.isErr = true
        sub.apps = []
        sub._raw = JSON.parse(JSON.stringify(sub))
        sub.updateTime = new Date()
        usercfgs.appsubCaches[suburl] = sub
        console.log(`更新订阅, 失败! ${suburl}`)
      } finally {
        resolve()
      }
    })
  })
}

async function refreshAppSubs(subId) {
  $.msg($.name, '更新订阅: 开始!')
  const usercfgs = getUserCfgs()
  const refreshActs = []
  if (subId) {
    const sub = usercfgs.appsubs.find((sub) => sub.id === subId)
    refreshActs.push(refreshAppSub(sub, usercfgs))
  } else {
    for (let subIdx = 0; subIdx < usercfgs.appsubs.length; subIdx++) {
      const sub = usercfgs.appsubs[subIdx]
      refreshActs.push(refreshAppSub(sub, usercfgs))
    }
  }
  await Promise.all(refreshActs)
  $.setdata(JSON.stringify(usercfgs), $.KEY_userCfgs)
  console.log(`全部订阅, 完成!`)
  const endTime = new Date().getTime()
  const costTime = (endTime - $.startTime) / 1000
  $.msg($.name, `更新订阅: 完成! 🕛 ${costTime} 秒`)
}

function getAppSubs() {
  const usercfgs = getUserCfgs()
  const appsubs = []
  for (let subIdx = 0; subIdx < usercfgs.appsubs.length; subIdx++) {
    const sub = usercfgs.appsubs[subIdx]
    const suburl = sub.url.replace(/[ ]|[\r\n]/g, '')
    const cachedsub = usercfgs.appsubCaches[suburl]
    if (cachedsub && Array.isArray(cachedsub.apps)) {
      cachedsub._raw = sub
      cachedsub.apps.forEach((app) => (app.datas = []))
      wrapapps(cachedsub.apps)
      appsubs.push(cachedsub)
    } else {
      sub.isErr = true
      sub.apps = []
      sub._raw = JSON.parse(JSON.stringify(sub))
      appsubs.push(sub)
    }
  }
  return appsubs
}

function getUserApps() {
  return []
}

function wrapapps(apps) {
  apps.forEach((app) => {
    // 获取持久化数据
    app.datas = Array.isArray(app.datas) ? app.datas : []
    app.keys.forEach((key) => {
      const valdat = $.getdata(key)
      const val = [undefined, null, 'null', ''].includes(valdat) ? null : valdat
      app.datas.push({ key, val })
    })
    Array.isArray(app.settings) &&
      app.settings.forEach((setting) => {
        const valdat = $.getdata(setting.id)
        const val = [undefined, null, 'null', ''].includes(valdat) ? null : valdat
        if (setting.type === 'boolean') {
          setting.val = val === null ? setting.val : val === 'true'
        } else if (setting.type === 'int') {
          setting.val = val * 1 || setting.val
        } else if (setting.type === 'checkboxes') {
          if (![null, undefined].includes(valdat)) {
            setting.val = valdat ? valdat.split(',') : []
          }
        } else {
          setting.val = val || setting.val
        }
        app.author = app.author ? app.author : '@anonymous'
        app.repo = app.repo ? app.repo : '作者很神秘, 没有留下任何线索!'
      })
    // 判断是否收藏应用
    const usercfgs = getUserCfgs()
    const favapps = usercfgs && usercfgs.favapps
    if (favapps) {
      app.isFav = favapps.findIndex((appId) => app.id === appId) > -1 ? true : false
    }
  })
}

function getSessions() {
  const sessionstr = $.getdata($.KEY_sessions)
  const sessions = sessionstr ? JSON.parse(sessionstr) : []
  return Array.isArray(sessions) ? sessions : []
}

async function getVersions() {
  let vers = []
  // 如果启用了修复功能, 则直接返回, 不发送检查版本请求
  // const usercfgs = getUserCfgs()
  // if (['true', true].includes(usercfgs.isFixVPN)) {
  //   return vers
  // }
  await new Promise((resolve) => {
    setTimeout(resolve, 1000)
    const verurl = `https://cdn.jsdelivr.net/gh/chavyleung/scripts@${$.version}/box/release/box.release.json`
    $.get({ url: verurl }, (err, resp, data) => {
      try {
        const _data = JSON.parse(data)
        vers = Array.isArray(_data.releases) ? _data.releases : vers
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
  return vers
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

async function handleApi() {
  const data = JSON.parse($request.body)
  // 保存会话
  if (data.cmd === 'saveSession') {
    const session = data.val
    const sessions = getSessions()
    sessions.push(session)
    const savesuc = $.setdata(JSON.stringify(sessions), $.KEY_sessions)
    $.subt = `保存会话: ${savesuc ? '成功' : '失败'} (${session.appName})`
    $.desc = []
    $.desc.push(`会话名称: ${session.name}`, `应用名称: ${session.appName}`, `会话编号: ${session.id}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
    $.msg($.name, $.subt, $.desc.join('\n'))
  }
  // 保存至指定会话
  else if (data.cmd === 'saveSessionTo') {
    const { fromapp, toSession } = data.val
    const sessions = getSessions()
    const session = sessions.find((s) => s.id === toSession.id)
    session.datas = fromapp.datas
    const savesuc = $.setdata(JSON.stringify(sessions), $.KEY_sessions)
    $.subt = `保存会话: ${savesuc ? '成功' : '失败'} (${session.appName})`
    $.desc = []
    $.desc.push(`会话名称: ${session.name}`, `应用名称: ${session.appName}`, `会话编号: ${session.id}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
    $.msg($.name, $.subt, $.desc.join('\n'))
  }
  // 修改指定会话
  else if (data.cmd === 'onModSession') {
    const sessiondat = data.val
    const sessions = getSessions()
    const session = sessions.find((s) => s.id === sessiondat.id)
    session.name = sessiondat.name
    session.datas = sessiondat.datas
    const savesuc = $.setdata(JSON.stringify(sessions), $.KEY_sessions)
    $.subt = `保存会话: ${savesuc ? '成功' : '失败'} (${session.appName})`
    $.desc = []
    $.desc.push(`会话名称: ${session.name}`, `应用名称: ${session.appName}`, `会话编号: ${session.id}`, `应用编号: ${session.appId}`, `数据: ${JSON.stringify(session)}`)
    $.msg($.name, $.subt, $.desc.join('\n'))
  }
  // 保存当前会话
  else if (data.cmd === 'saveCurAppSession') {
    const app = data.val
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
  // 保存设置
  else if (data.cmd === 'saveSettings') {
    $.log(`❕ ${$.name}, 保存设置!`)
    const settings = data.val
    if (Array.isArray(settings)) {
      settings.forEach((setting) => {
        const oldval = $.getdata(setting.id)
        const newval = `${setting.val}`
        const usesuc = $.setdata(newval, setting.id)
        $.log(`❕ ${$.name}, 保存设置: ${setting.id} ${usesuc ? '成功' : '失败'}!`, `旧值: ${oldval}`, `新值: ${newval}`)
        $.setdata(newval, setting.id)
      })
      $.subt = `保存设置: 成功! `
      $.msg($.name, $.subt, '')
    }
  }
  // 应用会话
  else if (data.cmd === 'useSession') {
    $.log(`❕ ${$.name}, 应用会话!`)
    const curSessionsstr = $.getdata($.KEY_curSessions)
    const curSessions = ![undefined, null, 'null', ''].includes(curSessionsstr) ? JSON.parse(curSessionsstr) : {}
    const session = data.val
    const sessions = getSessions()
    const sessionIdx = sessions.findIndex((s) => session.id === s.id)
    if (sessions.splice(sessionIdx, 1) !== -1) {
      session.datas.forEach((data) => {
        const oldval = $.getdata(data.key)
        const newval = data.val
        const isNull = (val) => [undefined, null, 'null', 'undefined', ''].includes(val)
        const usesuc = $.setdata(isNull(newval) ? '' : `${newval}`, data.key)
        $.log(`❕ ${$.name}, 替换数据: ${data.key} ${usesuc ? '成功' : '失败'}!`, `旧值: ${oldval}`, `新值: ${newval}`)
      })
      curSessions[session.appId] = session.id
      $.setdata(JSON.stringify(curSessions), $.KEY_curSessions)
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
  // 添加应用订阅
  else if (data.cmd === 'addAppSub') {
    $.msg($.name, '添加订阅: 开始!')
    const sub = data.val
    const usercfgs = getUserCfgs()
    usercfgs.appsubs.push(sub)
    await refreshAppSub(sub, usercfgs)
    $.setdata(JSON.stringify(usercfgs), $.KEY_userCfgs)
    const endTime = new Date().getTime()
    const costTime = (endTime - $.startTime) / 1000
    $.msg($.name, `添加订阅: 完成! 🕛 ${costTime} 秒`)
  }
  // 删除应用订阅
  else if (data.cmd === 'delAppSub') {
    const subId = data.val
    const usercfgs = getUserCfgs()
    const subIdx = usercfgs.appsubs.findIndex((s) => s.id === subId)
    if (usercfgs.appsubs.splice(subIdx, 1) !== -1) {
      const delsuc = $.setdata(JSON.stringify(usercfgs), $.KEY_userCfgs) ? '成功' : '失败'
      $.subt = `删除订阅: ${delsuc ? '成功' : '失败'}`
      $.msg($.name, $.subt, '')
    }
  }
  // 全局备份
  else if (data.cmd === 'globalBak') {
    const baks = getGlobalBaks()
    baks.push(data.val)
    const baksuc = $.setdata(JSON.stringify(baks), $.KEY_globalBaks)
    $.subt = `全局备份: ${baksuc ? '成功' : '失败'}`
    $.msg($.name, $.subt, '')
  }
  // 删除全局备份
  else if (data.cmd === 'delGlobalBak') {
    const baks = getGlobalBaks()
    const bakIdx = baks.findIndex((b) => b.id === data.val)
    if (baks.splice(bakIdx, 1) !== -1) {
      const delsuc = $.setdata(JSON.stringify(baks), $.KEY_globalBaks) ? '成功' : '失败'
      $.subt = `删除备份: ${delsuc ? '成功' : '失败'}`
      $.msg($.name, $.subt, '')
    }
  }
  // 还原全局备份
  else if (data.cmd === 'revertGlobalBak') {
    const baks = getGlobalBaks()
    const bakobj = baks.find((b) => b.id === data.val)
    if (bakobj && bakobj.bak) {
      const { chavy_boxjs_sessions, chavy_boxjs_sysCfgs, chavy_boxjs_userCfgs, chavy_boxjs_sysApps, ...datas } = bakobj.bak
      $.setdata(JSON.stringify(chavy_boxjs_sessions), $.KEY_sessions)
      $.setdata(JSON.stringify(chavy_boxjs_userCfgs), $.KEY_userCfgs)
      const isNull = (val) => [undefined, null, 'null', 'undefined', ''].includes(val)
      Object.keys(datas).forEach((datkey) => $.setdata(isNull(datas[datkey]) ? '' : `${datas[datkey]}`, datkey))
      $.subt = '还原备份: 成功'
      $.msg($.name, $.subt, $.desc)
    } else {
      $.subt = '还原备份: 失败'
      $.desc = `找不到备份: ${data.val}`
      $.msg($.name, $.subt, $.desc)
    }
  }
  // 刷新应用订阅
  else if (data.cmd === 'refreshAppSubs') {
    await refreshAppSubs(data && data.val)
  }
  // 抹掉订阅缓存
  else if (data.cmd === 'revertSubCaches') {
    console.log(data.cmd)
    const usercfgs = getUserCfgs()
    usercfgs.appsubCaches = {}
    const delsuc = $.setdata(JSON.stringify(usercfgs), $.KEY_userCfgs)
    $.subt = `抹掉订阅缓存: ${delsuc ? '成功' : '失败'}`
    $.msg($.name, $.subt)
  }
  // 抹掉备份
  else if (data.cmd === 'revertBaks') {
    const delsuc = $.setdata('', $.KEY_globalBaks) ? '成功' : '失败'
    $.subt = `抹掉备份: ${delsuc ? '成功' : '失败'}`
    $.msg($.name, $.subt)
  }
  // 抹掉会话
  else if (data.cmd === 'revertSessions') {
    const delsuc = $.setdata('', $.KEY_sessions) ? '成功' : '失败'
    $.setdata('', $.KEY_curSessions)
    $.subt = `抹掉会话: ${delsuc ? '成功' : '失败'}`
    $.msg($.name, $.subt)
  }
}

async function getBoxData() {
  const box = {
    sessions: getSessions(),
    versions: await getVersions(),
    sysapps: getSystemApps(),
    userapps: getUserApps(),
    appsubs: getAppSubs(),
    syscfgs: getSystemCfgs(),
    usercfgs: getUserCfgs(),
    globalbaks: getGlobalBaks(),
    colors: getSystemThemes()
  }
  const apps = []
  apps.push(...box.sysapps)
  box.appsubs.forEach((sub) => apps.push(...sub.apps))
  box.usercfgs.favapps = box.usercfgs.favapps.filter((favappId) => apps.find((app) => app.id === favappId))
  return box
}

async function handleHome() {
  const box = await getBoxData()
  $.html = printHtml(JSON.stringify(box))
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`, `\${curview}`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

async function handleApp(appId) {
  const box = await getBoxData()
  const apps = []
  const cursysapp = box.sysapps.find((app) => app.id === appId)
  if (cursysapp) {
    apps.push(cursysapp)
  }
  box.appsubs.filter((sub) => sub.enable !== false).forEach((sub) => apps.push(...sub.apps))
  const curapp = apps.find((app) => app.id === appId)
  $.html = printHtml(JSON.stringify(box), JSON.stringify(curapp), 'appsession')
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`, `\${curview}`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

async function handleSub() {
  const box = await getBoxData()
  $.html = printHtml(JSON.stringify(box), null, 'sub')
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`, `\${curview}`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

async function handleMy() {
  const box = await getBoxData()
  $.html = printHtml(JSON.stringify(box), null, 'my')
  if (box.usercfgs.isDebugFormat) {
    console.log(printHtml(`'\${data}'`, `'\${curapp}'`, `\${curview}`))
  } else if (box.usercfgs.isDebugData) {
    console.log($.html)
  }
}

async function handleRevert() {
  $.html = printRevertHtml()
}

function printRevertHtml() {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <title>BoxJs</title>
      <meta charset="utf-8" />
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      <link rel="Bookmark" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="shortcut icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet" />
    </head>
    <body>
      <div id="app">
        <v-app v-cloak>
          <v-container>
            <v-card class="mt-4">
              <v-card-title>抹掉订阅缓存</v-card-title>
              <v-card-text>
                <p class="">该操作会抹掉: <font class="error--text">订阅缓存</font></p>
                如果添加、更新了订阅后出现白屏现象, 可以尝试抹掉用户设置 <br />
                注意: 该操作不会删掉订阅, 只会清空订阅缓存
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-dialog v-model="ui.revertSubCachesDialog.show" persistent max-width="290">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn small text color="error" v-on="on">抹掉</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">确定抹掉订阅?</v-card-title>
                    <v-card-text>该操作不可逆, 请注意备份!</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="grey darken-1" text @click="ui.revertSubCachesDialog.show = false">取消</v-btn>
                      <v-btn color="green darken-1" text @click="revertSubCaches()">确定</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
            </v-card>
            <v-card class="mt-4">
              <v-card-title>抹掉全局备份</v-card-title>
              <v-card-text>
                <p>该操作会抹掉: <font class="error--text">全局备份</font></p>
                如果备份、导入备份后出现 VPN 断开重连现象, 可尝试抹掉所有备份
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-dialog v-model="ui.revertBaksDialog.show" persistent max-width="290">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn small text color="error" v-on="on">抹掉</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">确定抹掉备份?</v-card-title>
                    <v-card-text>该操作不可逆, 请注意备份!</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="grey darken-1" text @click="ui.revertBaksDialog.show = false">取消</v-btn>
                      <v-btn color="green darken-1" text @click="revertBaks()">确定</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
            </v-card>
            <v-card class="mt-4">
              <v-card-title>抹掉所有会话</v-card-title>
              <v-card-text>
                <p>该操作会抹掉: <font class="error--text">所有会话</font></p>
                如果切换会话时出现不符预期现象, 可尝试抹掉所有会话
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-dialog v-model="ui.revertSessionsDialog.show" persistent max-width="290">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn small text color="error" v-on="on">抹掉</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">确定抹掉会话?</v-card-title>
                    <v-card-text>该操作不可逆, 请注意备份!</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="grey darken-1" text @click="ui.revertSessionsDialog.show = false">取消</v-btn>
                      <v-btn color="green darken-1" text @click="revertSessions()">确定</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
            </v-card>
            <v-overlay v-model="ui.overlay.show" :opacity="0.7">
              <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>
          </v-container>
        </v-app>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js"></script>
      <script>
        new Vue({
          el: '#app',
          vuetify: new Vuetify({ theme: { dark: true } }),
          data() {
            return {
              ui: {
                overlay: { show: false },
                revertSubCachesDialog: {show: false},
                revertBaksDialog: {show: false},
                revertSessionsDialog: {show: false}
              }
            }
          },
          computed: {
          },
          watch: {
          },
          methods: {
            revertSubCaches: function() {
              this.ui.revertSubCachesDialog.show = false
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'revertSubCaches', val: null })).finally(() => {
                this.ui.overlay.show = false
              })
            },
            revertBaks: function() {
              this.ui.revertBaksDialog.show = false
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'revertBaks', val: null })).finally(() => {
                this.ui.overlay.show = false
              })
            },
            revertSessions: function() {
              this.ui.revertSessionsDialog.show = false
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'revertSessions', val: null })).finally(() => {
                this.ui.overlay.show = false
              })
            }
          }
        })
      </script>
    </body>
  </html>
  
  `
}

function printHtml(data, curapp = null, curview = 'app') {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <title>BoxJs</title>
      <meta charset="utf-8" />
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      <link rel="Bookmark" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="shortcut icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet" />
      <style>
        [v-cloak]{
          display: none
        }
        .v-bottom-navigation,
        .v-bottom-sheet {
          padding-bottom: constant(safe-area-inset-bottom);
          padding-bottom: env(safe-area-inset-bottom);
        }
        .v-bottom-navigation{
          box-sizing: content-box;
        }
        .v-bottom-navigation button {
          box-sizing: border-box;
        }
        .v-main.safe {
          margin-bottom: 56px;
          margin-bottom: calc(56px + constant(safe-area-inset-bottom));
          margin-bottom: calc(56px + env(safe-area-inset-bottom));
        }
        .v-main .v-main__wrap {
          padding-bottom: 68px;
          padding-bottom: calc(68px + constant(safe-area-inset-bottom));
          padding-bottom: calc(68px + env(safe-area-inset-bottom));
        }
        .v-main.safe .v-main__wrap {
          padding-bottom: 68px;
        }
        .v-speed-dial {
          bottom: calc(12px + constant(safe-area-inset-bottom));
          bottom: calc(12px + env(safe-area-inset-bottom));
        }
        .v-speed-dial.has-nav {
          bottom: calc(68px + constant(safe-area-inset-bottom));
          bottom: calc(68px + env(safe-area-inset-bottom));
        }
      </style>
    </head>
    <body>
      <div id="app">
        <v-app v-scroll="onScroll" v-cloak>
          <v-app-bar app dense>
            <v-menu bottom left v-if="['app', 'home', 'log', 'sub'].includes(ui.curview) && box.syscfgs.env !== ''">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-avatar size="26">
                    <img :src="box.syscfgs.envs.find(e=>e.id===box.syscfgs.env).icons[iconIdx]" alt="box.syscfgs.env" />
                  </v-avatar>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item v-for="(env, envIdx) in box.syscfgs.envs" :key="env.id" @click="box.syscfgs.env=env.id">
                  <v-list-item-avatar size="24"><v-img :src="env.icons[iconIdx]"></v-img></v-list-item-avatar>
                  <v-list-item-title>{{ env.id }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn icon @click="ui.curview = ui.bfview" v-else><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-autocomplete v-model="ui.autocomplete.curapp" :items="apps" :filter="appfilter" :menu-props="{ closeOnContentClick: true, overflowY: true }" :label="ui.curapp ? ui.curapp.name + ' ' + ui.curapp.author : 'BoxJs - v' + box.syscfgs.version" no-data-text="未实现" dense hide-details solo>
              <template v-slot:item="{ item }">
                <v-list-item @click="goAppSessionView(item)">
                  <v-list-item-avatar>
                    <img v-if="item.icons" :src="item.icons[iconIdx]">
                    <img v-else :src="ui.icons[iconIdx]">
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }} ({{ item.id }})</v-list-item-title>
                    <v-list-item-subtitle>{{ item.repo }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ item.author }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon v-if="item.isFav" @click.stop="onFav(item)">
                      <v-icon v-if="box.usercfgs.isTransparentIcons" color="white">mdi-star</v-icon>
                      <v-icon v-else color="yellow darken-2">mdi-star</v-icon>
                    </v-btn>
                    <v-btn icon v-else @click.stop="onFav(item)"><v-icon color="grey">mdi-star-outline</v-icon></v-btn>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-btn icon @click="ui.drawer.show = true">
              <v-avatar size="26">
                <img :src="box.syscfgs.orz3.icon" :alt="box.syscfgs.orz3.repo" />
              </v-avatar>
            </v-btn>
          </v-app-bar>
          <v-fab-transition>
            <v-speed-dial v-show="ui.box.show && !box.usercfgs.isHideBoxIcon" fixed fab bottom direction="top" :left="ui.drawer.show || box.usercfgs.isLeftBoxIcon" :right="!box.usercfgs.isLeftBoxIcon === true" :class="box.usercfgs.isHideNavi ? '' : 'has-nav'">
              <template v-slot:activator>
                <v-btn fab>
                  <v-avatar size="56">
                    <img :src="box.syscfgs.boxjs.icons[iconIdx]" :alt="box.syscfgs.boxjs.repo" />
                  </v-avatar>
                </v-btn>
              </template>
              <v-btn dark v-if="!box.usercfgs.isHideHelp" fab small color="grey" @click="ui.versheet.show = true">
                <v-icon>mdi-help</v-icon>
              </v-btn>
              <v-btn dark fab small color="pink" @click="box.usercfgs.isLeftBoxIcon = !box.usercfgs.isLeftBoxIcon, onUserCfgsChange()">
                <v-icon v-if="!box.usercfgs.isLeftBoxIcon">mdi-format-horizontal-align-left</v-icon>
                <v-icon v-else>mdi-format-horizontal-align-right</v-icon>
              </v-btn>
              <v-btn dark fab small color="indigo" @click="ui.impGlobalBakDialog.show = true">
                <v-icon>mdi-database-import</v-icon>
              </v-btn>
              <v-btn dark fab small color="green" v-clipboard:copy="JSON.stringify(boxdat)" v-clipboard:success="onCopy">
                <v-icon>mdi-export-variant</v-icon>
              </v-btn>
              <v-btn dark fab small color="orange" @click="reload">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-speed-dial>
          </v-fab-transition>
          <v-navigation-drawer v-model="ui.drawer.show" app temporary right>
            <v-list dense nav>
              <v-list-item dense @click="onLink(box.syscfgs.chavy.repo)">
                <v-list-item-avatar><img :src="box.syscfgs.chavy.icon" /></v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ box.syscfgs.chavy.id }}</v-list-item-title>
                  <v-list-item-subtitle>{{ box.syscfgs.chavy.repo }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item dense @click="onLink(box.syscfgs.senku.repo)">
                <v-list-item-avatar><img :src="box.syscfgs.senku.icon" /></v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ box.syscfgs.senku.id }}</v-list-item-title>
                  <v-list-item-subtitle>{{ box.syscfgs.senku.repo }}</v-list-item-subtitle>
                </v-ist-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item class="pt-1">
                <v-row align="center" justify="start" no-gutters>
                  <v-col v-for="(c, cIdx) in box.syscfgs.contributors" cols="2" :key="c.id">
                    <v-avatar class="ma-1" size="26" @click="onGoToRepo(c.repo)">
                      <img :src="c.icon" />
                    </v-avatar>
                  </v-col>
                </v-row>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-select 
                    hide-details
                    v-model="box.usercfgs.theme"
                    :items="[{text: '跟随系统', value: 'auto'}, {text: '暗黑', value: 'dark'}, {text: '明亮', value: 'light'}]"
                    label="颜色主题"
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="透明图标" v-model="box.usercfgs.isTransparentIcons" @change="onUserCfgsChange" :disabled="!darkMode"></v-switch>
                <v-spacer></v-spacer>
                <v-btn fab small text @click="onLink(box.syscfgs.orz3.repo)">
                  <v-avatar size="32"><img :src="box.syscfgs.orz3.icon" :alt="box.syscfgs.orz3.repo" /></v-avatar>
                </v-btn>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="隐藏悬浮图标" v-model="box.usercfgs.isHideBoxIcon" @change="onUserCfgsChange"></v-switch>
                <v-spacer></v-spacer>
                <v-btn fab small text @click="onLink(box.syscfgs.boxjs.repo)">
                  <v-avatar size="32"><img :src="box.syscfgs.boxjs.icons[iconIdx]" :alt="box.syscfgs.boxjs.repo" /></v-avatar>
                </v-btn>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="隐藏我的标题" v-model="box.usercfgs.isHideMyTitle" @change="onUserCfgsChange"></v-switch>
                <v-spacer></v-spacer>
                <v-btn fab small text>
                  <v-avatar v-if="box.usercfgs.icon" size="32"><img :src="box.usercfgs.icon" :alt="box.syscfgs.boxjs.repo" /></v-avatar>
                  <v-icon v-else size="32">mdi-face-profile</v-icon>
                </v-btn>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="隐藏帮助按钮" v-model="box.usercfgs.isHideHelp" @change="onUserCfgsChange"></v-switch>
                <v-spacer></v-spacer>
                <v-btn fab small text @click="onLink(box.syscfgs.boxjs.repo)">
                  <v-avatar size="32"><v-icon>mdi-help</v-icon></v-avatar>
                </v-btn>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="隐藏底部导航" v-model="box.usercfgs.isHideNavi" @change="onUserCfgsChange"></v-switch>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="隐藏更新订阅提示" v-model="box.usercfgs.isHideRefreshTip" @change="onUserCfgsChange"></v-switch>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="调试模式 (数据)" v-model="box.usercfgs.isDebugData" @change="onUserCfgsChange"></v-switch>
              </v-list-item>
              <v-list-item class="mt-4">
                <v-switch dense class="mt-0" hide-details label="调试模式 (格式)" v-model="box.usercfgs.isDebugFormat" @change="onUserCfgsChange"></v-switch>
              </v-list-item>
              <v-list-item two-line dense>
                <v-list-item-content>
                  <v-list-item-title></v-list-item-title>
                  <v-list-item-subtitle></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
          <v-main :class="box.usercfgs.isHideNavi ? '' : 'safe'">
            <v-container fluid v-if="ui.curview === 'app'">
              <v-expansion-panels class="mx-auto" v-if="favapps.length > 0" multiple v-model="box.usercfgs.favapppanel">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    收藏应用 ({{ favapps.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list nav dense class="mx-n4">
                      <v-list-item three-line dense v-for="(app, appIdx) in favapps" :key="app.id" @click="goAppSessionView(app)">
                        <v-list-item-avatar><v-img :src="appicon(app)"></v-img></v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ app.name }} ({{ app.id }})</v-list-item-title>
                          <v-list-item-subtitle>{{ app.repo }}</v-list-item-subtitle>
                          <v-list-item-subtitle color="blue">{{ app.author }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-menu bottom left>
                            <template v-slot:activator="{ on }">
                              <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                            </template>
                            <v-list dense>
                              <v-list-item v-if="appIdx > 0" @click="onMoveFav(appIdx, -1)">
                                <v-list-item-title>上移</v-list-item-title>
                              </v-list-item>
                              <v-list-item v-if="appIdx + 1 < favapps.length" @click="onMoveFav(appIdx, 1)">
                                <v-list-item-title>下移</v-list-item-title>
                              </v-list-item>
                              <v-divider v-if="favapps.length > 1"></v-divider>
                              <v-list-item @click="onFav(app)">
                                <v-list-item-title>取消收藏</v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-expansion-panels class="mx-auto mt-4" multiple v-model="box.usercfgs.subapppanel">
                <v-expansion-panel v-for="(sub, subIdx) in appsubs.filter((sub) => sub.isErr !== true)" :key="sub.id">
                  <v-expansion-panel-header>
                    {{ sub.name ? sub.name : '匿名订阅' }} ({{ sub.apps.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list nav dense class="mx-n4">
                      <v-list-item three-line dense v-for="(app, appIdx) in sub.apps" :key="app.id" @click="goAppSessionView(app)">
                        <v-list-item-avatar><v-img :src="appicon(app)"></v-img></v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{ app.name }} ({{ app.id }})</v-list-item-title>
                          <v-list-item-subtitle>{{ app.repo }}</v-list-item-subtitle>
                          <v-list-item-subtitle color="blue">{{ app.author }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon v-if="app.isFav" @click.stop="onFav(app, appIdx)">
                            <v-icon v-if="box.usercfgs.isTransparentIcons" color="white">mdi-star</v-icon>
                            <v-icon v-else color="yellow darken-2">mdi-star</v-icon>
                          </v-btn>
                          <v-btn icon v-else @click.stop="onFav(app, appIdx)"><v-icon color="grey">mdi-star-outline</v-icon></v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-expansion-panels class="mx-auto mt-4" v-if="box.sysapps.length > 0" multiple v-model="box.usercfgs.sysapppanel">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                  内置应用 ({{ box.sysapps.length }})
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                  <v-list nav dense class="mx-n4">
                    <v-list-item three-line dense v-for="(app, appIdx) in box.sysapps" :key="app.id" @click="goAppSessionView(app)">
                      <v-list-item-avatar><v-img :src="appicon(app)"></v-img></v-list-item-avatar>
                      <v-list-item-content>
                        <v-list-item-title>{{ app.name }} ({{ app.id }})</v-list-item-title>
                        <v-list-item-subtitle>{{ app.repo }}</v-list-item-subtitle>
                        <v-list-item-subtitle color="blue">{{ app.author }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon v-if="app.isFav" @click.stop="onFav(app, appIdx)">
                          <v-icon v-if="box.usercfgs.isTransparentIcons" color="white">mdi-star</v-icon>
                          <v-icon v-else color="yellow darken-2">mdi-star</v-icon>
                        </v-btn>
                        <v-btn icon v-else @click.stop="onFav(app, appIdx)"><v-icon color="grey">mdi-star-outline</v-icon></v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-container>
            <v-container fluid v-if="ui.curview === 'appsession'">
              <v-card class="mx-auto mb-4">
                <template v-if="Array.isArray(ui.curapp.settings)">
                  <v-subheader v-if="Array.isArray(ui.curapp.settings)">
                    应用设置 ({{ ui.curapp.settings.length }})
                  </v-subheader>
                  <v-form class="pl-4 pr-4">
                    <template v-for="(setting, settingIdx) in ui.curapp.settings">
                      <v-slider :label="setting.name" v-model="setting.val" :hint="setting.desc" :min="setting.min" :max="setting.max" thumb-label="always" :placeholder="setting.placeholder" v-if="setting.type === 'slider'"></v-slider>
                      <v-switch :label="setting.name" v-model="setting.val" :hint="setting.desc" :placeholder="setting.placeholder" v-else-if="setting.type === 'boolean'"></v-switch>
                      <v-textarea :label="setting.name" v-model="setting.val" :hint="setting.desc" :auto-grow="setting.autoGrow" :placeholder="setting.placeholder" :rows="setting.rows" v-else-if="setting.type === 'textarea'"></v-textarea>
                      <v-radio-group :label="setting.name" v-model="setting.val" :hint="setting.desc" :placeholder="setting.placeholder" v-else-if="setting.type === 'radios'">
                        <v-radio :class="itemIdx === 0 ? 'mt-2' : ''" v-for="(item, itemIdx) in setting.items" :label="item.label" :value="item.key" :key="item.key"></v-radio>
                      </v-radio-group>
                      <template v-else-if="setting.type === 'checkboxes'">
                        <label>{{ setting.name }}</label>
                        <v-checkbox class="mt-0" :hide-details="itemIdx + 1 !== setting.items.length" v-model="setting.val" :label="item.label" :value="item.key" v-for="(item, itemIdx) in setting.items" :key="item.key" multiple></v-checkbox>
                      </template>
                      <v-text-field :label="setting.name" v-model="setting.val" :hint="setting.desc" :placeholder="setting.placeholder" type="number" v-else-if="setting.type === 'number'"></v-text-field>
                      <v-text-field :label="setting.name" v-model="setting.val" :hint="setting.desc" :placeholder="setting.placeholder" v-else></v-text-field>
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
                    <v-list dense>
                      <v-list-item v-clipboard:copy="JSON.stringify(ui.curapp)" v-clipboard:success="onCopy">
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
                  <v-menu bottom left v-if="ui.curappSessions && ui.curappSessions.length > 0">
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" small text color="success">保存至</v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item v-for="(session, sessionIdx) in ui.curappSessions" :key="session.id" @click="onSaveSessionTo(session)">
                        <v-list-item-title>{{ session.name }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn small text color="success" @click="onSaveSession">保存会话</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="ml-10 mt-4" v-for="(session, sessionIdx) in ui.curappSessions" :key="session.id">
                <v-subheader>
                  #{{ sessionIdx + 1 }} {{ session.name }}
                  <v-spacer></v-spacer>
                  <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item @click="ui.modSessionDialog.show = true, ui.modSessionDialog.session = JSON.parse(JSON.stringify(session))">
                        <v-list-item-title>修改会话</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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
              <v-card class="ma-4" v-if="(!ui.curappSessions || ui.curappSessions.length === 0) && ui.curapp.keys.length > 0">
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
                    <v-btn text small v-clipboard:copy="ui.impSessionDialog.impval" v-clipboard:success="onCopy">复制</v-btn>
                    <v-btn text small @click="onImpSessionPaste">粘粘</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text small color="grey darken-1" text @click="ui.impSessionDialog.show = false">取消</v-btn>
                    <v-btn text small color="success darken-1" text @click="onImpSession">导入</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="ui.modSessionDialog.show">
                <v-card v-if="ui.modSessionDialog.session">
                  <v-card-title>
                    修改会话
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-text-field class="mt-4" v-model="ui.modSessionDialog.session.name" label="会话名称"></v-text-field>
                    <v-text-field v-for="(data, dataIdx) in ui.modSessionDialog.session.datas" :key="dataIdx" v-model="data.val" :label="data.key"></v-text-field>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text small color="grey darken-1" text @click="ui.modSessionDialog.show = false, ui.modSessionDialog.session = null">取消</v-btn>
                    <v-btn text small color="success darken-1" text @click="onModSession">保存</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-container>
            <v-container fluid v-if="ui.curview === 'sub'">
              <v-card class="mx-auto" v-if="appsubs.length > 0">
                <v-list nav dense>
                  <v-subheader inset>
                    应用订阅 ({{ appsubs.length }})
                    <v-spacer></v-spacer>
                    <v-tooltip v-model="ui.refreshtip.show && !box.usercfgs.isHideRefreshTip" bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn icon @click="onRefreshAppSubs"><v-icon>mdi-refresh-circle</v-icon></v-btn>
                      </template>
                      <span>手动更新订阅</span>
                    </v-tooltip>
                    <v-btn icon @click="ui.addAppSubDialog.show = true"><v-icon color="green">mdi-plus-circle</v-icon></v-btn>
                  </v-subheader>
                  <v-list-item two-line dense v-for="(sub, subIdx) in appsubs" :key="sub.id" @click="onGoToRepo(sub.repo)">
                    <v-list-item-avatar v-if="sub.icon"><v-img :src="sub.icon"></v-img></v-list-item-avatar>
                    <v-list-item-avatar v-else color="grey"><v-icon dark>mdi-account</v-icon></v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ sub.name ? sub.name : '匿名订阅' }} ({{ sub.apps.length }})
                        <v-chip v-if="sub.isErr === true" color="pink" x-small class="ml-4">格式错误</v-chip>
                      </v-list-item-title>
                      <v-list-item-subtitle>{{ sub.repo ? sub.repo : sub._raw.url }}</v-list-item-subtitle>
                      <v-list-item-subtitle color="blue">{{ sub.author ? sub.author : '@anonymous' }}</v-list-item-subtitle>
                      <v-list-item-subtitle color="blue">更新于: {{ moment(sub.updateTime) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-menu bottom left>
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="onRefreshAppSub(sub)">
                            <v-list-item-title>更新</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-clipboard:copy="sub._raw.url" v-clipboard:success="onCopy">
                            <v-list-item-title>复制</v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item @click="onDelAppSub(sub)">
                            <v-list-item-title>删除</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card>
              <v-btn class="mx-auto" block v-if="appsubs.length === 0" @click="ui.addAppSubDialog.show = true">添加订阅</v-btn>
              <v-dialog v-model="ui.addAppSubDialog.show" scrollable>
                <v-card>
                  <v-card-title>
                    添加订阅
                    <v-spacer></v-spacer>
                    <v-btn text small class="mr-n4" color="red darken-1" @click="ui.addAppSubDialog.url = ''">清空</v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-textarea clearable auto-grow v-model="ui.addAppSubDialog.url" label="订阅地址 (URL)" hint="请粘贴 URL 格式的订阅地址!"></v-textarea>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-btn text small v-clipboard:copy="ui.addAppSubDialog.url" v-clipboard:success="onCopy">复制</v-btn>
                    <v-btn text small @click="onAddAppSubPaste">粘粘</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text small color="grey darken-1" text @click="ui.addAppSubDialog.show = false">取消</v-btn>
                    <v-btn text small color="success darken-1" text :disabled="!/^https?:\\/\\/.*?/.test(ui.addAppSubDialog.url)" @click="onAddAppSub">添加</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-container>
            <v-container fluid v-if="ui.curview === 'my'">
              <v-card class="mx-auto">
                <v-card-title class="headline">
                  {{ box.usercfgs.name ? box.usercfgs.name : '大侠, 留个名字吧!' }}
                  <v-spacer></v-spacer>
                  <v-btn icon @click="ui.editProfileDialog.show=true"><v-icon>mdi-cog-outline</v-icon></v-btn>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <v-card-text>
                  <span class="subheading">我的数据</span>
                  <v-chip-group>
                    <v-chip>应用: {{ appcnt }}</v-chip>
                    <v-chip>订阅: {{ subcnt }}</v-chip>
                    <v-chip>会话: {{ sessioncnt}}</v-chip>
                  </v-chip-group>
                </v-card-text>
                <v-card-actions>
                  <v-btn text dense color="red" @click="onGoToRevert">抹掉数据</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn @click="ui.impGlobalBakDialog.show = true">导入</v-btn>
                  <v-btn @click="onGlobalBak">备份</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="mx-auto mt-4">
                <template v-for="(bak, bakIdx) in box.globalbaks">
                  <v-divider v-if="bakIdx>0"></v-divider>
                  <v-list-item three-line dense>
                    <v-list-item-content>
                      <v-list-item-title>{{ bak.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ bak.createTime}}</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        <v-chip x-small class="mr-2" v-for="(tag, tagIdx) in bak.tags" :key="tagIdx">{{ tag }}</v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-menu bottom left>
                        <template v-slot:activator="{ on }">
                          <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item v-clipboard:copy="JSON.stringify(boxdat)" v-clipboard:success="onCopy">
                            <v-list-item-title>复制</v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item @click="onRevertGlobalBak(bak.id)">
                            <v-list-item-title>还原</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="onDelGlobalBak(bak.id)">
                            <v-list-item-title>删除</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-card>
              <v-dialog v-model="ui.editProfileDialog.show">
                <v-card>
                  <v-card-title>个人资料</v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                  <v-text-field label="昵称" v-model="box.usercfgs.name" hint="少侠请留名!"></v-text-field>
                  <v-text-field label="头像 (选填)" v-model="box.usercfgs.icon" hint="头像链接, 建议直接从 GitHub 获取!"></v-text-field>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text text @click="ui.editProfileDialog.show = false">取消</v-btn>
                    <v-btn text color="success darken-1" text @click="ui.editProfileDialog.show = false, onUserCfgsChange()">保存</v-btn>
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
            <v-dialog v-model="ui.reloadConfirmDialog.show" persistent max-width="290">
              <v-card>
                <v-card-title class="headline">{{ ui.reloadConfirmDialog.title }}</v-card-title>
                <v-card-text>{{ ui.reloadConfirmDialog.message }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="grey darken-1" text @click="ui.reloadConfirmDialog.show = false">稍候</v-btn>
                  <v-btn color="green darken-1" text @click="reload">马上刷新 {{ ui.reloadConfirmDialog.sec ? '(' + ui.reloadConfirmDialog.sec + ')' : '' }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="ui.impGlobalBakDialog.show">
              <v-card>
                <v-card-title>
                  导入备份
                  <v-spacer></v-spacer>
                  <v-btn text small class="mr-n4" color="red darken-1" @click="ui.impGlobalBakDialog.bak = ''">清空</v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-textarea clearable v-model="ui.impGlobalBakDialog.bak" label="备份内容" hint="请粘贴全局备份内容!"></v-textarea>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-btn text small v-clipboard:copy="ui.impGlobalBakDialog.bak" v-clipboard:success="onCopy">复制</v-btn>
                  <v-btn text small @click="onImpGlobalBakPaste">粘粘</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn text small color="grey darken-1" text @click="ui.impGlobalBakDialog.show = false">取消</v-btn>
                  <v-btn text small color="success darken-1" text @click="onImpGlobalBak">导入</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-main>
          <v-expand-transition>
            <v-bottom-navigation v-model="ui.curview" app v-show="ui.navi.show && !box.usercfgs.isHideNavi">
              <v-btn value="home">
                <span>首页</span>
                <v-icon>mdi-home</v-icon>
              </v-btn>
              <v-btn v-if="ui.curview !== 'appsession'" value="app">
                <span>应用</span>
                <v-icon>mdi-application</v-icon>
              </v-btn>
              <v-btn v-if="ui.curview === 'appsession'" value="appsession">
                <span>应用</span>
                <v-icon>mdi-application</v-icon>
              </v-btn>
              <v-btn value="sub">
                <span>订阅</span>
                <v-icon>mdi-database</v-icon>
              </v-btn>
              <v-btn value="my">
                <template v-if="box.usercfgs.icon">
                  <span v-if="!box.usercfgs.isHideMyTitle">我的</span>
                  <v-avatar :size="box.usercfgs.isHideMyTitle ? 36 : 24">
                    <v-img :src="box.usercfgs.icon"></v-img>
                  </v-avatar>
                </template>
                <template v-else>
                  <span v-if="!box.usercfgs.isHideMyTitle">我的</span>
                  <v-icon :size="box.usercfgs.isHideMyTitle ? 36 : 24">mdi-face-profile</v-icon>
                </template>
              </v-btn>
            </v-bottom-navigation>
          </v-expand-transition>
          <v-bottom-sheet v-model="ui.versheet.show" hide-overlay scrollable>
            <v-card flat scrollable>
              <v-subheader class="my-4">
                <v-btn text @click="ui.versheet.show = false, ui.updatesheet.show = true">升级教程</v-btn>
                <v-spacer></v-spacer>
                <v-btn text>新版本</v-btn>
                <v-spacer></v-spacer>
                <v-btn text @click="ui.versheet.show = false">朕, 知道了!</v-btn>
              </v-subheader>
              <v-card-text>
                <v-timeline dense>
                  <v-timeline-item small v-for="(ver, verIdx) in box.versions" :key="ver.version">
                    <div class="py-4">
                      <h2 v-if="box.syscfgs.version === ver.version" class="headline font-weight-bold mb-4 green--text">v{{ ver.version }} (当前)</h2>
                      <h2 v-else class="headline font-weight-bold mb-4 grey--text">v{{ ver.version }}</h2>
                      <template v-for="(note, noteIdx) in ver.notes">
                        <strong>{{ note.name }}</strong>
                        <ul><li v-for="(desc, descIdx) in note.descs">{{ desc }}</li></ul>
                      </template>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-bottom-sheet>
          <v-bottom-sheet v-model="ui.updatesheet.show" hide-overlay>
            <v-sheet>
              <v-subheader>
                <v-menu bottom left v-if="box.syscfgs.env !== ''">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-avatar size="26">
                        <img :src="box.syscfgs.envs.find(e=>e.id===box.syscfgs.env).icons[iconIdx]" alt="box.syscfgs.env" />
                      </v-avatar>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item v-for="(env, envIdx) in box.syscfgs.envs" :key="env.id" @click="box.syscfgs.env=env.id">
                      <v-list-item-avatar size="24"><v-img :src="env.icons[iconIdx]"></v-img></v-list-item-avatar>
                      <v-list-item-title>{{ env.id }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-spacer></v-spacer>
                <v-btn text @click="ui.updatesheet.show = false">朕, 知道了!</v-btn>
              </v-subheader>
              <v-card flat v-if="box.syscfgs.env === 'Surge'">
                <v-card-text>
                  <p class="subtitle-1">【安装模块】</p>
                  <p class="body-1">
                    首页 &gt; 模块 &gt; 安装新模块
                    https://github.com/chavyleung/scripts/raw/master/surge.box.sgmodule
                  </p>
                  <p class="body-2">最后重启 Surge 代理 (首页右上角的开关)</p>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text>
                  <p class="subtitle-1">【更新模块】</p>
                  <p class="body-1">首页 &gt; Surge图标 (左上角) &gt; 外部资源 &gt; 全部更新</p>
                  <p class="body-2">最后重启 Surge 代理 (首页右上角的开关)</p>
                </v-card-text>
              </v-card>
              <v-card flat v-else-if="box.syscfgs.env === 'QuanX'">
                <v-card-title>QuanX TF 或 商店 (购买超 90 天)</v-card-title>
                <v-card-text>
                  <p class="subtitle-1">【远程订阅】</p>
                  <p class="body-1">
                    风车 &gt; 重写 &gt; 引用 &gt; 添加 (右上角)
                    https://github.com/chavyleung/scripts/raw/master/QuantumultX.box.remote.conf
                  </p>
                  <p class="subtitle-1">【订阅更新】</p>
                  <p class="body-2">长按风车 &gt; 刷新 (左下角) &gt; 重启代理 (主界面右上角的开关)</p>
                  <p class="caption">注意: 不是能只更新订阅链接, 必须长按风车全部更新!</p>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-title>QuanX 商店 (购买少于 90 天)</v-card-title>
                <v-card-text>
                  <p class="subtitle-1">【本地更新】</p>
                  <p class="body-2">下载最新脚本 &gt; 重启代理 (主界面右上角的开关)</p>
                </v-card-text>
              </v-card>
              <v-card flat v-if="box.syscfgs.env === 'Loon'">
                <v-card-text>
                  <p class="subtitle-1">【远程订阅】</p>
                  <p class="body-1">
                    配置 (底栏) &gt; 脚本 &gt; 订阅脚本 &gt; 添加 (右上角图标)
                    https://github.com/chavyleung/scripts/raw/master/loon.box.conf
                  </p>
                  <p class="body-2">最后重启 Loon 代理 (首页右上角的开关)</p>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text>
                  <p class="subtitle-1">【订阅更新】</p>
                  <p class="body-1">配置 (底栏) &gt; 脚本 &gt; 订阅脚本 &gt; 刷新 (右上角图标)</p>
                  <p class="body-2">最后重启 Loon 代理 (首页右上角的开关)</p>
                </v-card-text>
              </v-card>
            </v-sheet>
          </v-bottom-sheet>
          <v-overlay v-model="ui.overlay.show" :opacity="0.7">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
        </v-app>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/moment@2.26.0/moment.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/timeago.js@4.0.2/dist/timeago.full.min.js"></script>
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
                curview: '${curview}',
                curapp: ${curapp},
                curappTabs: { curtab: 'sessions' },
                curappSessions: null,
                overlay: { show: false },
                autocomplete: { curapp: null },
                refreshtip: { show: false },
                modSessionDialog: { show: false, session: null },
                editProfileDialog: { show: false, bak: '' },
                impGlobalBakDialog: { show: false, bak: '' },
                reloadConfirmDialog: { show: false, sec: 0, title: '操作成功', message: '是否马上刷新页面?' },
                impSessionDialog: { show: false, impval: '' },
                addAppSubDialog: { show: false, url: '' },
                versheet: { show: false },
                updatesheet: { show: false },
                snackbar: { show: false, text: '已复制!', timeout: 2000 },
                appbar: { color: '' },
                box: { show: false },
                navi: { show: false },
                drawer: { show: false },
                icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/appstore.png', 'https://raw.githubusercontent.com/Orz-3/task/master/appstore.png']
              },
              box: ${data}
            }
          },
          computed: {
            darkMode: function() {
              const isSysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              let isDark = !this.box.usercfgs.isLight
              if (this.box.usercfgs.theme === 'auto') {
                isDark = isSysDark ? true : false
              } else if (this.box.usercfgs.theme === 'dark') {
                isDark = true
              } else if (this.box.usercfgs.theme === 'light') {
                isDark = false
              }
              return isDark
            },
            iconIdx: function() {
              let idx = 1
              if (this.box.usercfgs.theme === 'auto') {
                if (this.darkMode === true) {
                  idx = this.box.usercfgs.isTransparentIcons ? 0 : 1
                }
              } else if (this.box.usercfgs.theme === 'dark') {
                idx = this.box.usercfgs.isTransparentIcons ? 0 : 1
              }
              return idx
            },
            apps: function () {
              const apps = []
              apps.push(...this.box.sysapps)
              this.box.appsubs.forEach((sub, subIdx) => apps.push(...sub.apps))
              apps.sort((a, b) => a.name.localeCompare(b.name))
              return apps
            },
            appcnt: function () {
              let cnt = 0
              cnt += Array.isArray(this.box.sysapps) ? this.box.sysapps.length : 0
              if (Array.isArray(this.box.appsubs)) {
                this.box.appsubs.forEach((sub, subIdx) => {
                  cnt += Array.isArray(sub.apps) ? sub.apps.length : 0
                })
              }
              return cnt
            },
            subcnt: function () {
              return Array.isArray(this.box.appsubs) ? this.box.appsubs.length : 0
            },
            sessioncnt: function () {
              return Array.isArray(this.box.sessions) ? this.box.sessions.length : 0
            },
            boxdat: function () {
              const KEY_sessions = 'chavy_boxjs_sessions'
              const KEY_sysCfgs = 'chavy_boxjs_sysCfgs'
              const KEY_userCfgs = 'chavy_boxjs_userCfgs'
              const KEY_sysApps = 'chavy_boxjs_sysApps'
              const dat = {}
              dat['env'] = this.box.syscfgs.env
              dat['version'] = this.box.syscfgs.version
              dat['versionType'] = this.box.syscfgs.versionType
              dat[KEY_sessions] = this.box.sessions
              dat[KEY_sysCfgs] = this.box.syscfgs
              dat[KEY_userCfgs] = this.box.usercfgs
              dat[KEY_sysApps] = this.box.sysapps
              this.box.sysapps.forEach((app, appIdx) => {
                app.datas.forEach((data, dataIdx) => {
                  if (![undefined, null, 'null'].includes(data.val)) {
                    dat[data.key] = data.val
                  }
                })
                app.settings && app.settings.forEach((setting, settingIdx) => {
                  if (![undefined, null, 'null'].includes(setting.val)) {
                    dat[setting.id] = setting.val
                  }
                })
              })
              this.box.appsubs.forEach((sub, subIdx) => {
                sub.apps.forEach((app, appIdx) => {
                  app.datas.forEach((data, dataIdx) => {
                    if (![undefined, null, 'null'].includes(data.val)) {
                      dat[data.key] = data.val
                    }
                  })
                  app.settings && app.settings.forEach((setting, settingIdx) => {
                    if (![undefined, null, 'null'].includes(setting.val)) {
                      dat[setting.id] = setting.val
                    }
                  })
                })
              })
              return dat
            },
            favapps: function () {
              const favapps = []
              if (this.box.usercfgs.favapps) {
                this.box.usercfgs.favapps.forEach((favappId) => {
                  const apps = []
                  apps.push(...this.box.sysapps)
                  this.box.appsubs.forEach((sub) => {
                    apps.push(...sub.apps)
                  })
                  const app = apps.find((app) => app.id === favappId)
                  if (app) {
                    favapps.push(app)
                  }
                })
              }
              return favapps
            },
            appsubs: function () {
              return this.box.appsubs
            }
          },
          watch: {
            'ui.curview': {
              handler(newval, oldval) {
                this.ui.bfview = oldval
                const isFullScreen = window.navigator.standalone
                if (newval === 'app') {
                  this.ui.curapp = null
                  this.ui.curappSessions = null
                  var state = { title: 'BoxJs' }
                  document.title = state.title
                  if (!isFullScreen) {
                    history.pushState(state, '', '/home')
                  }
                  this.$vuetify.goTo(this.ui.scrollY, { duration: 0, offset: 0 })
                } else if (newval === 'sub') {
                  this.ui.curapp = null
                  this.ui.curappSessions = null
                  this.showRefreshTip()
                  var state = { title: 'BoxJs' }
                  document.title = state.title
                  if (!isFullScreen) {
                    history.pushState(state, '', '/sub')
                  }
                } else if (newval === 'my') {
                  this.ui.curapp = null
                  this.ui.curappSessions = null
                  var state = { title: 'BoxJs' }
                  document.title = state.title
                  if (!isFullScreen) {
                    history.pushState(state, '', '/my')
                  }
                }
              }
            },
            'ui.reloadConfirmDialog.sec': {
              handler(newval, oldval) {
                if (newval !== 0) {
                  setTimeout(() => this.ui.reloadConfirmDialog.sec -= 1, 1000)
                } else {
                  this.reload()
                }
              }
            },
            'box.usercfgs.favapppanel': {
              handler(newval, oldval) {
                this.onUserCfgsChange()
              }
            },
            'box.usercfgs.subapppanel': {
              handler(newval, oldval) {
                this.onUserCfgsChange()
              }
            },
            'box.usercfgs.sysapppanel': {
              handler(newval, oldval) {
                this.onUserCfgsChange()
              }
            },
            'box.usercfgs.theme': {
              handler(newval, oldval) {
                this.$vuetify.theme.dark = this.darkMode
                this.onUserCfgsChange()
              }
            }
          },
          methods: {
            moment(date) {
              return timeago.format(date, 'zh_CN');
            },
            appfilter(item, queryText, itemText) {
              return item.id.includes(queryText) || item.name.includes(queryText)
            },
            appicon(app) {
              const deficons = ['https://raw.githubusercontent.com/Orz-3/mini/master/appstore.png', 'https://raw.githubusercontent.com/Orz-3/task/master/appstore.png']
              const iconIdx = this.iconIdx
              if (app.icons && Array.isArray(app.icons)) {
                return app.icons[iconIdx] || deficons[iconIdx]
              } else {
                return deficons[iconIdx]
              }
            },
            onLink(link) {
              window.open(link)
            },
            onScroll(e) {
              if (this.ui.curview === 'app') {
                this.ui.scrollY = e.currentTarget.scrollY + 48
              }
            },
            onMoveFav(favIdx, moveCnt) {
              const fromIdx = favIdx
              const toIdx = favIdx + moveCnt
              this.box.usercfgs.favapps.splice(fromIdx, 1, ...this.box.usercfgs.favapps.splice(toIdx, 1, this.box.usercfgs.favapps[fromIdx]))
              this.onUserCfgsChange()
            },
            onFav(app) {
              const appIdx = this.box.sysapps.findIndex((appId) => appId === app.id)
              app.isFav = !app.isFav
              Vue.set(this.box.sysapps, appIdx, this.box.sysapps[appIdx])
              const usercfgs = this.box.usercfgs ? this.box.usercfgs : { favapps: [] }
              usercfgs.favapps = usercfgs.favapps ? usercfgs.favapps : []
              const idx = usercfgs.favapps.findIndex((appId) => appId === app.id)
              if (app.isFav === true && idx === -1) {
                usercfgs.favapps.push(app.id)
              } else if (app.isFav === false && idx > -1) {
                usercfgs.favapps.splice(idx, 1)
              }
              this.onUserCfgsChange()
            },
            onDelAppSub(sub) {
              const subIdx = this.box.appsubs.findIndex((_sub) => _sub._raw.id === sub._raw.id)
              this.box.appsubs.splice(subIdx, 1)
              axios.post('/api', JSON.stringify({ cmd: 'delAppSub', val: sub._raw.id }))
            },
            onUserCfgsChange() {
              axios.post('/api', JSON.stringify({ cmd: 'saveUserCfgs', val: this.box.usercfgs }))
            },
            goAppSessionView(app) {
              this.ui.bfview = this.ui.curview === 'appsession' ? this.ui.bfview : this.ui.curview
              this.ui.curapp = app
              this.ui.curappSessions = this.box.sessions.filter((s) => s.appId === this.ui.curapp.id)
              this.ui.curview = 'appsession'
              var state = { title: 'BoxJs - ' + this.ui.curapp.name, url: window.location.href }
              const isFullScreen = window.navigator.standalone
              if (!isFullScreen) {
                history.pushState(state, '', '/app/' + this.ui.curapp.id)
              }
              document.title = state.title
            },
            onClearCurAppSessionData(app, datas, data) {
              data.val = ''
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'saveCurAppSession', val: app })).finally(() => {
                this.onReload()
              })
            },
            onSaveSessionTo(session) {
              const val = {
                fromapp: this.ui.curapp,
                toSession: session
              }
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'saveSessionTo', val })).finally(() => {
                this.onReload()
              })
            },
            onModSession () {
              this.ui.modSessionDialog.show = false
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'onModSession', val: this.ui.modSessionDialog.session })).finally(() => {
                this.onReload()
              })
            },
            onSaveSession() {
              const session = {
                id: uuidv4(),
                name: '会话 ' + (this.ui.curappSessions.length + 1),
                appId: this.ui.curapp.id,
                appName: this.ui.curapp.name,
                enable: true,
                createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                datas: JSON.parse(JSON.stringify(this.ui.curapp.datas))
              }
              this.box.sessions.push(session)
              this.ui.curappSessions.push(session)
              axios.post('/api', JSON.stringify({ cmd: 'saveSession', val: session }))
            },
            onSaveSettings() {
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'saveSettings', val: this.ui.curapp.settings })).finally(() => {
                this.onReload()
              })
            },
            onImpSessionPaste() {
              navigator.clipboard.readText().then((text) => {
                this.ui.impSessionDialog.impval = text
              })
            },
            onAddAppSubPaste() {
              navigator.clipboard.readText().then((text) => {
                this.ui.addAppSubDialog.url = text
              })
            },
            onImpGlobalBakPaste() {
              navigator.clipboard.readText().then((text) => {
                this.ui.impGlobalBakDialog.bak = text
              })
            },
            onImpSession() {
              this.ui.overlay.show = true
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
                this.ui.impSessionDialog.show = false
                axios.post('/api', JSON.stringify({ cmd: 'saveSession', val: session })).finally(() => {
                  this.ui.overlay.show = false
                })
              } else {
                this.ui.overlay.show = false
                alert('导入失败! 原因: appId 为空?')
              }
            },
            onAddAppSub() {
              this.ui.addAppSubDialog.show = false
              this.ui.overlay.show = true
              const sub = {
                id: uuidv4(),
                url: this.ui.addAppSubDialog.url,
                enable: true
              }
              axios.post('/api', JSON.stringify({ cmd: 'addAppSub', val: sub })).finally(() => {
                this.onReload()
              })
            },
            onRefreshAppSub(sub) {
              axios.post('/api', JSON.stringify({ cmd: 'refreshAppSubs', val: sub._raw.id })).finally(() => {
                this.onReload()
              })
            },
            onRefreshAppSubs(){
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'refreshAppSubs', val: null })).finally(() => {
                this.onReload()
              })
            },
            reload() {
              window.location.reload()
            },
            onReload() {
              window.location.reload()
            },
            onDelSession(session) {
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'delSession', val: session })).finally(() => {
                const sessionIdx = this.box.sessions.findIndex((s) => session.id === s.id)
                if (this.box.sessions.splice(sessionIdx, 1) !== -1) {
                  this.ui.curappSessions = this.box.sessions.filter((s) => s.appId === this.ui.curapp.id)
                }
                this.ui.overlay.show = false
              })
            },
            onUseSession(session) {
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'useSession', val: session })).finally(() => {
                this.ui.curapp.datas = JSON.parse(JSON.stringify(session.datas))
                this.onReload()
              })
            },
            onImpGlobalBak() {
              this.ui.impGlobalBakDialog.show = false
              this.ui.overlay.show = true
              const env = this.box.syscfgs.env
              const version = this.box.syscfgs.version
              const versionType = this.box.syscfgs.versionType
              const bakobj = {
                id: uuidv4(),
                name: '全局备份 ' + (this.box.globalbaks.length + 1),
                env,
                version,
                versionType,
                createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                bak: JSON.parse(this.ui.impGlobalBakDialog.bak)
              }
              bakobj.tags = [env, version, versionType]
              this.box.globalbaks.push(bakobj)
              axios.post('/api', JSON.stringify({ cmd: 'globalBak', val: bakobj })).finally(() => {
                this.onReload()
              })
            },
            onGoToRevert() {
              window.open('/revert')
            },
            onGlobalBak() {
              const env = this.box.syscfgs.env
              const version = this.box.syscfgs.version
              const versionType = this.box.syscfgs.versionType
              const bakobj = {
                id: uuidv4(),
                name: '全局备份 ' + (this.box.globalbaks.length + 1),
                env,
                version,
                versionType,
                createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                bak: this.boxdat
              }
              bakobj.tags = [env, version, versionType]
              this.box.globalbaks.push(bakobj)
              this.ui.impGlobalBakDialog.show = false
              axios.post('/api', JSON.stringify({ cmd: 'globalBak', val: bakobj }))
            },
            onDelGlobalBak(id) {
              const bakIdx = this.box.globalbaks.findIndex((b) => b.id === id)
              this.box.globalbaks.splice(bakIdx, 1) !== -1
              axios.post('/api', JSON.stringify({ cmd: 'delGlobalBak', val: id }))
            },
            onRevertGlobalBak(id) {
              this.ui.overlay.show = true
              axios.post('/api', JSON.stringify({ cmd: 'revertGlobalBak', val: id })).finally(() => {
                this.onReload()
              })
            },
            onCopy(e) {
              this.ui.snackbar.show = true
            },
            showRefreshTip() {
              this.ui.refreshtip.show = true
              setTimeout(() => this.ui.refreshtip.show = false, 2000)
            },
            compareVersion(v1, v2) {
              var _v1 = v1.split('.'),
                _v2 = v2.split('.'),
                _r = _v1[0] - _v2[0]
              return _r == 0 && v1 != v2 ? this.compareVersion(_v1.splice(1).join('.'), _v2.splice(1).join('.')) : _r
            },
            onGoToRepo(url) {
              window.open(url)
            }
          },
          mounted: function () {
            this.$vuetify.theme.dark = this.darkMode
            if (this.ui.curapp) {
              this.goAppSessionView(this.ui.curapp)
            }
            setTimeout(() => {
              this.ui.navi.show = true
              this.ui.box.show = true
            }, 500)
            const curver = this.box.syscfgs.version
            const vers = this.box.versions
            if (this.ui.curview === 'sub') {
              this.showRefreshTip()
            }
            if (curver && Array.isArray(vers)) {
              const lastestVer = vers[0].version
              if (this.compareVersion(lastestVer, curver) > 0) {
                this.ui.versheet.show = true
              }
            }
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
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i),console.log(`${i}: ${JSON.stringify(s)}`)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i),console.log(`${i}: ${JSON.stringify(h)}`)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
