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
      extensions: gl.getSupportedExtensions()?.length || 0,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)?.join('\u00d7') || null,
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

async function getSpeechVoices() {
  try {
    let voices = speechSynthesis.getVoices();
    if (!voices.length) {
      await new Promise((resolve) => {
        speechSynthesis.onvoiceschanged = resolve;
        setTimeout(resolve, 1000);
      });
      voices = speechSynthesis.getVoices();
    }
    return { count: voices.length, sample: voices.slice(0, 5).map((v) => v.name) };
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
  const names = ['notifications', 'geolocation', 'camera', 'microphone'];
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
  if (report.audio)                               bits += 3;
  if (report.fonts?.detected?.length > 5)         bits += 3.5;
  if (report.navigator?.hardwareConcurrency)      bits += 1.5;
  if (report.navigator?.deviceMemory)             bits += 1.5;
  if (report.network?.ip)                         bits += 4;
  if (report.connection)                          bits += 1;
  if (report.voices?.count > 0)                   bits += 2;
  if (report.mediaDevices)                        bits += 1;
  if (report.mathFingerprint)                     bits += 1;
  if (report.mediaPreferences)                    bits += 1;
  return Math.round(bits * 10) / 10;
}

function getScoreLabel(bits) {
  if (bits <= 10) return { label: 'Low Exposure',      color: '#22c55e' };
  if (bits <= 18) return { label: 'Moderate Exposure',  color: '#eab308' };
  if (bits <= 25) return { label: 'High Exposure',      color: '#f97316' };
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
    const audio            = await getAudioFingerprint();
    const fonts            = detectFonts();
    const adBlocker        = detectAdBlocker();
    const voices           = await getSpeechVoices();
    const mediaDevices     = await getMediaDeviceCount();
    const permissions      = await getPermissionStates();

    let network = null;
    try {
      const res = await fetch(`${API_BASE}/ip`);
      if (res.ok) network = await res.json();
    } catch { /* worker unavailable — skip */ }

    const full = {
      navigator: nav, screen: scr, timezone: tz, mediaPreferences, mathFingerprint,
      connection: conn, storage, canvas, webgl, audio, fonts, adBlocker,
      voices, mediaDevices, permissions, network,
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
              <tr><td>Fonts Detected</td><td>{r ? `${r.fonts.detected.length} / ${r.fonts.tested} tested` : empty}</td></tr>
              <tr><td>WebGL Extensions</td><td>{r ? (r.webgl?.extensions || 'N/A') : empty}</td></tr>
            </tbody></table>
          </div>

          {/* Media & Hardware */}
          <div className="bf-section">
            <h3>Media &amp; Hardware</h3>
            <table className="bf-table"><tbody>
              <tr><td>Speech Voices</td><td>{r ? (r.voices ? `${r.voices.count} installed` : 'N/A') : empty}</td></tr>
              <tr><td>Sample Voices</td><td className="bf-ua">{r ? (r.voices?.sample?.length > 0 ? r.voices.sample.join(', ') : 'N/A') : empty}</td></tr>
              <tr><td>Audio Inputs</td><td>{r ? (r.mediaDevices?.audioinput ?? 'N/A') : empty}</td></tr>
              <tr><td>Audio Outputs</td><td>{r ? (r.mediaDevices?.audiooutput ?? 'N/A') : empty}</td></tr>
              <tr><td>Video Inputs</td><td>{r ? (r.mediaDevices?.videoinput ?? 'N/A') : empty}</td></tr>
              <tr><td>PDF Viewer</td><td>{r ? (r.navigator.pdfViewerEnabled === null ? 'N/A' : r.navigator.pdfViewerEnabled ? 'Yes' : 'No') : empty}</td></tr>
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
