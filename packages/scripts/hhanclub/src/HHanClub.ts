import { createHttp, Http, Notification } from '@boxapp/core-runtime'
import { HttpRequestConfig } from '@boxapp/core-runtime/src/http/createHttp'

export const hhanclub = async (store: HHanClub) => {
  // 1. init env
  const http = createHttp()
  const harData = store.hhanclub
  if (harData === undefined)
    throw new Error(
      '[HHanClub] HarNotFound! Please check your environment variables'
    )

  // 2. attendance
  const har = JSON.parse(harData)
  const result = await attendance(http, har)

  // 3. notification
  const notification = createNotification(result)

  return { notification }
}

const attendance = async (http: Http, har: HHanClubHar) => {
  console.log(har)

  return http(har).then((resp) => {
    console.log(resp)
    return resp.data.includes('签到成功')
  })
}

export const createNotification = (result: boolean) => {
  const details = ['']

  const notification: Notification = {
    title: `HHanClub`,
    subTitle: `签到: ${result ? '成功' : '失败'}`,
    detailContent: details.join('\n')
  }

  return notification
}

export interface HHanClub {
  hhanclub?: string
}

export interface HHanClubHar {
  url: string
  headers: HttpRequestConfig['headers']
}
