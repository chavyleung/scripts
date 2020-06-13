const $ = new Env('WPS')
$.VAL_signhomeurl = $.getdata('chavy_signhomeurl_wps')
$.VAL_signhomeheader = $.getdata('chavy_signhomeheader_wps')

!(async () => {
  $.log('', `🔔 ${$.name}, 开始!`, '')
  await loginapp()
  await signapp()
  await getquestion()
  await answerwx()
  await signwx()
  await signupwx()
  await getUserInfo()
  await invite()
  await getSigninfo()
  await getSignreward()
  await showmsg()
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.msg($.name, $.subt, $.desc.join('\n')), $.log('', `🔔 ${$.name}, 结束!`, ''), $.done()
  })

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
  const answers = ['WPS会员全文检索', '100G', 'WPS会员数据恢复', 'WPS会员PDF转doc', 'WPS会员PDF转图片', 'WPS图片转PDF插件', '金山PDF转WORD', 'WPS会员拍照转文字', '使用WPS会员修复', 'WPS全文检索功能', '有，且无限次', '文档修复']
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

function invite() {
  const sids = [
    'V02S2UBSfNlvEprMOn70qP3jHPDqiZU00a7ef4a800341c7c3b',
    'V02StVuaNcoKrZ3BuvJQ1FcFS_xnG2k00af250d4002664c02f',
    'V02SWIvKWYijG6Rggo4m0xvDKj1m7ew00a8e26d3002508b828',
    'V02Sr3nJ9IicoHWfeyQLiXgvrRpje6E00a240b890023270f97',
    'V02SBsNOf4sJZNFo4jOHdgHg7-2Tn1s00a338776000b669579',
    'V02ScVbtm2pQD49ArcgGLv360iqQFLs014c8062e000b6c37b6',
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
  const inviteActs = []
  $.log('', '开始邀请: ')
  for (let sidIdx = 0; sidIdx < sids.length; sidIdx++) {
    inviteActs.push(
      new Promise((resove) => {
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
    )
  }
  return Promise.all(inviteActs)
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
    resove()
  })
}

// prettier-ignore
function Env(t){this.name=t,this.logs=[],this.isSurge=(()=>"undefined"!=typeof $httpClient),this.isQuanX=(()=>"undefined"!=typeof $task),this.log=((...t)=>{this.logs=[...this.logs,...t],t?console.log(t.join("\n")):console.log(this.logs.join("\n"))}),this.msg=((t=this.name,s="",i="")=>{this.isSurge()&&$notification.post(t,s,i),this.isQuanX()&&$notify(t,s,i);const e=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t&&e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n"))}),this.getdata=(t=>this.isSurge()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):void 0),this.setdata=((t,s)=>this.isSurge()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):void 0),this.get=((t,s)=>this.send(t,"GET",s)),this.wait=((t,s=t)=>i=>setTimeout(()=>i(),Math.floor(Math.random()*(s-t+1)+t))),this.post=((t,s)=>this.send(t,"POST",s)),this.send=((t,s,i)=>{if(this.isSurge()){const e="POST"==s?$httpClient.post:$httpClient.get;e(t,(t,s,e)=>{s&&(s.body=e,s.statusCode=s.status),i(t,s,e)})}this.isQuanX()&&(t.method=s,$task.fetch(t).then(t=>{t.status=t.statusCode,i(null,t,t.body)},t=>i(t.error,t,t)))}),this.done=((t={})=>$done(t))}
