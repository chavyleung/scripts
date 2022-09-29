import { createHttp, Http, Notification, wait } from '@boxapp/core-runtime'

export const tieba = async (store: Tieba) => {
  const cookie = store.tieba ?? store.chavy_cookie_tieba ?? ''
  const http = createHttp({
    headers: {
      'Cookie': cookie,
      'Host': `tieba.baidu.com`,
      'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1`
    }
  })

  // 1. 获取关注列表
  const likeForums = await getForums(http)

  // 2. 排序
  const forums = likeForums.sort((a, b) => b.exp - a.exp)

  // 3. 签到
  await signForums(http, forums)

  const notification = createNotification(forums)
  return { notification }
}

export const getForums = async (http: Http) => {
  const url = 'https://tieba.baidu.com/mo/q/newmoindex'
  const result = await http.get<ApiResult<GetForumsResult>>(url)

  const { tbs, like_forum } = result.data.data
  const forums: Forum[] = like_forum.map((rawForum) => {
    const {
      forum_id: id,
      forum_name: name,
      user_exp: exp,
      user_level: level,
      is_like: isLike,
      is_sign: isSign
    } = rawForum

    return {
      id,
      name,
      tbs,
      exp: Number(exp),
      level: Number(level),
      isLike: isLike,
      isSign: isSign === 1
    }
  })

  return forums
}

export const signForums = async (http: Http, forums: Forum[]) => {
  let pool: Promise<Forum>[] = []
  for (let i = 0; i < forums.length; i++) {
    const forum = forums[i]

    // 放入并发池
    if (pool.length < 5 && !forum.isSign) {
      pool.push(signForum(http, forum))
    }

    // 等待并发完成
    if (pool.length === 5 || forums.length === i + 1) {
      await Promise.allSettled(pool)
      await wait(2000)
      pool = []
    }
  }
  return forums
}

export const signForum = async (http: Http, forum: Forum) => {
  const { name, tbs } = forum
  const baseURL = 'https://tieba.baidu.com/sign/add'
  const encodeName = encodeURIComponent(name)
  const url = `${baseURL}?ie=utf-8&kw=${encodeName}&tbs=${tbs}`

  return http.post(url).then(({ data }) => {
    forum.isSign = data.no === 0 || data.no === 1101
    forum.message = data.error ?? forum.message
    return forum
  })
}

export const createNotification = (forums: Forum[]) => {
  const details = ['']

  const allCnt = forums.length
  const sucCnt = forums.filter((f) => f.isSign).length

  forums
    // 只提示签到失败的条目
    .filter((forum) => !forum.isSign)
    .forEach((forum, idx) => {
      const { name, level, exp, isSign } = forum
      const index = idx + 1
      const flag = isSign === true ? '🟢' : '🔴'
      const msg = `${flag} ${index}. ${name}, 等级: ${level}, 经验: ${exp}`
      details.push(msg)
    })

  const notification: Notification = {
    title: `百度贴吧`,
    subTitle: `签到: ${
      allCnt === sucCnt ? '全部成功' : '部分成功'
    } (${sucCnt}/${allCnt})`,
    detailContent: details.join('\n')
  }

  return notification
}

export type Tieba = {
  tieba?: string
  chavy_cookie_tieba?: string
}

export type Forum = {
  id: number
  name: string
  tbs: string
  exp: number
  level: number
  isLike: boolean
  isSign: boolean
  message?: string
  signInfo?: {
    keep: number
    rank: number
    total: number
  }
}

export type ApiResult<Data> = {
  no: number
  error: string
  data: Data
}

export type GetForumsResult = {
  uid: number
  tbs: string
  itb_tbs: string
  like_forum: {
    forum_name: string
    user_level: string
    user_exp: string
    forum_id: number
    is_like: boolean
    favo_type: number
    is_sign: number
  }[]
  ubs_sample_ids: string
  ubs_abtest_config: {
    sid: string
  }[]
}
