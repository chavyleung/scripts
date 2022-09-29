import { createHttp } from '@boxapp/core-runtime'
import Koa from 'koa'

export const store = () => async (ctx: Koa.Context, next: Koa.Next) => {
  console.log(`Url: ${ctx.url}`)

  // 1. get store from query
  const { store: queryStore, ...restQueryStore } = ctx.query
  const store = Array.isArray(queryStore) ? queryStore.shift() : queryStore

  if (store) {
    // remote store
    if (/^http.*/.test(store)) {
      ctx.boxapp.store = await parseRemoteStore(store)
    }

    // json store
    else {
      ctx.boxapp.store = parseJsonStore(store)
    }
  } else {
    // unknow store
  }

  // 2. wrap the rest query
  Object.assign(ctx.boxapp.store, restQueryStore)

  await next()
}

const parseRemoteStore = async (url: string) => {
  const store = await createHttp()
    .get(url)
    .then((resp) => resp.data)

  return store
}

const parseJsonStore = (json: string) => {
  const store = {}

  try {
    const data = JSON.parse(json)
    Object.assign(store, data)
  } catch {}

  return store
}
