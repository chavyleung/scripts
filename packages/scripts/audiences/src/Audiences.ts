import { createHttp, Http, Notification } from '@boxapp/core-runtime'
import { HttpRequestConfig } from '@boxapp/core-runtime/src/http/createHttp'

export const audiences = async (store: Audiences) => {
  // 1. init env
  const http = createHttp()
  const harData = store.audiences
  if (harData === undefined)
    throw new Error(
      '[Audiences] HarNotFound! Please check your environment variables'
    )

  // 2. attendance
  const har = JSON.parse(harData)
  const result = await attendance(http, har)

  // 3. notification
  const notification = createNotification(result)

  return { notification }
}

const attendance = async (http: Http, har: AudiencesHar) => {
  return http(har).then(({ data }) => {
    return data.includes('签到成功') || data.includes('已经签到')
  })
}

export const createNotification = (result: boolean) => {
  const details = ['']

  const notification: Notification = {
    title: `Audiences`,
    subTitle: `签到: ${result ? '成功' : '失败'}`,
    detailContent: details.join('\n')
  }

  return notification
}

export interface Audiences {
  audiences?: string
}

export interface AudiencesHar {
  url: string
  headers: HttpRequestConfig['headers']
}
