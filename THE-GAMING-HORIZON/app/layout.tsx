import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Sora, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SiteShell } from '@/components/site-shell'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Normalize the site URL so a trailing slash (or one accidentally added to
// the env var) never breaks how relative metadata paths — like the OG image
// below — get resolved into absolute URLs.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thegaminghorizon.netlify.app').replace(/\/+$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: {
    default: 'Gaming Horizon — The Home of Browser Gaming',
    template: '%s · Gaming Horizon',
  },
  description:
    'Play. Compete. Conquer. Gaming Horizon is the browser gaming home in development — instant-play games, AI-powered recommendations, achievements, leaderboards, and a community built around the games you love. No downloads. Public Beta 1 January 2027.',
  keywords: [
    'browser gaming',
    'instant play',
    'AI game recommendations',
    'Gaming Horizon',
    'no download games',
    'leaderboards',
    'achievements',
    'public beta',
  ],
  openGraph: {
    title: 'Gaming Horizon — The Ultimate Gaming Destination',
    description:
      '1M+ players. 500+ tournaments. ₹10M+ in prizes won. Compete in epic tournaments, play top games, climb the leaderboard, and win real rewards — join the Horizon today.',
    type: 'website',
    siteName: 'Gaming Horizon',
    url: '/',
    images: [{ url: '/og-social-preview.jpg?v=3', width: 1200, height: 630, alt: 'Gaming Horizon — Play. Compete. Conquer.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaming Horizon — The Ultimate Gaming Destination',
    description:
      '1M+ players. 500+ tournaments. ₹10M+ in prizes won. Compete in epic tournaments, play top games, climb the leaderboard, and win real rewards — join the Horizon today.',
    images: ['/og-social-preview.jpg?v=3'],
  },
  applicationName: 'Gaming Horizon',
  category: 'gaming',
  creator: 'Gaming Horizon',
  publisher: 'Gaming Horizon',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f5fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1020' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// Applies saved Customization Studio settings BEFORE first paint to prevent
// a flash of the default theme/accent on load (the classic FOUC).
const themeInitScript = `
(function () {
  try {
    var ACCENTS = {"aurora":["109 40 217","79 70 229","8 145 178"],"lavenderMist":["109 40 217","139 92 246","99 102 241"],"cosmicViolet":["107 33 168","126 34 206","37 99 235"],"deepAmethyst":["88 28 135","109 40 217","14 116 144"],"royalIndigo":["67 56 202","79 70 229","37 99 235"],"midnightBlue":["30 64 175","37 99 235","8 145 178"],"sapphire":["29 78 216","37 99 235","79 70 229"],"glacierBlue":["3 105 161","14 165 233","6 182 212"],"arcticCyan":["14 116 144","6 182 212","59 130 246"],"aquaPulse":["14 116 144","6 182 212","13 148 136"],"tealCurrent":["15 118 110","13 148 136","6 182 212"],"quantumTeal":["13 104 101","13 148 136","34 211 238"],"emeraldCore":["4 120 87","16 185 129","13 148 136"],"mintSignal":["4 120 87","16 185 129","20 184 166"],"limeEnergy":["77 124 15","101 163 13","22 163 74"],"solarYellow":["161 98 7","202 138 4","217 119 6"],"amberGold":["180 83 9","217 119 6","234 88 12"],"amberGlow":["146 64 14","217 119 6","251 191 36"],"tangerine":["194 65 12","234 88 12","217 119 6"],"sunsetCoral":["194 65 12","244 63 94","225 29 72"],"scarlet":["185 28 28","220 38 38","225 29 72"],"crimson":["159 18 57","190 18 60","225 29 72"],"ruby":["159 18 57","190 24 93","219 39 119"],"roseQuartz":["190 24 93","219 39 119","168 85 247"],"magentaPulse":["162 28 175","192 38 211","126 34 206"],"horizonPink":["190 24 93","219 39 119","99 102 241"],"graphite":["51 65 85","71 85 105","100 116 139"],"slate":["51 65 85","71 85 105","59 130 246"],"softSilver":["71 85 105","100 116 139","148 163 184"],"pearl":["82 82 91","113 113 122","161 161 170"],"iceSilver":["71 85 105","100 116 139","8 145 178"],"monochrome":["39 39 42","63 63 70","113 113 122"],"electricViolet":["91 33 182","124 58 237","59 130 246"],"skylineBlue":["2 132 199","14 165 233","34 211 238"],"jadeSignal":["6 95 70","5 150 105","8 145 178"],"blazeOrange":["154 52 18","234 88 12","220 38 38"],"cherryBlossom":["190 18 60","236 72 153","167 139 250"],"goldenHour":["180 83 9","245 158 11","244 63 94"],"charcoalBlue":["30 41 59","51 65 85","71 85 105"]};
    var keys = ['gh-settings-v13', 'gh-settings-v12', 'gh-settings-v11', 'gh-settings-v10', 'gh-settings-v9', 'gh-settings-v8', 'gh-settings-v7', 'gh-settings-v6', 'gh-settings-v5', 'gh-settings-v4', 'gh-settings-v3'];
    var raw = null;
    for (var i = 0; i < keys.length && !raw; i++) raw = localStorage.getItem(keys[i]);
    var s = raw ? JSON.parse(raw) : {};
    var r = document.documentElement;
    var theme = ['light','dark','system'].indexOf(s.theme) >= 0 ? s.theme : 'light';
    var resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    var clamp = function (v, min, max, fallback) {
      v = Number(v);
      return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
    };
    var hexToTriplet = function (hex) {
      hex = String(hex || '');
      var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      return r + ' ' + g + ' ' + b;
    };
    var rgbToHsl = function (r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, sVal = 0;
      if (max !== min) {
        var d = max - min;
        sVal = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
      }
      return [h, sVal, l];
    };
    var hslToTriplet = function (h, sVal, l) {
      h = ((h % 360) + 360) % 360;
      sVal = Math.min(1, Math.max(0, sVal));
      l = Math.min(1, Math.max(0, l));
      var c = (1 - Math.abs(2 * l - 1)) * sVal;
      var x = c * (1 - Math.abs((h / 60) % 2 - 1));
      var m = l - c / 2;
      var rr = 0, gg = 0, bb = 0;
      if (h < 60) { rr = c; gg = x; bb = 0; }
      else if (h < 120) { rr = x; gg = c; bb = 0; }
      else if (h < 180) { rr = 0; gg = c; bb = x; }
      else if (h < 240) { rr = 0; gg = x; bb = c; }
      else if (h < 300) { rr = x; gg = 0; bb = c; }
      else { rr = c; gg = 0; bb = x; }
      var ch = function (v) { return Math.round(Math.min(1, Math.max(0, v + m)) * 255); };
      return ch(rr) + ' ' + ch(gg) + ' ' + ch(bb);
    };
    var a;
    if (s.accent === 'custom' && /^#[0-9a-fA-F]{6}$/.test(s.customAccentHex || '')) {
      var base = hexToTriplet(s.customAccentHex);
      var parts = base.split(' ').map(Number);
      var hsl = rgbToHsl(parts[0], parts[1], parts[2]);
      a = [
        hslToTriplet(hsl[0], hsl[1] * 1.05, hsl[2] - 0.12),
        base,
        hslToTriplet(hsl[0] + 16, hsl[1] * 0.94, hsl[2] + 0.16),
      ];
    } else {
      a = ACCENTS[s.accent] || ACCENTS.aurora;
    }
    var motion = ['full', 'reduced', 'off'].indexOf(s.motionMode) >= 0 ? s.motionMode : 'full';
    r.style.setProperty('--accent-1', a[0]);
    r.style.setProperty('--accent-2', a[1]);
    r.style.setProperty('--accent-3', a[2]);
    var lum = function (tone) { var c=tone.split(/\s+/).map(Number).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    var accentFg = lum(a[0]) > .33 ? 'rgb(8 18 32)' : 'rgb(255 255 255)';
    r.style.setProperty('--accent-button-fg', accentFg);
    r.style.setProperty('--primary-foreground', accentFg);
    r.style.setProperty('--particle-opacity', String(s.particlesEnabled === false ? 0 : clamp(s.particleDensity, 0, .62, .32)));
    r.style.setProperty('--bg-intensity', String(clamp(s.backgroundIntensity, .18, .76, .52)));
    r.style.setProperty('--glass-opacity', String(clamp(s.glassOpacity, .48, .8, .58)));
    var gridVisibility = clamp(s.gridVisibility, 0, .5, .34);
    r.style.setProperty('--grid-opacity', String(gridVisibility));
    r.style.setProperty('--grid-visibility', String(gridVisibility));
    r.style.setProperty('--glow-intensity', String(clamp(s.glowIntensity, .15, .7, .55)));
    r.style.setProperty('--background-pattern-strength', String(Math.min(.82, .28 + clamp(s.gridVisibility, 0, .5, .34))));
    r.style.setProperty('--atmosphere-strength', String(Math.min(.9, .34 + clamp(s.backgroundIntensity, .18, .76, .52) * .72)));
    r.style.setProperty('--anim-scale', String(motion === 'off' ? .001 : motion === 'reduced' ? .28 : clamp(s.animationIntensity, .25, 1, .72)));
    var cursors = ['default','horizonDot','neonRing','minimalArrow','pixelPointer','orbital','cometTrail','spark','gamepad','crosshair','softGlow','retroArcade'];
    var legacyBackgrounds = {static:'calm',mesh:'neutral',grid:'frost',starfield:'cosmic'};
    var backgrounds = ['calm','nebula','aurora','ocean','sunset','forest','cosmic','frost','warmStudio','neutral'];
    var backgroundStyles = ['defaultHorizon','cleanCanvas','softGrid','fadedGrid','dotMatrix','auroraWash','nebulaMist','radialGlow','horizonLines','subtleNoise','frostedLight','deepSpace','sunsetHaze','oceanGlow','emeraldAtmosphere','monochromeStudio','minimal'];
    var performance = ['battery','balanced','high'];
    var cursor = cursors.indexOf(s.cursor) >= 0 ? s.cursor : 'default';
    if (motion !== 'full' || s.performance === 'battery') cursor = 'default';
    r.setAttribute('data-cursor', cursor);
    r.setAttribute('data-density', ['compact','cozy','comfortable'].indexOf(s.density) >= 0 ? s.density : 'cozy');
    r.setAttribute('data-reduced', String(motion !== 'full'));
    r.setAttribute('data-motion', motion);
    var bg = legacyBackgrounds[s.backgroundMode] || s.backgroundMode;
    var safeAtmosphere = backgrounds.indexOf(bg) >= 0 ? bg : 'calm';
    r.setAttribute('data-bg-mode', safeAtmosphere);
    r.setAttribute('data-atmosphere', safeAtmosphere);
    var legacyBackgroundStyles = {grid:'softGrid',soft:'fadedGrid',clean:'cleanCanvas',dots:'dotMatrix',lines:'horizonLines',noise:'subtleNoise',glow:'radialGlow'};
    var backgroundStyle = legacyBackgroundStyles[s.backgroundStyle] || s.backgroundStyle;
    var safeBackground = backgroundStyles.indexOf(backgroundStyle) >= 0 ? backgroundStyle : 'defaultHorizon';
    r.setAttribute('data-bg-style', safeBackground);
    r.setAttribute('data-background', safeBackground);
    r.setAttribute('data-grid', gridVisibility > 0 ? 'on' : 'off');
    r.setAttribute('data-customization-ready', 'true');
    r.setAttribute('data-perf', performance.indexOf(s.performance) >= 0 ? s.performance : 'balanced');
    r.setAttribute('data-page-transitions', String(s.pageTransitions !== false));
    r.setAttribute('data-theme-preference', theme);
    r.setAttribute('data-theme', resolved);
    r.classList.toggle('dark', resolved === 'dark');
    r.classList.toggle('light', resolved === 'light');
    r.style.colorScheme = resolved;
    var themeColor = resolved === 'dark' ? '#0d1020' : '#f3f5fb';
    var themeMetas = document.querySelectorAll('meta[name="theme-color"]');
    for (var j = 0; j < themeMetas.length; j++) themeMetas[j].setAttribute('content', themeColor);
  } catch (e) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`


const gatewayInitScript = `
(function () {
  var root = document.documentElement;
  var path = '/';
  var isHomepage = true;
  var state = 'open';
  var gatewayTheme = 'light';

  try {
    path = window.location.pathname || '/';
    isHomepage = path === '/';

    if (!isHomepage) {
      state = 'dismissed';
    } else {
      var params = new URLSearchParams(window.location.search);
      if (params.get('gateway') === 'skip') {
        params.delete('gateway');
        var clean = path + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
        window.history.replaceState(window.history.state, '', clean);
      }
      var sessionSkipActive = false;
      try {
        var sessionSkipValue = sessionStorage.getItem('gh_gateway_skip_session');
        sessionSkipActive = sessionSkipValue === '1';
        if (sessionSkipValue !== null && sessionSkipValue !== '1') sessionStorage.removeItem('gh_gateway_skip_session');
      } catch (_) {
        // When session storage cannot be read, keep the safe Gateway-first state.
        sessionSkipActive = false;
      }
      state = sessionSkipActive ? 'dismissed' : 'open';
    }

    try {
      var consentRaw = localStorage.getItem('gh:gateway-consent-v2') || localStorage.getItem('gh:gateway-consent-v1');
      var consent = consentRaw ? JSON.parse(consentRaw) : null;
      var mayReadAppearance = Boolean(consent && consent.appearancePreferences === true);
      var storedGatewayTheme = mayReadAppearance ? localStorage.getItem('gh_gateway_theme') : null;
      if (storedGatewayTheme === 'dark') gatewayTheme = 'dark';
      else if (storedGatewayTheme === 'system') gatewayTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      gatewayTheme = 'light';
    }
  } catch (_) {
    // The homepage always fails closed to the opaque Gateway. Dedicated routes
    // fail open to their requested page so legal and informational content is reachable.
    try { isHomepage = (window.location.pathname || '/') === '/'; } catch (_) { isHomepage = true; }
    state = isHomepage ? 'open' : 'dismissed';
  }

  root.setAttribute('data-gateway-state', state);
  root.setAttribute('data-gateway-shell-theme', gatewayTheme);
  root.removeAttribute('data-gateway-hydrated');
  if (state === 'open') root.setAttribute('data-gh-gateway', 'show');
  else root.removeAttribute('data-gh-gateway');
})();
`

const gatewayFirstPaintCss = `
html[data-gateway-state='open'],
html[data-gateway-state='unresolved'] {
  overflow: hidden !important;
  background: #f3f5fb;
}
html[data-gateway-shell-theme='dark'][data-gateway-state='open'],
html[data-gateway-shell-theme='dark'][data-gateway-state='unresolved'] {
  background: #0d1020;
}
html[data-gateway-state='open'] [data-gh-site-layer],
html[data-gateway-state='unresolved'] [data-gh-site-layer] {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
#gh-gateway-initial-shell {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 2147482999;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  place-items: center;
  background:
    radial-gradient(60% 62% at 70% 42%, rgba(79,70,229,.14), transparent 72%),
    radial-gradient(48% 50% at 18% 18%, rgba(8,145,178,.08), transparent 74%),
    #f3f5fb;
  color: #20243a;
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}
html[data-gateway-shell-theme='dark'] #gh-gateway-initial-shell {
  background:
    radial-gradient(60% 62% at 70% 42%, rgba(109,40,217,.2), transparent 72%),
    radial-gradient(48% 50% at 18% 18%, rgba(8,145,178,.12), transparent 74%),
    #0d1020;
  color: #f3f5ff;
}
html[data-gateway-state='open']:not([data-gateway-hydrated='true']) #gh-gateway-initial-shell,
html[data-gateway-state='unresolved'] #gh-gateway-initial-shell {
  display: grid;
}
#gh-gateway-initial-shell .gh-first-paint-inner {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 28px;
  text-align: center;
}
#gh-gateway-initial-shell .gh-first-paint-mark {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid rgba(109,40,217,.24);
  border-radius: 24px;
  background: rgba(255,255,255,.72);
  box-shadow: 0 30px 80px -42px rgba(79,70,229,.8);
}
html[data-gateway-shell-theme='dark'] #gh-gateway-initial-shell .gh-first-paint-mark {
  border-color: rgba(139,92,246,.34);
  background: rgba(22,26,48,.9);
}
#gh-gateway-initial-shell .gh-first-paint-title {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -.02em;
}
#gh-gateway-initial-shell .gh-first-paint-copy {
  margin: 0;
  max-width: 320px;
  color: rgba(71,85,105,.82);
  font-size: 12px;
  line-height: 1.65;
}
html[data-gateway-shell-theme='dark'] #gh-gateway-initial-shell .gh-first-paint-copy {
  color: rgba(203,213,225,.76);
}
`


// Applies a previously chosen page zoom (e.g. the 80% suggested on the
// Gateway) before first paint so the site doesn't flash at 100% and then
// jump to the saved zoom level.
const zoomInitScript = `
(function () {
  try {
    var raw = localStorage.getItem('gh:page-zoom');
    var value = raw ? Number(raw) : null;
    if (value && isFinite(value) && value !== 100) {
      var clamped = Math.min(125, Math.max(60, Math.round(value)));
      document.documentElement.style.zoom = clamped + '%';
      document.documentElement.style.setProperty('--gh-page-zoom', String(clamped / 100));
    }
  } catch (e) {}
})();
`

// Applies a previously chosen interface language to <html lang="..."> before
// first paint, so the page never flashes "en" before LocaleProvider hydrates.
const languageInitScript = `
(function () {
  try {
    var code = localStorage.getItem('gh-language');
    var known = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'hi'];
    if (code && known.indexOf(code) >= 0) {
      document.documentElement.setAttribute('lang', code);
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-gateway-state="unresolved"
      className={`${sora.variable} ${spaceGrotesk.variable} ${jetbrains.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <style id="gh-gateway-first-paint" dangerouslySetInnerHTML={{ __html: gatewayFirstPaintCss }} />
        <script id="gh-theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script id="gh-gateway-init" dangerouslySetInnerHTML={{ __html: gatewayInitScript }} />
        <script id="gh-zoom-init" dangerouslySetInnerHTML={{ __html: zoomInitScript }} />
        <script id="gh-language-init" dangerouslySetInnerHTML={{ __html: languageInitScript }} />
      </head>
      <body className="antialiased">
        <div id="gh-gateway-initial-shell" aria-label="Preparing Gaming Horizon entry gateway" role="status">
          <div className="gh-first-paint-inner">
            <div className="gh-first-paint-mark" aria-hidden="true">
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4.5C11.44 4.5 4.5 11.44 4.5 20S11.44 35.5 20 35.5 35.5 28.56 35.5 20 28.56 4.5 20 4.5Z" stroke="url(#gh-shell-gradient)" strokeWidth="2.2"/>
                <path d="M10.8 22.6c3.8-6.4 14.6-9.7 20.1-3.1-4.2-1.7-8.8-.4-11.2 3.1-2.2 3.2-5.8 4.1-8.9 0Z" fill="url(#gh-shell-gradient)" opacity=".92"/>
                <circle cx="20" cy="20" r="3.2" fill="url(#gh-shell-gradient)"/>
                <defs><linearGradient id="gh-shell-gradient" x1="7" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#6D28D9"/><stop offset=".52" stopColor="#4F46E5"/><stop offset="1" stopColor="#0891B2"/></linearGradient></defs>
              </svg>
            </div>
            <p className="gh-first-paint-title">Gaming Horizon</p>
            <p className="gh-first-paint-copy">Opening the connected browser-gaming gateway.</p>
          </div>
        </div>
        <SiteShell>{children}</SiteShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
