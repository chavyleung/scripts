const $ = new Env('魔盒')
const hostApi = 'https://api.icitybox.cn/api'
const drawRes = []
const activeDrawEnd = '2026-09-20'
const activeDrawTimes = 5
const activeDrawGap = 800
const activeDrawRetry = 4
const warmupGap = 800

// 抓包 headers 只需剔除会导致请求体长度不符的字段。
// 注意: 「请勿重复提交」经日志确认是服务端限流(首次 trigger_draw 即被拒且 gift_num 仍为 5),
// 并非签名重放, 因此关键在于请求间隔而不是删请求头。
const replayHeaders = ['content-length']


!(async () => {
  const KEY_har = 'boxapp_citybox_har'
  const har = $.getjson(KEY_har)
  const headers = cleanHeaders(har?.headers)
  if (!headers) throw new Error('未获取到 CityBox 账户, 请先进入小程序签到页抓取')
  await sign(headers)
  if ($.time('yyyy-MM-dd') <= activeDrawEnd) {
    // 签到已占用限流额度, 进活动抽奖前先冷却
    await $.wait(warmupGap)
    // 先确认今天还剩几次
    await getActiveList(headers)
    const total = $.active?.gift_num ?? activeDrawTimes
    let done = 0
    let retry = 0
    while (done < total) {
      await $.wait(done === 0 ? warmupGap : activeDrawGap)
      const res = await triggerDraw(headers)
      if (res.ok) {
        // 成功一次才计数, 抽满即停
        done++
        retry = 0
        continue
      }
      if (res.retryable && ++retry <= activeDrawRetry) {
        // 限流(「请勿重复提交」): 指数退避后重试, 不消耗次数
        const backoff = Math.min(activeDrawGap * Math.pow(2, retry - 1), 6400)
        $.log(`限流, ${backoff / 1000}s 后重试 (${retry}/${activeDrawRetry})`)
        await $.wait(backoff)
        continue
      }
      break
    }
    $.log(`活动抽奖完成 ${done}/${total} 次`)
  }
  const subTitle = $.sign?.signnum
    ? `第${$.sign.signnum}天 签到成功`
    : $.sign?.message || '签到失败'
  $.msg($.name, subTitle, drawRes.join('\n'))
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function cleanHeaders(raw) {
  if (!raw) return null
  const headers = {}
  Object.keys(raw).forEach((k) => {
    if (replayHeaders.includes(k.toLowerCase())) return
    headers[k] = raw[k]
  })
  $.log(`请求头字段: ${Object.keys(headers).join(', ')}`)
  return headers
}

function sign(headers) {
  return new Promise((resolve) => {
    const url = {
      url: hostApi + '/user/up_sign',
      headers,
    }
    $.get(url, (err, resp, data) => {
      try {
        $.sign = JSON.parse(data)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}

function getActiveList(headers) {
  return new Promise((resolve) => {
    const url = {
      url: hostApi + '/active/trigger_active_list',
      headers,
    }
    $.get(url, (err, resp, data) => {
      try {
        $.active = JSON.parse(data)
        $.log(`活动列表: ${data}`)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}

function triggerDraw(headers) {
  return new Promise((resolve) => {
    let result = { ok: false, retryable: false }
    const url = {
      url: hostApi + '/active/trigger_draw',
      headers,
    }
    $.post(url, (err, resp, data) => {
      try {
        const res = JSON.parse(data)
        $.log(`活动抽奖: ${data}`)
        if (res.status === false) {
          const msg = res.message || ''
          // 限流类可重试; 次数用尽/活动结束则直接停止
          result.retryable = /重复提交|频繁|稍后|请稍候|超时/.test(msg)
          if (!result.retryable && msg) drawRes.push(`活动: ${msg}`)
        } else {
          const prize = res.is_win
            ? res.reward?.detail?.open_door_remarks || res.reward?.detail?.card_name || res.reward?.name
            : res.reels
              ? `未中奖 ${res.reels.join('')}`
              : res.message
          if (prize) drawRes.push(`活动: ${prize}`)
          result.ok = true
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(result)
      }
    })
  })
}
