import App from 'express'
import { Bot, webhookCallback } from 'grammy'

import { createKeyBoard } from './KeyBoard'
import { createMessageMenus } from './MessageMenus'

const bot_token = process.env.tg_bot_id!
const bot_info = process.env.tg_bot_info!
const notify_chat_id = process.env.tg_chat_id!

const botInfo = JSON.parse(bot_info)
const bot = new Bot(bot_token, { botInfo })
const keyboard = createKeyBoard()

bot.command('start', (ctx) =>
  ctx.reply(`聊天标识: ${ctx.chat.id}`, { reply_markup: keyboard })
)

bot.command('view', (ctx) =>
  ctx.reply(`聊天标识: ${ctx.chat.id}`, { reply_markup: keyboard })
)

const messageMenus = createMessageMenus()
bot.use(messageMenus)

bot.on('message:text', async (ctx) => {
  if (ctx.msg.text === '绑定 Github') {
    await ctx.reply('亲, 该功能未实现咧!')
  } else if (ctx.msg.text === '解绑 Github') {
    await ctx.reply('亲, 该功能未实现咧!')
  } else {
    const messageId = ctx.msg.message_id
    await ctx.reply('Select your command:', {
      reply_markup: messageMenus,
      reply_to_message_id: messageId
    })
  }
})

const app = App()
app.use(App.json())
app.use(`/${bot_token}`, webhookCallback(bot, 'express'))

app.listen(9000, () => {
  return bot.api.sendMessage(notify_chat_id, `🔔 服务启动 🔔`)
})
