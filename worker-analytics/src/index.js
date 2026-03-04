/**
 * worker-analytics/src/index.js
 *
 * Cloudflare Worker that:
 *   1. Serves the dashboard SPA (static assets via [assets] in wrangler.toml)
 *   2. Handles POST /api/event — ingests analytics events into D1
 *   3. Handles GET /api/* — serves aggregated data for the dashboard
 *   4. Handles POST /api/content/* — content management (add/archive/restore)
 *
 * Bindings:
 *   env.DB — D1 database (jchowlabs-analytics)
 *   env.ALLOWED_ORIGIN — origin allowed for CORS (jchowlabs.com)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // ── CORS ──
    const allowedOrigins = [
      env.ALLOWED_ORIGIN || 'https://jchowlabs.com',
      'https://www.jchowlabs.com',
      'http://localhost:3000',
    ];
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── API routes ──
    if (pathname.startsWith('/api/')) {
      try {
        return await handleApi(pathname, request, env, corsHeaders, url);
      } catch (err) {
        console.error('API error:', err);
        return json({ error: err.message }, 500, corsHeaders);
      }
    }

    // ── Everything else: let Cloudflare static assets serve the SPA ──
    // Workers with [assets] config will automatically serve files from dist/
    // For SPA routing (e.g., /anything), serve index.html as fallback
    return env.ASSETS.fetch(request);
  },
};

/* ================================================================== */
/*  API Router                                                         */
/* ================================================================== */

async function handleApi(pathname, request, env, corsHeaders, url) {
  // ── Event ingestion (public) ──
  if (pathname === '/api/event' && request.method === 'POST') {
    return handleEventIngestion(request, env, corsHeaders);
  }

  // ── Dashboard query endpoints ──
  if (request.method === 'GET') {
    const params = Object.fromEntries(url.searchParams);

    if (pathname === '/api/summary') return handleSummary(env, params, corsHeaders);
    if (pathname === '/api/trend') return handleTrend(env, params, corsHeaders);
    if (pathname === '/api/pages') return handlePages(env, params, corsHeaders);
    if (pathname === '/api/labs') return handleLabs(env, params, corsHeaders);
    if (pathname === '/api/storage') return handleStorage(env, corsHeaders);
    if (pathname === '/api/content') return handleContentList(env, corsHeaders);
  }

  // ── Content management ──
  if (request.method === 'POST') {
    const archiveMatch = pathname.match(/^\/api\/content\/(\d+)\/archive$/);
    if (archiveMatch) return handleContentArchive(env, archiveMatch[1], corsHeaders);

    const restoreMatch = pathname.match(/^\/api\/content\/(\d+)\/restore$/);
    if (restoreMatch) return handleContentRestore(env, restoreMatch[1], corsHeaders);

    if (pathname === '/api/content') return handleContentAdd(request, env, corsHeaders);
  }

  return json({ error: 'Not found' }, 404, corsHeaders);
}

/* ================================================================== */
/*  Event Ingestion                                                    */
/* ================================================================== */

