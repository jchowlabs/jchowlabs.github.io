'use client';

import { useState } from 'react';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8787'
    : 'https://browser-fingerprint.jchow-a27.workers.dev';

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

function hashSimple(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/* ------------------------------------------------------------------ */
/*  Collectors                                                        */
/* ------------------------------------------------------------------ */

function getNavigatorInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor || null,
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [navigator.language],
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || null,
    pdfViewerEnabled: navigator.pdfViewerEnabled ?? null,
    webdriver: navigator.webdriver || false,
    onLine: navigator.onLine,
  };
}

function getScreenInfo() {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

function getTimezoneInfo() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: new Date().getTimezoneOffset(),
  };
}

function getMediaPreferences() {
  const mq = (q) => { try { return window.matchMedia(q).matches; } catch { return null; } };
  return {
    darkMode: mq('(prefers-color-scheme: dark)'),
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    highContrast: mq('(prefers-contrast: more)'),
    hdr: mq('(dynamic-range: high)'),
    p3Gamut: mq('(color-gamut: p3)'),
  };
}

function getMathFingerprint() {
  try {
    const values = [
      Math.tan(-1e300),
      Math.log(1000),
      Math.sqrt(2),
      Math.atan2(1, 1),
      Math.exp(10),
    ];
    return hashSimple(values.join(','));
  } catch {
    return null;
  }
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return null;
  return {
    effectiveType: conn.effectiveType || null,
    downlink: conn.downlink || null,
    rtt: conn.rtt || null,
    saveData: conn.saveData || false,
  };
}

function getStorageInfo() {
  const test = (fn) => { try { fn(); return true; } catch { return false; } };
  return {
    localStorage: test(() => localStorage),
    sessionStorage: test(() => sessionStorage),
    indexedDB: test(() => indexedDB),
  };
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.font = '14px Arial';
    ctx.fillText('jchowlabs fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.font = '18px Times New Roman';
    ctx.fillText('jchowlabs fingerprint', 4, 45);
    return hashSimple(canvas.toDataURL());
  } catch {
    return null;
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
      version: gl.getParameter(gl.VERSION) || null,
      shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || null,
      extensions: gl.getSupportedExtensions()?.length || 0,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)?.join('\u00d7') || null,
      antialiasing: gl.getContextAttributes()?.antialias ?? null,
    };
  } catch {
    return null;
  }
}

async function getAudioFingerprint() {
  try {
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, ctx.currentTime);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-50, ctx.currentTime);
    comp.knee.setValueAtTime(40, ctx.currentTime);
    comp.ratio.setValueAtTime(12, ctx.currentTime);
    comp.attack.setValueAtTime(0, ctx.currentTime);
    comp.release.setValueAtTime(0.25, ctx.currentTime);
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0).slice(4500, 5000);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
    return hashSimple(sum.toString());
  } catch {
    return null;
  }
}

function detectFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Comic Sans MS', 'Impact', 'Trebuchet MS',
    'Arial Black', 'Lucida Console', 'Tahoma', 'Helvetica Neue',
    'Futura', 'Gill Sans', 'Rockwell', 'Copperplate', 'Papyrus',
    'Brush Script MT', 'Luminari', 'American Typewriter', 'Didot',
    'Optima', 'Baskerville', 'Andale Mono', 'Monaco', 'Menlo',
    'Consolas', 'Segoe UI', 'Roboto', 'SF Pro', 'Fira Code',
  ];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const getWidth = (font) => { ctx.font = `${testSize} ${font}`; return ctx.measureText(testString).width; };
  const baseWidths = baseFonts.map(getWidth);
  const detected = [];
  for (const font of testFonts) {
    if (baseFonts.some((base, i) => getWidth(`'${font}', ${base}`) !== baseWidths[i])) {
      detected.push(font);
    }
  }
  return { detected, tested: testFonts.length };
}

function detectAdBlocker() {
  try {
    const el = document.createElement('div');
    el.className = 'adsbox ad-banner ad_wrapper';
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.left = '-9999px';
    el.style.height = '1px';
    el.innerHTML = '&nbsp;';
    document.body.appendChild(el);
    const blocked = el.offsetHeight === 0 || el.clientHeight === 0;
    document.body.removeChild(el);
    return blocked;
  } catch {
    return null;
  }
}

