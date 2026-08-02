export const routeRules = {
  '/pages/portfolio': { redirect: { to: '/content/20-portfolio', statusCode: 301 } },
  '/pages/about': { redirect: { to: '/content/30-about', statusCode: 301 } },
  // s-maxage: CDN edge TTL of 24h. Note: Cloudflare does NOT cache HTML by default
  // (it caches by file extension only), so this header has no effect on pages unless
  // a Cache Rule marking HTML as "Eligible for cache" is configured on the zone.
  // Prerendered pages are fast regardless because Cloudflare Pages serves them as
  // static assets at the edge (see _routes.json / verify-cf-routes.mjs).
  // max-age=0: browsers always fetch fresh, so users never see stale pages
  '/**': { headers: { 'Cache-Control': 'public, s-maxage=86400, max-age=0, must-revalidate' } },
};
