const ALLOWED_ORIGINS = [
  'https://jchowlabs.com',
  'https://www.jchowlabs.com',
  'https://jchowlabs.github.io',
  'http://localhost:3000',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/ip' && request.method === 'GET') {
      try {
        const cf = request.cf || {};
        const data = {
          ip: request.headers.get('CF-Connecting-IP') || null,
          city: cf.city || null,
          region: cf.region || null,
          country: cf.country || null,
          latitude: cf.latitude || null,
          longitude: cf.longitude || null,
          timezone: cf.timezone || null,
          isp: cf.asOrganization || null,
          tlsVersion: cf.tlsVersion || null,
          httpProtocol: cf.httpProtocol || null,
          acceptLanguage: request.headers.get('Accept-Language') || null,
          acceptEncoding: request.headers.get('Accept-Encoding') || null,
        };
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/headers' && request.method === 'GET') {
      try {
        const headerMap = {};
        for (const [key, value] of request.headers.entries()) {
          if (key.startsWith('cf-') && key !== 'cf-connecting-ip') continue;
          if (key === 'x-forwarded-for' || key === 'x-real-ip') continue;
          headerMap[key] = value;
        }
        return new Response(JSON.stringify(headerMap), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