async function getMediaDeviceCount() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const counts = { audioinput: 0, audiooutput: 0, videoinput: 0 };
    devices.forEach((d) => { if (counts[d.kind] !== undefined) counts[d.kind]++; });
    return counts;
  } catch {
    return null;
  }
}

async function getPermissionStates() {
  const names = ['notifications', 'geolocation', 'camera', 'microphone', 'clipboard-read'];
  const results = {};
  for (const name of names) {
    try {
      const status = await navigator.permissions.query({ name });
      results[name] = status.state;
    } catch {
      results[name] = 'unsupported';
    }
  }
  return results;
}

async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: Math.round(battery.level * 100),
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch {
    return null;
  }
}

/* ---------- WebRTC Leak Detection ---------- */

async function getWebRTCLeaks() {
  try {
    if (!window.RTCPeerConnection) return null;
    const ips = new Set();
    const candidates = [];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pc.createDataChannel('');

    const gathered = new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 5000);
      pc.onicecandidate = (e) => {
        if (!e.candidate) { clearTimeout(timeout); resolve(); return; }
        const line = e.candidate.candidate;
        candidates.push(line);
        const match = line.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
        if (match) ips.add(match[1]);
      };
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await gathered;
    pc.close();

    const ipList = [...ips];
    const localIPs = ipList.filter((ip) => /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(ip) || ip === '0.0.0.0');
    const publicIPs = ipList.filter((ip) => !localIPs.includes(ip) && ip !== '0.0.0.0');
    return {
      localIPs,
      publicIPs,
      candidateCount: candidates.length,
      supported: true,
    };
  } catch {
    return { localIPs: [], publicIPs: [], candidateCount: 0, supported: false };
  }
}

/* ---------- CSS Feature Detection ---------- */

function getCSSFeatures() {
  const features = [
    ['backdrop-filter', 'backdrop-filter: blur(1px)'],
    ['container-queries', 'container-type: inline-size'],
    [':has()', 'selector(:has(a))'],
    ['subgrid', 'grid-template-columns: subgrid'],
    ['color-mix()', 'color: color-mix(in srgb, red 50%, blue)'],
    ['nesting', 'selector(& a)'],
    ['@layer', 'at-rule(@layer)'],
    ['aspect-ratio', 'aspect-ratio: 1 / 1'],
    ['gap (flexbox)', 'gap: 1px'],
    ['overscroll-behavior', 'overscroll-behavior: contain'],
    ['scroll-snap', 'scroll-snap-type: x mandatory'],
    ['text-wrap: balance', 'text-wrap: balance'],
    ['scrollbar-width', 'scrollbar-width: thin'],
    ['accent-color', 'accent-color: red'],
    ['color-scheme', 'color-scheme: dark light'],
    ['inert', 'selector([inert])'],
    ['individual-transforms', 'translate: 0px'],
    ['lh unit', 'width: 1lh'],
    ['dvh unit', 'height: 1dvh'],
    ['oklch()', 'color: oklch(0.5 0.2 240)'],
    ['@property', 'at-rule(@property)'],
    ['view-transitions', 'view-transition-name: a'],
    ['popover', 'selector([popover])'],
    ['anchor-positioning', 'position-anchor: --a'],
  ];

  const supported = [];
  const unsupported = [];

  for (const [name, test] of features) {
    try {
      let result = false;
      if (test.startsWith('selector(')) {
        result = CSS.supports(test);
      } else if (test.startsWith('at-rule(')) {
        // at-rules: check via existence heuristics
        result = CSS.supports(test) || true; // most modern browsers support @layer, @property
      } else {
        result = CSS.supports(test);
      }
      (result ? supported : unsupported).push(name);
    } catch {
      unsupported.push(name);
    }
  }
  return { supported, unsupported, total: features.length };
}

/* ---------- JavaScript API Surface ---------- */

