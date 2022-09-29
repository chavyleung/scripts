import KoaRouter from '@koa/router'
import { wrapRedirectRoutes } from './RedirectRoutes'
import { wrapSchemeRoutes } from './SchemeRoutes'
import { wrapScriptRoutes } from './ScriptRoutes'

const router = new KoaRouter()

wrapSchemeRoutes(router)
wrapRedirectRoutes(router)
wrapScriptRoutes(router)

export { router }
