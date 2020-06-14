const $ = new Env('百度签到')
$.VAL_cookies = $.getdata('chavy_cookie_tieba') || $.getdata('CookieTB')

$.CFG_isOrderBars = $.getdata('CFG_tieba_isOrderBars') || 'false' // 1: 经验排序, 2: 连签排序
$.CFG_maxShowBars = $.getdata('CFG_tieba_maxShowBars') * 1 || 15 //每次通知数量

$.CFG_maxSignBars = $.getdata('CFG_tieba_maxSignBars') * 1 || 5 // 每次并发执行多少个任务
$.CFG_signWaitTime = $.getdata('CFG_tieba_signWaitTime') * 1 || 2000 // 每次并发间隔时间 (毫秒)

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await tieba()
  await zhidao()
  showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

// 贴吧
function tieba() {
  return new Promise((resove, reject) => {
    const url = { url: 'https://tieba.baidu.com/mo/q/newmoindex', headers: { Cookie: $.VAL_cookies } }
    $.get(url, async (error, response, data) => {
      try {
        const _data = JSON.parse(data)
        // 处理异常
        if (_data.no !== 0) {
          throw new Error(`贴吧: 获取清单失败! 原因: ${_data.error}`)
        }
        // 组装数据
        $.bars = []
        $.tieba = { tbs: _data.data.tbs }
        _data.data.like_forum.forEach((bar) => $.bars.push(barWrapper(bar)))
        $.bars = $.bars.sort((a, b) => b.exp - a.exp)
        // 开始签到
        await signbars($.bars)
        await getbars($.bars)
      } catch (e) {
        reject(`贴吧: 获取清单失败! 原因: ${e}`)
      } finally {
        resove()
      }
    })
  })
}

async function signbars(bars) {
  let signbarActs = []
  // 处理`已签`数据
  bars.filter((bar) => bar.isSign).forEach((bar) => (bar.iscurSign = false))
  // 处理`未签`数据
  let _curbarIdx = 1
  let _signbarCnt = 0
  bars.filter((bar) => !bar.isSign).forEach((bar) => _signbarCnt++)
  for (let bar of bars.filter((bar) => !bar.isSign)) {
    const signbarAct = (resove) => {
      const url = { url: 'https://tieba.baidu.com/sign/add', headers: { Cookie: $.VAL_cookies } }
      url.body = `ie=utf-8&kw=${encodeURIComponent(bar.name)}&tbs=${$.tieba.tbs}`
      url.headers['Host'] = 'tieba.baidu.com'
      url.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1'
      $.post(url, (error, response, data) => {
        try {
          const _data = JSON.parse(data)
          bar.iscurSign = true
          bar.issignSuc = _data.no === 0 || _data.no === 1101
          bar.signNo = _data.no
          bar.signMsg = _data.no === 1102 ? '签得太快!' : _data.error
          bar.signMsg = _data.no === 2150040 ? '需要验证码!' : _data.error
        } catch (e) {
          bar.iscurSign = true
          bar.issignSuc = false
          bar.signNo = null
          bar.signMsg = error !== null ? error : e
          $.log('', `❗️ 贴吧: ${bar.name}, 签到失败! 原因: `, e, '错误: ', error, '响应: ', JSON.stringify(response), '数据: ', data)
        } finally {
          $.log(`❕ 贴吧:【${bar.name}】签到完成!`)
          resove()
        }
      })
    }
    signbarActs.push(new Promise(signbarAct))
    if (signbarActs.length === $.CFG_maxSignBars || _signbarCnt === _curbarIdx) {
      $.log('', `⏳ 正在发起 ${signbarActs.length} 个签到任务!`)
      await Promise.all(signbarActs)
      await new Promise($.wait($.CFG_signWaitTime))
      signbarActs = []
    }
    _curbarIdx++
  }
}

function getbars(bars) {
  const getBarActs = []
  for (let bar of bars) {
    const getBarAct = (resove) => {
      const url = { url: `http://tieba.baidu.com/sign/loadmonth?kw=${encodeURIComponent(bar.name)}&ie=utf-8`, headers: { Cookie: $.VAL_cookies } }
      url.headers['Host'] = 'tieba.baidu.com'
      url.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1'
      $.get(url, (error, response, data) => {
        try {
          const _signinfo = JSON.parse(data).data.sign_user_info
          bar.signRank = _signinfo.rank
          bar.contsignCnt = _signinfo.sign_keep
          bar.totalsignCnt = _signinfo.sign_total
        } catch (e) {
          bar.contsignCnt = '❓'
        } finally {
          resove()
        }
      })
    }
    getBarActs.push(new Promise(getBarAct))
  }
  return Promise.all(getBarActs)
}

async function zhidao() {
  await loginZhidao()
  await signZhidao()
}