async function handleEventIngestion(request, env, corsHeaders) {
  const body = await request.json();
  const {
    event_type, slug, session_id, referrer,
    user_agent, is_bot, bot_category, timestamp,
  } = body;

  if (!event_type || !slug || !timestamp) {
    return json({ error: 'Missing required fields' }, 400, corsHeaders);
  }

  // Validate event_type
  if (!['page_view', 'lab_usage'].includes(event_type)) {
    return json({ error: 'Invalid event_type' }, 400, corsHeaders);
  }

  // Get country from Cloudflare headers (no IP stored)
  const country = request.cf?.country || 'unknown';

  await env.DB.prepare(
    `INSERT INTO events (event_type, slug, session_id, ip_country, referrer, user_agent, is_bot, bot_category, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    event_type,
    slug,
    session_id || null,
    country,
    referrer || null,
    user_agent || null,
    is_bot || 0,
    bot_category || null,
    timestamp,
  ).run();

  return json({ ok: true }, 200, corsHeaders);
}

/* ================================================================== */
/*  Summary (top-level cards)                                          */
/* ================================================================== */

async function handleSummary(env, params, corsHeaders) {
  const { start, end, range } = params;

  // Current period
  const where = buildTimeWhere(start, end);
  const bind = buildTimeBind(start, end);

  // Previous period for delta calculation
  const prev = getPreviousPeriod(start, end, range);
  const prevWhere = prev.start ? buildTimeWhere(prev.start, prev.end) : '';
  const prevBind = prev.start ? buildTimeBind(prev.start, prev.end) : [];

  // Page views
  const pvCur = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE event_type = 'page_view' AND is_bot = 0 ${where}`, bind);
  const pvPrev = prevWhere
    ? await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE event_type = 'page_view' AND is_bot = 0 ${prevWhere}`, prevBind)
    : null;

  // Unique sessions (visitors)
  const visCur = await queryScalar(env, `SELECT COUNT(DISTINCT session_id) as v FROM events WHERE event_type = 'page_view' AND is_bot = 0 ${where}`, bind);
  const visPrev = prevWhere
    ? await queryScalar(env, `SELECT COUNT(DISTINCT session_id) as v FROM events WHERE event_type = 'page_view' AND is_bot = 0 ${prevWhere}`, prevBind)
    : null;

  // Lab usages
  const labCur = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE event_type = 'lab_usage' AND is_bot = 0 ${where}`, bind);
  const labPrev = prevWhere
    ? await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE event_type = 'lab_usage' AND is_bot = 0 ${prevWhere}`, prevBind)
    : null;

  // Bots
  const botsTotal = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE is_bot = 1 ${where}`, bind);
  const botsAi = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE is_bot = 1 AND bot_category = 'ai_agent' ${where}`, bind);
  const botsCrawler = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE is_bot = 1 AND bot_category = 'crawler' ${where}`, bind);
  const botsHeadless = await queryScalar(env, `SELECT COUNT(*) as v FROM events WHERE is_bot = 1 AND bot_category = 'headless_browser' ${where}`, bind);

  return json({
    page_views: pvCur,
    page_views_delta: calcDelta(pvCur, pvPrev),
    visitors: visCur,
    visitors_delta: calcDelta(visCur, visPrev),
    lab_usages: labCur,
    lab_usages_delta: calcDelta(labCur, labPrev),
    bots_total: botsTotal,
    bots_ai_agent: botsAi,
    bots_crawler: botsCrawler,
    bots_headless: botsHeadless,
  }, 200, corsHeaders);
}

/* ================================================================== */
/*  Trend (chart data)                                                 */
/* ================================================================== */

async function handleTrend(env, params, corsHeaders) {
  const { start, end, range } = params;
  const where = buildTimeWhere(start, end);
  const bind = buildTimeBind(start, end);

  let groupBy, labelExpr;
  if (range === 'day') {
    // Group by hour
    groupBy = `CAST(((timestamp / 1000) % 86400) / 3600 AS INTEGER)`;
    labelExpr = groupBy;
  } else if (range === 'all') {
    // Group by month
    groupBy = `strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch'))`;
    labelExpr = groupBy;
  } else {
    // Group by day (week, month views)
    groupBy = `DATE(timestamp / 1000, 'unixepoch')`;
    labelExpr = groupBy;
  }

  const rows = await queryAll(env,
    `SELECT
       ${labelExpr} as label,
       SUM(CASE WHEN event_type = 'page_view' AND is_bot = 0 THEN 1 ELSE 0 END) as page_views,
       SUM(CASE WHEN event_type = 'lab_usage' AND is_bot = 0 THEN 1 ELSE 0 END) as lab_usages
     FROM events
     WHERE 1=1 ${where}
     GROUP BY label
     ORDER BY label`,
    bind
  );

  // Format hour labels for day view
  if (range === 'day') {
    return json(rows.map((r) => ({
      ...r,
      label: `${String(r.label).padStart(2, '0')}:00`,
    })), 200, corsHeaders);
  }

  // Format month labels
  if (range === 'all') {
    return json(rows.map((r) => {
      const [y, m] = r.label.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1);
      return {
        ...r,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      };
    }), 200, corsHeaders);
  }

  // Format day labels for week/month view
  return json(rows.map((r) => {
    const d = new Date(r.label + 'T00:00:00');
    return {
      ...r,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }), 200, corsHeaders);
}

/* ================================================================== */
/*  Pages (table data)                                                 */
/* ================================================================== */

async function handlePages(env, params, corsHeaders) {
  const { start, end } = params;
  const joinWhere = buildJoinTimeWhere(start, end);
  const bind = buildTimeBind(start, end);

  const rows = await queryAll(env,
    `SELECT
       tc.slug,
       tc.title,
       tc.status,
       COUNT(e.id) as views,
       COUNT(DISTINCT e.session_id) as visitors
     FROM tracked_content tc
     LEFT JOIN events e ON e.slug = tc.slug
       AND e.event_type = 'page_view'
       AND e.is_bot = 0
       ${joinWhere}
     WHERE tc.content_type = 'page'
     GROUP BY tc.slug
     ORDER BY views DESC`,
    bind
  );

  return json(rows, 200, corsHeaders);
}

