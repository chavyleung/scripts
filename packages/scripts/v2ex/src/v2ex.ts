import { createHttp, Http, Notification } from '@boxapp/core-runtime'

export const v2ex = async (store: V2EX) => {
  // 1. 获取 cookie
  const cookie = store.v2ex ?? store.chavy_cookie_v2ex
  if (!cookie) {
    const notification = notifyFailure('没有会话.')
    return { notification }
  }

  if (!cookie) return
  const http = createHttp({ headers: { cookie } })

  // 2. 获取 once
  const once = await getOnce(http)

  // 3.1 已经签过
  if (once === true) {
    const notification = notifySuccess()
    return { notification }
  }

  // 3.2 签到失败
  else if (once === false) {
    const notification = notifyFailure('获取 once 失败.')
    return { notification }
  }

  // 3.3 开始签到
  else {
    const success = await signIn(http, once)
    const notification = success
      ? notifySuccess()
      : notifyFailure('签到失败, 原因未知.')
    return { notification }
  }
}

const getOnce = async (http: Http) => {
  const url = `https://www.v2ex.com/mission/daily`
  const { data: body } = await http.get<string>(url)
  if (/奖励已领取/.test(body)) return true

  const regex = /<input[^>]*\/mission\/daily\/redeem\?once=(\d+)[^>]*>/
  if (!regex.test(body)) {
    console.error(body)
    return false
  }

  const [, once] = body.match(regex)!
  return once
}

const signIn = async (http: Http, once: string) => {
  const url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`
  const { data: body } = await http.get<string>(url)
  const success = /奖励已领取/.test(body)
  if (!success) {
    console.error(body)
  }
  return success
}

const notifySuccess = () => {
  const notification: Notification = {
    title: 'v2ex',
    subTitle: '签到: 成功'
  }
  return notification
}

const notifyFailure = (reason?: string) => {
  const notification: Notification = {
    title: 'v2ex',
    subTitle: `签到: 失败`
  }

  if (reason) {
    notification.detailContent = `原因: ${reason}`
  }

  return notification
}

type V2EX = {
  v2ex?: string
  chavy_cookie_v2ex?: string
}