function loginZhidao() {
  return new Promise((resove) => {
    const url = { url: 'https://zhidao.baidu.com/', headers: { Cookie: $.VAL_cookies } }
    url.headers['Host'] = 'zhidao.baidu.com'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
    $.zhidao = {}
    $.post(url, (error, response, data) => {
      try {
        $.zhidao.stoken = data.match(/"stoken"[^"]*"([^"]*)"/)[1]
        if (!$.zhidao.stoken) {
          throw new Error(`获取 stoken 失败! stoken: ${$.zhidao.stoken}`)
        }
        $.zhidao.isloginSuc = true
        $.zhidao.loginMsg = '登录成功'
      } catch (e) {
        $.zhidao.isloginSuc = false
        $.zhidao.loginMsg = '登录失败'
        $.log('', '❗️ 知道: 登录失败! 原因: ', e, '')
      } finally {
        resove()
      }
    })
  })
}

function signZhidao() {
  // 登录失败, 直接跳出
  if (!$.zhidao.isloginSuc) {
    return null
  }
  return new Promise((resove) => {
    const url = { url: 'https://zhidao.baidu.com/submit/user', headers: { Cookie: $.VAL_cookies } }
    url.headers['Host'] = 'zhidao.baidu.com'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
    const timestamp = Date.parse(new Date())
    const utdata = `61,61,7,0,0,0,12,61,5,2,12,4,24,5,4,1,4,${timestamp}`
    url.body = `cm=100509&utdata=${utdata}&stoken=${$.zhidao.stoken}`
    $.post(url, (error, response, data) => {
      try {
        const _data = JSON.parse(data)
        $.zhidao.isSignSuc = true
        $.zhidao.signNo = _data.errorNo
        $.zhidao.signMsg = _data.errorMsg
      } catch (e) {
        $.zhidao.isSignSuc = false
        $.zhidao.signNo = null
        $.zhidao.signMsg = e
        $.log('', '❗️知道: 签到失败! 原因: ', e, '数据: ', data, '')
      } finally {
        resove()
      }
    })
  })
}

function barWrapper(bar) {
  return { id: bar.forum_id, name: bar.forum_name, exp: bar.user_exp, level: bar.user_level, isSign: bar.is_sign === 1 }
}

function showmsg() {
  // 数据: 签到数量
  const allbarCnt = $.bars.length
  let allsignCnt = 0
  let cursignCnt = 0
  let curfailCnt = 0
  $.bars.filter((bar) => bar.isSign).forEach((bar) => (allsignCnt += 1))
  $.bars.filter((bar) => bar.iscurSign && bar.issignSuc).forEach((bar) => (cursignCnt += 1))
  $.bars.filter((bar) => bar.iscurSign && !bar.issignSuc).forEach((bar) => (curfailCnt += 1))
  $.bars = [true, 'true'].includes($.CFG_isOrderBars) ? $.bars.sort((a, b) => b.contsignCnt - a.contsignCnt) : $.bars
  allsignCnt += cursignCnt
  // 通知: 副标题
  let tiebasubt = '贴吧: '
  if (allbarCnt == allsignCnt) tiebasubt += '成功'
  else if (allbarCnt == curfailCnt) tiebasubt += '失败'
  else tiebasubt += '部分'
  let zhidaosubt = '知道: '
  if ($.zhidao.isSignSuc && $.zhidao.signNo === 0) zhidaosubt += '成功'
  else if ($.zhidao.isSignSuc && $.zhidao.signNo === 2) zhidaosubt += '重复'
  else zhidaosubt += '失败'
  // 通知: 详情
  let _curPage = 1
  const _totalPage = Math.ceil(allbarCnt / $.CFG_maxShowBars)

  $.desc = []
  $.bars.forEach((bar, index) => {
    const barno = index + 1
    const signbar = `${bar.isSign || bar.issignSuc ? '🟢' : '🔴'} [${barno}]【${bar.name}】排名: ${bar.signRank}`
    const signlevel = `等级: ${bar.level}`
    const signexp = `经验: ${bar.exp}`
    const signcnt = `连签: ${bar.contsignCnt}/${bar.totalsignCnt}天`
    const signmsg = `${bar.isSign || bar.issignSuc ? '' : `失败原因: ${bar.signMsg}\n`}`
    $.desc.push(`${signbar}`)
    $.desc.push(`${signlevel}, ${signexp}, ${signcnt}`)
    $.desc.push(`${signmsg}`)
    if (barno % $.CFG_maxShowBars === 0 || barno === allbarCnt) {
      const _descinfo = []
      _descinfo.push(`共签: ${allsignCnt}/${allbarCnt}, 本次成功: ${cursignCnt}, 本次失败: ${curfailCnt}`)
      _descinfo.push(`点击查看详情, 第 ${_curPage++}/${_totalPage} 页`)
      $.subt = `${tiebasubt}, ${zhidaosubt}`
      $.desc = [..._descinfo, '', ...$.desc].join('\n')
      $.msg($.name, $.subt, $.desc)
      $.desc = []
    }
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
