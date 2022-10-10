import { createHttp } from '@boxapp/core-runtime'

export const surgeNodesUsage = async ({ url }: SurgeNodesUsage) => {
  if (!url) return 'Error=direct'
  const { headers } = await createHttp().get<string>(url)

  const userinfo = headers?.['subscription-userinfo']
  if (!userinfo) return 'Error=direct'

  const [rawUpload, rawDownload, rawTotal] = userinfo.split('; ')
  const [, upload] = rawUpload.split('=')
  const [, download] = rawDownload.split('=')
  const [, total] = rawTotal.split('=')

  const toSize = (bytes: number) => Math.round(bytes / 1024 ** 3)
  const used = Number(upload) + Number(download)
  const usedSize = toSize(used)
  const totalSize = toSize(Number(total))

  return `${usedSize} GB | ${totalSize} GB= direct`
}

type SurgeNodesUsage = {
  url?: string
}
