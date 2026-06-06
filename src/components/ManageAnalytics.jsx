import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '28 days', days: 28 },
  { label: '90 days', days: 90 },
];

function deviceFromWidth(w) {
  if (!w) return 'Unknown';
  if (w < 768) return 'Mobile';
  if (w < 1024) return 'Tablet';
  return 'Desktop';
}

function MetricCard({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 10, padding: '20px 24px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const first = data[0];
  const mid = data[Math.floor(data.length / 2)];
  const last = data[data.length - 1];

  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>
        Page views over time
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.date}: ${d.value} view${d.value !== 1 ? 's' : ''}`}
            style={{
              flex: 1, background: '#1a1a1a', borderRadius: 2,
              height: `${Math.max(d.value ? (d.value / max) * 76 : 0, d.value ? 3 : 0)}px`,
              transition: 'height 0.3s',
              cursor: 'default',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {[first, mid, last].filter(Boolean).map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: '#bbb' }}>{d.dateShort}</span>
        ))}
      </div>
    </div>
  );
}

function TopPages({ pages }) {
  const maxViews = Math.max(...pages.map((p) => p.views), 1);
  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 10, padding: '20px 24px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>Top pages</div>
      {pages.length === 0 && <div style={{ fontSize: 13, color: '#bbb' }}>No data yet.</div>}
      {pages.map((p) => (
        <div key={p.path} style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{p.path === '/' ? 'Home (/)' : p.path}</span>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600, flexShrink: 0, paddingLeft: 12 }}>{p.views}</span>
          </div>
          <div style={{ height: 3, background: '#f0ede8', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#1a1a1a', borderRadius: 2, width: `${(p.views / maxViews) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceBreakdown({ devices }) {
  const total = Object.values(devices).reduce((a, b) => a + b, 0);
  const entries = Object.entries(devices).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 10, padding: '20px 24px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>Devices</div>
      {entries.length === 0 && <div style={{ fontSize: 13, color: '#bbb' }}>No data yet.</div>}
      {entries.map(([name, count]) => (
        <div key={name} style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{name}</span>
            <span style={{ fontSize: 13, color: '#888', flexShrink: 0, paddingLeft: 12 }}>
              {count}{' '}
              <span style={{ fontSize: 11, color: '#ccc' }}>
                ({total ? Math.round((count / total) * 100) : 0}%)
              </span>
            </span>
          </div>
          <div style={{ height: 3, background: '#f0ede8', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#555', borderRadius: 2, width: `${total ? (count / total) * 100 : 0}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManageAnalytics() {
  const [rangeDays, setRangeDays] = useState(28);
  const [events, setEvents] = useState([]);
  const [bookClicks, setBookClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      unsub();

      const start = new Date();
      start.setDate(start.getDate() - rangeDays);
      start.setHours(0, 0, 0, 0);
      const startTs = Timestamp.fromDate(start);

      Promise.all([
        getDocs(query(collection(db, 'page_views'), where('ts', '>=', startTs), orderBy('ts', 'asc'))),
        getDocs(query(collection(db, 'book_clicks'), where('ts', '>=', startTs), orderBy('ts', 'asc'))),
      ])
        .then(([pvSnap, bcSnap]) => {
          setEvents(pvSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setBookClicks(bcSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        })
        .catch((err) => setError(`Failed to load analytics: ${err.message}`))
        .finally(() => setLoading(false));
    });

    return unsub;
  }, [rangeDays]);

  const stats = useMemo(() => {
    const empty = { totalViews: 0, uniqueSessions: 0, viewsPerSession: '—', dailyData: [], topPages: [], devices: {} };
    if (!events.length) {
      // Still build empty daily buckets so chart renders
      const dayMap = buildDayMap(rangeDays);
      return { ...empty, dailyData: Object.values(dayMap) };
    }

    const sessions = new Set(events.map((e) => e.sessionId)).size;
    const vps = sessions ? (events.length / sessions).toFixed(1) : '—';

    const dayMap = buildDayMap(rangeDays);
    events.forEach((e) => {
      if (!e.ts) return;
      const d = e.ts.toDate ? e.ts.toDate() : new Date(e.ts);
      const key = d.toISOString().slice(0, 10);
      if (dayMap[key]) dayMap[key].value++;
    });

    const pathMap = {};
    events.forEach((e) => { pathMap[e.path] = (pathMap[e.path] || 0) + 1; });
    const topPages = Object.entries(pathMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const devices = {};
    events.forEach((e) => {
      const dev = deviceFromWidth(e.w);
      devices[dev] = (devices[dev] || 0) + 1;
    });

    // Book clicks — group by book + retailer
    const clickMap = {};
    bookClicks.forEach((c) => {
      const key = `${c.book}||${c.section}||${c.retailer}`;
      if (!clickMap[key]) clickMap[key] = { book: c.book, section: c.section, retailer: c.retailer, clicks: 0 };
      clickMap[key].clicks++;
    });
    const topBookClicks = Object.values(clickMap).sort((a, b) => b.clicks - a.clicks);

    return { totalViews: events.length, uniqueSessions: sessions, viewsPerSession: vps, dailyData: Object.values(dayMap), topPages, devices, topBookClicks };
  }, [events, bookClicks, rangeDays]);

  return (
    <main className="manage-main">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Analytics</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#777' }}>Site traffic tracked via Firebase.</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              style={{
                padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                background: rangeDays === days ? '#1a1a1a' : '#fff',
                color: rangeDays === days ? '#fff' : '#555',
                border: `1px solid ${rangeDays === days ? '#1a1a1a' : '#d8d5d0'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: '#aaa', fontSize: 13 }}>Loading…</p>}

      {error && (
        <div style={{ padding: '16px 20px', background: '#fff8f8', border: '1px solid #ffd0cc', borderRadius: 8, fontSize: 13, color: '#c00', marginBottom: 20, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Page views" value={stats.totalViews.toLocaleString()} sub={`Last ${rangeDays} days`} />
            <MetricCard label="Sessions" value={stats.uniqueSessions.toLocaleString()} sub="Unique tab sessions" />
            <MetricCard label="Views / session" value={stats.viewsPerSession} />
          </div>

          <BarChart data={stats.dailyData} />

          <div style={{ display: 'flex', gap: 14 }}>
            <TopPages pages={stats.topPages} />
            <DeviceBreakdown devices={stats.devices} />
          </div>

          <BookClicks rows={stats.topBookClicks || []} />
        </>
      )}
    </main>
  );
}

function BookClicks({ rows }) {
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);
  return (
    <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 10, padding: '20px 24px', marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>
        Book link clicks
      </div>
      {rows.length === 0 && <div style={{ fontSize: 13, color: '#bbb' }}>No clicks yet.</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#333' }}>
              <span style={{ fontWeight: 600 }}>{r.book}</span>
              <span style={{ color: '#aaa', margin: '0 5px' }}>·</span>
              <span style={{ color: '#888' }}>{r.section}</span>
              <span style={{ color: '#ccc', margin: '0 5px' }}>·</span>
              <span style={{ color: '#888' }}>{r.retailer}</span>
            </span>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600, flexShrink: 0, paddingLeft: 12 }}>{r.clicks}</span>
          </div>
          <div style={{ height: 3, background: '#f0ede8', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#1a1a1a', borderRadius: 2, width: `${(r.clicks / maxClicks) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildDayMap(rangeDays) {
  const map = {};
  const now = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    map[key] = {
      value: 0,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateShort: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }
  return map;
}
