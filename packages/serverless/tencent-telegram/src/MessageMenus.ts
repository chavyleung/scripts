import { Menu } from '@grammyjs/menu'

export const createMessageMenus = () => {
  const menus = new Menu('MessageMenu')

  menus.text(
    '编码',
    replyTextMessage((message) => encodeURI(message))
  )

  menus.text(
    '解码',
    replyTextMessage((message) => decodeURI(message))
  )

  menus.row()

  menus.text(
    '编码 (url)',
    replyTextMessage((message) => encodeURIComponent(message))
  )

  menus.text(
    '解码 (url)',
    replyTextMessage((message) => decodeURIComponent(message))
  )

  menus.row()

  menus.text(
    'JSON (串化)',
    replyTextMessage((message) => JSON.stringify(message))
  )

  menus.text(
    'JSON (对象化)',
    replyTextMessage((message) => JSON.parse(message))
  )

  return menus
}

export const replyTextMessage = (
  reply: (message: string) => string | Promise<string>
) => {
  const middleware: TextMenuMiddleware = async (ctx, next) => {
    const srcMessage = ctx.msg?.reply_to_message
    if (!srcMessage?.text) {
      return await next()
    }

    const replyMessage = await Promise.resolve(reply(srcMessage.text))
    await ctx.reply(replyMessage, {
      reply_to_message_id: srcMessage.message_id,
      disable_web_page_preview: true
    })

    const chat = ctx.chat
    const message = ctx.msg
    if (!chat?.id || !message?.message_id) {
      return await next()
    }

    await ctx.api.deleteMessage(chat.id, message.message_id)
  }

  return middleware
}

export type TextMenuMiddleware = Parameters<Menu['text']>[1]
