import { createHttp, Notification } from '@boxapp/core-runtime'
import currency from 'currency.js'

export const everphoto = async (store: EverPhoto) => {
  const http = createHttp()
  const harData = store.everphoto
  if (harData === undefined)
    throw new Error(
      '[EverPhoto] HarNotFound! Please check your environment variables'
    )

  const har = JSON.parse(harData)
  const signResult: SignResult = await http({
    method: 'POST',
    ...har
  }).then((resp) => resp.data)

  const notification = createNotification(signResult)

  return { notification }
}

export const createNotification = (signResult: SignResult) => {
  const details = ['']

  const toSize = (size: number) =>
    currency(size, { precision: 0, pattern: '#' }).format()

  if (signResult.code === 0) {
    const total_reward = signResult.data.total_reward / 1024 ** 2
    const tomorrow_reward = signResult.data.tomorrow_reward / 1024 ** 2
    let detail = `总共获得: ${toSize(total_reward)} MB`
    detail += `, 明天获得: ${toSize(tomorrow_reward)} MB`
    details.push(detail)
  }

  const notification: Notification = {
    title: `时光相册`,
    subTitle: `签到: ${signResult.code === 0 ? '成功' : '失败'}`,
    detailContent: details.join('\n')
  }

  return notification
}

export interface EverPhoto {
  everphoto?: string
}

interface Response<Result> {
  code: number
  message: string
  data: Result
}

type SignResult = Response<{
  checkin_result: boolean
  continuity: number
  total_reward: number
  tomorrow_reward: number
  cache_time: number
  checkin_push: number
}>
