import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ================================================================== */
/*  Constants & helpers                                                */
/* ================================================================== */

const API = '/api';

const RANGE_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All Time' },
];

function formatNum(n) {
  if (n == null) return '—';
  return n.toLocaleString();
}

function formatPct(n) {
  if (n == null || !isFinite(n)) return '';
  const sign = n >= 0 ? '▲' : '▼';
  return `${sign} ${Math.abs(Math.round(n))}%`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Date helpers */
function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function startOfWeek(d) {
  const c = new Date(d);
  c.setDate(c.getDate() - c.getDay() + 1); // Monday
  c.setHours(0, 0, 0, 0);
  return c;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfDay(d) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

function endOfWeek(d) {
  const c = startOfWeek(d);
  c.setDate(c.getDate() + 6);
  c.setHours(23, 59, 59, 999);
  return c;
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDateLabel(range, anchor) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  const shortOpts = { month: 'short', day: 'numeric' };
  if (range === 'day') return anchor.toLocaleDateString('en-US', opts);
  if (range === 'week') {
    const end = endOfWeek(anchor);
    return `${anchor.toLocaleDateString('en-US', shortOpts)} – ${end.toLocaleDateString('en-US', opts)}`;
  }
  if (range === 'month') {
    return anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return 'All Time';
}

function getRangeBounds(range, anchor) {
  if (range === 'day') return { start: startOfDay(anchor), end: endOfDay(anchor) };
  if (range === 'week') return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
  if (range === 'month') return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  return { start: null, end: null }; // all time
}

function getPrevBounds(range, anchor) {
  if (range === 'day') {
    const prev = new Date(anchor);
    prev.setDate(prev.getDate() - 1);
    return getRangeBounds('day', prev);
  }
  if (range === 'week') {
    const prev = new Date(anchor);
    prev.setDate(prev.getDate() - 7);
    return getRangeBounds('week', prev);
  }
  if (range === 'month') {
    const prev = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
    return getRangeBounds('month', prev);
  }
  return { start: null, end: null };
}

function stepAnchor(range, anchor, direction) {
  const c = new Date(anchor);
  if (range === 'day') c.setDate(c.getDate() + direction);
  if (range === 'week') c.setDate(c.getDate() + (7 * direction));
  if (range === 'month') c.setMonth(c.getMonth() + direction);
  return c;
}

function canGoForward(range, anchor) {
  if (range === 'all') return false;
  const next = stepAnchor(range, anchor, 1);
  return next <= new Date();
}

/* ================================================================== */
/*  API client                                                         */
/* ================================================================== */

async function apiFetch(path, params = {}) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/* ================================================================== */
/*  App component                                                      */
/* ================================================================== */

export default function App() {
  const [range, setRange] = useState('month');
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [pages, setPages] = useState([]);
  const [labs, setLabs] = useState([]);
  const [storage, setStorage] = useState(null);
  const [content, setContent] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const bounds = useMemo(() => getRangeBounds(range, anchor), [range, anchor]);
  const dateLabel = useMemo(() => formatDateLabel(range, anchor), [range, anchor]);

  /* ---- Fetch all data ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (bounds.start) params.start = bounds.start.getTime();
      if (bounds.end) params.end = bounds.end.getTime();
      params.range = range;

      const [summaryRes, trendRes, pagesRes, labsRes, storageRes, contentRes] = await Promise.all([
        apiFetch(`${API}/summary`, params),
        apiFetch(`${API}/trend`, params),
        apiFetch(`${API}/pages`, params),
        apiFetch(`${API}/labs`, params),
        apiFetch(`${API}/storage`),
        apiFetch(`${API}/content`),
      ]);

      setSummary(summaryRes);
      setTrend(trendRes);
      setPages(pagesRes);
      setLabs(labsRes);
      setStorage(storageRes);
      setContent(contentRes);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [bounds, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Navigation ---- */
  const handleRangeChange = (e) => {
    const newRange = e.target.value;
    setRange(newRange);
    if (newRange === 'day') setAnchor(startOfDay(new Date()));
    else if (newRange === 'week') setAnchor(startOfWeek(new Date()));
    else if (newRange === 'month') setAnchor(startOfMonth(new Date()));
  };

  const handlePrev = () => setAnchor((a) => stepAnchor(range, a, -1));
  const handleNext = () => {
    if (canGoForward(range, anchor)) setAnchor((a) => stepAnchor(range, a, 1));
  };

  /* ---- Content management ---- */
  const handleArchive = async (id) => {
    try {
      await fetch(`${API}/content/${id}/archive`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await fetch(`${API}/content/${id}/restore`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error('Restore failed:', err);
    }
  };

  const handleAddContent = async (data) => {
    try {
      await fetch(`${API}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setAddModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Add content failed:', err);
    }
  };

  /* ---- Lab bar max ---- */
  const labMax = useMemo(() => {
    if (!labs.length) return 1;
    return Math.max(...labs.map((l) => l.usages), 1);
  }, [labs]);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="dashboard-header">
        <a href="https://jchowlabs.com" className="dashboard-header-brand" target="_blank" rel="noreferrer">
          <img src="https://jchowlabs.com/static/images/favicon.png" alt="" />
          jchowlabs
        </a>
        <nav className="dashboard-header-nav">
          <a href="https://jchowlabs.com" target="_blank" rel="noreferrer">Home</a>
          <a href="https://jchowlabs.com/events" target="_blank" rel="noreferrer">Events</a>
        </nav>
      </header>

      {/* Main */}
      <main className="dashboard-main" style={{ flex: 1 }}>

        {/* Title + time selector */}
        <div className="dashboard-title-row">
          <h1 className="dashboard-title">Analytics</h1>
          <div className="time-selector">
            <select className="time-select" value={range} onChange={handleRangeChange}>
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {range !== 'all' && (
              <>
                <button className="time-nav-btn" onClick={handlePrev}>◀</button>
                <span className="time-label">{dateLabel}</span>
                <button
                  className="time-nav-btn"
                  onClick={handleNext}
                  disabled={!canGoForward(range, anchor)}
                >▶</button>
              </>
            )}
            {range === 'all' && <span className="time-label">{dateLabel}</span>}
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading dashboard…</div>
        ) : (
          <>
            {/* ── Summary cards ── */}
            <div className="summary-grid">
              <SummaryCard
                label="Page Views"
                value={summary?.page_views}
                delta={summary?.page_views_delta}
              />
              <SummaryCard
                label="Visitors"
                value={summary?.visitors}
                delta={summary?.visitors_delta}
              />
              <SummaryCard
                label="Lab Usages"
                value={summary?.lab_usages}
                delta={summary?.lab_usages_delta}
              />
              <div className="summary-card">
                <div className="summary-card-label">Bots Detected</div>
                <div className="summary-card-value">{formatNum(summary?.bots_total)}</div>
                <div className="bot-breakdown">
                  <span>AI Agents: {summary?.bots_ai_agent || 0}</span>
                  <span>Crawlers: {summary?.bots_crawler || 0}</span>
                  <span>Headless: {summary?.bots_headless || 0}</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Storage</div>
                <div className="summary-card-value">{storage ? formatBytes(storage.used_bytes) : '—'}</div>
                <div className="summary-card-sub">of {storage ? formatBytes(storage.limit_bytes) : '5 GB'}</div>
                <div className="storage-bar">
                  <div
                    className="storage-bar-fill"
                    style={{ width: `${storage ? (storage.used_bytes / storage.limit_bytes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Middle tiles: Trend + Lab usage ── */}
            <div className="tile-row">
              {/* Trend chart */}
              <div className="tile">
                <div className="tile-header">
                  {range === 'day' ? 'Hourly Breakdown' : 'Daily Breakdown'}
                </div>
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                      <Bar dataKey="page_views" name="Page Views" fill="#2563eb" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="lab_usages" name="Lab Usages" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    No data for this period
                  </div>
                )}
              </div>

              {/* Lab usage bars */}
              <div className="tile">
                <div className="tile-header">Lab Usage</div>
                {labs.length > 0 ? (
                  labs.map((lab) => (
                    <div key={lab.slug} className="lab-bar-row">
                      <div className="lab-bar-label">{lab.title}</div>
                      <div className="lab-bar-track">
                        <div
                          className="lab-bar-fill"
                          style={{ width: `${(lab.usages / labMax) * 100}%` }}
                        />
                      </div>
                      <div className="lab-bar-count">{lab.usages}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    No lab usage for this period
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom tiles: Page analytics + Content management ── */}
            <div className="tile-row">
              {/* Page analytics */}
              <div className="tile">
                <div className="tile-header">Page Analytics</div>
                {pages.length > 0 ? (
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th className="col-num">Views</th>
                        <th className="col-num">Visitors</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.slug}>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.title || p.slug}
                          </td>
                          <td className="col-num">{formatNum(p.views)}</td>
                          <td className="col-num">{formatNum(p.visitors)}</td>
                          <td>
                            <span className={`status-dot ${p.status}`} />
                            {p.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    No page data for this period
                  </div>
                )}
              </div>

              {/* Content management */}
              <div className="tile">
                <div className="tile-header">Content Management</div>
                <div className="content-mgmt-list">
                  {content.map((c) => (
                    <div key={c.id} className="content-mgmt-row">
                      <div className="content-mgmt-info">
                        <span className={`status-dot ${c.status}`} />
                        <span className="content-mgmt-type">{c.content_type}</span>
                        <span>{c.title}</span>
                      </div>
                      {c.status === 'active' ? (
                        <button className="content-btn" onClick={() => handleArchive(c.id)}>
                          Archive
                        </button>
                      ) : (
                        <button className="content-btn" onClick={() => handleRestore(c.id)}>
                          Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="add-content-btn" onClick={() => setAddModalOpen(true)}>
                  + Add Content
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        © {new Date().getFullYear()} jchowlabs. Analytics Dashboard.
      </footer>

      {/* Add content modal */}
      {addModalOpen && (
        <AddContentModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddContent}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Summary Card                                                       */
/* ================================================================== */

function SummaryCard({ label, value, delta }) {
  return (
    <div className="summary-card">
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">{formatNum(value)}</div>
      {delta != null && isFinite(delta) && delta !== 0 && (
        <div className={`summary-card-delta ${delta >= 0 ? 'up' : 'down'}`}>
          {formatPct(delta)} vs prev
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Add Content Modal                                                  */
/* ================================================================== */

function AddContentModal({ onClose, onSubmit }) {
  const [type, setType] = useState('page');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slug.trim() || !title.trim()) return;
    onSubmit({ content_type: type, slug: slug.trim(), title: title.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add Content to Track</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="page">Page</option>
              <option value="lab">Lab</option>
            </select>
          </div>
          <div className="modal-field">
            <label>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={type === 'page' ? '/insights/my-article' : 'my-lab-slug'}
              required
            />
          </div>
          <div className="modal-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Display name"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