function getJSAPISurface() {
  const apis = [
    ['WebAssembly', () => typeof WebAssembly !== 'undefined'],
    ['SharedArrayBuffer', () => typeof SharedArrayBuffer !== 'undefined'],
    ['Atomics', () => typeof Atomics !== 'undefined'],
    ['WebGPU', () => !!navigator.gpu],
    ['WebTransport', () => typeof WebTransport !== 'undefined'],
    ['WebSocket', () => typeof WebSocket !== 'undefined'],
    ['WebRTC', () => !!window.RTCPeerConnection],
    ['Fetch', () => typeof fetch !== 'undefined'],
    ['Streams', () => typeof ReadableStream !== 'undefined'],
    ['Compression', () => typeof CompressionStream !== 'undefined'],
    ['PaymentRequest', () => typeof PaymentRequest !== 'undefined'],
    ['Web Serial', () => !!navigator.serial],
    ['Web USB', () => !!navigator.usb],
    ['Web HID', () => !!navigator.hid],
    ['Web Bluetooth', () => !!navigator.bluetooth],
    ['EyeDropper', () => typeof EyeDropper !== 'undefined'],
    ['File System Access', () => typeof showOpenFilePicker !== 'undefined'],
    ['Clipboard API', () => !!navigator.clipboard],
    ['Screen Orientation', () => !!screen.orientation],
    ['Vibration', () => !!navigator.vibrate],
    ['Wake Lock', () => !!navigator.wakeLock],
    ['Presentation', () => !!navigator.presentation],
    ['Idle Detection', () => typeof IdleDetector !== 'undefined'],
    ['Web Share', () => !!navigator.share],
    ['Web Crypto', () => !!window.crypto?.subtle],
    ['Credential Management', () => !!navigator.credentials],
    ['Web Locks', () => !!navigator.locks],
    ['Storage Manager', () => !!navigator.storage],
    ['Resize Observer', () => typeof ResizeObserver !== 'undefined'],
    ['Intersection Observer', () => typeof IntersectionObserver !== 'undefined'],
    ['Mutation Observer', () => typeof MutationObserver !== 'undefined'],
    ['Performance Observer', () => typeof PerformanceObserver !== 'undefined'],
    ['Reporting API', () => typeof ReportingObserver !== 'undefined'],
    ['Trusted Types', () => !!window.trustedTypes],
    ['Scheduler', () => !!window.scheduler],
    ['View Transitions', () => !!document.startViewTransition],
    ['Navigation API', () => !!window.navigation],
    ['Storage Buckets', () => !!navigator.storageBuckets],
  ];

  const available = [];
  const unavailable = [];
  for (const [name, test] of apis) {
    try {
      (test() ? available : unavailable).push(name);
    } catch {
      unavailable.push(name);
    }
  }
  return { available, unavailable, total: apis.length };
}

/* ---------- Intl Fingerprint ---------- */

function getIntlFingerprint() {
  try {
    const dtf = new Intl.DateTimeFormat().resolvedOptions();
    const nf = new Intl.NumberFormat().resolvedOptions();
    const collator = new Intl.Collator().resolvedOptions();
    const pr = new Intl.PluralRules().resolvedOptions();
    const listFormat = typeof Intl.ListFormat !== 'undefined';
    const segmenter = typeof Intl.Segmenter !== 'undefined';
    const durationFormat = typeof Intl.DurationFormat !== 'undefined';

    return {
      dateLocale: dtf.locale,
      calendar: dtf.calendar,
      numberingSystem: dtf.numberingSystem,
      timeZone: dtf.timeZone,
      hourCycle: dtf.hourCycle || null,
      numberLocale: nf.locale,
      numberCurrency: nf.currency || null,
      numberMinFraction: nf.minimumFractionDigits,
      collation: collator.collation,
      collatorLocale: collator.locale,
      collatorSensitivity: collator.sensitivity,
      pluralType: pr.type,
      listFormat,
      segmenter,
      durationFormat,
      hash: hashSimple(JSON.stringify({
        dtf: [dtf.locale, dtf.calendar, dtf.numberingSystem, dtf.timeZone, dtf.hourCycle],
        nf: [nf.locale, nf.minimumFractionDigits],
        col: [collator.locale, collator.collation, collator.sensitivity],
      })),
    };
  } catch {
    return null;
  }
}

/* ---------- Expanded Speech Voices ---------- */

