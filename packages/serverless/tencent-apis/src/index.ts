import { Bot } from 'grammy'
import Koa from 'koa'
import json from 'koa-json'

import { notifyTelegram } from './Notify'
import { router } from './Router'
import { wrapStore } from './Store'

const server = new Koa()

const beforeAll = () => async (ctx: Koa.Context, next: Koa.Next) => {
  ctx.boxapp = {
    notifications: [],
    startTime: new Date().getTime(),
    store: {}
  }

  console.log(`🔔 @boxapp/tencent-apis 开始!`)
  await next()
}

const afterAll = () => async (ctx: Koa.Context, next: Koa.Next) => {
  const endTime = new Date().getTime()
  const costTime = (endTime - ctx.boxapp.startTime) / 1000

  console.log(`🔔 @boxapp/tencent-apis 结束! 时间: ${costTime} 秒`)
  console.log(`status: ${ctx.response.status}`)

  await next()
}

const { tg_bot_id } = process.env
const bot = new Bot(tg_bot_id!)
bot.command('view', (ctx) => ctx.reply(`聊天标识: ${ctx.msg.chat.id}`))

server
  .use(json())
  .use(beforeAll())
  .use(wrapStore())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(notifyTelegram())
  .use(afterAll())
  .listen(9000)
