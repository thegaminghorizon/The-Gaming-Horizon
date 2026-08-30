import type { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thegaminghorizon.netlify.app').replace(/\/+$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/vision',
    '/platform',
    '/plans',
    '/ai',
    '/games',
    '/music',
    '/blog',
    '/blog/why-browser-gaming-matters',
    '/blog/behind-gaming-horizon',
    '/blog/building-the-ai-companion',
    '/blog/progress-update-1',
    '/blog/progress-update-2',
    '/game-request',
    '/roadmap',
    '/development',
    '/beta',
    '/beta-preview',
    '/faq',
    '/signin',
    '/signup',
    '/status',
    '/press',
    '/contact',
    '/support',
    '/support-us',
    '/developers',
    '/privacy',
    '/cookies',
    '/beta-platform',
    '/terms',
    '/accessibility',
  ]
  const now = new Date()
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: r === '' ? 1 : 0.7,
  }))
}
