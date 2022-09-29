export const notify = (notification: Notification) => {
  const { title, subTitle, detailContent } = notification
  const logs: string[] = ['']
  logs.push(title)
  subTitle && logs.push(subTitle)
  detailContent && logs.push(detailContent)
  console.log(logs.join('\n'))
}

export interface Notification {
  title: string
  subTitle?: string
  detailContent?: string
}
