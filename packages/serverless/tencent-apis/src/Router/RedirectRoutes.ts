import Router from '@koa/router'

const REDIRECT_ROUTES = [
  {
    route: '/quanx-install',
    url: `quantumult-x:///add-resource?remote-resource=%7B%22rewrite_remote%22%3A%5B%22https%3A%2F%2Fgithub.com%2Fchavyleung%2Fscripts%2Fraw%2Fmaster%2Fbox%2Frewrite%2Fboxjs.rewrite.quanx.conf%2Ctag%3Dboxjs%22%5D%7D`
  },
  {
    route: '/quanx-update',
    url: `quantumult-x:///add-resource?remote-resource=%7B%22rewrite_remote%22%3A%5B%22https%3A%2F%2Fgithub.com%2Fchavyleung%2Fscripts%2Fraw%2Fmaster%2Fbox%2Frewrite%2Fboxjs.rewrite.quanx.conf%2Ctag%3Dboxjs%22%5D%7D`
  },
  {
    route: '/loon-install',
    url: `loon://import?plugin=https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.loon.plugin`
  },
  {
    route: '/loon-update',
    url: `loon://update?sub=all`
  },
  {
    route: '/shadowrocket-install',
    url: `shadowrocket://install?module=https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule`
  },
  {
    route: '/shadowrocket-update',
    url: `shadowrocket://install?module=https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule`
  }
]

export const wrapRedirectRoutes = (router: Router) => {
  REDIRECT_ROUTES.forEach(({ route, url }) =>
    router.get(route, async (ctx, next) => {
      ctx.redirect(url)
      await next()
    })
  )
}
