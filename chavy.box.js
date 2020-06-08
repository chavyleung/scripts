const $ = new Env('chavy.box.js')
$.domain = '8.8.8.8'

$.KEY_sessions = 'chavy_boxjs_sessions'

$.json = $.name
$.html = $.name

!(async () => {
  $.log(`🔔 ${$.name}, 开始!`)

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
    $.log(`❌ ${$.name}, 失败! 原因: ${e}!`)
  })
  .finally(() => {
    $.log(`🔔 ${$.name}, 结束!`)
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
      { id: 'Surge', icon: 'https://is3-ssl.mzstatic.com/image/thumb/Purple123/v4/21/0a/0d/210a0df9-cbe1-b9dc-7549-4c10cd996279/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/492x0w.png' },
      { id: 'QuanX', icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple123/v4/ae/7c/a2/ae7ca2fb-c4b6-d3a9-885a-935c1ea34cdb/AppIcon-1x_U007emarketing-0-7-0-0-85-220.png/492x0w.png' },
      { id: 'Loon', icon: 'https://is2-ssl.mzstatic.com/image/thumb/Purple123/v4/59/2c/fb/592cfb3b-162e-83dc-4e96-7a2175e1d29f/AppIcon-0-1x_U007emarketing-0-7-0-0-85-220.png/492x0w.png' }
    ]
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
      icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/f7/03/75/f70375ee-7462-d5fc-4b76-79809e63a325/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-85-220.png/492x0w.png'
    },
    {
      id: '52poje',
      name: '吾爱破解',
      keys: ['CookieWA'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/52pojie-DailyBonus/52pojie.js',
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/52pj.png'
    },
    {
      id: 'AcFun',
      name: 'AcFun',
      keys: ['chavy_cookie_acfun', 'chavy_token_acfun'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/acfun',
      icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple123/v4/41/f0/11/41f011f8-1bbc-188f-220f-3db5164a9ae9/AppIcon-1x_U007emarketing-0-7-0-0-85-220.png/492x0w.png'
    },
    {
      id: 'ApkTw',
      name: 'ApkTw',
      keys: ['chavy_cookie_apktw'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/apktw',
      url: 'https://apk.tw/',
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/apktw.png',
      tasks: [{ cron: '3 0 * * *', script: 'noteyoudao.js' }],
      rewrites: [{ type: 'request', pattern: '^https://note.youdao.com/yws/mapi/user?method=checkin', script: 'noteyoudao.cookie.js', body: true }]
    },
    {
      id: 'BAIDU',
      name: '百度签到',
      keys: ['chavy_cookie_tieba'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/tieba',
      icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/0a/33/50/0a335055-952a-6860-76aa-c657b2627a78/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-85-220.jpeg/434x0w.jpg'
    },
    {
      id: 'iQIYI',
      name: '爱奇艺',
      keys: ['CookieQY'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/iQIYI-DailyBonus/iQIYI.js',
      icon: 'https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/fa/dd/9a/fadd9a15-6b01-e4f7-0e59-920b23e58490/AppIcon-0-0-1x_U007emarketing-0-0-0-5-0-0-85-220.png/492x0w.png'
    },
    {
      id: 'JD',
      name: '京东',
      keys: ['CookieJD', 'CookieJD2'],
      author: '@NobyDa',
      repo: 'https://github.com/NobyDa/Script/blob/master/JD-DailyBonus/JD_DailyBonus.js',
      icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/0b/7c/08/0b7c08b3-4c03-1d92-5461-32c176a6fc30/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-85-220.png/460x0w.png'
    },
    {
      id: 'JD618',
      name: '京东618',
      keys: ['chavy_url_jd816', 'chavy_body_jd816', 'chavy_headers_jd816'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/jd',
      icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple113/v4/0b/7c/08/0b7c08b3-4c03-1d92-5461-32c176a6fc30/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-85-220.png/460x0w.png'
    },
    {
      id: 'videoqq',
      name: '腾讯视频',
      keys: ['chavy_cookie_videoqq', 'chavy_auth_url_videoqq', 'chavy_auth_header_videoqq', 'chavy_msign_url_videoqq', 'chavy_msign_header_videoqq'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/videoqq',
      icon: 'https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/f1/b4/87/f1b4871f-717d-50c6-3151-b087733768ec/AppIcon-0-0-1x_U007emarketing-0-0-0-8-0-85-220.png/492x0w.png'
    },
    {
      id: 'V2EX',
      name: 'V2EX',
      keys: ['chavy_cookie_v2ex'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/v2ex',
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/v2ex.png'
    },
    {
      id: 'NoteYoudao',
      name: '有道云笔记',
      keys: ['chavy_signurl_noteyoudao', 'chavy_signbody_noteyoudao', 'chavy_signheaders_noteyoudao'],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/tree/master/noteyoudao',
      url: 'https://apps.apple.com/cn/app/有道云笔记-扫描王版/id450748070',
      icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/25/6a/00/256a002d-b5f0-46e1-ef55-841d41f8aafc/AppIcon-0-1x_U007emarketing-0-7-0-0-85-220.png/460x0w.png',
      tasks: [{ cron: '3 0 * * *', script: 'noteyoudao.js' }],
      rewrites: [{ type: 'request', pattern: '^https://note.youdao.com/yws/mapi/user?method=checkin', script: 'noteyoudao.cookie.js', body: true }]
    }
  ]
  sysapps.forEach((app) => {
    app.datas = Array.isArray(app.datas) ? app.datas : []
    app.keys.forEach((key) => {
      app.datas.push({ key, val: $.getdata(key) })
    })
  })
  return sysapps
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
        const usesuc = $.setdata(newval, data.key)
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
}

function handleApp(appId) {
  const box = {
    sessions: getSessions(),
    sysapps: getSystemApps(),
    userapps: getUserApps(),
    syscfgs: getSystemCfgs(),
    colors: getSystemThemes()
  }
  const curapp = appId ? box.sysapps.find((app) => app.id === appId) : null
  $.html = printHtml(JSON.stringify(box), JSON.stringify(curapp))
  console.log($.html)
}

function handleHome() {
  $.html = printHtml(
    JSON.stringify({
      sessions: getSessions(),
      sysapps: getSystemApps(),
      userapps: getUserApps(),
      syscfgs: getSystemCfgs(),
      colors: getSystemThemes()
    })
  )
  console.log($.html)
}

function printHtml(data, curapp = null) {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <title>BoxJs</title>
      <meta charset="utf-8" />
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    </head>
    <body>
      <div id="app">
        <v-app>
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
                  <v-avatar size="24">
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
            <v-app-bar-nav-icon @click="ui.drawer.show = true"></v-app-bar-nav-icon>
          </v-app-bar>
          <v-navigation-drawer v-model="ui.drawer.show" app temporary right> </v-navigation-drawer>
          <v-content>
            <v-container fluid v-if="ui.curview === 'app'">
              <v-card class="mx-auto" tile>
                <v-list nav dense>
                  <v-subheader inset>内置应用 ({{ box.sysapps.length }})</v-subheader>
                  <v-list-item three-line dense v-for="(app, appIdx) in box.sysapps" :key="app.id" @click="goAppSessionView(app)">
                    <v-list-item-avatar><v-img :src="app.icon"></v-img></v-list-item-avatar>
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
              <v-card class="mx-auto">
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
                  <v-spacer></v-spacer>
                  <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                      <v-btn icon v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="" v-clipboard:copy="JSON.stringify(session)" v-clipboard:success="onCopy">
                        <v-list-item-title>复制会话</v-list-item-title>
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
                  <v-btn x-small text color="grey">{{ session.createTime }}</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn small text color="error" @click="onDelSession(session)">删除</v-btn>
                  <v-btn small text color="success" @click="onUseSession(session)">应用</v-btn>
                </v-card-actions>
              </v-card>
              <v-card class="ma-4" v-if="ui.curappSessions.length === 0">
                <v-card-text>当前脚本没有自建会话!</v-card-text>
              </v-card>
              <v-snackbar top color="success" v-model="ui.snackbar.show" :timeout="ui.snackbar.timeout">
                {{ ui.snackbar.text }}
                <v-btn text @click="ui.snackbar.show = false">关闭</v-btn>
              </v-snackbar>
              <v-dialog v-model="ui.impSessionDialog.show" scrollable>
                <v-card>
                  <v-card-title>导入会话</v-card-title>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-textarea autofocus auto-grow v-model="ui.impSessionDialog.impval" label="会话数据 (JSON)" hint="请粘贴 JSON 格式的会话数据! 你可以通过 复制会话 获得数据."></v-textarea>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="grey darken-1" text @click="ui.impSessionDialog.show = false">取消</v-btn>
                    <v-btn text color="success darken-1" text @click="onImpSession">导入</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-container>
          </v-content>
          <v-bottom-navigation :value="ui.curview" app>
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
                bfview: 'app',
                curview: 'app',
                curapp: ${curapp},
                curappTabs: { curtab: 'sessions' },
                curappSessions: null,
                impSessionDialog: { show: false, impval: '' },
                snackbar: { show: false, text: '已复制!', timeout: 2000 },
                appbar: { color: '' },
                drawer: { show: false }
              },
              box: ${data}
            }
          },
          computed: {},
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
                }
              }
            }
          },
          methods: {
            goAppSessionView(app) {
              this.ui.bfview = this.ui.curview
              this.ui.curapp = app
              this.ui.curappSessions = this.box.sessions.filter((s) => s.appId === this.ui.curapp.id)
              this.ui.curview = 'appsession'
              var state = { title: 'BoxJs - ' + this.ui.curapp.name, url: window.location.href }
              history.pushState(state, '', '/app/' + this.ui.curapp.id)
              document.title = state.title
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
              this.ui.curapp.datas = session.datas
            },
            onCopy(e) {
              this.ui.snackbar.show = true
            }
          },
          mounted: function () {
            if (this.ui.curapp) {
              this.goAppSessionView(this.ui.curapp)
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
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i),this.log("==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),t&&this.log(t),s&&this.log(s),i&&this.log(i)}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
