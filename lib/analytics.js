/**
 * lib/analytics.js — Lightweight analytics event emitter
 *
 * Sends events to the jchowlabs Analytics Worker (Cloudflare D1).
 * Respects cookie consent. Silently fails on errors.
 */

const ANALYTICS_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8788/api/event'
    : 'https://dashboard.jchow-a27.workers.dev/api/event';

/* ------------------------------------------------------------------ */
/*  Session ID (sessionStorage — per-tab, no cookies)                  */
/* ------------------------------------------------------------------ */

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let id = sessionStorage.getItem('_jcl_sid');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('_jcl_sid', id);
  }
  return id;
}

/* ------------------------------------------------------------------ */
/*  Bot detection (client-side, basic)                                 */
/* ------------------------------------------------------------------ */

function detectBot() {
  if (typeof navigator === 'undefined') return { is_bot: false, bot_category: null };

  const ua = (navigator.userAgent || '').toLowerCase();

  const aiAgentPatterns = [
    'gptbot', 'chatgpt-user', 'claudebot', 'anthropic',
    'cohere-ai', 'perplexitybot', 'bytespider', 'oai-searchbot',
  ];

  const crawlerPatterns = [
    'bot', 'crawl', 'spider', 'slurp', 'mediapartners',
    'facebookexternalhit', 'linkedinbot', 'twitterbot',
    'whatsapp', 'telegrambot', 'discordbot', 'bingpreview',
    'googlebot', 'yandex', 'baidu', 'duckduckbot',
    'ccbot', 'amazonbot',
  ];

  const isWebDriver = navigator.webdriver === true;
  const noLanguages = !navigator.languages || navigator.languages.length === 0;

  const isAiAgent = aiAgentPatterns.some((p) => ua.includes(p));
  const isCrawler = !isAiAgent && crawlerPatterns.some((p) => ua.includes(p));
  const isHeadless = !isAiAgent && !isCrawler && (isWebDriver || noLanguages);

  const isBot = isAiAgent || isCrawler || isHeadless;
  const category = isAiAgent
    ? 'ai_agent'
    : isCrawler
      ? 'crawler'
      : isHeadless
        ? 'headless_browser'
        : null;

  return { is_bot: isBot, bot_category: category };
}

/* ------------------------------------------------------------------ */
/*  Core event emitter                                                 */
/* ------------------------------------------------------------------ */

/**
 * Send an analytics event to the Worker.
 *
 * @param {'page_view' | 'lab_usage'} eventType
 * @param {object} [options]
 * @param {string} [options.slug] - Override slug (defaults to pathname)
 */
export async function trackEvent(eventType, options = {}) {
  try {
    if (typeof window === 'undefined') return;

    const { is_bot, bot_category } = detectBot();

    await fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        slug: options.slug || window.location.pathname,
        session_id: getSessionId(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
        is_bot: is_bot ? 1 : 0,
        bot_category: bot_category,
        timestamp: Date.now(),
      }),
      keepalive: true,
    });
  } catch {
    // Never break the site for analytics
  }
}

/**
 * Track a page view for the current pathname.
 */
export function trackPageView() {
  trackEvent('page_view');
}

/**
 * Track lab usage.
 * @param {string} labSlug - e.g., 'passkey-demo', 'vulnerable-chatbot'
 */
export function trackLabUsage(labSlug) {
  trackEvent('lab_usage', { slug: labSlug });
}
