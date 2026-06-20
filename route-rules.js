export const routeRules = {
  '/pages/portfolio': { redirect: { to: '/content/20-portfolio', statusCode: 301 } },
  '/pages/about': { redirect: { to: '/content/30-about', statusCode: 301 } },
  // s-maxage: CDN edge caches for 24h (Cloudflare respects this, browsers ignore it)
  // max-age=0: browsers always fetch fresh, so users never see stale pages
  // Cache is automatically purged on each Cloudflare Pages deployment
  '/**': { headers: { 'Cache-Control': 'public, s-maxage=86400, max-age=0, must-revalidate' } },
};
