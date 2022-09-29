import { Keyboard } from 'grammy'

export const createKeyBoard = () => {
  const keyboard = new Keyboard()
    .text('绑定 Github')
    .text('解绑 Github')
    .resized()

  return keyboard
}
