import { audiences } from '@boxapp/script-audiences'
import { everphoto } from '@boxapp/script-everphoto'
import { hhanclub } from '@boxapp/script-hhanclub'
import { mallcoo } from '@boxapp/script-mallcoo'
import { sfexpress } from '@boxapp/script-sfexpress'
import { surgeNodesFilter } from '@boxapp/script-surge-nodes-filter'
import { surgeNodesUsage } from '@boxapp/script-surge-nodes-usage'
import { tieba } from '@boxapp/script-tieba'
import { v2ex } from '@boxapp/script-v2ex'
import Router from '@koa/router'

export const SCRIPT_ROUTES = [
  { route: '/audiences', script: audiences },
  { route: '/everphoto', script: everphoto },
  { route: '/hhanclub', script: hhanclub },
  { route: '/mallcoo', script: mallcoo },
  { route: '/sfexpress', script: sfexpress },
  { route: '/surge-nodes-filter', script: surgeNodesFilter },
  { route: '/surge-nodes-usage', script: surgeNodesUsage },
  { route: '/tieba', script: tieba },
  { route: '/v2ex', script: v2ex }
]

export const wrapScriptRoutes = (router: Router) => {
  SCRIPT_ROUTES.forEach(({ route, script }) => {
    router.get(route, async (ctx, next) => {
      const result = await script(ctx.boxapp.store)

      if (typeof result === 'string') {
        ctx.body = result
      } else if (result?.notification) {
        ctx.boxapp.notifications.push(result.notification)
        ctx.body = JSON.stringify(result)
      }

      await next()
    })
  })
}
