import { createHttp, Notification } from '@boxapp/core-runtime'

export const mallcoo = async (store: MallCoo) => {
  const http = createHttp()
  const harData = store.mallcoo
  if (harData === undefined)
    throw new Error(
      '[MallCoo] HarNotFound! Please check your environment variables'
    )

  const har = JSON.parse(harData)
  const signResult = await http({
    method: 'POST',
    ...har
  }).then((resp) => resp.data)

  const notification = createNotification(signResult)

  return { notification }
}

export const createNotification = (signResult: SignResult) => {
  const details = ['']

  details.push(signResult?.e)

  const notification: Notification = {
    title: `环宇城`,
    subTitle: `签到: ${signResult?.d ? '成功' : '失败'}`,
    detailContent: details.join('\n')
  }

  return notification
}

export interface MallCoo {
  mallcoo?: string
}

type SignResult = {
  d: { IsCheckIn: boolean }
  e: string
}
