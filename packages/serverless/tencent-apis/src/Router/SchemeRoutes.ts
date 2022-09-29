import Router from '@koa/router'

export const SCHEME_ROUTES = [
  {
    route: '/surge/:scheme',
    scheme: 'surge://'
  },
  {
    route: '/quanx/:scheme',
    scheme: 'quantumult-x://'
  },
  {
    route: '/loon/:scheme',
    scheme: 'loon://'
  },
  {
    route: '/stash/:scheme',
    scheme: 'stash://'
  },
  {
    route: '/shadowrocket/:scheme',
    scheme: 'shadowrocket://'
  },
  {
    route: '/clash/:scheme',
    scheme: 'clash://'
  }
]

export const wrapSchemeRoutes = (router: Router) => {
  SCHEME_ROUTES.forEach(({ route, scheme }) =>
    router.get(route, async (ctx, next) => {
      const url = Object.keys(ctx.query).reduce((pre, key, idx) => {
        const param = ctx.query[key]
        if (!param) return pre
        const urlParam = Array.isArray(param) ? param.join(',') : param
        const encodeParam = encodeURIComponent(urlParam)
        return `${pre}${idx === 0 ? '' : '&'}${key}=${encodeParam}`
      }, `${scheme}${ctx.params.scheme}?`)
      ctx.redirect(url)
      await next()
    })
  )
}
