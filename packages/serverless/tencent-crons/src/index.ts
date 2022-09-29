import { createHttp } from '@boxapp/core-runtime'

export const execute = async (event: Event) => {
  const http = createHttp()
  const { data } = await http(JSON.parse(event.Message))
  return data
}

type Event = {
  Message: string
}
