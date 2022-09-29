import { Notification } from '@boxapp/core-runtime'
import 'koa'

declare module 'koa' {
  interface DefaultState {}

  interface DefaultContext {
    boxapp: {
      notifications: Notification[]
      startTime: number
      store: Record<string, string>
    }
  }
}
