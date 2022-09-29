import { Bot } from 'grammy'
import Koa from 'koa'

export const notifyTelegram =
  () => async (ctx: Koa.Context, next: Koa.Next) => {
    const { tg_bot_id } = process.env
    const { tg_chat_id } = ctx.boxapp.store

    console.log(`tg_bot_id: ${tg_bot_id}`)
    console.log(`tg_chat_id: ${tg_chat_id}`)

    if (tg_bot_id && tg_chat_id) {
      const bot = new Bot(tg_bot_id)

      const { notifications } = ctx.boxapp
      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i]

        const messages = [
          notification.title,
          notification.subTitle,
          notification.detailContent
        ].filter((m) => m)

        await bot.api.sendMessage(tg_chat_id, messages.join('\n'))
      }
    }
    await next()
  }