/* ================================================================== */
/*  Labs (bar data)                                                    */
/* ================================================================== */

async function handleLabs(env, params, corsHeaders) {
  const { start, end } = params;
  const joinWhere = buildJoinTimeWhere(start, end);
  const bind = buildTimeBind(start, end);

  const rows = await queryAll(env,
    `SELECT
       tc.slug,
       tc.title,
       COUNT(e.id) as usages
     FROM tracked_content tc
     LEFT JOIN events e ON e.slug = tc.slug
       AND e.event_type = 'lab_usage'
       AND e.is_bot = 0
       ${joinWhere}
     WHERE tc.content_type = 'lab'
       AND tc.status = 'active'
     GROUP BY tc.slug
     ORDER BY usages DESC`,
    bind
  );

  return json(rows, 200, corsHeaders);
}

/* ================================================================== */
/*  Storage                                                            */
/* ================================================================== */

async function handleStorage(env, corsHeaders) {
  // Approximate storage: count rows and estimate
  const count = await queryScalar(env, 'SELECT COUNT(*) as v FROM events', []);
  const estimatedBytes = count * 250; // ~250 bytes per row average
  const limitBytes = 5 * 1024 * 1024 * 1024; // 5 GB D1 free tier

  return json({
    event_count: count,
    used_bytes: estimatedBytes,
    limit_bytes: limitBytes,
  }, 200, corsHeaders);
}

/* ================================================================== */
/*  Content Management                                                 */
/* ================================================================== */

async function handleContentList(env, corsHeaders) {
  const rows = await queryAll(env,
    `SELECT id, content_type, slug, title, status, added_at, archived_at
     FROM tracked_content
     ORDER BY status ASC, content_type ASC, title ASC`,
    []
  );
  return json(rows, 200, corsHeaders);
}

async function handleContentArchive(env, id, corsHeaders) {
  await env.DB.prepare(
    `UPDATE tracked_content SET status = 'archived', archived_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(parseInt(id)).run();
  return json({ ok: true }, 200, corsHeaders);
}

async function handleContentRestore(env, id, corsHeaders) {
  await env.DB.prepare(
    `UPDATE tracked_content SET status = 'active', archived_at = NULL WHERE id = ?`
  ).bind(parseInt(id)).run();
  return json({ ok: true }, 200, corsHeaders);
}

async function handleContentAdd(request, env, corsHeaders) {
  const { content_type, slug, title } = await request.json();
  if (!content_type || !slug || !title) {
    return json({ error: 'Missing fields' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    `INSERT INTO tracked_content (content_type, slug, title) VALUES (?, ?, ?)`
  ).bind(content_type, slug, title).run();

  return json({ ok: true }, 201, corsHeaders);
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function buildTimeWhere(start, end) {
  if (!start && !end) return '';
  if (start && end) return 'AND timestamp >= ? AND timestamp <= ?';
  if (start) return 'AND timestamp >= ?';
  return 'AND timestamp <= ?';
}

function buildJoinTimeWhere(start, end) {
  if (!start && !end) return '';
  if (start && end) return 'AND e.timestamp >= ? AND e.timestamp <= ?';
  if (start) return 'AND e.timestamp >= ?';
  return 'AND e.timestamp <= ?';
}

function buildTimeBind(start, end) {
  const bind = [];
  if (start) bind.push(parseInt(start));
  if (end) bind.push(parseInt(end));
  return bind;
}

function getPreviousPeriod(start, end, range) {
  if (!start || !end || range === 'all') return { start: null, end: null };
  const s = parseInt(start);
  const e = parseInt(end);
  const duration = e - s;
  return {
    start: s - duration,
    end: s - 1,
  };
}

function calcDelta(current, previous) {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

async function queryScalar(env, sql, bind) {
  const stmt = env.DB.prepare(sql);
  const result = bind.length ? await stmt.bind(...bind).first() : await stmt.first();
  return result?.v ?? 0;
}

async function queryAll(env, sql, bind) {
  const stmt = env.DB.prepare(sql);
  const result = bind.length ? await stmt.bind(...bind).all() : await stmt.all();
  return result?.results ?? [];
}
