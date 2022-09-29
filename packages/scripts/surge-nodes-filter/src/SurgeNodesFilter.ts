import { createHttp } from '@boxapp/core-runtime'

export const surgeNodesFilter = async (params: SurgeNodesFilter) => {
  const { url, filter, append } = params

  if (!url) return 'Error=direct'
  const { data } = await createHttp().get<string>(url)

  let lines = data.split('\n')
  lines = lines.filter((line) => line) // 去除空行

  if (filter) lines = lines.filter((line) => line.includes(filter))
  if (append) lines = lines.map((line) => `${line}${append}`)
  return lines.join('\n')
}

type SurgeNodesFilter = {
  url?: string
  filter?: string
  append?: string
}
