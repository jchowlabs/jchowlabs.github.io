/* ================================================================ */
/* index.js — Cloudflare Worker entry point                        */
/*                                                                  */
/* Routes /lab/start, /lab/chat, /lab/reset to the LabSession       */
/* Durable Object and handles CORS for cross-origin requests.       */
/* ================================================================ */

export { LabSession } from './session.js';
export { LabSessionSecure } from './session-secure.js';

// --------------- CORS ---------------

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://jchowlabs.com',
  'https://www.jchowlabs.com',
  'https://jchowlabs.github.io',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function withCors(response, request) {
  const headers = corsHeaders(request);
  for (const [k, v] of Object.entries(headers)) {
    response.headers.set(k, v);
  }
  return response;
}

// --------------- Worker fetch handler ---------------

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Only accept POST to /lab/* or /lab-secure/*
    if (request.method !== 'POST' || (!path.startsWith('/lab/') && !path.startsWith('/lab-secure/'))) {
      return withCors(
        new Response('Not found', { status: 404 }),
        request,
      );
    }

    const isSecure = path.startsWith('/lab-secure/');
    const route = isSecure
      ? path.replace('/lab-secure', '')   // → /start | /chat | /reset
      : path.replace('/lab', '');         // → /start | /chat | /reset

    try {
      let sessionId;

      if (route === '/start') {
        // Generate a fresh session id
        sessionId = crypto.randomUUID();
      } else {
        // Parse session_id from body (clone so DO can also read body)
        const body = await request.clone().json();
        sessionId = body.session_id;
        if (!sessionId) {
          return withCors(
            Response.json({ error: 'Missing session_id' }, { status: 400 }),
            request,
          );
        }
      }

      // Forward to Durable Object
      const binding = isSecure ? env.LAB_SESSION_SECURE : env.LAB_SESSION;
      const id = binding.idFromName(sessionId);
      const stub = binding.get(id);

      const doRequest = new Request(`https://do${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: request.body,
      });

      const doResponse = await stub.fetch(doRequest);
      const data = await doResponse.json();

      // Inject session_id into /start responses
      if (route === '/start') {
        data.session_id = sessionId;
      }

      return withCors(
        Response.json(data, { status: doResponse.status }),
        request,
      );
    } catch (err) {
      console.error('Worker error:', err);
      return withCors(
        Response.json(
          { error: err.message || 'Internal server error' },
          { status: 500 },
        ),
        request,
      );
    }
  },
};
