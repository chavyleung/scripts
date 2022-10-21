import Koa from 'koa'
import { notifyTelegram } from './NotifyTelegram'

export const notifyAll = () => async (ctx: Koa.Context, next: Koa.Next) => {
  await notifyTelegram(ctx, next)
  await next()
}

export * from './NotifyTelegram'