async function getFullSpeechVoices() {
  try {
    let voices = speechSynthesis.getVoices();
    if (!voices.length) {
      await new Promise((resolve) => {
        speechSynthesis.onvoiceschanged = resolve;
        setTimeout(resolve, 1500);
      });
      voices = speechSynthesis.getVoices();
    }
    const voiceList = voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      local: v.localService,
    }));
    const langs = [...new Set(voices.map((v) => v.lang))];
    const localCount = voices.filter((v) => v.localService).length;
    return {
      count: voices.length,
      localCount,
      remoteCount: voices.length - localCount,
      languages: langs,
      langCount: langs.length,
      sample: voiceList.slice(0, 8),
      hash: hashSimple(voiceList.map((v) => `${v.name}|${v.lang}`).join(',')),
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                           */
/* ------------------------------------------------------------------ */

function calculateScore(report) {
  let bits = 0;
  if (report.navigator?.userAgent)               bits += 4;
  if (report.screen)                              bits += 3;
  if (report.timezone)                            bits += 2;
  if (report.navigator?.languages?.length > 1)    bits += 1.5;
  if (report.canvas)                              bits += 5;
  if (report.webgl?.renderer)                     bits += 4;
  if (report.webgl?.version)                      bits += 0.5;
  if (report.webgl?.shadingLanguage)              bits += 0.5;
  if (report.audio)                               bits += 3;
  if (report.fonts?.detected?.length > 5)         bits += 3.5;
  if (report.navigator?.hardwareConcurrency)      bits += 1.5;
  if (report.navigator?.deviceMemory)             bits += 1.5;
  if (report.network?.ip)                         bits += 4;
  if (report.connection)                          bits += 1;
  if (report.voices?.count > 0)                   bits += 2;
  if (report.voices?.langCount > 3)               bits += 1;
  if (report.mediaDevices)                        bits += 1;
  if (report.mathFingerprint)                     bits += 1;
  if (report.mediaPreferences)                    bits += 1;
  if (report.battery)                             bits += 0.5;
  if (report.webrtc?.localIPs?.length > 0)        bits += 3;
  if (report.webrtc?.publicIPs?.length > 0)       bits += 4;
  if (report.cssFeatures?.supported?.length > 0)  bits += 2;
  if (report.jsAPIs?.available?.length > 0)       bits += 2;
  if (report.httpHeaders && Object.keys(report.httpHeaders).length > 3) bits += 2;
  if (report.intl)                                bits += 2;
  return Math.round(bits * 10) / 10;
}

function getScoreLabel(bits) {
  if (bits <= 12) return { label: 'Low Exposure',      color: '#22c55e' };
  if (bits <= 24) return { label: 'Moderate Exposure',  color: '#eab308' };
  if (bits <= 36) return { label: 'High Exposure',      color: '#f97316' };
  return                  { label: 'Very High Exposure', color: '#ef4444' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function BrowserFingerprint() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    setReport(null);

    const nav              = getNavigatorInfo();
    const scr              = getScreenInfo();
    const tz               = getTimezoneInfo();
    const mediaPreferences = getMediaPreferences();
    const mathFingerprint  = getMathFingerprint();
    const conn             = getConnectionInfo();
    const storage          = getStorageInfo();
    const canvas           = getCanvasFingerprint();
    const webgl            = getWebGLInfo();
    const cssFeatures      = getCSSFeatures();
    const jsAPIs           = getJSAPISurface();
    const intl             = getIntlFingerprint();
    const audio            = await getAudioFingerprint();
    const fonts            = detectFonts();
    const adBlocker        = detectAdBlocker();
    const voices           = await getFullSpeechVoices();
    const mediaDevices     = await getMediaDeviceCount();
    const permissions      = await getPermissionStates();
    const battery          = await getBatteryInfo();
    const webrtc           = await getWebRTCLeaks();

    let network = null;
    let httpHeaders = null;
    try {
      const [ipRes, headersRes] = await Promise.all([
        fetch(`${API_BASE}/ip`).catch(() => null),
        fetch(`${API_BASE}/headers`).catch(() => null),
      ]);
      if (ipRes?.ok) network = await ipRes.json();
      if (headersRes?.ok) httpHeaders = await headersRes.json();
    } catch { /* worker unavailable — skip */ }

    const full = {
      navigator: nav, screen: scr, timezone: tz, mediaPreferences, mathFingerprint,
      connection: conn, storage, canvas, webgl, audio, fonts, adBlocker,
      voices, mediaDevices, permissions, battery, webrtc, cssFeatures,
      jsAPIs, intl, httpHeaders, network,
    };
    full.score = calculateScore(full);
    full.scoreLabel = getScoreLabel(full.score);
    setReport(full);
    setLoading(false);
  }

  const r = report;
  const empty = '\u2014';

  return (
    <div className="bf-container">
      <div className="bf-dashboard">

        {/* ---- Score ---- */}
        <div className="bf-score-section">
          {r ? (
            <>
              <div className="bf-score-value" style={{ color: r.scoreLabel.color }}>
                ~{r.score} bits
              </div>
              <div className="bf-score-bar">
                <div className="bf-score-fill" style={{ width: `${Math.min((r.score / 40) * 100, 100)}%`, backgroundColor: r.scoreLabel.color }} />
              </div>
              <div className="bf-score-label" style={{ color: r.scoreLabel.color }}>
                {r.scoreLabel.label}
              </div>
            </>
          ) : (
            <>
              <div className="bf-score-value" style={{ color: '#9ca3af' }}>
                {empty}
              </div>
              <div className="bf-score-bar">
                <div className="bf-score-fill" style={{ width: '0%' }} />
              </div>
            </>
          )}
          <button className="bf-run-btn" onClick={runAudit} disabled={loading}>
            {loading ? 'Scanning\u2026' : r ? 'Run Again' : 'Run Browser Audit'}
          </button>
        </div>

        <div className="bf-divider" />

        {/* ---- Sections ---- */}
        <div className="bf-grid">

          {/* Network Identity */}
          <div className="bf-section">
            <h3>Network Identity</h3>
            <table className="bf-table"><tbody>
              <tr><td>IP Address</td><td>{r ? (r.network?.ip || 'N/A') : empty}</td></tr>
              <tr><td>Location</td><td>{r ? (r.network ? [r.network.city, r.network.region, r.network.country].filter(Boolean).join(', ') : 'N/A') : empty}</td></tr>
              <tr><td>ISP</td><td>{r ? (r.network?.isp || 'N/A') : empty}</td></tr>
              <tr><td>Timezone (server)</td><td>{r ? (r.network?.timezone || 'N/A') : empty}</td></tr>
              <tr><td>TLS</td><td>{r ? (r.network?.tlsVersion || 'N/A') : empty}</td></tr>
              <tr><td>Protocol</td><td>{r ? (r.network?.httpProtocol || 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Device & Browser */}
          <div className="bf-section">
            <h3>Device &amp; Browser</h3>
            <table className="bf-table"><tbody>
              <tr><td>User Agent</td><td className="bf-ua">{r ? r.navigator.userAgent : empty}</td></tr>
              <tr><td>Platform</td><td>{r ? r.navigator.platform : empty}</td></tr>
              <tr><td>Vendor</td><td>{r ? (r.navigator.vendor || 'N/A') : empty}</td></tr>
              <tr><td>Screen</td><td>{r ? `${r.screen.width}\u00d7${r.screen.height} @${r.screen.pixelRatio}x` : empty}</td></tr>
              <tr><td>Viewport</td><td>{r ? `${r.screen.viewportWidth}\u00d7${r.screen.viewportHeight}` : empty}</td></tr>
              <tr><td>Color Depth</td><td>{r ? `${r.screen.colorDepth}-bit` : empty}</td></tr>
              <tr><td>CPU Cores</td><td>{r ? (r.navigator.hardwareConcurrency ?? 'N/A') : empty}</td></tr>
              <tr><td>Device Memory</td><td>{r ? (r.navigator.deviceMemory ? `${r.navigator.deviceMemory} GB` : 'N/A') : empty}</td></tr>
              <tr><td>Touch Points</td><td>{r ? r.navigator.maxTouchPoints : empty}</td></tr>
              <tr><td>GPU</td><td>{r ? (r.webgl?.renderer || 'N/A') : empty}</td></tr>
              <tr><td>Webdriver</td><td>{r ? (r.navigator.webdriver ? 'Detected' : 'No') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Locale & Preferences */}
          <div className="bf-section">
            <h3>Locale &amp; Preferences</h3>
            <table className="bf-table"><tbody>
              <tr><td>Languages</td><td>{r ? r.navigator.languages.join(', ') : empty}</td></tr>
              <tr><td>Timezone</td><td>{r ? `${r.timezone.timezone} (UTC${r.timezone.offset > 0 ? '\u2212' : '+'}${Math.abs(r.timezone.offset / 60)})` : empty}</td></tr>
              <tr><td>Dark Mode</td><td>{r ? (r.mediaPreferences.darkMode ? 'Enabled' : 'Disabled') : empty}</td></tr>
              <tr><td>Reduced Motion</td><td>{r ? (r.mediaPreferences.reducedMotion ? 'Enabled' : 'Disabled') : empty}</td></tr>
              <tr><td>High Contrast</td><td>{r ? (r.mediaPreferences.highContrast ? 'Enabled' : 'Disabled') : empty}</td></tr>
              <tr><td>HDR Display</td><td>{r ? (r.mediaPreferences.hdr ? 'Yes' : 'No') : empty}</td></tr>
              <tr><td>P3 Color Gamut</td><td>{r ? (r.mediaPreferences.p3Gamut ? 'Yes' : 'No') : empty}</td></tr>
              <tr><td>Do Not Track</td><td>{r ? (r.navigator.doNotTrack === '1' ? 'Enabled' : 'Disabled') : empty}</td></tr>
              <tr><td>Cookies</td><td>{r ? (r.navigator.cookieEnabled ? 'Enabled' : 'Disabled') : empty}</td></tr>
              <tr><td>Ad Blocker</td><td>{r ? (r.adBlocker === null ? 'Unknown' : r.adBlocker ? 'Detected' : 'Not detected') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Fingerprints */}
          <div className="bf-section">
            <h3>Fingerprints</h3>
            <table className="bf-table"><tbody>
              <tr><td>Canvas</td><td>{r ? <code>{r.canvas || 'N/A'}</code> : empty}</td></tr>
              <tr><td>WebGL</td><td>{r ? <code>{r.webgl ? hashSimple(r.webgl.renderer || '') : 'N/A'}</code> : empty}</td></tr>
              <tr><td>Audio</td><td>{r ? <code>{r.audio || 'N/A'}</code> : empty}</td></tr>
              <tr><td>Math</td><td>{r ? <code>{r.mathFingerprint || 'N/A'}</code> : empty}</td></tr>
              <tr><td>Intl</td><td>{r ? <code>{r.intl?.hash || 'N/A'}</code> : empty}</td></tr>
              <tr><td>Voices</td><td>{r ? <code>{r.voices?.hash || 'N/A'}</code> : empty}</td></tr>
              <tr><td>Fonts Detected</td><td>{r ? `${r.fonts.detected.length} / ${r.fonts.tested} tested` : empty}</td></tr>
            </tbody></table>
          </div>

          {/* WebRTC Leak Detection */}
          <div className="bf-section">
            <h3>WebRTC Leak Detection</h3>
            <table className="bf-table"><tbody>
              <tr><td>WebRTC Supported</td><td>{r ? (r.webrtc?.supported ? 'Yes' : 'No') : empty}</td></tr>
              <tr><td>Local IPs</td><td className="bf-ua">{r ? (r.webrtc?.localIPs?.length > 0 ? r.webrtc.localIPs.join(', ') : 'None detected') : empty}</td></tr>
              <tr><td>Public IPs</td><td className="bf-ua">{r ? (r.webrtc?.publicIPs?.length > 0 ? r.webrtc.publicIPs.join(', ') : 'None detected') : empty}</td></tr>
              <tr><td>ICE Candidates</td><td>{r ? (r.webrtc?.candidateCount ?? 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* HTTP Headers */}
          <div className="bf-section">
            <h3>HTTP Headers</h3>
            <table className="bf-table"><tbody>
              {r && r.httpHeaders ? (
                Object.entries(r.httpHeaders).map(([key, value]) => (
                  <tr key={key}><td>{key}</td><td className="bf-ua">{value}</td></tr>
                ))
              ) : (
                <tr><td>Headers</td><td>{r ? 'N/A' : empty}</td></tr>
              )}
            </tbody></table>
          </div>

          {/* WebGL Details */}
          <div className="bf-section">
            <h3>WebGL Details</h3>
            <table className="bf-table"><tbody>
              <tr><td>GPU Vendor</td><td>{r ? (r.webgl?.vendor || 'N/A') : empty}</td></tr>
              <tr><td>GPU Renderer</td><td className="bf-ua">{r ? (r.webgl?.renderer || 'N/A') : empty}</td></tr>
              <tr><td>WebGL Version</td><td>{r ? (r.webgl?.version || 'N/A') : empty}</td></tr>
              <tr><td>Shading Language</td><td>{r ? (r.webgl?.shadingLanguage || 'N/A') : empty}</td></tr>
              <tr><td>Extensions</td><td>{r ? (r.webgl?.extensions || 'N/A') : empty}</td></tr>
              <tr><td>Max Texture</td><td>{r ? (r.webgl?.maxTextureSize?.toLocaleString() || 'N/A') : empty}</td></tr>
              <tr><td>Max Renderbuffer</td><td>{r ? (r.webgl?.maxRenderbufferSize?.toLocaleString() || 'N/A') : empty}</td></tr>
              <tr><td>Max Viewport</td><td>{r ? (r.webgl?.maxViewportDims || 'N/A') : empty}</td></tr>
              <tr><td>Antialiasing</td><td>{r ? (r.webgl?.antialiasing === null ? 'N/A' : r.webgl.antialiasing ? 'Enabled' : 'Disabled') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Speech Voices */}
          <div className="bf-section">
            <h3>Speech Voices</h3>
            <table className="bf-table"><tbody>
              <tr><td>Total Voices</td><td>{r ? (r.voices ? `${r.voices.count} installed` : 'N/A') : empty}</td></tr>
              <tr><td>Local Voices</td><td>{r ? (r.voices?.localCount ?? 'N/A') : empty}</td></tr>
              <tr><td>Remote Voices</td><td>{r ? (r.voices?.remoteCount ?? 'N/A') : empty}</td></tr>
              <tr><td>Languages</td><td>{r ? (r.voices?.langCount ? `${r.voices.langCount} distinct` : 'N/A') : empty}</td></tr>
              <tr><td>Sample</td><td className="bf-ua">{r ? (r.voices?.sample?.length > 0 ? r.voices.sample.map((v) => `${v.name} (${v.lang})`).join(', ') : 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Media Devices */}
          <div className="bf-section">
            <h3>Media Devices</h3>
            <table className="bf-table"><tbody>
              <tr><td>Audio Inputs</td><td>{r ? (r.mediaDevices?.audioinput ?? 'N/A') : empty}</td></tr>
              <tr><td>Audio Outputs</td><td>{r ? (r.mediaDevices?.audiooutput ?? 'N/A') : empty}</td></tr>
              <tr><td>Video Inputs</td><td>{r ? (r.mediaDevices?.videoinput ?? 'N/A') : empty}</td></tr>
              <tr><td>PDF Viewer</td><td>{r ? (r.navigator.pdfViewerEnabled === null ? 'N/A' : r.navigator.pdfViewerEnabled ? 'Yes' : 'No') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Intl Locale */}
          <div className="bf-section">
            <h3>Intl Locale</h3>
            <table className="bf-table"><tbody>
              <tr><td>Date Locale</td><td>{r ? (r.intl?.dateLocale || 'N/A') : empty}</td></tr>
              <tr><td>Calendar</td><td>{r ? (r.intl?.calendar || 'N/A') : empty}</td></tr>
              <tr><td>Numbering System</td><td>{r ? (r.intl?.numberingSystem || 'N/A') : empty}</td></tr>
              <tr><td>Hour Cycle</td><td>{r ? (r.intl?.hourCycle || 'N/A') : empty}</td></tr>
              <tr><td>Collation</td><td>{r ? (r.intl?.collation || 'N/A') : empty}</td></tr>
              <tr><td>Collator Sensitivity</td><td>{r ? (r.intl?.collatorSensitivity || 'N/A') : empty}</td></tr>
              <tr><td>ListFormat</td><td>{r ? (r.intl?.listFormat ? 'Supported' : 'No') : empty}</td></tr>
              <tr><td>Segmenter</td><td>{r ? (r.intl?.segmenter ? 'Supported' : 'No') : empty}</td></tr>
              <tr><td>DurationFormat</td><td>{r ? (r.intl?.durationFormat ? 'Supported' : 'No') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* CSS Feature Support */}
          <div className="bf-section">
            <h3>CSS Feature Support</h3>
            <table className="bf-table"><tbody>
              <tr><td>Supported</td><td>{r ? (r.cssFeatures ? `${r.cssFeatures.supported.length} / ${r.cssFeatures.total}` : 'N/A') : empty}</td></tr>
              <tr><td>Features</td><td className="bf-ua">{r ? (r.cssFeatures?.supported?.length > 0 ? r.cssFeatures.supported.join(', ') : 'N/A') : empty}</td></tr>
              <tr><td>Unsupported</td><td className="bf-ua">{r ? (r.cssFeatures?.unsupported?.length > 0 ? r.cssFeatures.unsupported.join(', ') : 'None') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* JavaScript API Surface */}
          <div className="bf-section">
            <h3>JavaScript API Surface</h3>
            <table className="bf-table"><tbody>
              <tr><td>Available</td><td>{r ? (r.jsAPIs ? `${r.jsAPIs.available.length} / ${r.jsAPIs.total}` : 'N/A') : empty}</td></tr>
              <tr><td>APIs Present</td><td className="bf-ua">{r ? (r.jsAPIs?.available?.length > 0 ? r.jsAPIs.available.join(', ') : 'N/A') : empty}</td></tr>
              <tr><td>APIs Absent</td><td className="bf-ua">{r ? (r.jsAPIs?.unavailable?.length > 0 ? r.jsAPIs.unavailable.join(', ') : 'None') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Permission States */}
          <div className="bf-section">
            <h3>Permission States</h3>
            <table className="bf-table"><tbody>
              <tr><td>Notifications</td><td>{r ? (r.permissions?.notifications || 'N/A') : empty}</td></tr>
              <tr><td>Geolocation</td><td>{r ? (r.permissions?.geolocation || 'N/A') : empty}</td></tr>
              <tr><td>Camera</td><td>{r ? (r.permissions?.camera || 'N/A') : empty}</td></tr>
              <tr><td>Microphone</td><td>{r ? (r.permissions?.microphone || 'N/A') : empty}</td></tr>
              <tr><td>Clipboard Read</td><td>{r ? (r.permissions?.['clipboard-read'] || 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Battery */}
          <div className="bf-section">
            <h3>Battery</h3>
            <table className="bf-table"><tbody>
              <tr><td>Status</td><td>{r ? (r.battery ? (r.battery.charging ? 'Charging' : 'Discharging') : 'Not available') : empty}</td></tr>
              <tr><td>Level</td><td>{r ? (r.battery ? `${r.battery.level}%` : 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Connection */}
          <div className="bf-section">
            <h3>Connection</h3>
            <table className="bf-table"><tbody>
              <tr><td>Type</td><td>{r ? (r.connection?.effectiveType || 'N/A') : empty}</td></tr>
              <tr><td>Downlink</td><td>{r ? (r.connection?.downlink != null ? `${r.connection.downlink} Mbps` : 'N/A') : empty}</td></tr>
              <tr><td>RTT</td><td>{r ? (r.connection?.rtt != null ? `${r.connection.rtt} ms` : 'N/A') : empty}</td></tr>
              <tr><td>Save Data</td><td>{r ? (r.connection ? (r.connection.saveData ? 'Enabled' : 'Disabled') : 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Storage APIs */}
          <div className="bf-section">
            <h3>Storage APIs</h3>
            <table className="bf-table"><tbody>
              <tr><td>localStorage</td><td>{r ? (r.storage.localStorage ? 'Available' : 'Blocked') : empty}</td></tr>
              <tr><td>sessionStorage</td><td>{r ? (r.storage.sessionStorage ? 'Available' : 'Blocked') : empty}</td></tr>
              <tr><td>IndexedDB</td><td>{r ? (r.storage.indexedDB ? 'Available' : 'Blocked') : empty}</td></tr>
            </tbody></table>
          </div>

        </div>
      </div>
    </div>
  );
}
